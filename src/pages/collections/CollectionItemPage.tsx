import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { ArrowDownNarrowWide, ChevronLeft, Filter, Search } from 'lucide-react'
import Input from '../../components/Input'
import { useBitsStore } from '../../stores/bitsStore'
import { Bit, BitData, BitTypePropertyDefinition } from '../../types/Bit'
import { getIconComponent } from '../../utils/getIcon'
import { format } from 'date-fns'
import Checkbox from '../../components/Checkbox'
import { motion } from 'framer-motion'

interface CollectionItemProps {
  bit: Bit
  selected: boolean
  dragHighlighted: boolean
  dragMode: 'select' | 'deselect'
  onSelected: (id: string, selected: boolean) => void
}

const CollectionItem: React.FC<CollectionItemProps> = ({ bit, selected, dragHighlighted, dragMode, onSelected }) => {
  const IconComponent = getIconComponent(bit.type.iconName)

  const getTextValue = () => {
    const textProperty = bit.type.properties.find((property: BitTypePropertyDefinition) => property.type === 'text')
    const bitData = bit.data.find((data: BitData) => data.propertyId === textProperty?.id)
    return bitData?.value || 'Untitled'
  }
  const getItemClasses = () => {
    if (dragHighlighted && dragMode === 'deselect') {
      return 'border bg-button-bg-hover/75 dark:bg-button-bg-hover-dark/75 border-red-400 dark:border-red-900/75'
    } else if (selected) {
      return 'border bg-button-bg-hover/75 dark:bg-button-bg-hover-dark/75 border-button-border-hover dark:border-button-border-hover-dark'
    } else if (dragHighlighted) {
      return 'border bg-button-bg-hover/50 dark:bg-button-bg-hover-dark/50 border-button-border dark:border-button-border-dark'
    } else {
      return 'border border-transparent bg-scry-bg dark:bg-scry-bg-dark hover:border-button-border-hover dark:hover:border-button-border-dark'
    }
  }

  return (
    <div onClick={() => onSelected(bit.id, !selected)} className={`cursor-pointer flex items-center gap-2 py-2 px-2 rounded-md  ${getItemClasses()}`}>
      <div className="p-2 bg-button-bg-hover dark:bg-button-bg-hover-dark rounded-md">
        {IconComponent && <IconComponent size={16} strokeWidth={1.5} />}
      </div>
      <div>
        <p className="text-sm">{getTextValue()}</p>
      </div>
      <div className="ml-auto">
        <p className="text-sm text-text-muted">{format(bit.updatedAt, 'MMM dd, yyyy')}</p>
      </div>
      <div>
        <Checkbox onClick={(e) => e.stopPropagation()} checked={selected} onChange={(checked) => onSelected(bit.id, checked)} />
      </div>
    </div>
  )
}

interface CollectionItemPageProps {
  setView: (view: string) => void
  handleUpdateBits: (bitIds: Set<string>) => void
  initialSelectedBitIds?: Set<string>
}

