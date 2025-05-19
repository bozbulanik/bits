import React, { useState } from 'react'
import { GripVertical, X, Plus, Trash } from 'lucide-react'
import Button from './Button'
import { BitTypePropertyDefinition } from '../types/Bit'
import { getPropertyIcon } from '../utils/getIcon'

interface ReorderablePropertyListProps {
  properties: BitTypePropertyDefinition[]
  onDeleteProperty: (id: string) => void
  onReorderProperties: (propertyIds: string[]) => void
  renderProperty: (property: BitTypePropertyDefinition) => React.ReactNode
}

const ReorderablePropertyList: React.FC<ReorderablePropertyListProps> = ({
  properties,
  onDeleteProperty,
  onReorderProperties,
  renderProperty
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<string>('')
  // Sort properties by order field
  const sortedProperties = [...properties].sort((a, b) =>
    a.order !== undefined && b.order !== undefined ? a.order - b.order : 0
  )

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Create new array with reordered items
    const newProperties = [...sortedProperties]
    const draggedItem = newProperties[draggedIndex]

    // Remove item from original position
    newProperties.splice(draggedIndex, 1)
    // Insert at new position
    newProperties.splice(index, 0, draggedItem)

    // Update dragged index to new position
    setDraggedIndex(index)

    // Send reordered property IDs to parent
    onReorderProperties(newProperties.map((prop) => prop.id))
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="w-full flex-1 p-2 flex flex-col overflow-auto">
      {sortedProperties.map((property, index) => (
        <div
          key={property.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setHoveredId(property.id)}
          onMouseLeave={() => setHoveredId('')}
          className={`flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-border dark:hover:border-border-dark hover:bg-scry-bg dark:hover:bg-scry-bg-dark ${
            draggedIndex === index
              ? 'bg-scry-bg dark:bg-scry-bg-dark opacity-50 border-border dark:border-border-dark'
              : ''
          }`}
        >
          <div className="cursor-pointer rounded-md p-1">
            {hoveredId == property.id ? (
              <GripVertical size={16} strokeWidth={1.5} />
            ) : (
              getPropertyIcon(property.type)
            )}
          </div>
          <div className="flex-1">{renderProperty(property)}</div>

          <div className="ml-auto">
            <Button
              onClick={() => onDeleteProperty(property.id)}
              variant={'iconDestructiveGhost'}
              className={`${hoveredId == property.id ? 'opacity-100' : 'opacity-0'}`}
            >
              <Trash size={16} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      ))}

      {properties.length === 0 && <div className="text-text-muted">No properties.</div>}
    </div>
  )
}

export default ReorderablePropertyList
