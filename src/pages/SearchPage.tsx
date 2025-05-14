import {
  ArrowDownAZ,
  Calendar,
  ChartArea,
  ChevronDown,
  ChevronRight,
  FileCog,
  MoreHorizontal,
  Notebook,
  Pin,
  PinOff,
  Search,
  Settings,
  SortAsc,
  SortDesc,
  Trash,
  X
} from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useBitsStore } from '../stores/bitsStore'
import { useEffect, useRef, useState } from 'react'
import { Bit } from '../types/Bit'
import { getIconComponent } from '../utils/getIcon'
import { format, formatDistance, formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface SearchItemProps {
  bit: Bit
}
const SearchItem: React.FC<SearchItemProps> = ({ bit }) => {
  const [hovered, setHovered] = useState<boolean>(false)
  const { deleteBit, updateBit } = useBitsStore()
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
    await window.ipcRenderer.invoke('openBitWindow', bitId)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer flex p-0.5 items-center rounded-md hover:bg-scry-bg hover:dark:bg-scry-bg-dark border border-transparent hover:border-border hover:dark:border-border-dark"
    >
      <div onClick={() => handleOpen(bit.id)} className="flex flex-1 gap-2">
        <div className="p-1">
          {(() => {
            const Icon = getIconComponent(bit.type.iconName)
            return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
          })()}
        </div>
        {getTextValue(bit) != null ? (
          <p>{getTextValue(bit)}</p>
        ) : (
          <p className="text-sm font-semibold">Untitled</p>
        )}
        <div
          className={`flex-1 flex items-center gap-2 transition duration-200 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-xs text-text-muted">
            {format(new Date(bit.createdAt), 'EE, MMM d hh:mm')}
          </p>
          <p className="ml-auto text-xs text-text-muted">
            Updated {formatDistanceToNow(new Date(bit.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div
        className={`pl-2 flex ml-auto transition duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
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
  const { bits, searchBits } = useBitsStore()
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} strokeWidth={1.5} />}
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
      <div className="p-2 bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark flex flex-col gap-2">
        <p className="font-semibold uppercase text-text-muted text-sm">Go to</p>
        <div className="flex gap-2">
          <Button variant={'default'}>
            <Calendar size={16} strokeWidth={1.5} />
            Calendar
          </Button>
          <Button variant={'default'}>
            <ChartArea size={16} strokeWidth={1.5} />
            Analytics
          </Button>
          <Button variant={'default'}>
            <FileCog size={16} strokeWidth={1.5} />
            Bit Type Manager
          </Button>
          <Button className="ml-auto" variant={'default'}>
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
                <SearchItem bit={bit} />
              ))}
            </div>
          </div>
        )}
        <div className="p-2 flex flex-col gap-2">
          <p className="text-sm uppercase font-semibold text-text-muted">All Bits</p>
          <div className="flex flex-col">
            {' '}
            {unpinnedBits.length > 0 ? (
              unpinnedBits.map((bit: Bit) => <SearchItem bit={bit} />)
            ) : (
              <p className="text-text-muted ">No bits found</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-2 h-12 mt-auto border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default SearchPage
