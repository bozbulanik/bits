import {
  Calendar,
  ChartArea,
  FileCog,
  Pin,
  PinOff,
  Search,
  Settings,
  StickyNote,
  Trash,
  X
} from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useBitsStore } from '../stores/bitsStore'
import { useEffect, useState } from 'react'
import { Bit, BitData } from '../types/Bit'
import { getIconComponent } from '../utils/getIcon'
import { format, formatDistanceToNow } from 'date-fns'
import { useSettingsStore } from '../stores/settingsStore'
import { UserSettings } from '../types/UserSettings'

interface SearchItemProps {
  bit: Bit
  deleteBit: (id: string) => void
  updateBit: (
    id: string,
    createdAt: string,
    updatedAt: string,
    pinned: number,
    data: BitData[]
  ) => void
  settings: UserSettings
}
const SearchItem: React.FC<SearchItemProps> = ({ bit, deleteBit, updateBit, settings }) => {
  const [hovered, setHovered] = useState<boolean>(false)
  const getTextValue = (bit: Bit) => {
    // If it includes a text property render that otherwise render untitled
    const textProperty = bit.type.properties.find((property) => property.type === 'text')
    if (!textProperty) return null
    const bitData = bit.data.find((data) => data.propertyId === textProperty.id)
    if (!bitData) return null
    return <p className="text-sm font-semibold">{bitData.value}</p>
  }
  const handlePinning = (bit: Bit) => {
    if (bit.pinned) {
      updateBit(bit.id, bit.createdAt, new Date().toISOString(), 0, bit.data)
    } else {
      updateBit(bit.id, bit.createdAt, new Date().toISOString(), 1, bit.data)
    }
  }
  const handleOpen = async (bitId: string) => {
    await window.ipcRenderer.invoke('openBitViewerWindow', bitId)
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
        {getTextValue(bit) != null ? (
          <p>{getTextValue(bit)}</p>
        ) : (
          <p className="text-sm font-semibold">Untitled</p>
        )}
        <div className={`flex-1 flex items-center gap-2 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-text-muted">{getDateTimeFormats(bit.createdAt)}</p>
          <p className="ml-auto text-xs text-text-muted">
            Updated {formatDistanceToNow(new Date(bit.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className={`pl-2 flex ml-auto ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button onClick={() => handlePinning(bit)} variant={'iconGhost'}>
          {bit.pinned ? (
            <PinOff size={16} strokeWidth={1.5} />
          ) : (
            <Pin size={16} strokeWidth={1.5} />
          )}
        </Button>
        <Button onClick={() => deleteBit(bit.id)} variant={'iconDestructiveGhost'}>
          <Trash size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}

const SearchPage = () => {
  const { settings } = useSettingsStore()

  const { bits, searchBits, deleteBit, updateBit } = useBitsStore()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchBits>>([])

  useEffect(() => {
    setSearchResults(searchBits(searchQuery))
  }, [searchQuery, bits, searchBits])

  const pinnedBits = searchResults.filter((bit: Bit) => bit.pinned == 1)
  const unpinnedBits = searchResults.filter((bit: Bit) => bit.pinned == 0)

  return (
    <div className="w-full h-full flex flex-col">
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
            onClick={async () => await window.ipcRenderer.invoke('openWindow', 'calendar')}
            variant={'default'}
          >
            <Calendar size={16} strokeWidth={1.5} />
            Calendar
          </Button>
          <Button
            onClick={async () => await window.ipcRenderer.invoke('openWindow', 'analytics')}
            variant={'default'}
          >
            <ChartArea size={16} strokeWidth={1.5} />
            Analytics
          </Button>
          <Button
            onClick={async () => await window.ipcRenderer.invoke('openWindow', 'bittypemanager')}
            variant={'default'}
          >
            <FileCog size={16} strokeWidth={1.5} />
            Bit Type Manager
          </Button>
          <Button
            onClick={async () => await window.ipcRenderer.invoke('openWindow', 'settings')}
            className="ml-auto"
            variant={'default'}
          >
            <Settings size={16} strokeWidth={1.5} />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 w-full overflow-auto">
        {pinnedBits.length > 0 && (
          <div className="p-2 flex flex-col gap-2 border-b border-border dark:border-border-dark">
            <p className="text-sm uppercase font-semibold text-text-muted">Pinned</p>
            <div className="flex flex-col">
              {pinnedBits.map((bit: Bit) => (
                <SearchItem
                  bit={bit}
                  deleteBit={deleteBit}
                  updateBit={updateBit}
                  settings={settings}
                />
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
                <SearchItem
                  bit={bit}
                  deleteBit={deleteBit}
                  updateBit={updateBit}
                  settings={settings}
                />
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
