import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  ArrowBigUp,
  ArrowDown,
  ArrowUp,
  Calendar,
  Command,
  CornerDownLeft,
  Delete,
  Folder,
  Monitor,
  Option,
  Plus,
  Search,
  Settings,
  Type,
  Workflow,
  X
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBitsStore } from '../stores/bitsStore'
import { Bit, BitTypeDefinition, Collection } from '../types/Bit'
import { getIconComponent } from '../utils/getIcon'
import { useCollectionsStore } from '../stores/collectionsStore'
import { useBitTypesStore } from '../stores/bitTypesStore'

interface BaseItem {
  id: string
  title: string
  description?: string
  type: 'bit' | 'collection' | 'bitType' | 'workflow' | 'monitor' | 'setting'
  createdAt: Date
  updatedAt: Date
  icon: React.ReactNode
}

interface BitItem extends BaseItem {
  type: 'bit'
  pinned: string
}

interface CollectionItem extends BaseItem {
  type: 'collection'
  itemCount: number
  pinned: string
}

interface BitTypeItem extends BaseItem {
  type: 'bitType'
  fields: string[]
}

interface WorkflowItem extends BaseItem {
  type: 'workflow'
  steps: number
  pinned: string
}

interface MonitorItem extends BaseItem {
  type: 'monitor'
  isActive: boolean
  pinned: string
}

interface SettingItem extends BaseItem {
  type: 'setting'
  category: string
  value: any
}

interface BaseAction {
  id: string
  title: string
  type: 'quickAction' | 'navigation'
  icon: React.ReactNode
  action: () => void
  shortcut: React.ReactNode
}
interface QuickAction extends BaseAction {
  type: 'quickAction'
  usage: number
}
interface NavigateAction extends BaseAction {
  type: 'navigation'
}

type SearchableItem = BitItem | CollectionItem | BitTypeItem | WorkflowItem | MonitorItem | SettingItem

type SearchResult = {
  id: string
  title: string
  type: 'item' | 'quickAction' | 'navigation' | 'createAction'
  icon: React.ReactNode
  action: () => void
  matchScore: number
  matchType: 'exact' | 'semantic' | 'partial'
  metadata?: {
    originalItem?: SearchableItem
    itemType?: string
    usage?: number
    query?: string
    shortcut?: React.ReactNode
  }
}

const mockWorkflows: WorkflowItem[] = [
  {
    icon: <Workflow size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Content Review',
    type: 'workflow',
    steps: 3,
    createdAt: new Date(2024, 4, 10),
    updatedAt: new Date(),
    pinned: 'False'
  }
]

const mockMonitors: MonitorItem[] = [
  {
    icon: <Monitor size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'System Health',
    type: 'monitor',
    isActive: true,
    createdAt: new Date(2024, 4, 1),
    updatedAt: new Date(),
    pinned: 'False'
  }
]

const mockSettings: SettingItem[] = [
  {
    icon: <Settings size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Theme',
    type: 'setting',
    category: 'Appearance',
    value: 'dark',
    createdAt: new Date(2024, 4, 1),
    updatedAt: new Date()
  },
  {
    icon: <Settings size={16} strokeWidth={1.5} />,
    id: '2',
    title: 'Notifications',
    type: 'setting',
    category: 'General',
    value: true,
    createdAt: new Date(2024, 4, 1),
    updatedAt: new Date()
  }
]
// ---
const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Create a bit',
    icon: <Plus size={16} strokeWidth={1.5} />,
    action: () => console.log('Create bit'),
    usage: 10,
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
      </div>
    ),
    type: 'quickAction'
  },
  {
    id: '2',
    title: 'Create a collection',
    icon: <Folder size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'collections', 'create', '', 480, 720)
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    usage: 8,
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
      </div>
    ),
    type: 'quickAction'
  },
  {
    id: '3',
    title: 'Create a bit type',
    icon: <Type size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'bittypes', 'create', '', 0, 0, '')
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    usage: 5,
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
      </div>
    ),
    type: 'quickAction'
  }
]

