import { useEffect, useRef, useState } from 'react'

import { format, startOfToday } from 'date-fns'
import Button from './Button'
import { Check, X } from 'lucide-react'

interface TimeRangeSelectorComponentProps {
  initialTime: Date
  onTimeChange: (time: Date) => void
  rangeStartTime: Date | null
  rangeEndTime: Date | null
  isStartSelector: boolean
  hasBeenSelected: boolean
  twelveHours: boolean
  includeSeconds: boolean
}

const TimeRangeSelectorComponent: React.FC<TimeRangeSelectorComponentProps> = ({
  initialTime = startOfToday(),
  onTimeChange = (time: Date) => {},
  rangeStartTime = null,
  rangeEndTime = null,
  isStartSelector = false,
  hasBeenSelected = false,
  twelveHours = true,
  includeSeconds = true
}) => {
  const [selectedTime, setSelectedTime] = useState(initialTime)
  const [hour, setHour] = useState<number>(0)
  const [minute, setMinute] = useState<number>(0)
  const [second, setSecond] = useState<number>(0)
  const [isAM, setIsAM] = useState<boolean>(true)

  const [isHourSelected, setHourSelected] = useState<boolean>(false)
  const [isMinuteSelected, setMinuteSelected] = useState<boolean>(false)
  const [isSecondSelected, setSecondSelected] = useState<boolean>(false)
  const [isAMPMSelected, setAMPMSelected] = useState<boolean>(false)

  const hourPanelRef = useRef<HTMLDivElement>(null)
  const minutePanelRef = useRef<HTMLDivElement>(null)
  const secondPanelRef = useRef<HTMLDivElement>(null)
  const amPMPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialTime) {
      setSelectedTime(initialTime)
      setHour(initialTime.getHours())
      setMinute(initialTime.getMinutes())
      setSecond(initialTime.getSeconds())
      setIsAM(initialTime.getHours() < 12)
    }
  }, [initialTime])

  function constructTime(): Date {
    let h = hour

    if (twelveHours) {
      if (isAM && h === 12) h = 0
      if (!isAM && h < 12) h += 12
    }

    const newTime = new Date(selectedTime)
    newTime.setHours(h)
    newTime.setMinutes(minute)
    newTime.setSeconds(includeSeconds ? second : 0)
    newTime.setMilliseconds(0)

    return newTime
  }
  const handleTimeSelect = () => {
    const updatedTime = constructTime()
    setSelectedTime(updatedTime)
    onTimeChange(updatedTime)
  }

  return (
    <div
      className={`text-text dark:text-text-dark flex flex-col border rounded-md border-border dark:border-border-dark transition-color duration-300 ease-in-out ${
        hasBeenSelected ? 'bg-scry-bg dark:bg-scry-bg-dark' : 'bg-bg dark:bg-bg-dark'
      }`}
    >
      <div className="flex items-center gap-2 justify-between p-2">
        <p>{format(constructTime(), `HH:mm${includeSeconds ? ':ss' : ''} ${twelveHours ? 'a' : ''}`)}</p>
        <Button onClick={() => handleTimeSelect()} variant={'iconGhost'}>
          <Check size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex items-center gap-2 border-b border-border dark:border-border-dark">
        <div className="w-16 flex items-center justify-center text-text-muted">
          <p className="text-sm">Hour</p>
        </div>
        <div className="w-16 flex items-center justify-center text-text-muted">
          <p className="text-sm">Minute</p>
        </div>
        {includeSeconds && (
          <div className="w-16 flex items-center justify-center text-text-muted">
            <p className="text-sm">Seconds</p>
          </div>
        )}
        {twelveHours && (
          <div className="w-16 flex items-center justify-center text-text-muted">
            <p className="text-sm">AM/PM</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div ref={hourPanelRef} className="p-1 h-48 w-16 overflow-y-auto no-scrollbar flex flex-col gap-1 items-center">
          {[...Array(twelveHours ? 12 : 24)].map((_, index) => (
            <div
              key={index}
              onClick={() => {
                setHour(index)
                setHourSelected(true)
                if (hourPanelRef.current) {
                  const elements = hourPanelRef.current.querySelectorAll('.hours')
                  if (elements[index]) {
                    elements[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
              className={`hours text-center text-sm p-1 w-full cursor-pointer hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-md ${
                hour == index ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark' : 'bg-transparent'
              }`}
            >
              {String(index).padStart(2, '0')}
            </div>
          ))}
        </div>
        <div ref={minutePanelRef} className="p-1 h-48 w-16 overflow-y-auto no-scrollbar flex flex-col gap-1 items-center">
          {[...Array(60)].map((_, index) => (
            <div
              key={index}
              onClick={() => {
                setMinute(index)
                setMinuteSelected(true)
                if (minutePanelRef.current) {
                  const elements = minutePanelRef.current.querySelectorAll('.minutes')
                  if (elements[index]) {
                    elements[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
              className={`minutes text-center text-sm p-1 w-full cursor-pointer hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-md ${
                minute == index ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark' : 'bg-transparent'
              }`}
            >
              {String(index).padStart(2, '0')}
            </div>
          ))}
        </div>
        {includeSeconds && (
          <div ref={secondPanelRef} className="p-1 h-48 w-16 overflow-y-auto no-scrollbar flex flex-col gap-1 items-center">
            {[...Array(60)].map((_, index) => (
              <div
                key={index}
                onClick={() => {
                  setSecond(index)
                  setSecondSelected(true)
                  if (secondPanelRef.current) {
                    const elements = secondPanelRef.current.querySelectorAll('.seconds')
                    if (elements[index]) {
                      elements[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }
                }}
                className={`seconds text-center text-sm p-1 w-full cursor-pointer hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-md ${
                  second == index ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark' : 'bg-transparent'
                }`}
              >
                {String(index).padStart(2, '0')}
              </div>
            ))}
          </div>
        )}
        {twelveHours && (
          <div ref={amPMPanelRef} className="p-1 h-48 w-16 overflow-y-auto no-scrollbar flex flex-col gap-1 items-center">
            <div
              onClick={() => {
                setIsAM(true)
                setAMPMSelected(true)
              }}
              className={`text-center text-sm p-1 w-full cursor-pointer hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-md ${
                isAM ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark' : 'bg-transparent'
              }`}
            >
              AM
            </div>
            <div
              onClick={() => {
                setIsAM(false)
                setAMPMSelected(true)
              }}
              className={`text-center text-sm p-1 w-full cursor-pointer hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-md ${
                !isAM ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark' : 'bg-transparent'
              }`}
            >
              PM
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeRangeSelectorComponent
