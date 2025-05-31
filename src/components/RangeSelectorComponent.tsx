import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getYear,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  setYear,
  isBefore,
  isWithinInterval,
  startOfMonth,
  endOfWeek,
  startOfWeek,
  subMonths
} from 'date-fns'
import { twMerge } from 'tailwind-merge'
import Button from './Button'

interface RangeSelectorComponentProps {
  initialDate: Date
  onDateChange: (day: Date) => void
  rangeStartDate: Date | null
  rangeEndDate: Date | null
  isStartSelector: boolean
  hasBeenSelected: boolean
}

const RangeSelectorComponent: React.FC<RangeSelectorComponentProps> = ({
  initialDate = startOfToday(),
  onDateChange = (day: Date) => {},
  rangeStartDate = null,
  rangeEndDate = null,
  isStartSelector = false,
  hasBeenSelected = false
}) => {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = useState(initialDate)
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  const [showMonthYearSelector, setShowMonthYearSelector] = useState(false)
  const [selectorView, setSelectorView] = useState('month') // 'month' or 'year'

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const currentYear = getYear(firstDayCurrentMonth)

  useEffect(() => {
    if (initialDate) {
      setSelectedDay(initialDate)
      setCurrentMonth(format(initialDate, 'MMM-yyyy'))
    }
  }, [initialDate])

  // Calculate all days to display in the calendar view
  const firstDayOfCurrentMonth = startOfMonth(firstDayCurrentMonth)
  const startDate = startOfWeek(firstDayOfCurrentMonth)
  const endDate = endOfWeek(endOfMonth(firstDayCurrentMonth))

  // Get all days from the start of the first week to the end of the last week
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const previousMonth = () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  const nextMonth = () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  const toggleMonthYearSelector = () => {
    setShowMonthYearSelector(!showMonthYearSelector)
    setSelectorView('month')
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const selectMonth = (monthIndex: any) => {
    const newDate = new Date(currentYear, monthIndex, 1)
    setCurrentMonth(format(newDate, 'MMM-yyyy'))
    setSelectorView('year')
  }

  const selectYear = (year: any) => {
    const month = firstDayCurrentMonth.getMonth()
    const newDate = new Date(year, month, 1)
    setCurrentMonth(format(newDate, 'MMM-yyyy'))
    setShowMonthYearSelector(false)
  }

  const previousYearSet = () => {
    const newYear = currentYear - 12
    const newDate = setYear(firstDayCurrentMonth, newYear)
    setCurrentMonth(format(newDate, 'MMM-yyyy'))
  }

  const nextYearSet = () => {
    const newYear = currentYear + 12
    const newDate = setYear(firstDayCurrentMonth, newYear)
    setCurrentMonth(format(newDate, 'MMM-yyyy'))
  }

  // Generate years list (12 years centered around current year)
  const startYear = currentYear - 4
  const years = Array.from({ length: 9 }, (_, i) => startYear + i)

  const handleDaySelect = (day: any) => {
    setSelectedDay(day)
    onDateChange(day) // Pass the selected date to parent
  }

  const isInRange = (day: any) => {
    if (!rangeStartDate || !rangeEndDate) return false

    return isWithinInterval(day, {
      start: rangeStartDate,
      end: rangeEndDate
    })
  }

  // Check if a day is the range start
  const isRangeStart = (day: any) => {
    return rangeStartDate && isSameDay(day, rangeStartDate)
  }

  // Check if a day is the range end
  const isRangeEnd = (day: any) => {
    return rangeEndDate && isSameDay(day, rangeEndDate)
  }

  // Determine if a date should be selectable
  const isDateSelectable = (day: any) => {
    // If this is the start selector, all dates are selectable
    if (isStartSelector) return true

    // If this is the end selector, only dates after start date are selectable
    return !rangeStartDate || !isBefore(day, rangeStartDate)
  }

  return (
    <div
      className={`text-text dark:text-text-dark flex gap-2 border rounded-md flex-col relative border-border dark:border-border-dark transition-color duration-300 ease-in-out ${
        hasBeenSelected ? 'bg-scry-bg dark:bg-scry-bg-dark' : 'bg-bg dark:bg-bg-dark'
      }`}
    >
      <div className="flex items-center w-full justify-between p-2">
        <Button variant={'icon'} onClick={previousMonth}>
          <ArrowLeft size={16} strokeWidth={1.5} />
        </Button>
        <Button variant={'ghost'} size={'sm'} onClick={toggleMonthYearSelector}>
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </Button>
        <Button variant={'icon'} onClick={nextMonth}>
          <ArrowRight size={16} strokeWidth={1.5} />
        </Button>
      </div>

      {showMonthYearSelector && (
        <div className="absolute w-full h-full bg-bg dark:bg-bg-dark rounded-md z-10 ">
          {selectorView === 'month' ? (
            <>
              <div className="grid grid-cols-3 w-full h-full p-2">
                {months.map((month, i) => (
                  <button
                    key={month}
                    onClick={() => selectMonth(i)}
                    className={twMerge(
                      'p-2 rounded-md hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer',
                      firstDayCurrentMonth.getMonth() === i && 'bg-blue-500 font-semibold text-white hover:text-black'
                    )}
                  >
                    <p className="text-sm">{month.substring(0, 3)}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="absolute w-full h-full bg-bg dark:bg-bg-dark rounded-md z-10 flex flex-col">
              <div className="flex items-center justify-between p-2">
                <Button variant={'icon'} onClick={previousYearSet}>
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </Button>
                <span className="text-sm font-semibold">
                  {years[0]} - {years[years.length - 1]}
                </span>
                <Button variant={'icon'} onClick={nextYearSet}>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Button>
              </div>
              <div className="grid grid-cols-3 w-full h-full p-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className={twMerge(
                      'p-2 rounded-md hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer',
                      currentYear === year && 'bg-blue-500 font-semibold text-white hover:text-black'
                    )}
                  >
                    <p className="text-sm">{year}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="">
        <div className="grid grid-cols-7 text-sm leading-6 text-center text-text-muted">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isSelectable = isDateSelectable(day)
            const isOutsideCurrentMonth = !isSameMonth(day, firstDayCurrentMonth)

            return (
              <div key={index} className="w-10 h-10">
                <button
                  type="button"
                  onClick={() => isSelectable && handleDaySelect(day)}
                  disabled={!isSelectable || isOutsideCurrentMonth}
                  className={twMerge(
                    // Base styling
                    'w-full h-full flex items-center justify-center ',

                    // Range styling - applied first as base
                    isInRange(day) && 'bg-blue-100 dark:bg-blue-900/30',
                    isRangeStart(day) && 'bg-blue-300 dark:bg-blue-500 text-text-dark rounded-l-xl',
                    isRangeEnd(day) && 'bg-blue-500 dark:bg-blue-900 text-text-dark rounded-r-xl',

                    // Selected day styling
                    isEqual(day, selectedDay) && !isRangeStart(day) && !isRangeEnd(day) && 'bg-blue-500 dark:bg-blue-900 text-text-dark',

                    // Today styling
                    !isEqual(day, selectedDay) && isToday(day) && !isInRange(day) && 'bg-red-500/20 border border-red-500 rounded-md',

                    // Outside current month styling (ghost days)
                    isOutsideCurrentMonth && 'text-text-muted/40',

                    // Hover styling
                    isSelectable &&
                      !isEqual(day, selectedDay) &&
                      !isOutsideCurrentMonth &&
                      'hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer hover:rounded-md',

                    // Font styling
                    (isEqual(day, selectedDay) || isToday(day) || isRangeStart(day) || isRangeEnd(day)) && 'font-semibold',

                    // Disabled styling
                    (!isSelectable || isOutsideCurrentMonth) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RangeSelectorComponent

let colStartClasses = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7']