const navigations: NavigateAction[] = [
  {
    id: '1',
    title: 'Calendar',
    icon: <Calendar size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'calendar')
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <ArrowBigUp size={16} strokeWidth={1.5} /> <p>C</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '2',
    title: 'Settings',
    icon: <Settings size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'settings')
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>S</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '3',
    title: 'Bit Type Manager',
    icon: <Type size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'bittypes', '', '', 480, 720)
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>B</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '4',
    title: 'Collections Manager',
    icon: <Folder size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'collections', '', '', 480, 720)
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>C</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '5',
    title: 'Advanced Search',
    icon: <Search size={16} strokeWidth={1.5} />,
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'advancedsearch')
      window.ipcRenderer.invoke('closeWindow', 'search')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <ArrowBigUp size={16} strokeWidth={1.5} />
        <p>S</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '6',
    title: 'Workflows (WIP)',
    icon: <Workflow size={16} strokeWidth={1.5} />,
    action: () => console.log('Navigate to workflows'),
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>W</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '7',
    title: 'Monitors (WIP)',
    icon: <Monitor size={16} strokeWidth={1.5} />,
    action: () => console.log('Navigate to monitors'),
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>M</p>
      </div>
    ),
    type: 'navigation'
  }
]

const handleItemAction = (item: SearchableItem) => {
  switch (item.type) {
    case 'bit':
      break
    case 'collection':
      window.ipcRenderer.invoke('openWindow', 'collections', 'view', item.id, 720, 720, '')
      window.ipcRenderer.invoke('closeWindow', 'search')
      break
    case 'monitor':
      console.log(`Navigate to ${item.type} view:`, item.id)
      break
    case 'bitType':
      window.ipcRenderer.invoke('openWindow', 'bittypes', 'edit', item.id, 0, 0, '')
      window.ipcRenderer.invoke('closeWindow', 'search')
      break
    case 'workflow':
      console.log(`Navigate to ${item.type} edit:`, item.id)
      break
    case 'setting':
      console.log(`Navigate to settings, focus:`, item.title)
      break
  }
}

const parseDate = (query: string): Date | null => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('today')) return new Date()
  if (lowerQuery.includes('tomorrow')) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }
  if (lowerQuery.includes('yesterday')) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }

  // Try to parse direct dates (simple implementation)
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const match = query.match(dateRegex)
  if (match) {
    const [, month, day, year] = match
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  return null
}

const checkSemanticMatch = (query: string, title: string): boolean => {
  const semanticMap = {
    'new bit': 'Create a bit',
    'add bit': 'Create a bit',
    'make bit': 'Create a bit',
    'new collection': 'Create a collection',
    'add folder': 'Create a collection',
    'new template': 'Create a bit type'
  }

  return Object.entries(semanticMap).some(
    ([keywords, actionTitle]) => keywords.split(' ').every((keyword) => query.includes(keyword)) && title === actionTitle
  )
}

const checkNavigationSemanticMatch = (query: string, title: string): boolean => {
  const navMap = {
    settings: ['setting', 'config', 'preference'],
    calendar: ['calendar', 'date', 'schedule'],
    'bit type manager': ['template', 'bit type'],
    'collections manager': ['folder', 'group']
  }

  return Object.entries(navMap).some(
    ([navTitle, keywords]) => title.toLowerCase().includes(navTitle) && keywords.some((keyword) => query.includes(keyword))
  )
}

