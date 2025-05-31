import 'leaflet/dist/leaflet.css'
import 'flag-icons/css/flag-icons.min.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import SearchPage from './pages/SearchPage'
import { useEffect } from 'react'
import { useSettingsStore } from './stores/settingsStore'
import { PulseLoader } from 'react-spinners'
import TestingPage from './pages/TestingPage'
import ConfigurationWizard from './pages/configuration/ConfigurationWizard'
import { useBitTypesStore } from './stores/bitTypesStore'
import { useBitsStore } from './stores/bitsStore'
import Button from './components/Button'
import { MessageCircleQuestion } from 'lucide-react'
import ConfigurationInitial from './pages/configuration/ConfigurationInitial'
import SettingsRouter from './pages/settings/SettingsRouter'
import { useShortcutsStore } from './stores/shortcutsStore'
import BitViewer from './pages/BitViewer'
import CalendarRouter from './pages/calendar/CalendarRouter'
import BitTypes from './pages/bittypes/BitTypes'
import BitTypeCreate from './pages/bittypes/BitTypeCreate'
import BitTypeEdit from './pages/bittypes/BitTypeEdit'
import AnalyticsPage from './pages/AnalyticsPage'
import AdvancedSearchPage from './pages/AdvancedSearchPage'
import { useCollectionsStore } from './stores/collectionsStore'
import Collections from './pages/collections/Collections'
import CollectionCreate from './pages/collections/CollectionCreate'
import CollectionView from './pages/collections/CollectionView'
import CollectionEdit from './pages/collections/CollectionEdit'

function App() {
  const { isLoading: bitsLoading, loadError: bitsError } = useBitsStore()
  const { isLoading: typesLoading, loadError: typesError } = useBitTypesStore()
  const { isLoading: collectionsLoading, loadError: collectionsError } = useCollectionsStore()

  const { settings, initialized, loadSettings } = useSettingsStore()
  const { isLoading, error: shortcutsError, shortcuts, fetchShortcuts } = useShortcutsStore()
  useEffect(() => {
    const fetchData = async () => {
      try {
        await useBitTypesStore.getState().loadBitTypes()
        await useBitsStore.getState().loadBits()
        await useCollectionsStore.getState().loadCollections()
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!initialized) {
      loadSettings()
    }
  }, [initialized, loadSettings])

  useEffect(() => {
    if (initialized) {
      document.body.className = settings.theme.mode
    }
  }, [initialized, settings.theme.mode])

  useEffect(() => {
    fetchShortcuts()
  }, [fetchShortcuts])

  if (bitsLoading || typesLoading || collectionsLoading) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
          <PulseLoader size={4} color={settings.theme.mode == 'dark' ? 'white' : 'black'} />
          <p className="text-md">Loading Data</p>
        </div>
      </RootLayout>
    )
  }
  if (bitsError || typesError || collectionsError) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <p className="text-md text-red-500">500 Internal Server Error</p>
          <p className="text-text-muted">{(bitsError || typesError)?.message}</p>
          <Button variant={'default'}>
            <a href="https://github.com/bozbulanik/bits/issues/new/choose" target="_blank" className="flex gap-2 items-center w-full h-full">
              <MessageCircleQuestion size={16} strokeWidth={1.5} />
              Support
            </a>
          </Button>
        </div>
      </RootLayout>
    )
  }
  if (!initialized) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <PulseLoader size={4} color={settings.theme.mode == 'dark' ? 'white' : 'black'} />
          <p className="text-md">Loading Application Settings</p>
        </div>
      </RootLayout>
    )
  }
  if (isLoading && shortcuts.length === 0) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <PulseLoader size={4} color={settings.theme.mode == 'dark' ? 'white' : 'black'} />
          <p className="text-md">Loading Shortcuts</p>
        </div>
      </RootLayout>
    )
  }
  if (shortcutsError) {
    return (
      <RootLayout>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <p className="text-md text-red-500">Error</p>
          <p className="text-text-muted">{shortcutsError}</p>
          <Button variant={'default'}>
            <a href="https://github.com/bozbulanik/bits/issues/new/choose" target="_blank" className="flex gap-2 items-center w-full h-full">
              <MessageCircleQuestion size={16} strokeWidth={1.5} />
              Support
            </a>
          </Button>
        </div>
      </RootLayout>
    )
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/configuration"
          element={
            <RootLayout>
              <ConfigurationInitial />
            </RootLayout>
          }
        />
        <Route
          path="/configuration/*"
          element={
            <RootLayout>
              <ConfigurationWizard />
            </RootLayout>
          }
        />
        <Route
          path="/search"
          element={
            <RootLayout>
              <SearchPage />
            </RootLayout>
          }
        />
        <Route
          path="/advancedsearch"
          element={
            <RootLayout>
              <AdvancedSearchPage />
            </RootLayout>
          }
        />
        <Route
          path="/bitviewer/:id"
          element={
            <RootLayout>
              <BitViewer />
            </RootLayout>
          }
        />
        <Route
          path="/bittypes"
          element={
            <RootLayout>
              <BitTypes />
            </RootLayout>
          }
        />
        <Route
          path="/bittypes/create-type"
          element={
            <RootLayout>
              <BitTypeCreate />
            </RootLayout>
          }
        />
        <Route
          path="/bittypes/edit-type/:typeId"
          element={
            <RootLayout>
              <BitTypeEdit />
            </RootLayout>
          }
        />

        <Route
          path="/collections"
          element={
            <RootLayout>
              <Collections />
            </RootLayout>
          }
        />
        <Route
          path="/collections/create-collection"
          element={
            <RootLayout>
              <CollectionCreate />
            </RootLayout>
          }
        />
        <Route
          path="/collections/edit-collection/:collectionId"
          element={
            <RootLayout>
              <CollectionEdit />
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
        <Route
          path="/settings/*"
          element={
            <RootLayout>
              <SettingsRouter />
            </RootLayout>
          }
        />
        <Route
          path="/calendar/*"
          element={
            <RootLayout>
              <CalendarRouter />
            </RootLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <RootLayout>
              <AnalyticsPage />
            </RootLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
