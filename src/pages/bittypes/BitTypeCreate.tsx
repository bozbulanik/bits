import React, { useRef, useState } from 'react'
import Button from '../../components/Button'
import { ChevronLeft, ChevronRight, GripVertical, Image, ImagePlus, Plus, Trash, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import { getIconComponent, getPropertyIcon } from '../../utils/getIcon'
import LucideIconList from '../../components/LucideIconList'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../types/Bit'
import { useBitTypesStore } from '../../stores/bitTypesStore'
import PropertyPage from './PropertyPage'
import { format } from 'date-fns'

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

function PropertyItem({
  id,
  prop,
  setSelectedPropertyId,
  setView,
  renderPropDV,
  handleDeleteProperty
}: {
  id: string
  prop: BitTypePropertyDefinition
  setSelectedPropertyId: (id: string) => void
  setView: (view: string) => void
  renderPropDV: (type: BitTypePropertyDefinitionType, value: any) => React.ReactNode
  handleDeleteProperty: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  const [hovered, setHovered] = useState<boolean>(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-scry-bg dark:bg-scry-bg-dark border border-transparent hover:border-button-border dark:hover:border-button-border-dark cursor-pointer rounded-md"
      ref={setNodeRef}
      style={style}
    >
      <div className="w-full flex items-center gap-2 p-2">
        <GripVertical
          className="text-text-muted cursor-pointer focus:outline-none focus-visible:outline-none"
          size={16}
          strokeWidth={1.5}
          {...attributes}
          {...listeners}
        />
        <div
          onClick={() => {
            setSelectedPropertyId(prop.id)
            setView('editProperty')
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="bg-bg-hover dark:bg-bg-hover-dark p-2 rounded-md">{getPropertyIcon(prop.type)}</div>
          <div className="flex flex-col flex-1">
            <p className="text-sm">{prop.name}</p>
            <p className="text-xs text-text-muted italic">{prop.required ? 'Required' : 'Not required'}</p>
          </div>
          <div className="ml-auto">{renderPropDV(prop.type, prop.defaultValue)}</div>
        </div>
        <div className="ml-auto flex items-center justify-center h-6.5 w-6.5">
          {hovered ? (
            <Button onClick={() => handleDeleteProperty(prop.id)} variant={'iconDestructiveGhost'}>
              <Trash size={16} strokeWidth={1.5} />
            </Button>
          ) : (
            <ChevronRight size={16} strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}

const BitTypeCreate = () => {
  const [view, setView] = useState<string>('mainView')
  const navigate = useNavigate()
  const { addBitType } = useBitTypesStore()

  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const [iconName, setIconName] = useState<string>('')
  const [typeIconHovered, setTypeIconHovered] = useState<boolean>(false)
  const iconButtonRef = useRef(null)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)

  const [properties, setProperties] = useState<BitTypePropertyDefinition[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

  const [bitTypeWarningMessage, setBitTypeWarningMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setBitTypeWarningMessage('Type name is required.')
      return
    }
    if (!iconName.trim()) {
      setBitTypeWarningMessage('Type icon is required.')
      return
    }
    if (properties?.length === 0) {
      setBitTypeWarningMessage('At least one property is required.')
      return
    }
    const propWithNoName = properties.find((p) => p.name == '')
    if (propWithNoName) {
      setBitTypeWarningMessage('Property name is required.')
      return
    }

    setBitTypeWarningMessage('')
    const id = crypto.randomUUID()
    try {
      await addBitType(id, name, description, iconName, properties)
      navigate('/bittypes')
    } catch (error) {
      console.error('Error creating bit type:', error)
    }
  }

  const handleAddProperty = (name: string, type: BitTypePropertyDefinitionType, required: boolean, defaultValue: any, options: any) => {
    const newProperty: BitTypePropertyDefinition = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      required: required,
      defaultValue: defaultValue,
      options: options,
      order: properties.length
    }
    setProperties([...properties, newProperty])
  }

  const handleUpdateProperty = (updatedProperty: BitTypePropertyDefinition) => {
    setProperties(properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p)))
  }

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id))
  }

  function truncateText(text: string, maxLength: number): string {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
  }
  const renderPropDV = (type: BitTypePropertyDefinitionType, value: any) => {
    switch (type) {
      case 'bit':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'text':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'checkbox':
        return <p className="text-sm text-text-muted">{value ? 'Checked' : 'Unchecked'}</p>
      case 'currency':
        return <p className="text-sm text-text-muted">{value}</p>
      case 'date':
        return <p className="text-sm text-text-muted">{format(value, 'MMM dd, yyyy')}</p>
      case 'document':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'email':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'file':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'image':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'location':
        return (
          <p className="text-sm text-text-muted">
            Lat {value[0].toFixed(2)} Lng {value[1].toFixed(2)}
          </p>
        )
      case 'number':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'phone':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'select':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'multiselect':
        return <p className="text-sm text-text-muted">{truncateText(value.length + ' default options', 15)}</p>
      case 'url':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'audio':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'percentage':
        return <p className="text-sm text-text-muted">{truncateText('%' + value, 15)}</p>
      case 'color':
        return <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `${value}` }}></div>
      case 'country':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'language':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'planguage':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'timezone':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'barcode':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'time':
        return <p className="text-sm text-text-muted">{format(value, 'HH:mm')}</p>
      case 'datetime':
        return <p className="text-sm text-text-muted">{format(value, 'MMM dd, yyyy HH:mm')}</p>
      case 'measurement':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'range':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
      case 'rating':
        return <p className="text-sm text-text-muted">{truncateText(value, 15)}</p>
    }
  }

  const IconComponent = getIconComponent(iconName)

  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = properties.findIndex((p) => p.id === active.id)
    const newIndex = properties.findIndex((p) => p.id === over.id)

    const newItems = arrayMove(properties, oldIndex, newIndex)

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    setProperties(updatedItems)
  }
  switch (view) {
    case 'mainView':
      return (
        <div className="w-full h-full flex flex-col">
          <div className=" flex items-center p-2 gap-2">
            <Button onClick={() => navigate('/bittypes')} variant={'iconGhost'}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Button>
            <div className="flex-1 h-full flex items-center drag-bar">
              <p className="ml-1 font-semibold text-lg">{name == '' ? 'Create Bit Type' : name + ' Type'}</p>
            </div>
            <Button onClick={() => window.ipcRenderer.invoke('closeWindow', 'bittypes')} variant={'iconGhost'} className="ml-auto">
              <X size={16} strokeWidth={1.5} />
            </Button>
          </div>

          <div className="flex flex-col h-full min-h-0">
            <div className="p-2">
              <div className="flex flex-col gap-2">
                <p className="text-text-muted font-semibold uppercase text-sm">Details</p>
                <div className="relative flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-muted">Type Icon</p>
                  <div
                    ref={iconButtonRef}
                    onMouseEnter={() => setTypeIconHovered(true)}
                    onMouseLeave={() => setTypeIconHovered(false)}
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className={`text-text-muted relative p-1 cursor-pointer h-16 w-full border border-dashed border-border-dark/25 dark:border-border/25 rounded-md flex items-center justify-center `}
                  >
                    {iconName != '' ? IconComponent && <IconComponent size={28} strokeWidth={1.5} /> : <Image size={28} strokeWidth={1.5} />}
                    {typeIconHovered && (
                      <div
                        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md ${
                          iconName == '' && bitTypeWarningMessage
                            ? 'bg-input-bg-error dark:bg-input-bg-error-dark '
                            : 'bg-button-bg dark:bg-button-bg-dark '
                        }`}
                      >
                        <ImagePlus size={28} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <LucideIconList
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelectIcon={setIconName}
                    containerRef={iconButtonRef}
                    initialIcon={iconName}
                    className="top-12 left-1/2 translate-x-[-50%]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-muted">Type Name</p>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-muted">Description (optional)</p>
                  <textarea
                    spellCheck={false}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="placeholder:text-text-muted/75 w-full h-24 p-1 text-sm ml-auto resize-none focus:outline-none bg-input-bg dark:bg-input-bg-dark border border-input-border dark:border-input-border-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="p-2 flex flex-col gap-2 overflow-auto">
              <p className="text-text-muted font-semibold uppercase text-sm">Properties</p>
              <Button onClick={() => setView('addProperty')} variant={'ghost'} className="bg-scry-bg dark:bg-scry-bg-dark">
                <Plus size={16} strokeWidth={1.5} />
                Add property
              </Button>
              <div className="overflow-auto">
                {properties.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext items={properties.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2">
                        {properties.map((prop) => (
                          <PropertyItem
                            key={prop.id}
                            id={prop.id}
                            prop={prop}
                            handleDeleteProperty={handleDeleteProperty}
                            setSelectedPropertyId={setSelectedPropertyId}
                            setView={setView}
                            renderPropDV={renderPropDV}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-text-muted text-sm">No property yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 mt-auto">
            <Button onClick={handleSubmit} className="w-full">
              Create Bit Type
            </Button>
          </div>
        </div>
      )
    case 'addProperty':
      return <PropertyPage mode="add" setView={setView} handleAddProperty={handleAddProperty} />

    case 'editProperty':
      return (
        <PropertyPage
          mode="edit"
          setView={setView}
          selectedProperty={properties.find((prop) => prop.id === selectedPropertyId)}
          handleUpdateProperty={handleUpdateProperty}
        />
      )
  }
}

export default BitTypeCreate
