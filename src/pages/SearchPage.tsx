import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { ArrowBigUp, ArrowDown, ArrowUp, Command, CornerDownLeft, Delete, Option, Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBitsStore } from '../stores/bitsStore'
import { Bit, BitTypeDefinition, BitTypePropertyDefinitionType } from '../types/Bit'
import { getIconComponent, getPropertyIcon } from '../utils/getIcon'
import { useBitTypesStore } from '../stores/bitTypesStore'
import { format } from 'date-fns'
import { truncateText } from '../utils'
import { renderTextualDataValue } from '../utils/getDataValue'

const getTextValue = (bit: Bit) => {
  if (!bit) return undefined
  const textProperty = bit.type.properties.find((property) => property.isTitle === true)
  if (!textProperty) return 'Untitled'
  const bitData = bit.data.find((data) => data.propertyId === textProperty.id)

  if (!bitData) return 'Untitled'

  return bitData.value as string
}

interface BitPropDetailsProps {
  bit: Bit
}
const BitPropDetails: React.FC<BitPropDetailsProps> = ({ bit }) => {
  const sortedProperties = [...bit.type.properties].sort((a, b) => a.order - b.order)

  return (
    <>
      {sortedProperties.map((property) => {
        const bitData = bit.data.find((data) => data.propertyId === property.id)

        return (
          <div key={property.id} className="flex items-center">
            <p className="text-sm text-text-muted">{property.name}</p>

            {bitData && bitData?.value != '' ? (
              <div className="ml-auto">
                <p className="text-sm">{renderTextualDataValue(property.type, bitData.value, 15)}</p>
              </div>
            ) : (
              <div className="ml-auto">
                <p className="text-sm text-text-muted italic truncate ml-auto">No data</p>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

interface BaseAction {
  id: string
  title: string
  description: string
  type: 'quickAction' | 'navigation'
  icon: string
  action: () => void
  shortcut: React.ReactNode
}
interface QuickAction extends BaseAction {
  type: 'quickAction'
}
interface NavigateAction extends BaseAction {
  type: 'navigation'
}

type SearchableItem = { kind: 'bit'; item: Bit } | { kind: 'bitType'; item: BitTypeDefinition }

type SearchResult = {
  id: string
  title: string
  description: string
  type: 'item' | 'quickAction' | 'navigation'
  icon: string
  action: () => void
  matchScore: number
  matchType: 'exact' | 'semantic' | 'partial'
  metadata?: {
    originalItem?: SearchableItem
    query?: string
    shortcut?: React.ReactNode
  }
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Create a bit',
    description: 'This action will open the bit creation page with default bit type',
    icon: 'Plus',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'fastcreate_window', 'fastcreate', 'Bits | Create bit', 720, 480, false)
      window.ipcRenderer.send('closeWindow')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} />{' '}
      </div>
    ),
    type: 'quickAction'
  },
  {
    id: '2',
    title: 'Create a bit type',
    description: 'This action will open the bit type creation page',
    icon: 'Type',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'bittypes_window', `bittypes/create-type`, 'Bits | Bit Types', 480, 720, false)

      window.ipcRenderer.send('closeWindow')
    },
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
    id: '0',
    title: 'AI',
    description: 'AI assistant',
    icon: 'Sparkles',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'ai_window', `ai`, 'Bits | AI', 480, 720, false)
      window.ipcRenderer.send('closeWindow')
    },
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <ArrowBigUp size={16} strokeWidth={1.5} /> <p>C</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '1',
    title: 'Calendar',
    description: 'See and manage the bits on the calendar',
    icon: 'Calendar',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'calendar_winddow', `calendar/agenda`, 'Bits | Calendar', 960, 960, false)
      window.ipcRenderer.send('closeWindow')
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
    description: 'Modify settings of the application',
    icon: 'Settings',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'settings_window', 'settings/general', 'Bits | Settings', 720, 480, false)
      window.ipcRenderer.send('closeWindow')
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
    description: 'View bit types, modify bit types and create bit types...',
    icon: 'Type',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'bittypes_window', `bittypes`, 'Bits | Bit Types', 480, 720, false)
      window.ipcRenderer.send('closeWindow')
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
    title: 'Advanced Search',
    description: 'Perform advanced searches on bits, bit types',
    icon: 'Search',
    action: () => {
      window.ipcRenderer.invoke('openWindow', 'advancedsearch_window', `advancedsearch`, 'Bits | Advanced Search', 960, 960, false)

      window.ipcRenderer.send('closeWindow')
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
    id: '5',
    title: 'Workflows (WIP)',
    description: 'View workflows, create workflows, modify workflows',
    icon: 'Workflow',
    action: () => console.log('Navigate to workflows'),
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>W</p>
      </div>
    ),
    type: 'navigation'
  },
  {
    id: '6',
    title: 'Monitors (WIP)',
    description: 'View monitors, create monitors, modify monitors',
    icon: 'Monitor',
    action: () => console.log('Navigate to monitors'),
    shortcut: (
      <div className="flex items-center gap-1">
        <Command size={16} strokeWidth={1.5} /> <Option size={16} strokeWidth={1.5} /> <p>M</p>
      </div>
    ),
    type: 'navigation'
  }
]

const handleItemAction = (item: string, id: string) => {
  switch (item) {
    case 'bit':
      window.ipcRenderer.invoke('openWindow', 'bits_window', `bits/view-bit/${id}`, 'Bits | Bit', 720, 720, true)
      window.ipcRenderer.send('closeWindow')
      break
    case 'bitType':
      window.ipcRenderer.invoke('openWindow', 'bittypes_window', `bittypes/edit-type/${id}`, 'Bits | Bit Types', 480, 720, false)

      window.ipcRenderer.send('closeWindow')
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
    bitTypeManager: ['template', 'bit type']
  }

  return Object.entries(navMap).some(
    ([navTitle, keywords]) => title.toLowerCase().includes(navTitle) && keywords.some((keyword) => query.includes(keyword))
  )
}

const SearchPage = () => {
  const { pinnedBits } = useBitsStore()
  const { bitTypes } = useBitTypesStore()
  const [allItems, setAllItems] = useState<SearchableItem[]>([])
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPinnedData = async () => {
      try {
        await useBitsStore.getState().getPinnedBits()
      } catch (error) {
        console.error('Error loading pinned bits:', error)
      }
    }
    fetchPinnedData()
  }, [])

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setAllItems([...bitTypes.map((bt) => ({ kind: 'bitType' as const, item: bt }))])
        return
      }
      const fetchedBits = await useBitsStore.getState().searchBits(query)
      setAllItems([...fetchedBits.map((b) => ({ kind: 'bit' as const, item: b })), ...bitTypes.map((bt) => ({ kind: 'bitType' as const, item: bt }))])
    }

    doSearch()
  }, [query, bitTypes])

  useEffect(() => {
    if (selectedItemRef.current && selectedIndex >= 0) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  const noQueryResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = []
    // recentItems.forEach((item) => {
    //   results.push({
    //     id: `recent-${item.id}`,
    //     title: item.title,
    //     type: 'item',
    //     icon: item.icon,
    //     action: () => handleItemAction(item),
    //     matchScore: 1,
    //     matchType: 'exact',
    //     metadata: { itemType: item.type, originalItem: item }
    //   })
    // })
    pinnedBits.forEach((item: Bit) => {
      results.push({
        id: `pinned-${item.id}`,
        title: getTextValue(item) || 'Untitled',
        description: '',
        type: 'item',
        icon: item.type.iconName,
        action: () => handleItemAction('bit', item.id),
        matchScore: 1,
        matchType: 'exact',
        metadata: { originalItem: { kind: 'bit', item } }
      })
    })
    quickActions.forEach((action) => {
      results.push({
        id: `quick-${action.id}`,
        title: action.title,
        description: action.description,
        type: 'quickAction',
        icon: action.icon,
        action: action.action,
        matchScore: 1,
        matchType: 'exact',
        metadata: { shortcut: action.shortcut }
      })
    })
    navigations.forEach((nav) => {
      results.push({
        id: `nav-${nav.id}`,
        title: nav.title,
        description: nav.description,
        type: 'navigation',
        icon: nav.icon,
        action: nav.action,
        matchScore: 1,
        matchType: 'exact',
        metadata: { shortcut: nav.shortcut }
      })
    })
    return results
  }, [pinnedBits, quickActions, navigations])

  const searchResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    const searchDate = parseDate(query)

    allItems.forEach(({ kind, item }) => {
      switch (kind) {
        case 'bit':
          const bitTitle = getTextValue(item) || 'Undefined'
          const lowerBitTitle = bitTitle.toLowerCase()
          const bitTitleMatch = lowerBitTitle.includes(lowerQuery)
          const isBitExact = lowerBitTitle === lowerQuery
          let hasBitDateMatch = false

          if (searchDate && (item.createdAt!.toString() === searchDate.toDateString() || item.createdAt.toString() === searchDate.toDateString())) {
            hasBitDateMatch = true
          }
          if (hasBitDateMatch || bitTitleMatch) {
            results.push({
              id: `item-${item.id}`,
              title: bitTitle,
              description: '',
              type: 'item',
              icon: item.type.iconName,
              action: () => handleItemAction('bit', item.id),
              matchScore: hasBitDateMatch ? 1 : isBitExact ? 1 : 0.8,
              matchType: hasBitDateMatch ? 'semantic' : isBitExact ? 'exact' : 'partial',
              metadata: { originalItem: { kind: 'bit', item } }
            })
          }
          break
        case 'bitType':
          const lowerBitTypeTitle = item.name.toLowerCase()
          const bitTypeTitleMatch = lowerBitTypeTitle.includes(lowerQuery)
          const isBitTypeExact = lowerBitTypeTitle === lowerQuery
          if (bitTypeTitleMatch) {
            results.push({
              id: `item-${item.id}`,
              title: item.name,
              description: item.description,
              type: 'item',
              icon: item.iconName,
              action: () => handleItemAction('bitType', item.id),
              matchScore: isBitTypeExact ? 1 : 0.8,
              matchType: isBitTypeExact ? 'exact' : 'partial',
              metadata: { originalItem: { kind: 'bitType', item } }
            })
          }
          break
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
          description: action.description,
          type: 'quickAction',
          icon: action.icon,
          action: action.action,
          matchScore: isExact ? 1 : semanticMatch ? 0.7 : 0.8,
          matchType: isExact ? 'exact' : semanticMatch ? 'semantic' : 'partial',
          metadata: { shortcut: action.shortcut }
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
          description: nav.description,
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
      results.push({
        id: 'create-bit-type',
        title: `Create bit type "${query}"`,
        description: `This action will open the bit type creation page with ${query} as a name`,
        type: 'quickAction',
        icon: 'Type',
        action: () => {
          window.ipcRenderer.invoke('openWindow', 'bittypes_window', `bittypes/create-type?name=${query}`, 'Bits | Bit Types', 480, 720, false)

          window.ipcRenderer.send('closeWindow')
        },
        matchScore: 0.5,
        matchType: 'semantic',
        metadata: { query }
      })
      results.push({
        id: 'search-query',
        title: `Search "${query}" in Advanced Search`,
        description: `This action will search the ${query} in advanced search`,
        type: 'quickAction',
        icon: 'Search',
        action: () => {
          window.ipcRenderer.invoke('openWindow', 'advancedsearch_window', `advancedsearch/?name=${query}`, 'Bits | Advanced Search', 960, 960, false)
          window.ipcRenderer.send('closeWindow')
        },
        matchScore: 0.5,
        matchType: 'semantic',
        metadata: { query }
      })
    }
    return results.sort((a, b) => b.matchScore - a.matchScore)
  }, [query, allItems])

  const handleTopbarScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.cancelable && e.preventDefault()

    if (!query.trim()) {
      if (noQueryResults.length === 0) return

      let newIndex = selectedIndex

      if (e.deltaY > 0) {
        newIndex = (selectedIndex + 1) % noQueryResults.length
      } else if (e.deltaY < 0) {
        newIndex = (selectedIndex - 1 + noQueryResults.length) % noQueryResults.length
      }

      setSelectedIndex(newIndex)
    } else {
      if (searchResults.length === 0) return

      let newIndex = selectedIndex

      if (e.deltaY > 0) {
        newIndex = (selectedIndex + 1) % searchResults.length
      } else if (e.deltaY < 0) {
        newIndex = (selectedIndex - 1 + searchResults.length) % searchResults.length
      }

      setSelectedIndex(newIndex)
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!query.trim()) {
        if (noQueryResults.length === 0) return

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex((prev) => (prev < noQueryResults.length - 1 ? prev + 1 : 0))
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : noQueryResults.length - 1))
            break
          case 'Enter':
            e.preventDefault()
            if (selectedIndex >= 0 && selectedIndex < noQueryResults.length) {
              noQueryResults[selectedIndex].action()
            }
            break
          case 'Escape':
            e.preventDefault()
            if (query !== '') {
              setQuery('')
            } else {
              window.ipcRenderer.send('closeWindow')
            }
            break
        }
      } else {
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
              window.ipcRenderer.send('closeWindow')
            }
            break
        }
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
    switch (result.type) {
      case 'item':
        const item = result.metadata?.originalItem
        if (!item) return null
        if (item.kind === 'bit') {
          return (
            <div className="flex flex-col h-full w-full overflow-auto">
              <div className="flex items-center gap-2 p-2">
                <span className="truncate px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                  {truncateText(item.item.type.name, 20)}
                </span>
              </div>
              <div className="px-2">
                <p className="font-semibold text-lg truncate">{result.title}</p>
              </div>

              <div className="p-2 flex flex-col gap-1 w-full">
                <p className="text-text-muted font-semibold uppercase text-sm">Meta-Data</p>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <p className="text-sm text-text-muted">Created</p>
                    <p className="text-sm truncate ml-auto">{format(new Date(item.item.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-text-muted">Updated</p>
                    <p className="text-sm truncate ml-auto">{format(new Date(item.item.updatedAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-col gap-1 w-full">
                <p className="text-text-muted font-semibold uppercase text-sm">Details</p>
                <div className="flex flex-col">
                  <BitPropDetails bit={item.item} />
                </div>
              </div>
            </div>
          )
        } else if (item.kind === 'bitType') {
          return (
            <div className="flex flex-col h-full w-full overflow-auto">
              <div className="flex items-center gap-2 p-2">
                <span className="text-nowrap px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                  Bit Type
                </span>
              </div>
              <div className="px-2">
                <p className="font-semibold text-lg truncate">{result.title}</p>
              </div>

              <div className="px-2">
                <p className="text-sm text-text-muted text-justify">{result.description}</p>
              </div>

              <div className="p-2 flex flex-col gap-1 w-full">
                <p className="text-text-muted font-semibold uppercase text-sm">Properties</p>
                <div className="flex flex-col">
                  {item.item.properties.map((prop) => (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-muted">{getPropertyIcon(prop.type)}</span>
                      <p className="text-sm truncate">{prop.name}</p>
                      <p className="text-sm ml-auto text-text-muted capitalize truncate">{prop.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        return

      case 'navigation':
        return (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center gap-2 p-2">
              <span className="text-nowrap flex px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                Navigation
              </span>
            </div>

            <div className="px-2">
              <p className="font-semibold text-lg truncate text-justify">{result.title}</p>
            </div>

            <div className="px-2">
              <p className="text-sm text-text-muted">{result.description}</p>
            </div>
          </div>
        )
      case 'quickAction':
        return (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center gap-2 p-2">
              <span className="text-nowrap flex px-2 py-1 text-xs bg-bg-hover dark:bg-bg-hover-dark rounded uppercase font-semibold text-text-muted">
                Quick Action
              </span>
            </div>

            <div className="px-2">
              <p className="font-semibold text-lg break-all">{result.title}</p>
            </div>

            <div className="px-2">
              <p className="text-sm text-text-muted text-justify break-all">{result.description}</p>
            </div>
          </div>
        )

      default:
        return []
    }
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
        className={`w-full cursor-pointer flex items-center gap-2 p-1 rounded-md  ${
          isSelected ? 'bg-scry-bg-dark/10 dark:bg-scry-bg/10' : 'hover:bg-scry-bg hover:dark:bg-scry-bg-dark'
        }`}
      >
        <div className={`p-2  rounded-md ${isSelected ? 'bg-bg-dark/15 dark:bg-bg/15' : 'bg-bg-hover dark:bg-bg-hover-dark'}`}>
          {(() => {
            const Icon = getIconComponent(result.icon)
            return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
          })()}
        </div>
        <div className="flex-1 flex items-center gap-2 w-full overflow-hidden ">
          <div className="font-medium text-sm truncate">{result.title}</div>
          <div className="flex-1 flex">{returnInfoChip(result)}</div>
        </div>
      </div>
    )
  }

  const returnInfoChip = (result: SearchResult) => {
    if (result.metadata?.originalItem?.kind) {
      switch (result.metadata.originalItem.kind) {
        case 'bit':
          return (
            <div className="text-xs px-4 py-0.5 text-center capitalize ml-auto font-semibold text-sky-700 dark:text-blue-300 bg-sky-100 dark:bg-blue-900 rounded-md">
              Bit
            </div>
          )
        case 'bitType':
          return (
            <div className="text-xs px-4 py-0.5 text-center capitalize ml-auto font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-md">
              Bit Type
            </div>
          )

        default:
          break
      }
    } else {
      return <div className="text-xs text-text-muted capitalize ml-auto">{result.metadata?.shortcut}</div>
    }
  }
  const renderDetailsPanel = () => {
    let result = null
    if (!query.trim()) {
      if (selectedIndex === -1 || !noQueryResults[selectedIndex]) return null
      result = noQueryResults[selectedIndex]
    } else {
      if (selectedIndex === -1 || !searchResults[selectedIndex]) return null
      result = searchResults[selectedIndex]
    }
    const details = getItemDetails(result)

    return (
      <motion.div
        style={{ width: '40%' }}
        initial={{ x: '100%' }}
        animate={{
          x: selectedIndex != -1 ? '0%' : '100%'
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className="overflow-auto flex flex-col border-l border-border dark:border-border-dark absolute right-0 h-full"
      >
        {details}
      </motion.div>
    )
  }

  return (
    <div className="relative min-h-0 w-full h-full flex flex-col">
      <div onWheel={handleTopbarScroll} className="h-12 p-2 flex items-center border-b border-border dark:border-border-dark">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftSection={
            <div className="p-1">
              <Search size={16} strokeWidth={1.5} />
            </div>
          }
          placeholder="Search bits, types, dates, actions..."
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
              window.ipcRenderer.send('closeWindow')
            }
          }}
          variant={'iconGhost'}
        >
          {query != '' ? <Delete size={16} strokeWidth={1.5} /> : <X size={16} strokeWidth={1.5} />}
        </Button>
      </div>
      <div className="flex-1 flex overflow-auto no-scrollbar relative">
        <motion.div
          className="flex overflow-auto h-full flex-col"
          initial={{ width: '100%' }}
          animate={{
            width: selectedIndex != -1 ? '60%' : '100%'
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut'
          }}
        >
          {!query.trim() && (
            <>
              <CategorySection title="Pinned">
                {noQueryResults
                  .filter((r) => r.id.startsWith('pinned-'))
                  .map((result, index) => (
                    <ItemRow key={`pinned-${index}`} result={result} index={index} />
                  ))}
              </CategorySection>
              <CategorySection title="Quick Actions">
                {searchResults
                  .filter((r) => r.id.startsWith('quick-'))
                  .map((result, index) => (
                    <ItemRow key={`quick-${index}`} result={result} index={pinnedBits.length + index} />
                  ))}
              </CategorySection>
              <CategorySection title="Navigate">
                {noQueryResults
                  .filter((r) => r.id.startsWith('nav-'))
                  .map((result, index) => (
                    <ItemRow key={`nav-${index}`} result={result} index={pinnedBits.length + quickActions.length + index} />
                  ))}
              </CategorySection>
            </>
          )}

          {query.trim() && searchResults.length > 0 && (
            <div className="flex-1 flex flex-col p-1">
              {searchResults.map((result, index) => (
                <ItemRow result={result} index={index} />
              ))}
            </div>
          )}
        </motion.div>
        {renderDetailsPanel()}
      </div>

      <div className="mt-auto border-t border-border dark:border-border-dark flex items-center h-12 p-2 gap-2 text-text-muted">
        <div className="flex items-center gap-2 p-1">
          <div className="flex items-center gap-1">
            <div className="p-1 w-7 bg-bg-hover dark:bg-bg-hover-dark rounded-md flex items-center justify-center border border-border dark:border-border-dark">
              <ArrowDown size={16} strokeWidth={1.5} />
            </div>
            <div className="p-1 w-7 bg-bg-hover dark:bg-bg-hover-dark rounded-md flex items-center justify-center border border-border dark:border-border-dark">
              <ArrowUp size={16} strokeWidth={1.5} />
            </div>
            <p className="text-sm">Navigate</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 p-1">
          <div className="p-1 w-7 bg-bg-hover dark:bg-bg-hover-dark rounded-md flex items-center justify-center border border-border dark:border-border-dark">
            <CornerDownLeft size={16} strokeWidth={1.5} />
          </div>
          <p className="text-sm">Open</p>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
