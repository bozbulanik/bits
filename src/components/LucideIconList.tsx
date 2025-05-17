import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Input from './Input'
import Button from './Button'
import { Tooltip } from './Tooltip'

interface IconPickerProps {
  onSelectIcon?: (iconName: string) => void
  size?: number
  className?: string
  iconsPerPage?: number
  isOpen: boolean
  onClose: () => void
  containerRef?: React.RefObject<HTMLElement>
  initialIcon?: string
}

const LucideIconList: React.FC<IconPickerProps> = ({
  onSelectIcon,
  size = 24,
  className = '',
  iconsPerPage = 8,
  isOpen,
  onClose,
  containerRef,
  initialIcon
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>(initialIcon || '')
  const [iconsList, setIconsList] = useState<string[]>([])
  const [filteredIcons, setFilteredIcons] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [visibleIcons, setVisibleIcons] = useState<string[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  const formatIconName = (name: string): string => {
    let formattedName = name
    formattedName = formattedName.replace(/([A-Z])/g, ' $1').trim()
    formattedName = formattedName.replace(/(\d+)/g, ' $1 ').replace(/\s+/g, ' ').trim()

    return formattedName
  }

  useEffect(() => {
    if (initialIcon) {
      setSelectedIcon(initialIcon)
    }
  }, [initialIcon])

  useEffect(() => {
    const icons = Object.keys(LucideIcons).filter((key) => {
      return (
        key !== 'createLucideIcon' &&
        key !== 'createElement' &&
        !key.startsWith('Default') &&
        !key.endsWith('Icon') &&
        !key.startsWith('Lucide') &&
        /^[A-Z]/.test(key)
      )
    })
    setIconsList(icons)
    setFilteredIcons(icons)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIcons(iconsList)
    } else {
      const filtered = iconsList.filter((icon) => {
        const formattedName = formatIconName(icon).toLowerCase()
        const search = searchTerm.toLowerCase()
        return formattedName.includes(search) || icon.toLowerCase().includes(search)
      })
      setFilteredIcons(filtered)
    }

    setCurrentPage(1)
  }, [searchTerm, iconsList])

  useEffect(() => {
    const total = Math.ceil(filteredIcons.length / iconsPerPage)
    setTotalPages(Math.max(1, total))

    if (currentPage > total) {
      setCurrentPage(Math.max(1, total))
    }
  }, [filteredIcons, iconsPerPage, currentPage])

  useEffect(() => {
    const startIndex = (currentPage - 1) * iconsPerPage
    const endIndex = startIndex + iconsPerPage
    setVisibleIcons(filteredIcons.slice(startIndex, endIndex))
  }, [filteredIcons, currentPage, iconsPerPage])

  const handleSelectIcon = useCallback(
    (iconName: string) => {
      setSelectedIcon(iconName)
      if (onSelectIcon) {
        onSelectIcon(iconName)
      }
      onClose()
    },
    [onSelectIcon, onClose]
  )

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsidePicker = pickerRef.current?.contains(target)
      const clickedInsideContainer = containerRef?.current?.contains(target)

      if (!clickedInsidePicker && !clickedInsideContainer) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus the search input when opened
      setTimeout(() => {
        const searchInput = pickerRef.current?.querySelector('input')
        if (searchInput) {
          searchInput.focus()
        }
      }, 10)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, containerRef])

  // Reset search when reopening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.15, ease: 'easeInOut' }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      x: -5,
      transition: { duration: 0.15, ease: 'easeInOut' }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={pickerRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`icon-picker-panel absolute z-10 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-md overflow-hidden ${className}`}
        >
          <div className="sticky top-0 p-1 border-b border-border dark:border-border-dark">
            <div className="relative flex items-center gap-2">
              <Input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search icons..."
                variant={'ghost'}
              />
            </div>
          </div>

          {/* Icons grid */}
          <div className="max-h-96 overflow-y-auto border-b border-border dark:border-border-dark">
            <div className="grid grid-cols-4 gap-2 w-full">
              {visibleIcons.length > 0 ? (
                visibleIcons.map((iconName) => {
                  const IconComponent = LucideIcons[
                    iconName as keyof typeof LucideIcons
                  ] as React.FC<{ size?: number; strokeWidth?: number }>
                  const displayName = formatIconName(iconName)
                  return (
                    <Tooltip content={displayName} mode="cursor" className="p-1">
                      <motion.button
                        key={iconName}
                        className={`cursor-pointer flex p-2 flex-col border border-transparent hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded transition-colors ${
                          selectedIcon === iconName
                            ? 'bg-button-bg dark:bg-button-bg-dark border border-button-border dark:border-button-border-dark'
                            : ''
                        }`}
                        onClick={() => handleSelectIcon(iconName)}
                        whileTap={{ scale: 0.95 }}
                      >
                        {IconComponent && <IconComponent size={size} strokeWidth={1.5} />}
                      </motion.button>
                    </Tooltip>
                  )
                })
              ) : (
                <div className="col-span-4 p-4 text-center text-text-muted">
                  No icons found {searchTerm ? `for "${searchTerm}"` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Pagination controls */}
          <div className="text-xs text-center text-text-muted my-2">
            <p>
              Showing {visibleIcons.length} of {filteredIcons.length} icons
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant={'icon'}
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </Button>

              <p className="font-medium text-sm">
                Page {currentPage} of {totalPages}
              </p>

              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant={'icon'}
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default LucideIconList
