import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { Check, ChevronLeft, GripVertical, Trash } from 'lucide-react'
import Combobox from '../../components/Combobox'
import Input from '../../components/Input'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../types/Bit'
import { getPropertyIcon } from '../../utils/getIcon'
import SegmentedControl from '../../components/SegmentedControl'
import NumberInput from '../../components/NumberInput'

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { AnimatePresence, motion } from 'framer-motion'

function SortableItem({ id, onRemove }: { id: string; onRemove: () => void }) {
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
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md bg-scry-bg dark:bg-scry-bg-dark p-1"
    >
      <GripVertical
        size={16}
        strokeWidth={1.5}
        className="text-text-muted cursor-pointer focus:outline-none focus-visible:outline-none"
        {...attributes}
        {...listeners}
      />
      <p className="text-sm">{id}</p>
      <Button variant="iconDestructiveGhost" className={`text-text-muted ml-auto ${hovered ? 'opacity-100' : 'opacity-0'}`} onClick={onRemove}>
        <Trash size={16} strokeWidth={1.5} />
      </Button>
    </div>
  )
}

interface PropertyPageProps {
  mode: string
  setView: (value: string) => void
  handleAddProperty?: (name: string, type: BitTypePropertyDefinitionType, options: any, isTitle: boolean) => void
  handleUpdateProperty?: (property: BitTypePropertyDefinition) => void
  selectedProperty?: BitTypePropertyDefinition
}

