import Button from './Button'
import { ArrowDownAZ, ArrowDownUp, ArrowDownZA, Check, ChevronsUpDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Input from './Input'

interface ToggleOption {
  value: string
  label?: string
  icon?: React.ReactNode
}

interface ToggleButtonProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  variant?: 'default' | 'icon' | 'ghost' | 'destructive' | 'tab' | 'selectedTab'
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  options,
  value,
  onChange,
  className,
  variant
}) => {
  const currentIndex = options.findIndex((opt) => opt.value === value)
  const current = options[currentIndex]

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % options.length
    onChange(options[nextIndex].value)
  }
  return (
    <Button className={className} variant={variant} onClick={handleClick}>
      {current?.icon}
    </Button>
  )
}

// Returns the span with a matched text.
function highlightMatch(label: string, query: string): React.ReactNode {
  if (!query) return label
  const index = label.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return label

  const before = label.slice(0, index)
  const match = label.slice(index, index + query.length)
  const after = label.slice(index + query.length)

  return (
    <>
      {before}
      <span className="font-bold text-accent-foreground">{match}</span>
      {after}
    </>
  )
}

interface ComboboxOption {
  value: string
  label?: string
  icon?: React.ReactNode
}

export interface ComboboxOptionGroup {
  header?: string
  options: ComboboxOption[]
  divider?: boolean
}

interface ComboboxProps {
  selectedValues: string | string[]
  options: ComboboxOptionGroup[]
  label?: string
  searchable?: boolean
  className?: string
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiSelect?: boolean
  ghost?: boolean
}

