import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import RangeSelectorComponent from './RangeSelectorComponent'
import Button from './Button'

interface RangeSelectorPanelProps {
  left?: number
  right?: number
  top?: number
  bottom?: number
  isOpen: boolean
  rangeType: string
  toggleRangeSelector: () => void
  setRangeType: (range: string) => void
  setCurrentDisplayDate: (date: string) => void
  setCurrentDisplayDateEnd: (date: string) => void
  buttonRef: React.RefObject<HTMLButtonElement>
  includeAllTime?: boolean
}

const RangeSelectorPanel: React.FC<RangeSelectorPanelProps> = ({
  top,
  left,
  right,
  bottom,
  isOpen,
  rangeType,
  toggleRangeSelector,
  setRangeType,
  setCurrentDisplayDate,
  setCurrentDisplayDateEnd,
  buttonRef,
  includeAllTime = false
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(null)
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        toggleRangeSelector()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, toggleRangeSelector])

  const handleFromDateChange = (date: Date) => {
    setSelectedDateFrom(date)

    if (selectedDateTo && date > selectedDateTo) {
      setSelectedDateTo(null)
    }
  }
  const handleToDateChange = (date: Date) => {
    setSelectedDateTo(date)
    if (selectedDateFrom && date) {
      // Set range type to custom
      setRangeType('custom')

      // Convert Date objects to strings in 'yyyy-MM-dd' format
      setCurrentDisplayDate(format(selectedDateFrom, 'yyyy-MM-dd'))
      setCurrentDisplayDateEnd(format(date, 'yyyy-MM-dd'))

      // Close the range selector
      toggleRangeSelector()
    }
  }
  const handlePresetClick = (preset: string) => {
    setRangeType(preset)
    toggleRangeSelector()
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={twMerge(
            'absolute p-2 flex items-center rounded-md bg-bg dark:bg-bg-dark border border-border dark:border-border-dark z-50',
            selectedDateFrom ? 'min-w-148' : 'min-w-74'
          )}
          style={{ left: `${left}px`, top: `${top}px`, right: `${right}px`, bottom: `${bottom}px` }}
        >
          <div className="flex flex-col w-full h-full items-center gap-2">
            <div className="flex justify-between w-full gap-2">
              <Button
                variant={rangeType == 'weekly' ? 'selectedTab' : 'tab'}
                className="flex-1"
                onClick={() => {
                  handlePresetClick('weekly')
                }}
              >
                Weekly
              </Button>
              <Button
                variant={rangeType == 'monthly' ? 'selectedTab' : 'tab'}
                className="flex-1"
                onClick={() => handlePresetClick('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={rangeType == 'yearly' ? 'selectedTab' : 'tab'}
                className="flex-1"
                onClick={() => handlePresetClick('yearly')}
              >
                Yearly
              </Button>
              {includeAllTime && (
                <Button
                  variant={rangeType == 'alltime' ? 'selectedTab' : 'tab'}
                  className="flex-1"
                  onClick={() => handlePresetClick('alltime')}
                >
                  All-time
                </Button>
              )}
            </div>
            <div className="flex-1 w-full h-full flex gap-2">
              <RangeSelectorComponent
                initialDate={selectedDateFrom as Date}
                onDateChange={handleFromDateChange}
                rangeStartDate={selectedDateFrom as null}
                rangeEndDate={selectedDateTo as null}
                isStartSelector={true}
              />
              {selectedDateFrom != null && (
                <RangeSelectorComponent
                  initialDate={selectedDateTo as Date}
                  onDateChange={handleToDateChange}
                  rangeStartDate={selectedDateFrom}
                  rangeEndDate={selectedDateTo as null}
                  isStartSelector={false}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RangeSelectorPanel