const PropertyPage: React.FC<PropertyPageProps> = ({ mode, setView, handleAddProperty, handleUpdateProperty, selectedProperty }) => {
  useEffect(() => {
    if (mode == 'edit' && selectedProperty) {
      setCurrentPropType(selectedProperty.type)
      setCurrentPropName(selectedProperty.name)
      setCurrentPropOptions(selectedProperty.options || [])
      setCurrentPropIsTitle(selectedProperty.isTitle)
    }
  }, [])

  const [currentPropType, setCurrentPropType] = useState<BitTypePropertyDefinitionType>('text')
  const [currentPropName, setCurrentPropName] = useState<string>('')
  const [currentPropOptions, setCurrentPropOptions] = useState<string[] | [number, number, number]>([])
  const [currentPropIsTitle, setCurrentPropIsTitle] = useState<boolean>(false)
  const currentPropNameRef = useRef<HTMLInputElement>(null)

  const propertyOptions = [
    {
      header: 'Basic Data Types',
      options: [
        { value: 'bit', label: 'Another bit', icon: getPropertyIcon('bit') },
        { value: 'text', label: 'Text', icon: getPropertyIcon('text') },
        { value: 'number', label: 'Number', icon: getPropertyIcon('number') },
        { value: 'select', label: 'Select', icon: getPropertyIcon('select') },
        { value: 'multiselect', label: 'Multi-select', icon: getPropertyIcon('multiselect') },
        { value: 'date', label: 'Date', icon: getPropertyIcon('date') },
        { value: 'time', label: 'Time', icon: getPropertyIcon('time') },
        { value: 'datetime', label: 'Date & Time', icon: getPropertyIcon('datetime') },
        { value: 'checkbox', label: 'Checkbox', icon: getPropertyIcon('checkbox') }
      ],
      divider: true
    },
    {
      header: 'Media & File Types',
      options: [
        { value: 'document', label: 'Document', icon: getPropertyIcon('document') },
        { value: 'file', label: 'File', icon: getPropertyIcon('file') },
        { value: 'image', label: 'Image', icon: getPropertyIcon('image') },
        { value: 'audio', label: 'Audio', icon: getPropertyIcon('audio') },
        { value: 'planguage', label: 'Programming Language', icon: getPropertyIcon('planguage') },
        { value: 'barcode', label: 'Barcode', icon: getPropertyIcon('barcode') }
      ],
      divider: true
    },
    {
      header: 'Location & Context',
      options: [
        { value: 'location', label: 'Location', icon: getPropertyIcon('location') },
        { value: 'country', label: 'Country', icon: getPropertyIcon('country') },
        { value: 'language', label: 'Language', icon: getPropertyIcon('language') },
        { value: 'timezone', label: 'Time-zone', icon: getPropertyIcon('timezone') },
        { value: 'currency', label: 'Currency', icon: getPropertyIcon('currency') }
      ],
      divider: true
    },
    {
      header: 'Additional Numerical Data',
      options: [
        { value: 'percentage', label: 'Percentage', icon: getPropertyIcon('percentage') },
        { value: 'rating', label: 'Rating', icon: getPropertyIcon('rating') },
        { value: 'range', label: 'Numerical Range', icon: getPropertyIcon('range') },
        { value: 'measurement', label: 'Measurement', icon: getPropertyIcon('measurement') }
      ],
      divider: true
    },
    {
      header: 'Contact & Communication',
      options: [
        { value: 'url', label: 'URL', icon: getPropertyIcon('url') },
        { value: 'email', label: 'E-mail', icon: getPropertyIcon('email') },
        { value: 'phone', label: 'Phone number', icon: getPropertyIcon('phone') }
      ],
      divider: true
    },
    {
      header: 'Visual & UI',
      options: [{ value: 'color', label: 'Color', icon: getPropertyIcon('color') }],
      divider: false
    }
  ]

  const [propOptionName, setPropOptionName] = useState<string>('')

  const handlePropOptionInput = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmedName = propOptionName.trim()
      if (trimmedName !== '' && Array.isArray(currentPropOptions) && currentPropOptions.every((item) => typeof item === 'string')) {
        if (!currentPropOptions.includes(trimmedName)) {
          setCurrentPropOptions((prev) => [...(prev as string[]), trimmedName])
        }
        setPropOptionName('')
      }
    }
  }
  const optionDivRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef<number>(currentPropOptions.length)

  useEffect(() => {
    const prevLength = prevLengthRef.current
    const newLength = currentPropOptions.length

    if (newLength > prevLength && optionDivRef.current) {
      optionDivRef.current.scrollTo({
        top: optionDivRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }

    prevLengthRef.current = newLength
  }, [currentPropOptions])

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return
    if (Array.isArray(currentPropOptions) && currentPropOptions.every((item) => typeof item === 'string')) {
      if (active.id !== over.id) {
        const oldIndex = currentPropOptions.indexOf(active.id)
        const newIndex = currentPropOptions.indexOf(over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          setCurrentPropOptions((items) => arrayMove(items as string[], oldIndex, newIndex))
        }
      }
    }
  }

  const normalizeToTuple = (arr: unknown): [number, number, number] => {
    const a = typeof (arr as any)?.[0] === 'number' ? (arr as any)[0] : 0
    const b = typeof (arr as any)?.[1] === 'number' ? (arr as any)[1] : 0
    const c = typeof (arr as any)?.[2] === 'number' ? (arr as any)[2] : 0
    return [a, b, c]
  }

  const updateTupleValue = (index: 0 | 1 | 2, value: number) => {
    if (Array.isArray(currentPropOptions) && currentPropOptions.every((v) => typeof v === 'number')) {
      const newTuple = [...currentPropOptions] as [number, number, number]
      newTuple[index] = value
      setCurrentPropOptions(normalizeToTuple(newTuple))
    }
  }
  const sensors = useSensors(useSensor(PointerSensor))

  const [propertyNameWarning, setPropertyNameWarning] = useState('')
  const [propertyOptionsWarning, setPropertyOptionsWarning] = useState('')
  const [propertyOptionsRangedWarning, setPropertyOptionsRangedWarning] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPropName.trim()) {
      setPropertyNameWarning('Property name is required.')
      return
    } else {
      setPropertyNameWarning('')
    }

    if ((currentPropType == 'select' || currentPropType == 'multiselect') && currentPropOptions.length == 0) {
      setPropertyOptionsWarning('At least one option is required.')
      return
    } else {
      setPropertyOptionsWarning('')
    }

    if ((currentPropType == 'rating' || currentPropType == 'range') && currentPropOptions.length == 0) {
      setPropertyOptionsRangedWarning('A full range is required.')
      return
    } else {
      setPropertyOptionsRangedWarning('')
    }

    if (mode === 'edit' && handleUpdateProperty && selectedProperty) {
      const newProperty: BitTypePropertyDefinition = {
        id: selectedProperty.id,
        order: selectedProperty.order,
        name: currentPropName,
        type: currentPropType,
        options: currentPropOptions,
        isTitle: currentPropIsTitle
      }
      handleUpdateProperty(newProperty)
    } else if (mode === 'add' && handleAddProperty) {
      handleAddProperty(currentPropName, currentPropType, currentPropOptions, currentPropIsTitle)
    }

    setCurrentPropName('')
    setCurrentPropType('text')
    setCurrentPropOptions([])
    setPropOptionName('')
    setCurrentPropIsTitle(false)
    setView('mainView')
  }
  const [isUnsavedChangesPanelOpen, setIsUnsavedChangesPanelOpen] = useState<boolean>(false)
  const handleBack = () => {
    if (currentPropName == '') {
      setView('mainView')
      setCurrentPropName('')
      setCurrentPropType('text')
      setCurrentPropOptions([])
      setCurrentPropIsTitle(false)
      setPropOptionName('')
    } else {
      setIsUnsavedChangesPanelOpen(true)
    }
  }
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
                <Button
                  onClick={() => {
                    setView('mainView')
                    setCurrentPropName('')
                    setCurrentPropType('text')
                    setCurrentPropOptions([])
                    setPropOptionName('')
                    setCurrentPropIsTitle(false)
                  }}
                  variant={'destructive'}
                >
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
          <p className="ml-1 font-semibold text-lg">{mode === 'edit' ? 'Update Property' : 'Add Property'}</p>
        </div>
        <Button onClick={handleSubmit} variant={'iconGhost'}>
          <Check size={16} strokeWidth={1.5} />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-2 overflow-auto h-full">
        <div className="flex flex-col gap-1">
          <p className="text-text-muted text-sm font-semibold">Property Type</p>
          <Combobox
            maxH={96}
            searchable
            selectedValues={currentPropType}
            options={propertyOptions}
            onChange={(e) => {
              setCurrentPropOptions([])
              setPropOptionName('')
              setCurrentPropType(e as BitTypePropertyDefinitionType)
              currentPropNameRef.current?.focus()
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <p className="text-text-muted text-sm font-semibold">Property Name</p>
            {propertyNameWarning != '' && <p className="ml-auto text-sm text-red-600">{propertyNameWarning}</p>}
          </div>
          <Input ref={currentPropNameRef} value={currentPropName} onChange={(e) => setCurrentPropName(e.target.value)} placeholder="Enter name..." />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-text-muted text-sm font-semibold">Constraint</p>
          <div className="flex items-center gap-2 justify-evenly">
            <SegmentedControl
              selectedOptionValue={currentPropIsTitle == true ? 'title' : 'nottitle'}
              segments={[
                { value: 'nottitle', label: 'Not Title' },
                { value: 'title', label: 'Title' }
              ]}
              onChange={(e) => setCurrentPropIsTitle(e == 'title' ? true : false)}
            />
          </div>
        </div>
        {(currentPropType === 'select' || currentPropType === 'multiselect') && (
          <div className="flex flex-col gap-1 max-h-48">
            <div className="flex items-center">
              <p className="text-text-muted text-sm font-semibold">Options</p>
              {propertyOptionsWarning != '' && <p className="ml-auto text-sm text-red-600">{propertyOptionsWarning}</p>}
            </div>

            <div className="flex flex-col gap-2 h-full min-h-0">
              <Input
                onKeyDown={handlePropOptionInput}
                value={propOptionName}
                onChange={(e) => setPropOptionName(e.target.value)}
                placeholder="Type an option and press enter"
              />

              <div className="overflow-auto" ref={optionDivRef}>
                {currentPropOptions.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext items={currentPropOptions} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1 py-2">
                        {Array.isArray(currentPropOptions) &&
                          currentPropOptions.every((item) => typeof item === 'string') &&
                          currentPropOptions.map((opt) => (
                            <SortableItem
                              key={opt}
                              id={opt}
                              onRemove={() => setCurrentPropOptions((items) => (items as string[]).filter((item) => item !== opt))}
                            />
                          ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="p-2">
                    <p className="text-text-muted text-center text-sm">No options yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(currentPropType === 'rating' || currentPropType === 'range') && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              <p className="text-text-muted text-sm font-semibold">Range</p>
              {propertyOptionsRangedWarning != '' && <p className="ml-auto text-sm text-red-600">{propertyOptionsRangedWarning}</p>}
            </div>

            <div className="flex items-center justify-around gap-2 h-full ">
              <div className="flex flex-col w-full">
                <p className="text-sm text-text-muted">Minimum</p>
                <NumberInput className="justify-between" value={(currentPropOptions[0] as number) || 0} onChange={(v) => updateTupleValue(0, v)} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-text-muted">Maximum</p>
                <NumberInput className="justify-between" value={(currentPropOptions[1] as number) || 0} onChange={(v) => updateTupleValue(1, v)} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-text-muted">Increment</p>
                <NumberInput className="justify-between" value={(currentPropOptions[2] as number) || 0} onChange={(v) => updateTupleValue(2, v)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyPage
