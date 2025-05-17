import { useState, useEffect } from 'react'

const DateTime = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
  return (
    <div className="text-sm p-2">
      {currentDate} {currentTime}
    </div>
  )
}
export default DateTime
