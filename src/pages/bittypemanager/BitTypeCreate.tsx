import React, { useRef, useState } from 'react'
import Button from '../../components/Button'
import { ChevronLeft, Image, ImagePlus, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import { getIconComponent } from '../../utils/getIcon'
import LucideIconList from '../../components/LucideIconList'
import { BitTypePropertyDefinition } from '../../types/Bit'

import { useBitTypesStore } from '../../stores/bitTypesStore'
import ReorderablePropertyList from '../../components/ReorderablePropertyList'
import PropertyEditor from '../../components/PropertyEditor'

const BitTypeCreate = () => {
  const navigate = useNavigate()
  const { addBitType } = useBitTypesStore()

  const [name, setName] = useState('')
  const [iconName, setIconName] = useState('')
  const [properties, setProperties] = useState<BitTypePropertyDefinition[]>([])
  const [typeIconHovered, setTypeIconHovered] = useState<boolean>(false)
  const iconButtonRef = useRef(null)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
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

    try {
      await addBitType(name, iconName, properties)
      navigate('/bittypemanager')
    } catch (error) {
      console.error('Error creating bit type:', error)
    }
  }

  const handleAddProperty = () => {
    const newProperty: BitTypePropertyDefinition = {
      id: crypto.randomUUID(),
      name: '',
      type: 'text',
      required: false,
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

  const handleReorderProperties = (propertyIds: string[]) => {
    const propertyMap = Object.fromEntries(properties.map((prop) => [prop.id, prop]))

    const reorderedProperties = propertyIds.map((id, index) => ({
      ...propertyMap[id],
      order: index
    }))

    setProperties(reorderedProperties)
  }

  const IconComponent = getIconComponent(iconName)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold">{name == '' ? 'Create Bit Type' : name + ' Type'}</p>
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
              className={`relative p-1 cursor-pointer h-16 w-16 border rounded-md flex items-center justify-center ${
                iconName == '' && bitTypeWarningMessage
                  ? 'bg-input-bg-error dark:bg-input-bg-error-dark border-input-border-error dark:border-input-border-error-dark hover:border-input-border-error-hover dark:hover:border-input-border-error-hover-dark'
                  : 'bg-button-bg dark:bg-button-bg-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark border-button-border dark:border-button-border-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark'
              }`}
            >
              {iconName != '' ? (
                IconComponent && <IconComponent size={28} strokeWidth={1.5} />
              ) : (
                <Image size={28} strokeWidth={1.5} />
              )}
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
          </div>
          <LucideIconList
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            onSelectIcon={setIconName}
            containerRef={iconButtonRef}
            initialIcon={iconName}
            className="top-2 left-20"
          />
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Type Name</p>
            <Input
              value={name}
              variant={name == '' && bitTypeWarningMessage ? 'error' : 'default'}
              onChange={(e) => setName(e.target.value)}
              className="w-48"
              placeholder="E.g. Contact"
            />
          </div>
        </div>
      </div>
      <div className="relative p-2 bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark flex items-center gap-2">
        <p className="uppercase text-text-muted font-semibold text-sm">Properties</p>
        <Button onClick={handleAddProperty} className="ml-auto" variant={'default'}>
          <Plus size={16} strokeWidth={1.5} />
          Add Property
        </Button>
      </div>

      <ReorderablePropertyList
        properties={properties}
        onDeleteProperty={handleDeleteProperty}
        onReorderProperties={handleReorderProperties}
        renderProperty={(property) => (
          <PropertyEditor
            property={property}
            bitTypeWarningMessage={bitTypeWarningMessage}
            onChange={handleUpdateProperty}
          />
        )}
      />

      <div className="mt-auto p-2 bg-scry-bg dark:bg-scry-bg-dark border-t border-border dark:border-border-dark flex items-center gap-2">
        {bitTypeWarningMessage && (
          <p className="text-red-500 font-semibold text-sm">{bitTypeWarningMessage}</p>
        )}
        <Button onClick={handleSubmit} className="ml-auto" variant={'default'}>
          <Plus size={16} strokeWidth={1.5} />
          Create Bit Type
        </Button>
      </div>
      <div className="p-2 h-12 border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default BitTypeCreate
