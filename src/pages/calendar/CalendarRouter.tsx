import { Routes, Route } from 'react-router-dom'
import CalendarAgendaPage from './CalendarAgendaPage'
import CalendarLayout from '../../layouts/CalendarLayout'
import CalendarDayPage from './CalendarDayPage'

const CalendarRouter = () => {
  return (
    <Routes>
      <Route
        path="/agenda"
        element={
          <CalendarLayout page="Agenda">
            <CalendarAgendaPage />
          </CalendarLayout>
        }
      />
      <Route
        path="/day"
        element={
          <CalendarLayout page="Day">
            <CalendarDayPage />
          </CalendarLayout>
        }
      />
    </Routes>
  )
}

export default CalendarRouter
