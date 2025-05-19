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
  isWithinInterval
} from 'date-fns'
import { twMerge } from 'tailwind-merge'
import Button from './Button'

const RangeSelectorComponent = ({
  initialDate = startOfToday(),
  onDateChange = (day: Date) => {},
  rangeStartDate = null,
  rangeEndDate = null,
  isStartSelector = false
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

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth)
  })

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

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

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
    <div className="flex gap-2 border border-border dark:border-border-dark rounded-md flex-col relative">
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
              <div className="grid grid-cols-3 w-full h-full">
                {months.map((month, i) => (
                  <button
                    key={month}
                    onClick={() => selectMonth(i)}
                    className={twMerge(
                      'p-2 rounded-md hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer',
                      firstDayCurrentMonth.getMonth() === i &&
                        'bg-blue-500 font-semibold text-white hover:text-black'
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
              <div className="grid grid-cols-3 w-full h-full">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className={twMerge(
                      'p-2 rounded-md hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer',
                      currentYear === year &&
                        'bg-blue-500 font-semibold text-white hover:text-black'
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
          {days.map((day, index) => {
            const isSelectable = isDateSelectable(day)
            return (
              <div
                key={index}
                className={twMerge(index === 0 && colStartClasses[getDay(day)], 'p-1.5')}
              >
                <button
                  type="button"
                  onClick={() => isSelectable && handleDaySelect(day)}
                  disabled={!isSelectable}
                  className={twMerge(
                    // Base styling
                    'flex w-8 h-8 items-center justify-center rounded-sm',

                    // Range styling - applied first as base
                    isInRange(day) && 'bg-blue-100 dark:bg-blue-900/30',
                    isRangeStart(day) && 'bg-blue-300 dark:bg-blue-500 text-text-dark rounded-l-sm',
                    isRangeEnd(day) && 'bg-blue-500 dark:bg-blue-900 text-text-dark rounded-r-sm',

                    // Selected day styling
                    isEqual(day, selectedDay) &&
                      !isRangeStart(day) &&
                      !isRangeEnd(day) &&
                      'bg-blue-500 dark:bg-blue-900 text-text-dark',

                    // Today styling
                    !isEqual(day, selectedDay) &&
                      isToday(day) &&
                      !isInRange(day) &&
                      'bg-red-500/20 border border-red-500',

                    // Month styling
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      'text-text-muted/50',

                    // Hover styling
                    isSelectable &&
                      !isEqual(day, selectedDay) &&
                      'hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark cursor-pointer',

                    // Font styling
                    (isEqual(day, selectedDay) ||
                      isToday(day) ||
                      isRangeStart(day) ||
                      isRangeEnd(day)) &&
                      'font-semibold',

                    // Disabled styling
                    !isSelectable && 'opacity-50 cursor-not-allowed'
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

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7'
]
