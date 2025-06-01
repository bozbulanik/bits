import React from 'react'
import Button from '../components/Button'
import { Search, X } from 'lucide-react'
import Input from '../components/Input'
import CalendarInput from '../components/DateInput'

// Aplied filters / sort
// Filters:
// - Conditionals
// - Simple type / category filters (selected will be applied to conditionals immediately)
// Sort:
// - Alphabetical
// - Newest first / oldest first

const AdvancedSearchPage = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 p-2 flex gap-2 items-center">
        <p className="font-semibold">Advanced Search</p>
        {/* <Input autoFocus leftSection={<Search size={16} strokeWidth={1.5} />} inputSize={'md'} placeholder="Search..." variant={'ghost'} /> */}
        <div className="drag-bar h-full flex-1">&nbsp;</div>

        <Button className="ml-auto" variant={'icon'} onClick={() => window.ipcRenderer.invoke('closeWindow', 'advancedsearch')}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="w-full bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark p-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <CalendarInput ranged horizontalAlign="left" setCurrentDisplayDate={() => {}} placeholder="Display by Date Range" />
          <Button className="ml-auto">Bit Type</Button>
          <Button className="">Category</Button>
          <Button className="">Sort</Button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearchPage
