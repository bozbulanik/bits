import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear
} from 'date-fns'
import Button from '../../components/Button'
import { ChevronLeft, ChevronRight, ExternalLink, Link, Link2, Pencil, X } from 'lucide-react'
import { useBitsStore } from '../../stores/bitsStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bit } from '../../types/Bit'
import SegmentedControl from '../../components/SegmentedControl'
import DateInput from '../../components/DateInput'
import Combobox from '../../components/Combobox'
import { useNavigate } from 'react-router-dom'
import { getIconComponent } from '../../utils/getIcon'
import { AnimatePresence, motion } from 'framer-motion'
import { truncateText } from '../../utils'

const getTextValue = (bit: Bit) => {
  if (!bit) return undefined
  const textProperty = bit.type.properties.find((property) => property.isTitle === true)
  if (!textProperty) return 'Untitled'
  const bitData = bit.data.find((data) => data.propertyId === textProperty.id)

  if (!bitData) return 'Untitled'

  return bitData.value as string
}

interface CalendarEvent {
  date: Date
  text: string
  referencedBit: Bit
  hasTime: boolean
}

function getTheDate(bit: Bit): Date {
  const datePropDef = bit.type.properties.find((p) => p.type === 'date' || p.type === 'time' || p.type === 'datetime')
  if (!datePropDef) return new Date()

  const dateData = bit.data.find((d) => d.propertyId === datePropDef.id)
  if (!dateData || isNaN(Date.parse(dateData.value as string))) return new Date()

  return new Date(dateData.value as string)
}

function bitToCalendarEvent(bit: Bit): CalendarEvent | null {
  const datePropDef = bit.type.properties.find((p) => p.type === 'date' || p.type === 'time' || p.type === 'datetime')
  if (!datePropDef) return null

  const dateData = bit.data.find((d) => d.propertyId === datePropDef.id)
  if (!dateData || isNaN(Date.parse(dateData.value as string))) return null

  const event: CalendarEvent = {
    date: new Date(dateData.value as string),
    text: datePropDef.name || '(Untitled)',
    referencedBit: bit,
    hasTime: datePropDef.type === 'time' || datePropDef.type === 'datetime'
  }

  return event
}

