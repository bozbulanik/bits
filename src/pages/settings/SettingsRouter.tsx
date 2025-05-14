import { Routes, Route } from 'react-router-dom'
import SettingsAbout from './SettingsAbout'
import SettingsLayout from '../../layouts/SettingsLayout'
import SettingsShortcuts from './SettingsShortcuts'
import SettingsAppearance from './SettingsAppearance'
import SettingsProfile from './SettingsProfile'
import SettingsGeneral from './SettingsGeneral'

const SettingsRouter = () => {
  return (
    <Routes>
      <Route
        path="/general"
        element={
          <SettingsLayout currentPage="general">
            <SettingsGeneral />
          </SettingsLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <SettingsLayout currentPage="profile">
            <SettingsProfile />
          </SettingsLayout>
        }
      />
      <Route
        path="/appearance"
        element={
          <SettingsLayout currentPage="appearance">
            <SettingsAppearance />
          </SettingsLayout>
        }
      />
      <Route
        path="/shortcuts"
        element={
          <SettingsLayout currentPage="shortcuts">
            <SettingsShortcuts />
          </SettingsLayout>
        }
      />
      <Route
        path="/about"
        element={
          <SettingsLayout currentPage="about">
            <SettingsAbout />
          </SettingsLayout>
        }
      />
    </Routes>
  )
}

export default SettingsRouter