const CollectionItemPage: React.FC<CollectionItemPageProps> = ({ setView, handleUpdateBits, initialSelectedBitIds }) => {
  const { bits } = useBitsStore()

  const [selectedBitIds, setSelectedBitIds] = useState<Set<string>>(new Set(initialSelectedBitIds))

  const [dragHighlightedIds, setDragHighlightedIds] = useState<Set<string>>(new Set())

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [dragThreshold] = useState(5)
  const [hasMovedPastThreshold, setHasMovedPastThreshold] = useState(false)
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select')

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartY(e.clientY)
    setDragStartX(e.clientX)
    setHasMovedPastThreshold(false)
    setDragHighlightedIds(new Set())

    const target = e.target as HTMLElement
    const itemElement = target.closest('[data-id]') as HTMLElement
    const itemId = itemElement?.dataset.id

    if (itemId && selectedBitIds.has(itemId)) {
      setDragMode('deselect')
    } else {
      setDragMode('select')
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartY === null || dragStartX === null) return

    const currentY = e.clientY
    const currentX = e.clientX
    const deltaY = Math.abs(currentY - dragStartY)
    const deltaX = Math.abs(currentX - dragStartX)

    if (!hasMovedPastThreshold && (deltaY > dragThreshold || deltaX > dragThreshold)) {
      setIsDragging(true)
      setHasMovedPastThreshold(true)
    }

    if (!isDragging || !containerRef.current) return

    const minY = Math.min(dragStartY, currentY)
    const maxY = Math.max(dragStartY, currentY)

    const items = Array.from(containerRef.current.querySelectorAll('[data-id]')) as HTMLDivElement[]
    const newHighlightedIds = new Set<string>()

    items.forEach((item) => {
      const rect = item.getBoundingClientRect()
      const id = item.dataset.id!

      if (rect.top < maxY && rect.bottom > minY) {
        if (dragMode === 'select' && !selectedBitIds.has(id)) {
          newHighlightedIds.add(id)
        } else if (dragMode === 'deselect' && selectedBitIds.has(id)) {
          newHighlightedIds.add(id)
        }
      }
    })

    setDragHighlightedIds(newHighlightedIds)
  }

  const handleMouseUp = () => {
    if (!hasMovedPastThreshold) {
      setDragStartY(null)
      setDragStartX(null)
      return
    }

    if (!isDragging) return

    setIsDragging(false)

    if (dragHighlightedIds.size > 0) {
      setSelectedBitIds((prev) => {
        const newSet = new Set(prev)

        if (dragMode === 'select') {
          dragHighlightedIds.forEach((id) => newSet.add(id))
        } else if (dragMode === 'deselect') {
          dragHighlightedIds.forEach((id) => newSet.delete(id))
        }

        return newSet
      })
    }

    setDragHighlightedIds(new Set())
    setDragStartY(null)
    setDragStartX(null)
    setHasMovedPastThreshold(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging || dragStartY !== null) {
        handleMouseUp()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragStartY === null || dragStartX === null) return

      const deltaY = Math.abs(e.clientY - dragStartY)
      const deltaX = Math.abs(e.clientX - dragStartX)

      if (!hasMovedPastThreshold && (deltaY > dragThreshold || deltaX > dragThreshold)) {
        setIsDragging(true)
        setHasMovedPastThreshold(true)
      }

      if (!isDragging || !containerRef.current) return

      const currentY = e.clientY
      const minY = Math.min(dragStartY, currentY)
      const maxY = Math.max(dragStartY, currentY)

      const items = Array.from(containerRef.current.querySelectorAll('[data-id]')) as HTMLDivElement[]
      const newHighlightedIds = new Set<string>()

      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const id = item.dataset.id!

        if (rect.top < maxY && rect.bottom > minY) {
          if (dragMode === 'select' && !selectedBitIds.has(id)) {
            newHighlightedIds.add(id)
          } else if (dragMode === 'deselect' && selectedBitIds.has(id)) {
            newHighlightedIds.add(id)
          }
        }
      })

      setDragHighlightedIds(newHighlightedIds)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, dragHighlightedIds, dragStartY, dragStartX, hasMovedPastThreshold, dragThreshold, dragMode, selectedBitIds])

  const handleCollectionItemToggle = (id: string, selected: boolean) => {
    setSelectedBitIds((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleConfirm = () => {
    handleUpdateBits(selectedBitIds)

    setView('mainView')
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className=" flex items-center p-2 gap-2">
        <Button
          onClick={() => {
            setView('mainView')
          }}
          variant={'iconGhost'}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold text-lg">Select Bits</p>
        </div>
      </div>
      <div className="px-2">
        <p className="text-sm text-text-muted">Click or drag bits to select/deselect</p>
      </div>
      <div className="overflow-hidden flex flex-col gap-2 p-2 overflow-auto h-full">
        <div className="flex gap-2">
          <Input
            leftSection={
              <div className="p-2 text-text-muted">
                <Search size={16} strokeWidth={1.5} />
              </div>
            }
            className="flex-1"
            autoFocus
            placeholder="Search for bits..."
          />
          <Button variant={'ghost'} className="ml-auto">
            <Filter size={16} strokeWidth={1.5} /> Filter
          </Button>
          <Button variant={'ghost'}>
            <ArrowDownNarrowWide size={16} strokeWidth={1.5} /> Sort
          </Button>
        </div>

        <div ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} className="overflow-auto gap-1 flex flex-col select-none">
          {bits.map((bit) => (
            <div key={bit.id} data-id={bit.id}>
              <CollectionItem
                bit={bit}
                selected={selectedBitIds.has(bit.id)}
                dragHighlighted={dragHighlightedIds.has(bit.id)}
                dragMode={dragMode}
                onSelected={handleCollectionItemToggle}
              />
            </div>
          ))}
        </div>
        {selectedBitIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 100, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="h-12 w-full p-2 flex items-center justify-center border border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark rounded-md"
          >
            <div className="w-full h-full flex items-center gap-2">
              <p className="text-sm text-text-muted">
                {selectedBitIds.size} {selectedBitIds.size > 1 ? 'bits' : 'bit'} selected
              </p>
              <Button className="ml-auto" variant={'ghost'} onClick={() => handleConfirm()}>
                Confirm
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CollectionItemPage
