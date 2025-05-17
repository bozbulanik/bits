import React from 'react'
import Button from '../components/Button'
import DateTime from '../components/DateTime'
import { X } from 'lucide-react'

interface CalendarLayoutProps {
  children: React.ReactNode
}
const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <div className="w-full h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold">Calendar</p>
          <p className="mr-1 ml-auto">
            <DateTime />
          </p>
        </div>
        <Button
          onClick={() => window.ipcRenderer.invoke('closeWindow', 'calendar')}
          variant={'icon'}
          className="ml-auto"
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      {children}
      <div className="p-2 h-12 mt-auto border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default CalendarLayout
