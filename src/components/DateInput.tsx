import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Button from './Button'
import { Calendar, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import RangeSelectorComponent from './RangeSelectorComponent'
import { format } from 'date-fns'

interface DateInputProps {
  placeholder?: string
  className?: string
  setCurrentDisplayDate: (date: Date) => void
  setCurrentDisplayDateEnd?: (date: Date) => void
  ranged?: boolean
  ghost?: boolean
  horizontalAlign?: 'left' | 'right'
}

const DateInput: React.FC<DateInputProps> = ({
  className,
  placeholder,
  setCurrentDisplayDate,
  setCurrentDisplayDateEnd,
  ranged = false,
  ghost = false,
  horizontalAlign
}) => {
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(null)
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(null)
  const [isCalendarPanelOpen, setCalendarPanelOpen] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0
  })

  useEffect(() => {
    if (isCalendarPanelOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPanelPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isCalendarPanelOpen, horizontalAlign])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!buttonRef.current?.contains(event.target as Node) && !document.getElementById('calendar-portal')?.contains(event.target as Node)) {
        setCalendarPanelOpen(false)
      }
    }
    if (isCalendarPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCalendarPanelOpen])

  const handleFromDateChange = (date: Date) => {
    setSelectedDateFrom(date)
    if (selectedDateTo && date > selectedDateTo) {
      setSelectedDateTo(null)
    }
    if (!ranged && date) {
      setCurrentDisplayDate(date)
      if (setCurrentDisplayDateEnd) {
        setCurrentDisplayDateEnd(new Date())
      }
      setCalendarPanelOpen(false)
    }
  }

  const handleToDateChange = (date: Date) => {
    setSelectedDateTo(date)
    if (selectedDateFrom && date) {
      setCurrentDisplayDate(selectedDateFrom)
      if (setCurrentDisplayDateEnd) {
        setCurrentDisplayDateEnd(date)
      }
      setCalendarPanelOpen(false)
    }
  }

  const calendarPanel = (
    <AnimatePresence mode="wait">
      {isCalendarPanelOpen && (
        <motion.div
          id="calendar-portal"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`${
            selectedDateFrom && ranged ? 'min-w-148' : 'min-w-75'
          } fixed p-2 z-100 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-md`}
          style={{
            top: panelPosition.top + 8,
            left: horizontalAlign === 'left' ? panelPosition.left : undefined,
            right: horizontalAlign === 'right' ? window.innerWidth - (panelPosition.left! + panelPosition.width) : 'undefined',
            width: panelPosition.width
          }}
        >
          <div className="flex gap-2 items-center">
            <RangeSelectorComponent
              initialDate={selectedDateFrom as Date}
              onDateChange={handleFromDateChange}
              rangeStartDate={selectedDateFrom}
              rangeEndDate={selectedDateTo}
              isStartSelector={true}
              hasBeenSelected={selectedDateFrom != null}
            />

            <AnimatePresence mode="wait">
              {ranged && selectedDateFrom != null && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: horizontalAlign === 'right' ? 300 : 0,
                    width: 0
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    width: 'auto'
                  }}
                  exit={{
                    opacity: 0,
                    x: horizontalAlign === 'right' ? 300 : 0,
                    width: 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <RangeSelectorComponent
                    initialDate={selectedDateTo as Date}
                    onDateChange={handleToDateChange}
                    rangeStartDate={selectedDateFrom}
                    rangeEndDate={selectedDateTo}
                    isStartSelector={false}
                    hasBeenSelected={selectedDateTo != null}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={`relative inline-block ${className}`}>
      <Button className="w-full" variant={ghost ? 'ghost' : 'default'} ref={buttonRef} onClick={() => setCalendarPanelOpen((prev) => !prev)}>
        <Calendar size={16} strokeWidth={1.5} />

        {selectedDateFrom == null
          ? placeholder
          : selectedDateTo == null
          ? format(selectedDateFrom as Date, 'dd MM yyyy')
          : `${format(selectedDateFrom as Date, 'dd MM yyyy')} - ${format(selectedDateTo as Date, 'dd MM yyyy')}`}
        <ChevronDown size={16} strokeWidth={1.5} />
      </Button>
      {ReactDOM.createPortal(calendarPanel, document.body)}
    </div>
  )
}

export default DateInput
