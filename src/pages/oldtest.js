import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  Notebook,
  Option,
  Plus,
  Search,
  Settings,
  Type,
  Workflow,
  X
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface BaseItem {
  id: string
  title: string
  type: 'bit' | 'collection' | 'bitType' | 'workflow' | 'monitor' | 'setting'
  createdAt: Date
  updatedAt: Date
  icon: React.ReactNode
}

interface BitItem extends BaseItem {
  type: 'bit'
  content: string
  date?: Date
  pinned: boolean
}

interface CollectionItem extends BaseItem {
  type: 'collection'
  itemCount: number
  pinned: boolean
}

interface BitTypeItem extends BaseItem {
  type: 'bitType'
  fields: string[]
}

interface WorkflowItem extends BaseItem {
  type: 'workflow'
  steps: number
  pinned: boolean
}

interface MonitorItem extends BaseItem {
  type: 'monitor'
  isActive: boolean
  pinned: boolean
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
  usage?: number
}

interface QuickAction extends BaseAction {
  type: 'quickAction'
}
interface NavigateAction extends BaseAction {
  type: 'navigation'
}

type SearchableItem = BitItem | CollectionItem | BitTypeItem | WorkflowItem | MonitorItem | SettingItem | QuickAction | NavigateAction

type SearchResult = {
  id: string
  title: string
  type: 'item' | 'quickAction' | 'navigation' | 'createAction'
  icon: React.ReactNode
  action: () => void
  matchScore: number
  matchType: 'exact' | 'semantic' | 'partial'
  metadata?: {
    itemType?: string
    usage?: number
    originalItem?: SearchableItem
    query?: string
    shortcut?: React.ReactNode
  }
}

const mockBits: BitItem[] = [
  {
    icon: <Notebook size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Meeting Notes',
    type: 'bit',
    content: 'Team sync discussion',
    createdAt: new Date(2024, 5, 1),
    updatedAt: new Date(),
    date: new Date(),
    pinned: true
  },
  {
    icon: <Notebook size={16} strokeWidth={1.5} />,
    id: '2',
    title: 'Project Ideas',
    type: 'bit',
    content: 'New feature concepts',
    createdAt: new Date(2024, 4, 15),
    updatedAt: new Date(),
    pinned: true
  },
  {
    icon: <Notebook size={16} strokeWidth={1.5} />,
    id: '3',
    title: 'Daily Tasks',
    type: 'bit',
    content: 'Todo items',
    createdAt: new Date(),
    updatedAt: new Date(),
    date: new Date(),
    pinned: false
  }
]

const mockCollections: CollectionItem[] = [
  {
    icon: <Folder size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Work Documents',
    type: 'collection',
    itemCount: 15,
    createdAt: new Date(2024, 4, 20),
    updatedAt: new Date(),
    pinned: true
  },
  {
    icon: <Folder size={16} strokeWidth={1.5} />,
    id: '2',
    title: 'Personal Notes',
    type: 'collection',
    itemCount: 8,
    createdAt: new Date(2024, 5, 10),
    updatedAt: new Date(),
    pinned: false
  }
]

const mockBitTypes: BitTypeItem[] = [
  {
    icon: <Type size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Task Template',
    type: 'bitType',
    fields: ['title', 'description', 'priority'],
    createdAt: new Date(2024, 4, 5),
    updatedAt: new Date()
  },
  {
    icon: <Type size={16} strokeWidth={1.5} />,

    id: '2',
    title: 'Meeting Template',
    type: 'bitType',
    fields: ['date', 'attendees', 'agenda'],
    createdAt: new Date(2024, 5, 1),
    updatedAt: new Date()
  }
]

