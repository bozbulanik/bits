import { BrushCleaning, Calendar, ChartArea, FileCog, Pin, PinOff, Search, Settings, StickyNote, Trash, TriangleAlert, X } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useBitsStore } from '../stores/bitsStore'
import { useEffect, useRef, useState } from 'react'
import { Bit, BitData } from '../types/Bit'
import { getIconComponent } from '../utils/getIcon'
import { format, formatDistanceToNow } from 'date-fns'
import { useSettingsStore } from '../stores/settingsStore'
import { UserSettings } from '../types/UserSettings'
import { AnimatePresence, motion } from 'framer-motion'
import { clearBitsHistory, getBitIdsFromHistory, saveBitIdToHistory } from '../utils/searchHistory'

interface SearchItemProps {
  bit: Bit
  openBitDeletePanel: (id: string) => void
  togglePin: (id: string) => void
  settings: UserSettings
}
const SearchItem: React.FC<SearchItemProps> = ({ bit, openBitDeletePanel, togglePin, settings }) => {
  const [hovered, setHovered] = useState<boolean>(false)
  const getTextValue = (bit: Bit) => {
    if (!bit) return null
    // If it includes a text property render that otherwise render untitled
    const textProperty = bit.type.properties.find((property) => property.type === 'text')
    if (!textProperty) return null
    const bitData = bit.data.find((data) => data.propertyId === textProperty.id)
    if (!bitData) return null
    return <p className="text-sm">{bitData.value}</p>
  }
  const handlePinning = (bit: Bit) => {
    togglePin(bit.id)
  }
  const handleOpen = async (bitId: string) => {
    await window.ipcRenderer.invoke('openBitViewerWindow', bitId)
    await window.ipcRenderer.invoke('closeWindow', 'search')
    saveBitIdToHistory(bitId)
  }
  const getDateTimeFormats = (time: string) => {
    const { dateFormat, timeFormat } = settings.locale.timeSystem

    if (dateFormat.customPattern) {
      try {
        return format(new Date(time), dateFormat.customPattern)
      } catch {
        return fallbackTimeFormat()
      }
    }

    const datePattern = dateFormat.type.replace(/-/g, dateFormat.delimiter)

    const is12Hour = timeFormat.convention === '12-hour'
    const timeParts = [
      is12Hour ? 'hh:mm' : 'HH:mm',
      timeFormat.includeSeconds ? ':ss' : '',
      is12Hour ? ' a' : '',
      timeFormat.timeZoneDisplay ? ' O' : ''
    ]

    const timePattern = timeParts.join('').trim()
    const finalFormat = `${datePattern} ${timePattern}`.trim()

    try {
      return format(new Date(time), finalFormat)
    } catch {
      return fallbackTimeFormat()
    }
  }
  const fallbackTimeFormat = () => format(Date.now(), 'EE, MMM d HH:mm')

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer flex p-0.5 items-center rounded-md hover:bg-scry-bg hover:dark:bg-scry-bg-dark border border-transparent hover:border-border hover:dark:border-border-dark"
    >
      <div onClick={() => handleOpen(bit.id)} className="flex flex-1 items-center gap-2">
        <div className="p-1">
          {bit.type.iconName != '' ? (
            (() => {
              const Icon = getIconComponent(bit.type.iconName)
              return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
            })()
          ) : (
            <StickyNote size={16} strokeWidth={1.5} />
          )}
        </div>
        {getTextValue(bit) != null ? <p>{getTextValue(bit)}</p> : <p className="text-sm">Untitled</p>}
        <div className={`flex-1 flex items-center gap-2 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-text-muted">{getDateTimeFormats(bit.createdAt)}</p>
          <p className="ml-auto text-xs text-text-muted">Updated {formatDistanceToNow(new Date(bit.updatedAt), { addSuffix: true })}</p>
        </div>
      </div>

      <div className={`pl-2 flex ml-auto ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button onClick={() => handlePinning(bit)} variant={'iconGhost'}>
          {bit.pinned ? <PinOff size={16} strokeWidth={1.5} /> : <Pin size={16} strokeWidth={1.5} />}
        </Button>
        <Button onClick={() => openBitDeletePanel(bit.id)} variant={'iconDestructiveGhost'}>
          <Trash size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}

const SearchPage = () => {
  const [recentlyOpenedBitIds, setRecentlyOpenedBitIds] = useState<string[]>([])
  useEffect(() => {
    const history = getBitIdsFromHistory()
    setRecentlyOpenedBitIds(history)
  }, [])

  const [recentlyOpenedHovered, setRecentlyOpenedHovered] = useState<boolean>(false)
  const { settings } = useSettingsStore()

  const { bits, searchBits, deleteBit, togglePin, getBitById } = useBitsStore()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchBits>>([])

  useEffect(() => {
    setSearchResults(searchBits(searchQuery))
  }, [searchQuery, bits, searchBits])

  const pinnedBits = searchResults.filter((bit: Bit) => bit.pinned == 1)
  const unpinnedBits = searchResults.filter((bit: Bit) => bit.pinned == 0)

  const [bitDeletePanelOpened, setBitDeletPanelOpened] = useState<boolean>(false)
  const bitDeletePanelRef = useRef<HTMLDivElement>(null)
  const [bitIdToDelete, setBitIdToDelete] = useState<string>('')

  const openBitDeletePanel = (id: string) => {
    setBitDeletPanelOpened(true)
    setBitIdToDelete(id)
  }
  const handleBitDelete = () => {
    deleteBit(bitIdToDelete)
    setBitIdToDelete('')
    setBitDeletPanelOpened(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!bitDeletePanelRef.current?.contains(event.target as Node)) {
        setBitDeletPanelOpened(false)
      }
    }
    if (bitDeletePanelOpened) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [bitDeletePanelOpened])
  return (
    <div className="relative w-full h-full flex flex-col">
      <AnimatePresence mode="wait">
        {bitDeletePanelOpened && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full h-full pointer-events-auto z-50"
          >
            <div
              ref={bitDeletePanelRef}
              className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark rounded-md flex flex-col items-center"
            >
              <div className="flex flex-col p-2 w-full">
                <p className="font-semibold">Delete Bit</p>
                <p className="text-xs">This action cannot be undone.</p>
              </div>

              <div className="flex gap-2 items-center w-full p-2">
                <Button onClick={() => setBitDeletPanelOpened(false)} className="ml-auto">
                  Cancel
                </Button>
                <Button onClick={handleBitDelete} variant={'destructive'}>
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-12 p-2 flex gap-2 items-center">
        <Input
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<Search size={16} strokeWidth={1.5} />}
          inputSize={'md'}
          placeholder="Search..."
          variant={'ghost'}
        />
        <div className="drag-bar h-full flex-1">&nbsp;</div>

        <Button
          className="ml-auto"
          onClick={() => {
            if (searchQuery != '') {
              setSearchQuery('')
            } else {
              window.ipcRenderer.invoke('closeWindow', 'search')
            }
          }}
          variant={'icon'}
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="w-full bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark p-2 flex flex-col gap-2">
        <p className="font-semibold uppercase text-text-muted text-sm">Go to</p>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              await window.ipcRenderer.invoke('openWindow', 'advancedsearch')
              await window.ipcRenderer.invoke('closeWindow', 'search')
            }}
            variant={'default'}
          >
            <Settings size={16} strokeWidth={1.5} />
            Advanced Search
          </Button>
          <Button onClick={async () => await window.ipcRenderer.invoke('openWindow', 'calendar')} variant={'default'}>
            <Calendar size={16} strokeWidth={1.5} />
            Calendar
          </Button>
          <Button onClick={async () => await window.ipcRenderer.invoke('openWindow', 'analytics')} variant={'default'}>
            <ChartArea size={16} strokeWidth={1.5} />
            Analytics
          </Button>
          <Button onClick={async () => await window.ipcRenderer.invoke('openWindow', 'datamanager')} variant={'default'}>
            <FileCog size={16} strokeWidth={1.5} />
            Data Manager
          </Button>
          <Button onClick={async () => await window.ipcRenderer.invoke('openWindow', 'settings')} className="ml-auto" variant={'default'}>
            <Settings size={16} strokeWidth={1.5} />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 w-full overflow-auto">
        {recentlyOpenedBitIds.length > 0 ? (
          <div
            onMouseEnter={() => setRecentlyOpenedHovered(true)}
            onMouseLeave={() => setRecentlyOpenedHovered(false)}
            className="p-2 flex flex-col gap-2 border-b border-border dark:border-border-dark"
          >
            <div className="flex gap-2 items-center h-4 mt-2">
              <p className="text-sm uppercase font-semibold text-text-muted">Recently Opened</p>
              {recentlyOpenedHovered && (
                <Button onClick={clearBitsHistory} className="ml-auto" variant={'ghost'}>
                  <BrushCleaning size={16} strokeWidth={1.5} />
                  Clear history
                </Button>
              )}
            </div>
            <div className="flex flex-col">
              {recentlyOpenedBitIds.map((bitId, index) => {
                const bit = getBitById(bitId)
                if (!bit) return null
                return <SearchItem key={index} bit={bit} openBitDeletePanel={openBitDeletePanel} togglePin={togglePin} settings={settings} />
              })}
            </div>
          </div>
        ) : (
          ''
        )}
        {pinnedBits.length > 0 && (
          <div className="p-2 flex flex-col gap-2 border-b border-border dark:border-border-dark">
            <p className="text-sm uppercase font-semibold text-text-muted">Pinned</p>
            <div className="flex flex-col">
              {pinnedBits.map((bit: Bit) => (
                <SearchItem bit={bit} openBitDeletePanel={openBitDeletePanel} togglePin={togglePin} settings={settings} />
              ))}
            </div>
          </div>
        )}

        <div className="p-2 flex flex-col gap-2">
          <p className="text-sm uppercase font-semibold text-text-muted">All Bits</p>
          <div className="flex flex-col">
            {' '}
            {unpinnedBits.length > 0 ? (
              unpinnedBits.map((bit: Bit) => (
                <SearchItem bit={bit} openBitDeletePanel={openBitDeletePanel} togglePin={togglePin} settings={settings} />
              ))
            ) : (
              <p className="text-text-muted">No bits found</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-2 h-12 mt-auto border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default SearchPage