const SearchPage = () => {
  const { bits } = useBitsStore()
  const { collections } = useCollectionsStore()
  const { bitTypes } = useBitTypesStore()
  const [allItems, setAllItems] = useState<SearchableItem[]>([...mockWorkflows, ...mockMonitors, ...mockSettings])

  useEffect(() => {
    const allBits = bits.map((bit: Bit) => {
      const getTextValue = (bit: Bit) => {
        if (!bit) return undefined
        const textProperty = bit.type.properties.find((property) => property.type === 'text')
        if (!textProperty) return 'Untitled'
        const bitData = bit.data.find((data) => data.propertyId === textProperty.id)
        if (!bitData) return 'Untitled'
        return bitData.value as string
      }
      return {
        id: bit.id,
        title: getTextValue(bit),
        type: 'bit',
        createdAt: new Date(bit.createdAt),
        updatedAt: new Date(bit.updatedAt),
        pinned: bit.pinned === 1 ? 'True' : 'False',
        icon: (() => {
          const Icon = getIconComponent(bit.type.iconName)
          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
        })()
      } as BitItem
    })

    const allCollections = collections.map((collection: Collection) => {
      return {
        id: collection.id,
        title: collection.name,
        type: 'collection',
        itemCount: collection.items.length,
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.updatedAt),
        pinned: 'False',
        icon: (() => {
          const Icon = getIconComponent(collection.iconName)
          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
        })()
      } as CollectionItem
    })

    const allBitTypes = bitTypes.map((bitType: BitTypeDefinition) => {
      return {
        id: bitType.id,
        title: bitType.name,
        description: bitType.description,
        type: 'bitType',
        fields: [...bitType.properties.map((prop) => prop.name)],
        createdAt: new Date(),
        updatedAt: new Date(),
        icon: (() => {
          const Icon = getIconComponent(bitType.iconName)
          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
        })()
      } as BitTypeItem
    })

    setAllItems((prev) => [...prev, ...allBits, ...allCollections, ...allBitTypes])
  }, [])

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedItemRef.current && selectedIndex >= 0) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  const { recentItems, pinnedItems } = useMemo(() => {
    const recent = [...allItems].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3)
    const pinned = allItems.filter((item) => 'pinned' in item && item.pinned == 'True')

    return { recentItems: recent, pinnedItems: pinned }
  }, [allItems])

  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      const results: SearchResult[] = []
      recentItems.forEach((item) => {
        results.push({
          id: `recent-${item.id}`,
          title: item.title,
          type: 'item',
          icon: item.icon,
          action: () => handleItemAction(item),
          matchScore: 1,
          matchType: 'exact',
          metadata: { itemType: item.type, originalItem: item }
        })
      })

      // Pinned items
      pinnedItems.forEach((item) => {
        results.push({
          id: `pinned-${item.id}`,
          title: item.title,
          type: 'item',
          icon: item.icon,
          action: () => handleItemAction(item),
          matchScore: 1,
          matchType: 'exact',
          metadata: { itemType: item.type, originalItem: item }
        })
      })

      quickActions
        .sort((a, b) => b.usage - a.usage)
        .forEach((action) => {
          results.push({
            id: `quick-${action.id}`,
            title: action.title,
            type: 'quickAction',
            icon: action.icon,
            action: action.action,
            matchScore: 1,
            matchType: 'exact',
            metadata: { usage: action.usage, shortcut: action.shortcut }
          })
        })
      navigations.forEach((nav) => {
        results.push({
          id: `nav-${nav.id}`,
          title: nav.title,
          type: 'navigation',
          icon: nav.icon,
          action: nav.action,
          matchScore: 1,
          matchType: 'exact',
          metadata: { shortcut: nav.shortcut }
        })
      })
      return results
    }
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    const searchDate = parseDate(query)

    allItems.forEach((item) => {
      const lowerTitle = item.title.toLowerCase()
      const titleMatch = lowerTitle.includes(lowerQuery)
      const isExact = lowerTitle === lowerQuery

      let hasDateMatch = false
      if (searchDate) {
        if (
          (item.type === 'bit' && (item as BitItem).createdAt && (item as BitItem).createdAt!.toDateString() === searchDate.toDateString()) ||
          item.createdAt.toDateString() === searchDate.toDateString()
        ) {
          hasDateMatch = true
        }
      }

      if (hasDateMatch || titleMatch) {
        results.push({
          id: `item-${item.id}`,
          title: item.title,
          type: 'item',
          icon: item.icon,
          action: () => handleItemAction(item),
          matchScore: hasDateMatch ? 1 : isExact ? 1 : 0.8,
          matchType: hasDateMatch ? 'semantic' : isExact ? 'exact' : 'partial',
          metadata: { itemType: item.type, originalItem: item }
        })
      }
    })

    quickActions.forEach((action) => {
      const titleMatch = action.title.toLowerCase().includes(lowerQuery)
      const semanticMatch = checkSemanticMatch(lowerQuery, action.title)

      if (titleMatch || semanticMatch) {
        const isExact = action.title.toLowerCase() === lowerQuery
        results.push({
          id: `quick-${action.id}`,
          title: action.title,
          type: 'quickAction',
          icon: action.icon,
          action: action.action,
          matchScore: isExact ? 1 : semanticMatch ? 0.7 : 0.8,
          matchType: isExact ? 'exact' : semanticMatch ? 'semantic' : 'partial',
          metadata: { usage: action.usage, shortcut: action.shortcut }
        })
      }
    })

    navigations.forEach((nav) => {
      const titleMatch = nav.title.toLowerCase().includes(lowerQuery)
      const semanticMatch = checkNavigationSemanticMatch(lowerQuery, nav.title)

      if (titleMatch || semanticMatch) {
        const isExact = nav.title.toLowerCase() === lowerQuery
        results.push({
          id: `nav-${nav.id}`,
          title: nav.title,
          type: 'navigation',
          icon: nav.icon,
          action: nav.action,
          matchScore: isExact ? 1 : semanticMatch ? 0.7 : 0.8,
          matchType: isExact ? 'exact' : semanticMatch ? 'semantic' : 'partial',
          metadata: { shortcut: nav.shortcut }
        })
      }
    })

    if (results.length === 0) {
      results.push(
        {
          id: 'create-bit-type',
          title: `Create bit type "${query}"`,
          type: 'createAction',
          icon: <Type size={16} strokeWidth={1.5} />,
          action: () => {
            window.ipcRenderer.invoke('openWindow', 'bittypes', 'create', '', 0, 0, `?name=${query}`)
            window.ipcRenderer.invoke('closeWindow', 'search')
          },
          matchScore: 0.5,
          matchType: 'semantic',
          metadata: { query }
        },
        {
          id: 'create-collection',
          title: `Create collection "${query}"`,
          type: 'createAction',
          icon: <Folder size={16} strokeWidth={1.5} />,
          action: () => {
            window.ipcRenderer.invoke('openWindow', 'collections', 'create', '', 480, 720, `?name=${query}`)
            window.ipcRenderer.invoke('closeWindow', 'search')
          },
          matchScore: 0.5,
          matchType: 'semantic',
          metadata: { query }
        }
      )
    }

    return results.sort((a, b) => b.matchScore - a.matchScore)
  }, [query, allItems, recentItems, pinnedItems, quickActions, navigations])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (searchResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            searchResults[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (query !== '') {
            setQuery('')
          } else {
            window.ipcRenderer.invoke('closeWindow', 'search')
          }
          break
      }
    },
    [searchResults, selectedIndex, query]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  const getItemDetails = (result: SearchResult) => {
    if (result.type === 'item' && result.metadata?.originalItem) {
      const item = result.metadata.originalItem

      const baseDetails = {
        type: item.type,
        title: item.title,
        description: item.description,
        created: item.createdAt.toLocaleDateString(),
        updated: item.updatedAt.toLocaleDateString()
      }

      switch (item.type) {
        case 'bit':
          const bit = item as BitItem
          return {
            ...baseDetails,
            pinned: bit.pinned
          }
        case 'collection':
          const collection = item as CollectionItem
          return {
            ...baseDetails,
            itemCount: collection.itemCount,
            pinned: collection.pinned
          }
        case 'bitType':
          const bitType = item as BitTypeItem
          return {
            ...baseDetails,
            fields: bitType.fields.join(', ')
          }
        default:
          return baseDetails
      }
    }

    if (result.type === 'quickAction') {
      return {
        type: 'Quick Action',
        title: result.title,
        usage: result.metadata?.usage || 0
      }
    }

    if (result.type === 'navigation') {
      return {
        type: 'Navigation',
        title: result.title,
        description: 'Navigate to this section'
      }
    }

    if (result.type === 'createAction') {
      return {
        type: 'Create Action',
        title: result.title,
        query: result.metadata?.query
      }
    }

    return { type: 'Unknown', title: result.title }
  }

  const CategorySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex flex-col p-1 bosrder-b border-border dark:border-border-dark">
      <p className="text-sm uppercase font-semibold text-text-muted p-1">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  )

  const ItemRow: React.FC<{
    result: SearchResult
    index: number
  }> = ({ result, index }) => {
    const isSelected = selectedIndex === index

    return (
      <div
        key={result.id}
        ref={isSelected ? selectedItemRef : null}
        onClick={result.action}
        className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg hover:dark:bg-scry-bg-dark ${
          isSelected ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
        }`}
      >
        <div className="p-2 bg-bg-hover dark:bg-bg-hover-dark rounded-md">{result.icon}</div>
        <div className="flex-1 flex items-center gap-2">
          <div className="font-medium text-sm">{result.title}</div>
          <div className="text-xs text-text-muted capitalize ml-auto"> {result.metadata?.itemType || result.metadata?.shortcut}</div>
        </div>
      </div>
    )
  }

  const renderDetailsPanel = () => {
    if (selectedIndex === -1 || !searchResults[selectedIndex] || searchResults[selectedIndex].type != 'item') return null

    const result = searchResults[selectedIndex]
    const details = getItemDetails(result)

    return (
      <motion.div
        initial={{ opacity: 0, x: 100, width: 0 }}
        animate={{ opacity: 1, x: 0, width: 256 }}
        exit={{ opacity: 0, x: 100, width: 0 }}
        transition={{ duration: 0.2 }}
        className="flex border-l border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark"
      >
        <div className="flex flex-col p-2 h-full w-full">
          <div className="flex flex-col gap-1">
            <div className="flex">
              <span className="px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                {details.type}
              </span>
            </div>
            <p className="font-semibold text-lg">{details.title}</p>
          </div>
          <div className="flex flex-col pb-2">
            <p className="text-sm text-text-muted">{details.description}</p>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <p className="text-text-muted font-semibold uppercase text-sm">Details</p>
            {Object.entries(details)
              .filter(([key]) => key !== 'type' && key !== 'title' && key !== 'description')
              .map(([key, value]) => (
                <div key={key} className="flex gap-1 items-center w-full">
                  <span className="text-xs text-text-muted font-medium capitalize">{key}</span>
                  <span className="text-sm ml-auto">{String(value)}</span>
                </div>
              ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative min-h-0 w-full h-full flex flex-col">
      <div className="h-12 p-2 flex items-center border-b border-border dark:border-border-dark">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftSection={
            <div className="p-1">
              <Search size={16} strokeWidth={1.5} />
            </div>
          }
          placeholder="Search bits, types, collections, dates, actions..."
          variant={'ghost'}
          className="w-1/2"
        />
        <div className="drag-bar h-full flex-1">&nbsp;</div>

        <Button
          className="ml-auto"
          onClick={() => {
            if (query != '') {
              setQuery('')
            } else {
              window.ipcRenderer.invoke('closeWindow', 'search')
            }
          }}
          variant={'iconGhost'}
        >
          {query != '' ? <Delete size={16} strokeWidth={1.5} /> : <X size={16} strokeWidth={1.5} />}
        </Button>
      </div>
      <div className="flex-1 flex overflow-auto no-scrollbar">
        <div className="overflow-auto flex-1 flex flex-col gap-2 no-scrollbar">
          {!query.trim() && (
            <>
              <CategorySection title="Recent">
                {searchResults
                  .filter((r) => r.id.startsWith('recent-'))
                  .map((result, index) => (
                    <ItemRow result={result} index={index} />
                  ))}
              </CategorySection>
              <CategorySection title="Pinned">
                {searchResults
                  .filter((r) => r.id.startsWith('pinned-'))
                  .map((result, index) => (
                    <ItemRow result={result} index={recentItems.length + index} />
                  ))}
              </CategorySection>
              <CategorySection title="Quick Actions">
                {searchResults
                  .filter((r) => r.id.startsWith('quick-'))
                  .map((result, index) => (
                    <ItemRow result={result} index={recentItems.length + pinnedItems.length + index} />
                  ))}
              </CategorySection>
              <CategorySection title="Navigate">
                {searchResults
                  .filter((r) => r.id.startsWith('nav-'))
                  .map((result, index) => (
                    <ItemRow result={result} index={recentItems.length + pinnedItems.length + quickActions.length + index} />
                  ))}
              </CategorySection>
            </>
          )}
          {query.trim() && searchResults[0].type == 'createAction' && (
            <div className="flex flex-col pt-2 px-2 text-text-muted text-sm ">No search results found</div>
          )}

          {query.trim() && searchResults.length > 0 && (
            <div className="flex-1 flex flex-col p-1">
              {searchResults.map((result, index) => (
                <ItemRow result={result} index={index} />
              ))}
            </div>
          )}
        </div>
        <AnimatePresence>{renderDetailsPanel()}</AnimatePresence>
      </div>

      <div className="mt-auto border-t border-border dark:border-border-dark flex items-center h-12 p-2 gap-2 text-text-muted">
        <div className="flex items-center gap-1 p-1">
          <div className="bg-bg-hover dark:bg-bg-hover-dark rounded-md flex items-center divide-x divide-button-border-hover dark:divide-button-border-hover-dark">
            <div className="p-1">
              <ArrowDown size={16} strokeWidth={1.5} />
            </div>
            <div className="p-1">
              <ArrowUp size={16} strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm">Navigate</p>
        </div>
        <div className="ml-auto flex items-center gap-1 p-1">
          <div className="bg-bg-hover dark:bg-bg-hover-dark rounded-md flex items-center divide-x divide-button-border-hover dark:divide-button-border-hover-dark">
            <div className="p-1">
              <CornerDownLeft size={16} strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm">Open</p>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
