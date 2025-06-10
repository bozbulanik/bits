import React from 'react'
import Button from '../components/Button'
import DateTime from '../components/DateTime'
import { MoreHorizontal, X } from 'lucide-react'
import SegmentedControl from '../components/SegmentedControl'
import { useNavigate } from 'react-router-dom'

interface CalendarLayoutProps {
  children: React.ReactNode
  page: string
}
const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children, page }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className=" flex items-center p-2 gap-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold text-lg">Calendar - {page}</p>
        </div>

        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'} className="ml-auto">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </Button>
        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'} className="ml-auto">
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex items-center justify-center"></div>
      {children}
    </div>
  )
}

export default CalendarLayout
