import { Routes, Route } from 'react-router-dom'
import CalendarAgendaPage from './CalendarAgendaPage'
import CalendarLayout from '../../layouts/CalendarLayout'

const CalendarRouter = () => {
  return (
    <Routes>
      <Route
        path="/agenda"
        element={
          <CalendarLayout>
            <CalendarAgendaPage />
          </CalendarLayout>
        }
      />
    </Routes>
  )
}

export default CalendarRouter
