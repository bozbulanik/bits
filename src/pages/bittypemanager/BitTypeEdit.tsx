import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import {
  ChevronLeft,
  Grab,
  GripVertical,
  ImagePlus,
  MoveHorizontal,
  Notebook,
  Plus,
  SquareMousePointer,
  Trash,
  X
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '../../components/Input'
import { getIconComponent, getPropertyIcon } from '../../utils/getIcon'
import LucideIconList from '../../components/LucideIconList'
import Checkbox from '../../components/Checkbox'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../types/Bit'

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import Combobox from '../../components/Combobox'
import { AnimatePresence, motion } from 'framer-motion'
import { useBitTypesStore } from '../../stores/bitTypesStore'

function SortableItem({
  property,
  onDelete
}: {
  property: BitTypePropertyDefinition
  onDelete: (id: string) => void
}) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: property.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
      className={`border 
                  transition-color ease-out duration-400 flex p-0.5 gap-2 rounded-md items-center  ${
                    isDragging
                      ? 'bg-scry-bg dark:bg-scry-bg-dark border-border dark:border-border-dark'
                      : 'border-transparent '
                  } `}
    >
      <div className="flex gap-1 w-full cursor-pointer">
        <div {...attributes} {...listeners} className="rounded-md p-1">
          {hovered ? <GripVertical size={14} strokeWidth={1.5} /> : getPropertyIcon(property.type)}
        </div>
        <div className="grid grid-cols-4 gap-2 items-center w-full">
          <p className="text-sm"> {property.sortId}</p>
          <p className=" text-sm">{property.name}</p>
          <p className=" font-light text-text-muted text-sm">
            {property.defaultValue ? property.defaultValue : 'No default value'}
          </p>
          <p className=" text-xs text-text-muted italic">
            {property.required ? 'Required' : 'Not required'}
          </p>
        </div>
      </div>
      <div className="ml-auto">
        <Button
          onClick={() => onDelete(property.id)}
          variant={'iconDestructiveGhost'}
          className={`${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Trash size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}

const BitTypeEdit = () => {
  const { typeId } = useParams<{ typeId?: string }>()
  if (!typeId) return

  const { getBitTypeById, updateBitType } = useBitTypesStore()
  const existingType = getBitTypeById(typeId as string)
  if (!existingType) return

  useEffect(() => {
    setBitTypeName(existingType.name)
    setBitTypeIcon(existingType.iconName)
    setCurrentProperties([...existingType.properties])
  }, [])

  const navigate = useNavigate()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  )
  const [bitTypeName, setBitTypeName] = useState<string>('')
  const [typeIconHovered, setTypeIconHovered] = useState<boolean>(false)
  const [bitTypeIcon, setBitTypeIcon] = useState<string>('')
  const IconComponent = getIconComponent(bitTypeIcon)
  const iconButtonRef = useRef(null)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
  const [bitTypeWarningMessage, setBitTypeWarningMessage] = useState<string>('')

  const updateExistingBitType = () => {
    if (!bitTypeName.trim()) {
      setBitTypeWarningMessage('Type name is required.')
      return
    }
    if (!bitTypeIcon.trim()) {
      setBitTypeWarningMessage('Type icon is required.')
      return
    }
    if (currentProperties?.length === 0) {
      setBitTypeWarningMessage('At least one property is required.')
      return
    }

    setBitTypeWarningMessage('')
    updateBitType(typeId, bitTypeName, bitTypeIcon, currentProperties)
    navigate('/bittypemanager')
  }
  const addPropertyButtonRef = useRef<HTMLButtonElement>(null)
  const [propertyAddPanelOpened, setPropertyAddPanelOpened] = useState(false)
  const propertyPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        propertyPanelRef.current &&
        !propertyPanelRef.current.contains(e.target as Node) &&
        !addPropertyButtonRef?.current?.contains(e.target as Node)
      ) {
        setPropertyAddPanelOpened(false)
        setPropertyName('')
        setPropertyDefaultValue('')
        setPropertyTypeValue('')
        setPropertyRequired(false)
        setPropertyNameWarningMessage('')
        setPropertyTypeWarningMessage('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const [currentProperties, setCurrentProperties] = useState<BitTypePropertyDefinition[]>([])
  const [propertyName, setPropertyName] = useState<string>('')
  const [propertyDefaultValue, setPropertyDefaultValue] = useState<string>()
  const [propertyTypeValue, setPropertyTypeValue] = useState<string>('')
  const [propertyRequired, setPropertyRequired] = useState<boolean>(false)
  const [propertyNameWarningMessage, setPropertyNameWarningMessage] = useState('')
  const [propertyTypeWarningMessage, setPropertyTypeWarningMessage] = useState('')

  const propertyOptions = [
    {
      options: [
        { value: 'bit', label: 'Another bit', icon: getPropertyIcon('bit') },
        { value: 'text', label: 'Text', icon: getPropertyIcon('text') },
        { value: 'number', label: 'Number', icon: getPropertyIcon('number') },
        { value: 'select', label: 'Select', icon: getPropertyIcon('select') },
        { value: 'multiselect', label: 'Multi-select', icon: getPropertyIcon('multiselect') },
        { value: 'date', label: 'Date', icon: getPropertyIcon('date') },
        { value: 'file', label: 'File', icon: getPropertyIcon('file') },
        { value: 'checkbox', label: 'Checkbox', icon: getPropertyIcon('checkbox') },
        { value: 'url', label: 'URL', icon: getPropertyIcon('url') },
        { value: 'email', label: 'E-mail', icon: getPropertyIcon('email') },
        { value: 'phone', label: 'Phone number', icon: getPropertyIcon('phone') },
        { value: 'image', label: 'Image', icon: getPropertyIcon('image') }
      ]
    }
  ]
  const addProperty = () => {
    if (!propertyName.trim()) {
      setPropertyNameWarningMessage('Property name is required.')
      return
    }
    setPropertyNameWarningMessage('')

    if (!propertyTypeValue) {
      setPropertyTypeWarningMessage('Property type is required.')
      return
    }
    setPropertyTypeWarningMessage('')
    const newProperty: BitTypePropertyDefinition = {
      id: crypto.randomUUID(),
      sortId: currentProperties.length,
      name: propertyName,
      defaultValue: propertyDefaultValue,
      type: propertyTypeValue as BitTypePropertyDefinitionType,
      required: propertyRequired
    }
    setCurrentProperties((prev) => [...prev, newProperty])
    setPropertyAddPanelOpened(false)

    setPropertyName('')
    setPropertyDefaultValue('')
    setPropertyTypeValue('')
    setPropertyRequired(false)
  }

  const deleteProperty = (propertyId: string) => {
    const filteredProperties = currentProperties.filter((property) => property.id !== propertyId)

    const updatedProperties = filteredProperties.map((property, index) => ({
      ...property,
      sortId: index
    }))

    setCurrentProperties(updatedProperties)
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold">
            {bitTypeName == '' ? 'Edit Bit Type' : bitTypeName + ' Type'}
          </p>
        </div>
        <Button
          onClick={() => window.ipcRenderer.invoke('closeWindow', 'bittypemanager')}
          variant={'icon'}
          className="ml-auto"
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="p-2 bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark flex items-center gap-2">
        <Button onClick={() => navigate('/bittypemanager')} className="" variant={'default'}>
          <ChevronLeft size={16} strokeWidth={1.5} />
          Back
        </Button>
      </div>
      <div className="relative flex flex-col gap-2 w-full p-2">
        <p className="uppercase text-text-muted font-bold text-sm">Bit Type</p>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <div
              ref={iconButtonRef}
              onMouseEnter={() => setTypeIconHovered(true)}
              onMouseLeave={() => setTypeIconHovered(false)}
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="relative p-1 cursor-pointer h-16 w-16 border border-button-border dark:border-button-border-dark rounded-md bg-button-bg dark:bg-button-bg-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark flex items-center justify-center"
            >
              {bitTypeIcon != '' ? (
                IconComponent && <IconComponent size={28} strokeWidth={1.5} />
              ) : (
                <Notebook size={28} strokeWidth={1.5} />
              )}
              {typeIconHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-button-bg dark:bg-button-bg-dark rounded-md`}
                >
                  <SquareMousePointer size={28} strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>
          <LucideIconList
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            onSelectIcon={setBitTypeIcon}
            containerRef={iconButtonRef}
            initialIcon={bitTypeIcon}
            className="top-2 left-20"
          />
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Type Name</p>
            <Input
              value={bitTypeName}
              variant={bitTypeName == '' && bitTypeWarningMessage ? 'error' : 'default'}
              onChange={(e) => setBitTypeName(e.target.value)}
              className="w-48"
              placeholder="E.g. Contact"
            />
          </div>
        </div>
      </div>
      <div className="relative p-2 bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark flex items-center gap-2">
        <p className="uppercase text-text-muted font-semibold text-sm">Properties</p>
        <Button
          onClick={() => setPropertyAddPanelOpened(!propertyAddPanelOpened)}
          ref={addPropertyButtonRef}
          className="ml-auto"
          variant={'default'}
        >
          <Plus size={16} strokeWidth={1.5} />
          Add Property
        </Button>
        <AnimatePresence>
          {propertyAddPanelOpened && (
            <motion.div
              ref={propertyPanelRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-100 top-14 right-2 w-64 flex flex-col p-2 bg-scry-bg dark:bg-scry-bg-dark rounded-md border border-border dark:border-border-dark"
            >
              <div className="flex">
                <p className="uppercase text-text-muted font-semibold text-sm">Property Form</p>
                <Button
                  onClick={() => setPropertyAddPanelOpened(false)}
                  variant={'ghost'}
                  className="ml-auto"
                >
                  <X size={16} strokeWidth={1.5} />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Property Name *</p>
                  <Input
                    autoFocus
                    variant={propertyNameWarningMessage != '' ? 'error' : 'default'}
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="E.g. Name"
                  />
                  <p className="text-sm font-semibold text-red-500">{propertyNameWarningMessage}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Property Default Value</p>
                  <Input
                    value={propertyDefaultValue}
                    onChange={(e) => setPropertyDefaultValue(e.target.value)}
                    placeholder="E.g. John"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Property Type *</p>
                  <Combobox
                    searchable
                    className={`${
                      propertyTypeWarningMessage != '' ? 'border rounded-md border-red-500 ' : ''
                    }`}
                    placeholder="Select type"
                    selectedValues={propertyTypeValue}
                    options={propertyOptions}
                    onChange={(value) => setPropertyTypeValue(value as string)}
                  />
                  <p className="text-sm font-semibold text-red-500">{propertyTypeWarningMessage}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Required</p>
                  <Checkbox
                    className=""
                    checked={propertyRequired}
                    onChange={setPropertyRequired}
                  />
                </div>
                <Button onClick={() => addProperty()}>
                  <Plus size={16} strokeWidth={1.5} /> Add
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col w-full flex-1 p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id) {
              const oldIndex = currentProperties.findIndex((item) => item.id === active.id)
              const newIndex = currentProperties.findIndex((item) => item.id === over?.id)
              const newPropertiesArray = arrayMove(currentProperties, oldIndex, newIndex)
              const updatedPropertiesArray = newPropertiesArray.map((property, index) => ({
                ...property,
                sortId: index
              }))

              setCurrentProperties(updatedPropertiesArray)
            }
          }}
        >
          <SortableContext
            items={currentProperties.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="overflow-y-auto h-full flex flex-col overflow-x-hidden">
              {currentProperties.map((property) => (
                <SortableItem
                  onDelete={deleteProperty}
                  key={property.id.toString()}
                  property={property}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-auto p-2 bg-scry-bg dark:bg-scry-bg-dark border-t border-border dark:border-border-dark flex items-center gap-2">
        {bitTypeWarningMessage && (
          <p className="text-red-500 font-semibold text-sm">{bitTypeWarningMessage}</p>
        )}
        <Button onClick={updateExistingBitType} className="ml-auto" variant={'default'}>
          <Plus size={16} strokeWidth={1.5} />
          Update Bit Type
        </Button>
      </div>
      <div className="p-2 h-12 border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default BitTypeEdit
