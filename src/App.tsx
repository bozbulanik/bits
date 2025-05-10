import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import SearchPage from './pages/SearchPage'
import { useEffect } from 'react'
import { useSettingsStore } from './stores/settingsStore'
import { PulseLoader } from 'react-spinners'
import TestingPage from './pages/TestingPage'

function App() {
  const { settings, initialized, initializeSettings } = useSettingsStore()

  useEffect(() => {
    if (!initialized) {
      initializeSettings()
    }
  }, [initialized, initializeSettings])

  useEffect(() => {
    if (initialized) {
      document.body.className = settings.theme.mode
    }
  }, [initialized, settings.theme])

  if (!initialized) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <PulseLoader size={4} color={settings.theme.mode == 'dark' ? 'white' : 'black'} />
          <p className="text-xl">Loading Application Settings</p>
        </div>
      </RootLayout>
    )
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/search"
          element={
            <RootLayout>
              <SearchPage />
            </RootLayout>
          }
        />
        <Route
          path="/testing"
          element={
            <RootLayout>
              <TestingPage />
            </RootLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
