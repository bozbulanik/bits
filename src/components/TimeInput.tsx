import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Button from './Button'
import { ChevronDown, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import TimeRangeSelectorComponent from './TimeRangeSelectorComponent'

interface TimeInputProps {
  placeholder?: string
  className?: string
  setCurrentDisplayTime: (time: Date) => void
  setCurrentDisplayTimeEnd?: (time: Date) => void
  ranged?: boolean
  ghost?: boolean
  horizontalAlign?: 'left' | 'right'
  twelveHours: boolean
  includeSeconds: boolean
}

const TimeInput: React.FC<TimeInputProps> = ({
  className,
  placeholder,
  setCurrentDisplayTime,
  setCurrentDisplayTimeEnd,
  ranged = false,
  ghost = false,
  horizontalAlign,
  twelveHours = false,
  includeSeconds = true
}) => {
  const [selectedTimeFrom, setSelectedTimeFrom] = useState<Date | null>(null)
  const [selectedTimeTo, setSelectedTimeTo] = useState<Date | null>(null)
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

  const handleFromTimeChange = (time: Date) => {
    setSelectedTimeFrom(time)
    if (selectedTimeTo && time > selectedTimeTo) {
      setSelectedTimeTo(null)
    }
    if (!ranged && time) {
      setCurrentDisplayTime(time)
      if (setCurrentDisplayTimeEnd) {
        setCurrentDisplayTimeEnd(new Date())
      }
      setCalendarPanelOpen(false)
    }
  }

  const handleToTimeChange = (time: Date) => {
    setSelectedTimeTo(time)
    if (selectedTimeFrom && time) {
      setCurrentDisplayTime(selectedTimeFrom)
      if (setCurrentDisplayTimeEnd) {
        setCurrentDisplayTimeEnd(time)
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
          className={`${selectedTimeFrom && ranged ? 'min-w-148' : 'min-w-96'} fixed z-100`}
          style={{
            top: panelPosition.top + 8,
            left: horizontalAlign === 'left' ? panelPosition.left : undefined,
            right: horizontalAlign === 'right' ? window.innerWidth - (panelPosition.left! + panelPosition.width) : 'undefined',
            width: panelPosition.width
          }}
        >
          <div className="flex gap-2 items-center">
            <TimeRangeSelectorComponent
              initialTime={selectedTimeFrom as Date}
              onTimeChange={handleFromTimeChange}
              rangeStartTime={selectedTimeFrom}
              rangeEndTime={selectedTimeTo}
              isStartSelector={true}
              hasBeenSelected={selectedTimeFrom != null}
              twelveHours={twelveHours}
              includeSeconds={includeSeconds}
            />

            <AnimatePresence mode="wait">
              {ranged && selectedTimeFrom != null && (
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
                  <TimeRangeSelectorComponent
                    initialTime={selectedTimeTo as Date}
                    onTimeChange={handleToTimeChange}
                    rangeStartTime={selectedTimeFrom}
                    rangeEndTime={selectedTimeTo}
                    isStartSelector={false}
                    hasBeenSelected={selectedTimeTo != null}
                    twelveHours={twelveHours}
                    includeSeconds={includeSeconds}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const timeFormat = `HH:mm${includeSeconds ? ':ss' : ''} ${twelveHours ? 'a' : ''}`

  return (
    <div className={`relative inline-block ${className}`}>
      <Button className="w-full" variant={ghost ? 'ghost' : 'default'} ref={buttonRef} onClick={() => setCalendarPanelOpen((prev) => !prev)}>
        <Clock size={16} strokeWidth={1.5} />

        {selectedTimeFrom == null
          ? placeholder
          : selectedTimeTo == null
          ? format(selectedTimeFrom as Date, timeFormat)
          : `${format(selectedTimeFrom as Date, timeFormat)} - ${format(selectedTimeTo as Date, timeFormat)}`}
        <ChevronDown size={16} strokeWidth={1.5} />
      </Button>
      {ReactDOM.createPortal(calendarPanel, document.body)}
    </div>
  )
}

export default TimeInput
