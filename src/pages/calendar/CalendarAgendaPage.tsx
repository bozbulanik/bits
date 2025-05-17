import Button from '../../components/Button'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const CalendarAgendaPage = () => {
  return (
    <>
      <div className="w-full bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark p-2 flex items-center gap-2">
        <Button variant={'icon'}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        <Button variant={'icon'}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
        <Button variant={'default'}>
          Monthly
          <Calendar size={16} strokeWidth={1.5} />
        </Button>

        <Button variant={'default'}>Today</Button>

        {/* <CalendarSelector className="ml-auto" option="agenda" /> */}
      </div>
      <div className="flex flex-col gap-2 flex-1 w-full overflow-auto">
        <p>Test</p>
      </div>
    </>
  )
}

export default CalendarAgendaPage
