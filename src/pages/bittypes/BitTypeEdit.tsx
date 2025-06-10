import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { ChevronLeft, ChevronRight, GripVertical, Image, ImagePlus, Plus, Trash, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '../../components/Input'
import { getIconComponent, getPropertyIcon } from '../../utils/getIcon'
import LucideIconList from '../../components/LucideIconList'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../types/Bit'
import { useBitTypesStore } from '../../stores/bitTypesStore'
import PropertyPage from './PropertyPage'

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { AnimatePresence, motion } from 'framer-motion'

function PropertyItem({
  id,
  prop,
  setSelectedPropertyId,
  setView,
  handleDeleteProperty
}: {
  id: string
  prop: BitTypePropertyDefinition
  setSelectedPropertyId: (id: string) => void
  setView: (view: string) => void
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
            <p className="text-xs text-text-muted italic">{prop.isTitle ? 'Title' : 'Not title'}</p>
          </div>
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

const BitTypeEdit = () => {
  const { typeId } = useParams<{ typeId: string }>()
  const { bitTypes, updateBitType } = useBitTypesStore()

  const bitType = typeId ? bitTypes.find((type) => type.id === typeId) : undefined

  const [originalValues, setOriginalValues] = useState<{
    name: string
    description: string
    iconName: string
    properties: BitTypePropertyDefinition[]
  }>({
    name: '',
    description: '',
    iconName: '',
    properties: []
  })

  const [view, setView] = useState<string>('mainView')
  const navigate = useNavigate()

  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const [iconName, setIconName] = useState<string>('')
  const [typeIconHovered, setTypeIconHovered] = useState<boolean>(false)
  const iconButtonRef = useRef(null)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)

  const [properties, setProperties] = useState<BitTypePropertyDefinition[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

  const [bitTypeNameWarning, setBitTypeNameWarning] = useState<string>('')
  const [bitTypeIconNameWarning, setBitTypeIconNameWarning] = useState<string>('')
  const [bitTypePropertyWarning, setBitTypePropertyWarning] = useState<string>('')

  useEffect(() => {
    if (bitType) {
      const initialValues = {
        name: bitType.name,
        description: bitType.description,
        iconName: bitType.iconName,
        properties: bitType.properties
      }

      setName(initialValues.name)
      setIconName(initialValues.iconName)
      setDescription(initialValues.description)
      setProperties(initialValues.properties)
      setOriginalValues(initialValues)
    }
  }, [bitType])

  const arePropertiesEqual = (props1: BitTypePropertyDefinition[], props2: BitTypePropertyDefinition[]) => {
    if (props1.length !== props2.length) return false

    return props1.every((prop1, index) => {
      const prop2 = props2[index]
      return (
        prop1.id === prop2.id &&
        prop1.name === prop2.name &&
        prop1.type === prop2.type &&
        prop1.order === prop2.order &&
        JSON.stringify(prop1.options) === JSON.stringify(prop2.options)
      )
    })
  }

  // Check for changes whenever state updates
  useEffect(() => {
    if (originalValues.name === '' && originalValues.description === '' && originalValues.iconName === '' && originalValues.properties.length === 0) {
      // Don't check for changes until original values are loaded
      return
    }

    const hasChanges =
      name !== originalValues.name ||
      description !== originalValues.description ||
      iconName !== originalValues.iconName ||
      !arePropertiesEqual(properties, originalValues.properties)

    setHasAnythingChanged(hasChanges)
  }, [name, description, iconName, properties, originalValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeId) return
    if (!name.trim()) {
      setBitTypeNameWarning('Type name is required.')
      return
    } else {
      setBitTypeNameWarning('')
    }
    if (!iconName.trim()) {
      setBitTypeIconNameWarning('Type icon is required.')
      return
    } else {
      setBitTypeIconNameWarning('')
    }
    if (properties?.length === 0) {
      setBitTypePropertyWarning('At least one property is required.')
      return
    } else {
      setBitTypePropertyWarning('')
    }
    try {
      await updateBitType(typeId, name, description, iconName, properties)

      setOriginalValues({
        name,
        description,
        iconName,
        properties
      })
      setHasAnythingChanged(false)

      navigate('/bittypes')
    } catch (error) {
      console.error('Error updating bit type:', error)
    }
  }

  const handleAddProperty = (name: string, type: BitTypePropertyDefinitionType, options: any, isTitle: boolean) => {
    setBitTypePropertyWarning('')
    const newProperty: BitTypePropertyDefinition = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      options: options,
      order: properties.length,
      isTitle
    }
    setProperties([...properties, newProperty])
  }

  const handleUpdateProperty = (updatedProperty: BitTypePropertyDefinition) => {
    setBitTypePropertyWarning('')
    setProperties(properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p)))
  }

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id))
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
  const [hasAnythingChanged, setHasAnythingChanged] = useState<boolean>(false)
  const [isUnsavedChangesPanelOpen, setIsUnsavedChangesPanelOpen] = useState<boolean>(false)

  const handleBack = () => {
    if (!hasAnythingChanged) {
      navigate('/bittypes')
    } else {
      setIsUnsavedChangesPanelOpen(true)
    }
  }

  const handleDiscardChanges = () => {
    // Reset to original values
    setName(originalValues.name)
    setDescription(originalValues.description)
    setIconName(originalValues.iconName)
    setProperties(originalValues.properties)
    setHasAnythingChanged(false)
    navigate('/bittypes')
  }
  switch (view) {
    case 'mainView':
      return (
        <div className="w-full h-full flex flex-col">
          <AnimatePresence>
            {isUnsavedChangesPanelOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute w-full h-full pointer-events-auto z-50 backdrop-blur-xs bg-bg/75 dark:bg-bg-dark/75"
              >
                <div className="absolute w-96 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border border-border dark:border-border-dark bg-bg dark:bg-bg-dark rounded-md flex flex-col items-center">
                  <div className="flex flex-col pb-2 px-4 pt-4 w-full">
                    <p className="font-semibold">Unsaved changes</p>
                  </div>
                  <div className="px-4 pb-2 w-full">
                    <p className="text-sm">You have unsaved changes. Are you sure want to leave this page and discard your changes?</p>
                  </div>
                  <div className="flex gap-2 items-center w-full p-2">
                    <Button onClick={() => setIsUnsavedChangesPanelOpen(false)} className="ml-auto" variant={'ghost'}>
                      Cancel
                    </Button>
                    <Button onClick={handleDiscardChanges} variant={'destructive'}>
                      Discard changes
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className=" flex items-center p-2 gap-2">
            <Button onClick={handleBack} variant={'iconGhost'}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Button>
            <div className="flex-1 h-full flex items-center drag-bar">
              <p className="ml-1 font-semibold text-lg">{name == '' ? 'Edit Bit Type' : name + ' Type'}</p>
            </div>
            <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'} className="ml-auto">
              <X size={16} strokeWidth={1.5} />
            </Button>
          </div>

          <div className="flex flex-col h-full min-h-0">
            <div className="p-2">
              <div className="flex flex-col gap-2">
                <p className="text-text-muted font-semibold uppercase text-sm">Details</p>
                <div className="relative flex flex-col gap-1">
                  <div className="flex items-center">
                    <p className="text-sm font-semibold text-text-muted">Type Icon</p>
                    {bitTypeIconNameWarning != '' && <p className="ml-auto text-sm text-red-600">{bitTypeIconNameWarning}</p>}
                  </div>
                  <div
                    ref={iconButtonRef}
                    onMouseEnter={() => setTypeIconHovered(true)}
                    onMouseLeave={() => setTypeIconHovered(false)}
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className={`text-text-muted relative p-1 cursor-pointer h-16 w-full border border-dashed rounded-md flex items-center justify-center ${
                      bitTypeIconNameWarning != '' ? 'border-red-500/50' : 'border-border-dark/25 dark:border-border/25 '
                    }`}
                  >
                    {iconName != '' ? IconComponent && <IconComponent size={28} strokeWidth={1.5} /> : <Image size={28} strokeWidth={1.5} />}
                    {typeIconHovered && (
                      <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md`}>
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
                  <div className="flex items-center">
                    <p className="text-sm font-semibold text-text-muted">Type Name</p>
                    {bitTypeNameWarning != '' && <p className="ml-auto text-sm text-red-600">{bitTypeNameWarning}</p>}
                  </div>
                  <Input
                    variant={bitTypeNameWarning != '' ? 'error' : 'default'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name..."
                  />
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

            <div className="p-2 flex flex-col gap-2 overflow-auto flex-1">
              <div className="flex items-center">
                <p className="text-text-muted font-semibold uppercase text-sm">Properties</p>
                {bitTypePropertyWarning != '' && <p className="ml-auto text-sm text-red-600">{bitTypePropertyWarning}</p>}
              </div>
              <Button onClick={() => setView('addProperty')} variant={'ghost'} className="bg-scry-bg dark:bg-scry-bg-dark">
                <Plus size={16} strokeWidth={1.5} />
                Add property
              </Button>
              <div className="overflow-auto h-full">
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
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex flex-col gap-1 items-center justify-center h-full">
                    <p className="font-semibold">No property yet</p>
                    <p className="text-text-muted text-sm">Add some property before updating this bit type</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 mt-auto">
            <Button onClick={handleSubmit} className="w-full">
              Update Bit Type
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

export default BitTypeEdit