const Combobox: React.FC<ComboboxProps> = ({
  selectedValues,
  options,
  label,
  searchable,
  className,
  onChange,
  placeholder,
  multiSelect,
  ghost
}) => {
  const [focusedOption, setFocusedOption] = useState<ComboboxOption | null>()
  const [isItemListOpen, setItemListOpen] = useState<boolean>(false)
  const [optionSearch, setOptionSearch] = useState<string>('')
  const [optionSort, setOptionSort] = useState<string>('default')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const allOptions = options.flatMap((group) => group.options)
  const selectedValuesArray = Array.isArray(selectedValues)
    ? selectedValues
    : [selectedValues].filter(Boolean)

  const selectedOptions = allOptions.filter((option) => selectedValuesArray.includes(option.value))

  // Constant variable of filtered groups based on the search query
  const filteredGroup = options
    .map((group) => {
      let filteredOptions = group.options.filter((option) =>
        option.label?.toLowerCase().includes(optionSearch.toLowerCase())
      )

      // Sorting logic
      if (optionSort === 'alphaAZ') {
        filteredOptions.sort((a, b) => (a.label || '').localeCompare(b.label || ''))
      } else if (optionSort === 'alphaZA') {
        filteredOptions.sort((a, b) => (b.label || '').localeCompare(a.label || ''))
      }
      return {
        ...group,
        options: filteredOptions
      }
    })
    .filter((group) => group.options.length > 0)
    .map((group, idx, arr) => ({
      ...group,
      divider: arr.length > 1 && group.divider !== false
    }))

  useEffect(() => {
    // Handles the clicking outside of the item list
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        // Close item list, make the focused option null for next time, set search input empty
        setItemListOpen(false)
        setFocusedOption(null)
        setOptionSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handles the scrolling through item list with the button
  const handleButtonScroll = (event: React.WheelEvent<HTMLButtonElement>) => {
    if (multiSelect) return
    event.cancelable && event.preventDefault()

    // Open the item list when scrolling starts
    if (!isItemListOpen) {
      setItemListOpen(true)
    }
    const flatOptions = filteredGroup.flatMap((group) => group.options)
    const currentIndex = flatOptions.findIndex((opt) => selectedValuesArray.includes(opt.value))

    if (flatOptions.length === 0) return

    let newIndex = currentIndex

    if (event.deltaY > 0) {
      newIndex = (currentIndex + 1) % flatOptions.length
    } else if (event.deltaY < 0) {
      newIndex = (currentIndex - 1 + flatOptions.length) % flatOptions.length
    }

    const newOption = flatOptions[newIndex]
    if (newOption) {
      setFocusedOption(newOption)
      onChange(newOption.value)
    }
  }

  // Handler for selecting/deselecting an option
  const handleOptionToggle = (value: string) => {
    if (multiSelect) {
      // Multi-select mode
      const valueIsSelected = selectedValuesArray.includes(value)
      const newSelectedValues = valueIsSelected
        ? selectedValuesArray.filter((v) => v !== value)
        : [...selectedValuesArray, value]

      onChange(newSelectedValues)
      setOptionSearch('')
    } else {
      // Single-select mode
      onChange(value)
      setItemListOpen(false)
      setOptionSearch('')
    }
  }

  // Clear all selected items
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(multiSelect ? [] : '')
  }
  const sortOptions = [
    { value: 'alphaAZ', icon: <ArrowDownAZ size={16} strokeWidth={1.5} /> },
    { value: 'alphaZA', icon: <ArrowDownZA size={16} strokeWidth={1.5} /> },
    { value: 'default', icon: <ArrowDownUp size={16} strokeWidth={1.5} /> }
  ]
  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        onWheel={handleButtonScroll}
        ref={buttonRef}
        variant={ghost ? 'ghost' : 'default'}
        className="w-full"
        onClick={() => setItemListOpen((prev) => !prev)}
      >
        {selectedOptions.length === 0 ? (
          <div>
            <span className="text-text-muted">{placeholder}</span>
          </div>
        ) : multiSelect ? (
          <div>
            <p>Selected ({selectedOptions.length})</p>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {selectedOptions[0]?.icon && selectedOptions[0].icon}
            <span>{selectedOptions[0]?.label}</span>
          </div>
        )}
        <div className="ml-auto">
          <ChevronsUpDown
            size={16}
            strokeWidth={1.5}
            className={`transition-transform duration-200 ${
              isItemListOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </Button>
      <AnimatePresence mode="wait">
        {isItemListOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-9 z-50 w-full bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md"
          >
            {searchable && (
              <div className="border-b border-border dark:border-border-dark flex">
                <Input
                  autoFocus
                  value={optionSearch}
                  onChange={(e) => setOptionSearch(e.target.value)}
                  placeholder="Search..."
                  variant={'ghost'}
                />
                <ToggleButton
                  className="m-1 text-text-muted hover:text-text hover:dark:text-text-dark"
                  value={optionSort}
                  variant="ghost"
                  options={sortOptions}
                  onChange={setOptionSort}
                />
              </div>
            )}
            {selectedOptions.length > 0 && multiSelect && (
              <div className="p-1 border-b border-border dark:border-border-dark">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted2 font-bold uppercase">
                    Selected ({selectedOptions.length})
                  </span>
                  <Button variant="ghost" onClick={handleClearAll}>
                    Clear all
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col overflow-auto max-h-64 p-1">
              {filteredGroup.length === 0 && optionSearch ? (
                <div className="text-sm text-text-muted">No options found</div>
              ) : (
                filteredGroup?.map((optionGroup, index) => (
                  <div
                    key={optionGroup.header || index}
                    className={`${
                      optionGroup.divider ? 'border-b border-border dark:border-border-dark' : ''
                    }`}
                  >
                    <p className="font-bold uppercase text-xs text-text-muted2">
                      {optionGroup.header}
                    </p>
                    {optionGroup.options.map((option) => (
                      <div
                        key={option.value}
                        className={`${
                          selectedValuesArray.includes(option.value) ? 'font-medium' : ''
                        } cursor-pointer text-sm w-full flex gap-2  p-0.5 items-center hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark rounded-sm ${
                          focusedOption?.value == option.value
                            ? 'bg-button-bg-hover dark:bg-button-bg-hover-dark'
                            : 'bg-transparent'
                        }`}
                        onMouseEnter={() => setFocusedOption(option)}
                        onClick={() => handleOptionToggle(option.value)}
                      >
                        {option.icon}
                        <div>{highlightMatch(option.label || '', optionSearch)}</div>
                        <div className="ml-auto">
                          {selectedValuesArray.includes(option.value) && (
                            <Check size={16} strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Combobox