const mockWorkflows: WorkflowItem[] = [
  {
    icon: <Workflow size={16} strokeWidth={1.5} />,
    id: '1',
    title: 'Content Review',
    type: 'workflow',
    steps: 3,
    createdAt: new Date(2024, 4, 10),
    updatedAt: new Date(),
    pinned: false
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
    pinned: false
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
      window.ipcRenderer.invoke('openWindow', 'bittypes', 'create', '', 480, 720)
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

const allItems: SearchableItem[] = [
  ...mockBits,
  ...mockCollections,
  ...mockBitTypes,
  ...mockWorkflows,
  ...mockMonitors,
  ...mockSettings,
  ...quickActions,
  ...navigations
]

const handleItemAction = (item: SearchableItem) => {
  switch (item.type) {
    case 'bit':
    case 'collection':
    case 'monitor':
      console.log(`Navigate to ${item.type} view:`, item.id)
      break
    case 'bitType':
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

  // Try to parse direct dates (simple implementation)
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
  const match = query.match(dateRegex)
  if (match) {
    const [, month, day, year] = match
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  return null
}

const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const { recentItems, pinnedItems } = useMemo(() => {
    const recent = [...allItems]
      .filter((item) => item.type !== 'quickAction' && item.type !== 'navigation')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3)
    const pinned = allItems.filter((item) => 'pinned' in item && item.pinned)

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
    return []
  }, [])

  // const [recentItems, setRecentItems] = useState<SearchableItem[]>([])
  // const [pinnedItems, setPinnedItems] = useState<SearchableItem[]>([])

  // useEffect(() => {
  //   const recent = [...allItems].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3)
  //   setRecentItems(recent)
  //   const pinned = [...mockBits, ...mockCollections, ...mockMonitors, ...mockWorkflows].filter((item) => item.pinned == true)

  //   setPinnedItems(pinned)
  // }, [])

  // useEffect(() => {
  //   setSelectedIndex(-1)
  // }, [query])

  // const quickActions: QuickAction[] = [
  //   {
  //     id: '1',
  //     title: 'Create a bit',
  //     icon: Plus,
  //     action: () => console.log('Create bit'),
  //     usage: 10,
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
  //       </div>
  //     )
  //   },
  //   {
  //     id: '2',
  //     title: 'Create a collection',
  //     icon: Folder,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'collections', 'create', '', 480, 720)
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     usage: 8,
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
  //       </div>
  //     )
  //   },
  //   {
  //     id: '3',
  //     title: 'Create a bit type',
  //     icon: Type,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'bittypes', 'create', '', 480, 720)
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     usage: 5,
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
  //       </div>
  //     )
  //   }
  // ]

  // const navigationItems = [
  //   {
  //     title: 'Calendar',
  //     icon: Calendar,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'calendar')
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <ArrowBigUp size={16} strokeWidth={1.5} /> <p>C</p>
  //       </div>
  //     )
  //   },

  //   {
  //     title: 'Settings',
  //     icon: Settings,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'settings')
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>S</p>
  //       </div>
  //     )
  //   },
  //   {
  //     title: 'Bit Type Manager',
  //     icon: Type,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'bittypes', '', '', 480, 720)
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>B</p>
  //       </div>
  //     )
  //   },
  //   {
  //     title: 'Collections Manager',
  //     icon: Folder,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'collections', '', '', 480, 720)
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>C</p>
  //       </div>
  //     )
  //   },
  //   {
  //     title: 'Advanced Search',
  //     icon: Search,
  //     action: () => {
  //       window.ipcRenderer.invoke('openWindow', 'advancedsearch')
  //       window.ipcRenderer.invoke('closeWindow', 'search')
  //     },
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <ArrowBigUp size={16} strokeWidth={1.5} />
  //         <p>S</p>
  //       </div>
  //     )
  //   },
  //   {
  //     title: 'Workflows (WIP)',
  //     icon: Workflow,
  //     action: () => console.log('Navigate to workflows'),
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>W</p>
  //       </div>
  //     )
  //   },
  //   {
  //     title: 'Monitors (WIP)',
  //     icon: Monitor,
  //     action: () => console.log('Navigate to monitors'),
  //     shortkey: (
  //       <div className="flex items-center gap-1">
  //         <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>M</p>
  //       </div>
  //     )
  //   }
  // ]

  // const searchResults = useMemo((): AllSearchResults[] => {
  //   if (!query.trim()) return []

  //   const results: AllSearchResults[] = []
  //   const lowerQuery = query.toLowerCase()

  //   // Check for date-based semantic search (existing code)
  //   const searchDate = parseDate(query)
  //   if (searchDate) {
  //     allItems.forEach((item) => {
  //       let hasDateMatch = false

  //       if (item.type === 'bit' && (item as BitItem).date) {
  //         const bitDate = (item as BitItem).date!
  //         if (bitDate.toDateString() === searchDate.toDateString()) {
  //           hasDateMatch = true
  //         }
  //       }

  //       if (item.createdAt.toDateString() === searchDate.toDateString()) {
  //         hasDateMatch = true
  //       }

  //       if (hasDateMatch) {
  //         results.push({ ...item, matchScore: 1, matchType: 'semantic' })
  //       }
  //     })
  //   }

  //   // Search through regular items (existing code)
  //   allItems.forEach((item) => {
  //     const titleMatch = item.title.toLowerCase().includes(lowerQuery)

  //     if (titleMatch) {
  //       const exactMatch = item.title.toLowerCase() === lowerQuery
  //       results.push({
  //         ...item,
  //         matchScore: exactMatch ? 1 : 0.8,
  //         matchType: exactMatch ? 'exact' : 'partial'
  //       })
  //     }
  //   })

  //   // Search through quick actions
  //   quickActions.forEach((action) => {
  //     const titleMatch = action.title.toLowerCase().includes(lowerQuery)

  //     // Also check for semantic matches (e.g., "new bit" matches "Create a bit")
  //     const semanticMatches = [
  //       { keywords: ['new', 'add', 'make'], actionKeywords: ['create'] },
  //       { keywords: ['bit', 'note'], actionKeywords: ['bit'] },
  //       { keywords: ['folder', 'group'], actionKeywords: ['collection'] },
  //       { keywords: ['template', 'type'], actionKeywords: ['bit type'] }
  //     ]

  //     let semanticMatch = false
  //     semanticMatches.forEach(({ keywords, actionKeywords }) => {
  //       const hasKeyword = keywords.some((keyword) => lowerQuery.includes(keyword))
  //       const hasActionKeyword = actionKeywords.some((keyword) => action.title.toLowerCase().includes(keyword))
  //       if (hasKeyword && hasActionKeyword) {
  //         semanticMatch = true
  //       }
  //     })

  //     if (titleMatch || semanticMatch) {
  //       const exactMatch = action.title.toLowerCase() === lowerQuery
  //       results.push({
  //         ...action,
  //         matchScore: exactMatch ? 1 : semanticMatch ? 0.7 : 0.8,
  //         matchType: exactMatch ? 'exact' : semanticMatch ? 'semantic' : 'partial',
  //         resultType: 'quickAction'
  //       })
  //     }
  //   })

  //   // Search through navigation items
  //   navigationItems.forEach((item, index) => {
  //     const titleMatch = item.title.toLowerCase().includes(lowerQuery)

  //     // Semantic matches for navigation
  //     const semanticMatches = [
  //       { keywords: ['setting', 'config', 'preference'], title: 'Settings' },
  //       { keywords: ['calendar', 'date', 'schedule'], title: 'Calendar' },
  //       { keywords: ['bit type', 'template', 'type'], title: 'Bit Type Manager' },
  //       { keywords: ['collection', 'folder', 'group'], title: 'Collections Manager' },
  //       { keywords: ['advanced search', 'search'], title: 'Advanced Search' },
  //       { keywords: ['workflow', 'automation'], title: 'Workflows (WIP)' },
  //       { keywords: ['monitor', 'watch'], title: 'Monitors (WIP)' }
  //     ]

  //     let semanticMatch = false
  //     semanticMatches.forEach(({ keywords, title }) => {
  //       if (item.title === title) {
  //         const hasKeyword = keywords.some((keyword) => lowerQuery.includes(keyword))
  //         if (hasKeyword) {
  //           semanticMatch = true
  //         }
  //       }
  //     })

  //     if (titleMatch || semanticMatch) {
  //       const exactMatch = item.title.toLowerCase() === lowerQuery
  //       results.push({
  //         id: `nav-${index}`,
  //         title: item.title,
  //         icon: item.icon,
  //         action: item.action,
  //         shortkey: item.shortkey,
  //         matchScore: exactMatch ? 1 : semanticMatch ? 0.7 : 0.8,
  //         matchType: exactMatch ? 'exact' : semanticMatch ? 'semantic' : 'partial',
  //         resultType: 'navigation'
  //       })
  //     }
  //   })

  //   // Remove duplicates and sort by match score
  //   const uniqueResults = results.filter((item, index, self) => {
  //     if ('resultType' in item) {
  //       // For quick actions and navigation, use title + resultType for uniqueness
  //       return index === self.findIndex((t) => 'resultType' in t && t.title === item.title && t.resultType === item.resultType)
  //     } else {
  //       // For regular items, use id + type
  //       return index === self.findIndex((t) => !('resultType' in t) && t.id === item.id && t.type === item.type)
  //     }
  //   })

  //   return uniqueResults.sort((a, b) => b.matchScore - a.matchScore)
  // }, [query])

  // const navigableItems = useMemo((): NavigableItem[] => {
  //   if (!query.trim()) {
  //     // For empty query, combine all default items
  //     const items: NavigableItem[] = []

  //     // Add recent items
  //     recentItems.forEach((item) => {
  //       items.push({
  //         id: `recent-${item.type}-${item.id}`,
  //         title: item.title,
  //         action: () => handleItemClick(item),
  //         type: item.type
  //       })
  //     })

  //     // Add pinned items
  //     pinnedItems.forEach((item) => {
  //       items.push({
  //         id: `pinned-${item.type}-${item.id}`,
  //         title: item.title,
  //         action: () => handleItemClick(item),
  //         type: item.type
  //       })
  //     })

  //     // Add quick actions
  //     quickActions
  //       .sort((a, b) => b.usage - a.usage)
  //       .forEach((action) => {
  //         items.push({
  //           id: `quick-${action.id}`,
  //           title: action.title,
  //           action: action.action,
  //           resultType: 'quickAction'
  //         })
  //       })

  //     // Add navigation items
  //     navigationItems.forEach((item, index) => {
  //       items.push({
  //         id: `nav-${index}`,
  //         title: item.title,
  //         action: item.action,
  //         resultType: 'navigation'
  //       })
  //     })

  //     return items
  //   } else if (searchResults.length > 0) {
  //     // For search results
  //     return searchResults.map((item, index) => ({
  //       id: 'resultType' in item ? `${item.resultType}-${item.title}` : `${item.type}-${item.id}`,
  //       title: item.title,
  //       action: () => {
  //         if ('resultType' in item) {
  //           item.action()
  //         } else {
  //           handleItemClick(item)
  //         }
  //       },
  //       type: 'resultType' in item ? item.resultType : item.type
  //     }))
  //   } else {
  //     // For no results view
  //     return [
  //       {
  //         id: 'create-bit-type',
  //         title: `Create bit type "${query}"`,
  //         action: () => console.log('Create bit type:', query),
  //         resultType: 'create-bit-type',
  //         query: query
  //       },
  //       {
  //         id: 'create-collection',
  //         title: `Create collection "${query}"`,
  //         action: () => console.log('Create collection:', query),
  //         resultType: 'create-collection',
  //         query: query
  //       }
  //     ]
  //   }
  // }, [query, searchResults, recentItems, pinnedItems, quickActions, navigationItems])

  // const handleKeyDown = useCallback(
  //   (e: KeyboardEvent) => {
  //     if (navigableItems.length === 0) return

  //     switch (e.key) {
  //       case 'ArrowDown':
  //         e.preventDefault()
  //         setSelectedIndex((prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0))
  //         break
  //       case 'ArrowUp':
  //         e.preventDefault()
  //         setSelectedIndex((prev) => (prev > 0 ? prev - 1 : navigableItems.length - 1))
  //         break
  //       case 'Enter':
  //         e.preventDefault()
  //         if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
  //           navigableItems[selectedIndex].action()
  //         }
  //         break
  //       case 'Escape':
  //         e.preventDefault()
  //         if (query !== '') {
  //           setQuery('')
  //         } else {
  //           window.ipcRenderer.invoke('closeWindow', 'search')
  //         }
  //         break
  //     }
  //   },
  //   [navigableItems, selectedIndex, query]
  // )

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown)
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [handleKeyDown])

  // const handleItemClick = (item: SearchableItem) => {
  //   switch (item.type) {
  //     case 'bit':
  //     case 'collection':
  //     case 'monitor':
  //       console.log(`Navigate to ${item.type} view page:`, item.id)
  //       break
  //     case 'bitType':
  //     case 'workflow':
  //       console.log(`Navigate to ${item.type} edit page:`, item.id)
  //       break
  //     case 'setting':
  //       console.log(`Navigate to settings page, scroll to:`, item.title)
  //       break
  //   }
  // }

  // const handleNoResults = () => {
  //   return (
  //     <div className="overflow-auto flex-1 flex flex-col">
  //       <div className="p-1">
  //         <p className="text-text-muted text-sm text-center">No search results found</p>
  //       </div>
  //       <div className="flex flex-col px-1">
  //         <div className="flex flex-col">
  //           <div
  //             onClick={() => console.log('Create bit type:', query)}
  //             className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg dark:hover:bg-scry-bg-dark ${
  //               selectedIndex === 0 ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
  //             }`}
  //           >
  //             <div className="p-2 bg-bg-hover dark:bg-bg-hover-dark rounded-md">
  //               <Type size={16} strokeWidth={1.5} />
  //             </div>
  //             <div className="font-medium text-sm">
  //               Create bit type <strong>"{query}"</strong>
  //             </div>
  //           </div>
  //           <div
  //             onClick={() => console.log('Create collection:', query)}
  //             className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg dark:hover:bg-scry-bg-dark ${
  //               selectedIndex === 1 ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
  //             }`}
  //           >
  //             <div className="p-2 bg-bg-hover dark:bg-bg-hover-dark rounded-md">
  //               <Folder size={16} strokeWidth={1.5} />
  //             </div>

  //             <div className="font-medium text-sm">
  //               Create collection <strong>"{query}"</strong>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const CategorySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex flex-col px-1 bosrder-b border-border dark:border-border-dark">
      <p className="text-sm uppercase font-semibold text-text-muted p-1">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  )

  const ItemRow: React.FC<{
    result: SearchResult
    index: number
  }> = ({ result, index }) => {
    return (
      <div
        onClick={result.action}
        className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg hover:dark:bg-scry-bg-dark ${
          selectedIndex === index ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
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

  // const ItemDetailsPanel: React.FC<{ item: NavigableItem }> = ({ item }) => {
  //   // Find the full item data based on the navigable item
  //   const getFullItemData = () => {
  //     if (!item.type || item.resultType) {
  //       if (item.resultType === 'quickAction') {
  //         const quickAction = quickActions.find((qa) => qa.title === item.title)
  //         return {
  //           type: 'Quick Action',
  //           title: item.title,
  //           details: quickAction ? `Usage: ${quickAction.usage} times` : 'Create and manage content quickly'
  //         }
  //       } else if (item.resultType === 'navigation') {
  //         return {
  //           type: 'Navigation',
  //           title: item.title,
  //           details: ''
  //         }
  //       } else if (item.resultType === 'create-bit-type') {
  //         return {
  //           type: 'Quick Action',
  //           title: item.title,
  //           details: `Create a bit type named ${item.query}`
  //         }
  //       } else if (item.resultType === 'create-collection') {
  //         return {
  //           type: 'Quick Action',
  //           title: item.title,
  //           details: `Create a collection named ${item.query}`
  //         }
  //       }
  //     }

  //     if (item.type == 'navigation') {
  //       return {
  //         type: 'Navigation',
  //         title: item.title,
  //         details: 'Navigate to this section of the application'
  //       }
  //     }
  //     if (item.type === 'quickAction') {
  //       const quickAction = quickActions.find((qa) => qa.title === item.title)
  //       return {
  //         type: 'Quick Action',
  //         title: item.title,
  //         details: quickAction ? `Usage: ${quickAction.usage} times` : 'Create and manage content quickly'
  //       }
  //     }
  //     // For regular items, find the full data
  //     const fullItem = allItems.find((i) => i.id === item.id.split('-').pop() && i.type === item.type)
  //     if (!fullItem) return null

  //     switch (fullItem.type) {
  //       case 'bit':
  //         const bitItem = fullItem as BitItem
  //         return {
  //           type: 'Bit',
  //           title: fullItem.title,
  //           details: bitItem.content,
  //           metadata: {
  //             Created: fullItem.createdAt.toLocaleDateString(),
  //             Updated: fullItem.updatedAt.toLocaleDateString(),
  //             Pinned: bitItem.pinned ? 'Yes' : 'No',
  //             Date: bitItem.date ? bitItem.date.toLocaleDateString() : 'None'
  //           }
  //         }

  //       case 'collection':
  //         const collectionItem = fullItem as CollectionItem
  //         return {
  //           type: 'Collection',
  //           title: fullItem.title,
  //           details: `Contains ${collectionItem.itemCount} items`,
  //           metadata: {
  //             Created: fullItem.createdAt.toLocaleDateString(),
  //             Updated: fullItem.updatedAt.toLocaleDateString(),
  //             Items: collectionItem.itemCount.toString(),
  //             Pinned: collectionItem.pinned ? 'Yes' : 'No'
  //           }
  //         }

  //       case 'bitType':
  //         const bitTypeItem = fullItem as BitTypeItem
  //         return {
  //           type: 'Bit Type',
  //           title: fullItem.title,
  //           details: `Template with ${bitTypeItem.fields.length} fields`,
  //           metadata: {
  //             Created: fullItem.createdAt.toLocaleDateString(),
  //             Updated: fullItem.updatedAt.toLocaleDateString(),
  //             Fields: bitTypeItem.fields.join(', ')
  //           }
  //         }

  //       case 'workflow':
  //         const workflowItem = fullItem as WorkflowItem
  //         return {
  //           type: 'Workflow',
  //           title: fullItem.title,
  //           details: `Automation workflow with ${workflowItem.steps} steps`,
  //           metadata: {
  //             Created: fullItem.createdAt.toLocaleDateString(),
  //             Updated: fullItem.updatedAt.toLocaleDateString(),
  //             Steps: workflowItem.steps.toString(),
  //             Pinned: workflowItem.pinned ? 'Yes' : 'No'
  //           }
  //         }

  //       case 'monitor':
  //         const monitorItem = fullItem as MonitorItem
  //         return {
  //           type: 'Monitor',
  //           title: fullItem.title,
  //           details: `System monitor - ${monitorItem.isActive ? 'Active' : 'Inactive'}`,
  //           metadata: {
  //             Created: fullItem.createdAt.toLocaleDateString(),
  //             Updated: fullItem.updatedAt.toLocaleDateString(),
  //             Status: monitorItem.isActive ? 'Active' : 'Inactive',
  //             Pinned: monitorItem.pinned ? 'Yes' : 'No'
  //           }
  //         }

  //       case 'setting':
  //         const settingItem = fullItem as SettingItem
  //         return {
  //           type: 'Setting',
  //           title: fullItem.title,
  //           details: `${settingItem.category} setting`,
  //           metadata: {
  //             Category: settingItem.category,
  //             Value: String(settingItem.value),
  //             Updated: fullItem.updatedAt.toLocaleDateString()
  //           }
  //         }

  //       default:
  //         return {
  //           type: 'Unknown',
  //           title: 'Unknown',
  //           details: 'No details available'
  //         }
  //     }
  //   }

  //   const itemData = getFullItemData()

  //   if (!itemData) {
  //     return (
  //       <div className="flex flex-col p-4">
  //         <h3 className="font-semibold text-lg mb-2">No Details Available</h3>
  //         <p className="text-text-muted text-sm">Unable to load details for this item.</p>
  //       </div>
  //     )
  //   }

  //   return (
  //     <div className="flex flex-col p-4 h-full">
  //       <div className="mb-4">
  //         <div className="flex items-center gap-2 mb-2">
  //           <span className="text-xs bg-bg-hover dark:bg-bg-hover-dark px-2 py-1 rounded uppercase font-semibold text-text-muted">
  //             {itemData.type}
  //           </span>
  //         </div>
  //         <h3 className="font-semibold text-lg mb-2">{itemData.title}</h3>
  //         <p className="text-text-muted text-sm">{itemData.details}</p>
  //       </div>

  //       {itemData.metadata && (
  //         <div className="flex flex-col gap-2">
  //           <h4 className="font-medium text-sm text-text-muted uppercase">Details</h4>
  //           <div className="space-y-2">
  //             {Object.entries(itemData.metadata).map(([key, value]) => (
  //               <div key={key} className="flex flex-col">
  //                 <span className="text-xs text-text-muted font-medium">{key}</span>
  //                 <span className="text-sm">{value}</span>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   )
  // }
  return (
    <div className="relative min-h-0 w-full h-full flex flex-col">
      <div className="h-12 p-2 flex items-center">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftSection={
            <div className="p-1">
              <Search size={16} strokeWidth={1.5} />
            </div>
          }
          inputSize={'md'}
          placeholder="Search..."
          variant={'ghost'}
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
      <div className="flex-1 flex overflow-auto">
        {!query.trim() && (
          <div className="overflow-auto flex-1 flex flex-col gap-2">
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
                  <ItemRow result={result} index={index} />
                ))}
            </CategorySection>
            <CategorySection title="Quick Actions">
              {searchResults
                .filter((r) => r.id.startsWith('quick-'))
                .map((result, index) => (
                  <ItemRow result={result} index={index} />
                ))}
            </CategorySection>
            <CategorySection title="Navigate">
              {searchResults
                .filter((r) => r.id.startsWith('nav-'))
                .map((result, index) => (
                  <ItemRow result={result} index={index} />
                ))}
            </CategorySection>
          </div>
        )}
        {query.trim() && searchResults.length > 0 && (
          <div className="flex-1 flex flex-col px-1">
            {searchResults.map((result, index) => (
              <ItemRow result={result} index={index} />
            ))}
          </div>
        )}
        {query.trim() && searchResults.length === 0 && <div className="flex-1 flex flex-col px-1">No results found for "{query}"</div>}
      </div>
      {/* <div className="flex-1 flex overflow-auto">
        {!query.trim() ? (
          <div className="overflow-auto flex-1 flex flex-col gap-2">
            <CategorySection title="Recent">
              {recentItems.map((item, index) => (
                <ItemRow key={`${item.type}-${item.id}`} item={item} onClick={() => handleItemClick(item)} isSelected={selectedIndex === index} />
              ))}
            </CategorySection>

            {pinnedItems.length > 0 && (
              <CategorySection title="Pinned">
                {pinnedItems.map((item, index) => {
                  const adjustedIndex = recentItems.length + index
                  return (
                    <ItemRow
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      isSelected={selectedIndex === adjustedIndex}
                    />
                  )
                })}
              </CategorySection>
            )}

            <CategorySection title="Quick Actions">
              {quickActions
                .sort((a, b) => b.usage - a.usage)
                .map((action, index) => {
                  const adjustedIndex = recentItems.length + pinnedItems.length + index
                  return (
                    <div
                      key={action.id}
                      onClick={action.action}
                      className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg dark:hover:bg-scry-bg-dark ${
                        selectedIndex === adjustedIndex ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
                      }`}
                    >
                      <div className="p-2 bg-bg-hover dark:bg-bg-hover-dark rounded-md">
                        <action.icon size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-text-muted capitalize ml-auto">{action.shortkey}</div>
                      </div>
                    </div>
                  )
                })}
            </CategorySection>

            <CategorySection title="Navigate">
              {navigationItems.map((item, index) => {
                const adjustedIndex = recentItems.length + pinnedItems.length + quickActions.length + index
                return (
                  <div
                    key={index}
                    onClick={item.action}
                    className={`cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-scry-bg dark:hover:bg-scry-bg-dark ${
                      selectedIndex === adjustedIndex ? 'bg-scry-bg dark:bg-scry-bg-dark' : ''
                    }`}
                  >
                    <div className="p-2 bg-bg-hover dark:bg-bg-hover-dark rounded-md">
                      <item.icon size={16} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-text-muted capitalize ml-auto">{item.shortkey}</div>
                    </div>
                  </div>
                )
              })}
            </CategorySection>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="flex flex-col px-1">
              {searchResults.map((item, index) => {
                const handleClick = () => {
                  if ('resultType' in item) {
                    // Handle quick actions and navigation
                    item.action()
                  } else {
                    // Handle regular items
                    handleItemClick(item)
                  }
                }

                return (
                  <ItemRow
                    key={`resultType` in item ? `${item.resultType}-${item.title}` : `${item.type}-${item.id}`}
                    item={item}
                    onClick={handleClick}
                    isSelected={selectedIndex === index}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          handleNoResults()
        )}
        <AnimatePresence>
          {selectedIndex !== -1 && navigableItems[selectedIndex] && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 256 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="flex border-l border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark"
            >
              <ItemDetailsPanel item={navigableItems[selectedIndex]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}
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
