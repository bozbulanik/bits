import React, { useEffect, useState } from 'react'
import DateInput from './DateInput'
import TimeInput from './TimeInput'

interface DateTimeComponentProps {
  handlePropDV: (v: string) => void
}

const DateTimeComponent: React.FC<DateTimeComponentProps> = ({ handlePropDV }) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<Date>()

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const mergedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds()
      )
      handlePropDV(mergedDate.toISOString())
    }
  }, [selectedDate, selectedTime, handlePropDV])
  return (
    <div className="flex w-full items-center">
      <DateInput ghost className="w-full" placeholder="Set date" setCurrentDisplayDate={(e) => setSelectedDate(e)} horizontalAlign="left" />

      <TimeInput
        twelveHours={false}
        includeSeconds={false}
        ghost
        className="w-full"
        placeholder="Set time"
        setCurrentDisplayTime={(e) => setSelectedTime(e)}
        horizontalAlign="left"
      />
    </div>
  )
}

export default DateTimeComponent