const CalendarAgendaPage = () => {
  const navigate = useNavigate()
  const today = startOfToday()

  const [bitsBetWeenDate, setBitsBetweenDate] = useState<Bit[]>([])
  const [bitsWithDateDataBetweenDate, setBitsWithDateDataBetweenDate] = useState<Bit[]>([])

  const [fromDate, setFromDate] = useState<Date>(today)
  const [toDate, setToDate] = useState<Date>(endOfMonth(today))
  const [currentRange, setCurrentRange] = useState<string>('month')

  const allEvents = useMemo((): CalendarEvent[] => {
    const results: CalendarEvent[] = bitsWithDateDataBetweenDate.map(bitToCalendarEvent).filter((e): e is CalendarEvent => e !== null)
    return results
  }, [bitsWithDateDataBetweenDate])

  const [highlightToday, setHighlightToday] = useState(false)
  const todayRef = useRef<HTMLDivElement>(null)

  const [clickedCalendarEvent, setClickedCalendarEvent] = useState<CalendarEvent>()
  const [isDetailsPanelOpen, setDetailPanelsOpen] = useState<boolean>(false)

  useEffect(() => {
    if (highlightToday && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      const timer = setTimeout(() => {
        setHighlightToday(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [highlightToday])

  const previousDateRange = () => {
    if (currentRange != 'custom') {
      let newDate

      switch (currentRange) {
        case 'week':
          newDate = add(fromDate, { weeks: -1 })
          break
        case 'month':
          newDate = add(fromDate, { months: -1 })
          break
        case 'year':
          newDate = add(fromDate, { years: -1 })
          break
        default:
          newDate = add(fromDate, { months: -1 })
      }

      setFromDate(newDate)
    } else {
      let newDate
      newDate = add(fromDate, { days: -1 })
      setFromDate(newDate)
    }
  }

  const nextDateRange = () => {
    if (currentRange != 'custom') {
      let newDate

      switch (currentRange) {
        case 'week':
          newDate = add(fromDate, { weeks: 1 })
          break
        case 'month':
          newDate = add(fromDate, { months: 1 })
          break
        case 'year':
          newDate = add(fromDate, { years: 1 })
          break
        default:
          newDate = add(fromDate, { months: 1 })
      }

      setFromDate(newDate)
    } else {
      let newDate
      newDate = add(toDate, { days: 1 })
      setToDate(newDate)
    }
  }

  const getDays = () => {
    switch (currentRange) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(fromDate),
          end: endOfWeek(fromDate)
        })
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(fromDate),
          end: endOfMonth(fromDate)
        })
      case 'year':
        return eachDayOfInterval({
          start: startOfYear(fromDate),
          end: endOfYear(fromDate)
        })
      case 'custom':
        return eachDayOfInterval({
          start: fromDate,
          end: toDate
        })
      default:
        return eachDayOfInterval({
          start: startOfMonth(fromDate),
          end: endOfMonth(toDate)
        })
    }
  }

  const days = getDays()

  useEffect(() => {
    const fetchPinnedData = async () => {
      try {
        await useBitsStore.getState().getBitsBetweenDate(days[0], days.slice(-1)[0]).then(setBitsBetweenDate)
        await useBitsStore.getState().getBitsWithDateDataBetweenDate(days[0], days.slice(-1)[0]).then(setBitsWithDateDataBetweenDate)
      } catch (error) {
        console.error('Error loading bits:', error)
      }
    }
    fetchPinnedData()
  }, [])

  const goToday = () => {
    if (currentRange == 'custom') {
      if (isBefore(toDate, today)) {
        setToDate(today)
      } else if (isBefore(fromDate, today) && isAfter(toDate, today)) {
        setHighlightToday(true)
      } else {
        setFromDate(today)
        setHighlightToday(true)
      }
    } else {
      setFromDate(today)
      setHighlightToday(true)
    }
  }

  const getRangeTitle = () => {
    switch (currentRange) {
      case 'week': {
        const start = startOfWeek(fromDate)
        const end = endOfWeek(fromDate)
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')} - Week ${format(start, 'ww')}`
      }
      case 'month':
        return format(fromDate, 'MMMM yyyy')
      case 'year':
        return format(fromDate, 'yyyy')
      case 'custom':
        return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`
      default:
        return format(fromDate, 'MMMM yyyy')
    }
  }
  return (
    <>
      <div className="w-full flex items-center">
        <div className="flex flex-col w-full px-2 gap-1">
          <p className="text-text-muted text-sm">Agenda View</p>
          <div className="flex gap-2 items-center w-full">
            <SegmentedControl
              segments={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
                { value: 'custom', label: 'Custom' }
              ]}
              selectedOptionValue={currentRange}
              onChange={(e) => setCurrentRange(e)}
            />

            {currentRange === 'custom' && (
              <DateInput
                className=""
                ranged
                horizontalAlign="left"
                placeholder="Set Custom Range"
                setCurrentDisplayDate={setFromDate}
                setCurrentDisplayDateEnd={setToDate}
              />
            )}
            <Button className="ml-auto" onClick={goToday} variant={'default'}>
              Go Today
            </Button>
            <Combobox
              className="w-32"
              options={[
                {
                  options: [
                    { value: 'agenda', label: 'Agenda' },
                    { value: 'day', label: 'Day' },
                    { value: 'week', label: 'Week' },
                    { value: 'month', label: 'Month' }
                  ]
                }
              ]}
              onChange={(e) => navigate(`/calendar/${e}`)}
              selectedValues={'agenda'}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-1 w-full p-2 min-h-0 gap-2 relative">
        <motion.div
          initial={{ width: '100%' }}
          animate={{
            width: isDetailsPanelOpen ? 'calc(60% - 12px)' : '100%'
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut'
          }}
          className="flex flex-col min-h-0 rounded-md border border-border dark:border-border-dark"
        >
          <div className="p-2 border-b border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark flex items-center gap-2 justify-between">
            <Button onClick={previousDateRange} variant={'iconGhost'}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Button>

            <p className="text-center font-semibold">{getRangeTitle()}</p>
            <Button onClick={nextDateRange} variant={'iconGhost'}>
              <ChevronRight size={16} strokeWidth={1.5} />
            </Button>
          </div>
          <div className="overflow-auto h-full divide-y divide-border dark:divide-border-dark">
            {days.map((day, index) => (
              <div
                ref={isToday(day) ? todayRef : null}
                key={index}
                className={` ${
                  isToday(day) ? `${highlightToday ? 'bg-red-500/15 transition-color duration-400' : ''}` : ''
                } flex divide-x divide-border dark:divide-border-dark`}
              >
                <div className="w-32 p-4 flex flex-col justify-center">
                  <p className="text-sm text-text-muted">{format(day, 'EEEE')}</p>
                  <p className="font-semibold text-md">{format(day, 'd')}</p>
                  <p className="text-xs text-text-muted"> Week {format(day, 'ww')}</p>
                  <p className="text-sm text-green-500">
                    {(() => {
                      const bitNum = bitsBetWeenDate.filter((bit) => isSameDay(new Date(bit.createdAt), day)).length
                      if (bitNum === 0) return null
                      return (
                        <span>
                          {bitNum} {bitNum === 1 ? 'bit' : 'bits'}
                        </span>
                      )
                    })()}
                  </p>
                </div>
                <div className="p-2 flex flex-col gap-1 flex-1">
                  {allEvents
                    .filter((calEvent) => isSameDay(calEvent.date, day))
                    .map((calEvent) => (
                      <div
                        onClick={() => {
                          setClickedCalendarEvent(calEvent)
                          setDetailPanelsOpen(true)
                        }}
                        className="cursor-pointer flex items-center gap-2 border border-transparent hover:border-border hover:dark:border-border-dark rounded-md bg-scry-bg dark:bg-scry-bg-dark px-2 py-1"
                      >
                        {(() => {
                          const Icon = getIconComponent(calEvent.referencedBit.type.iconName)
                          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
                        })()}
                        <p className="text-sm">{calEvent.text}</p>
                        {calEvent.hasTime && <p className="text-sm font-semibold">{format(calEvent.date, 'HH:mm a')}</p>}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        {clickedCalendarEvent && (
          <motion.div
            style={{ width: '40%' }}
            initial={{ x: '100%' }}
            animate={{
              x: isDetailsPanelOpen ? '0%' : '100%'
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="rounded-md border border-border dark:border-border-dark absolute right-2 h-full"
          >
            <div className="flex flex-col h-full w-full overflow-auto">
              <div className="flex items-center gap-2 p-2">
                <span className="truncate px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                  {truncateText(clickedCalendarEvent?.referencedBit.type.name, 20)}
                </span>
                <Button className="ml-auto" variant={'iconGhost'} onClick={() => setDetailPanelsOpen(false)}>
                  <X size={16} strokeWidth={1.5} />
                </Button>
              </div>
              <div className="px-2">
                <p className="font-semibold text-lg truncate">{getTextValue(clickedCalendarEvent.referencedBit)}</p>
              </div>

              <div className="p-2 flex flex-col gap-1 w-full border-b border-border dark:border-border-dark">
                <p className="text-text-muted font-semibold uppercase text-sm">Referenced Data</p>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 bg-scry-bg dark:bg-scry-bg-dark rounded-md p-1">
                    <p className="text-sm text-text-muted">{clickedCalendarEvent.text}</p>
                    <p className="text-sm ml-auto">{format(clickedCalendarEvent.date, 'MMM dd, yyyy')}</p>
                    <p className="text-sm">
                      {clickedCalendarEvent.hasTime && <p className="text-sm">{format(clickedCalendarEvent.date, 'HH:mm a')}</p>}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-col gap-1 w-full">
                <p className="text-text-muted font-semibold uppercase text-sm">Actions</p>
                <div className="flex flex-col gap-2">
                  <Button>
                    <ExternalLink size={16} strokeWidth={1.5} /> Open Bit
                  </Button>
                  <Button>
                    <Pencil size={16} strokeWidth={1.5} />
                    Edit bit data
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default CalendarAgendaPage
