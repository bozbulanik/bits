import { useBitsStore } from '../stores/bitsStore'
import { useBitTypesStore } from '../stores/bitTypesStore'
import { Bit, BitData, BitTypeDefinition, BitTypePropertyDefinition, BitTypePropertyDefinitionType, Note } from '../types/Bit'
import { format, formatDistanceToNow } from 'date-fns'

import { Pin, PinOff, Plus, X, Moon, Sun } from 'lucide-react'
import * as Icons from 'lucide-react'
import React, { FC, useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useSettingsStore } from '../stores/settingsStore'
import NumberInput from '../components/NumberInput'
import Checkbox from '../components/Checkbox'
import CalendarInput from '../components/DateInput'
import TimeInput from '../components/TimeInput'
import { getPropertyIcon } from '../utils/getIcon'

interface BitNoteProps {
  note: Note
  bit: Bit
}
const BitNoteItem: React.FC<BitNoteProps> = ({ note, bit }) => {
  const { deleteBitNote, updateBitNote } = useBitsStore()
  const [noteString, setNoteString] = useState<string>('Untitled')
  const [updateModeOn, setUpdateModeOn] = useState<boolean>(false)

  useEffect(() => {
    setNoteString(note.content || 'Untitled')
  }, [note.content])

  const handleUpdateMode = () => {
    if (updateModeOn) {
      setUpdateModeOn(false)
    }
  }
  return (
    <div onClick={handleUpdateMode} className="flex items-center gap-2 p-2 border border-border dark:border-border-dark rounded-md">
      {updateModeOn ? (
        <Input
          value={noteString}
          onChange={(e) => setNoteString(e.target.value)}
          onBlur={() => {
            updateBitNote(note.id, bit.id, noteString)
            setUpdateModeOn(false)
          }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p
          onClick={(e) => {
            e.stopPropagation()
            setUpdateModeOn(true)
          }}
          className="text-sm"
        >
          {noteString}
        </p>
      )}
      <p className="ml-auto text-text-muted">Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, includeSeconds: true })}</p>

      <Button variant={'icon'} onClick={() => deleteBitNote(note.id, bit.id)}>
        <Icons.Trash size={16} strokeWidth={1.5} />
      </Button>
    </div>
  )
}

interface BitCardProps {
  bit: Bit
  index: number
}

const BitCard: React.FC<BitCardProps> = ({ bit, index }) => {
  const { deleteBit, addBitNote, togglePin } = useBitsStore()

  function renderValueByType(type: BitTypePropertyDefinitionType, value: any) {
    switch (type) {
      case 'text':
      case 'number':
      case 'email':
      case 'phone':
        return <span>{value}</span>

      case 'checkbox':
        return <span>{value ? 'Yes' : 'No'}</span>

      case 'url':
        return (
          <a href={value} target="_blank" className="text-blue-600 underline">
            {value}
          </a>
        )

      case 'date':
        return <span>{new Date(value).toLocaleDateString()}</span>

      case 'select':
        return <span>{value}</span>

      case 'multiselect':
        return (
          <ul className="list-disc list-inside">
            {(value as string[]).map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        )

      case 'file':
      case 'image':
        return (
          <a href={value} target="_blank" className="text-blue-600 underline">
            {value}
          </a>
        )

      default:
        return <span>{String(value)}</span>
    }
  }
  function renderBitData(bit: Bit) {
    const sortedProperties = [...bit.type.properties].sort((a, b) => a.order - b.order)

    return (
      <div className="flex flex-col text-text-muted">
        {sortedProperties.map((property) => {
          const bitData = bit.data.find((data) => data.propertyId === property.id)

          return (
            <div key={property.id} className="text-sm">
              <div className="flex gap-2">
                <strong>{property.name}: </strong>
                {bitData ? (
                  <span className="ml-auto">{renderValueByType(property.type, bitData.value)}</span>
                ) : (
                  <span className="italic text-gray-500">No data</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  function getIconComponent(name: string): FC<{ size?: number; strokeWidth?: number }> {
    const Icon = Icons[name as keyof typeof Icons] as FC<{ size?: number; strokeWidth?: number }>
    return Icon
  }

  const handlePinning = (bit: Bit) => {
    togglePin(bit.id, bit.pinned ? 0 : 1)
  }

  const [newNoteString, setNewNoteString] = useState<string>('')
  const handleAddNewNote = () => {
    addBitNote(bit.id, newNoteString)
  }
  return (
    <div key={index} className="border border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark rounded-md p-2 flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        {(() => {
          const Icon = getIconComponent(bit.type.iconName)
          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
        })()}
        <p className="font-semibold">{bit.type.name}</p>

        <div className="ml-auto flex gap-2">
          <Button onClick={() => handlePinning(bit)} variant={'icon'}>
            {bit.pinned ? <PinOff size={16} strokeWidth={1.5} /> : <Pin size={16} strokeWidth={1.5} />}
          </Button>
          <Button onClick={() => deleteBit(bit.id)} variant={'icon'}>
            <X size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
      <div className="text-sm flex gap-2 justify-between">
        <p>{format(new Date(bit.createdAt), 'EE, MMM d hh:mm')}</p>
        <p>{format(new Date(bit.updatedAt), 'EE, MMM d hh:mm')}</p>
      </div>
      {renderBitData(bit)}
      <div className="flex gap-2 items-center w-full">
        <Input value={newNoteString} onChange={(e) => setNewNoteString(e.target.value)} className="flex-1" placeholder="Add note" />
        <Button onClick={handleAddNewNote} className="ml-auto">
          Add note
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {bit.notes?.map((note) => (
          <BitNoteItem note={note} bit={bit} />
        ))}
      </div>
    </div>
  )
}

const TestingPage = () => {
  const { settings, setSetting } = useSettingsStore()
  const { bitTypes, addBitType, deleteBitType } = useBitTypesStore()
  const { addBit } = useBitsStore()

  function getIconComponent(name: string): FC<{ size?: number; strokeWidth?: number }> {
    const Icon = Icons[name as keyof typeof Icons] as FC<{ size?: number; strokeWidth?: number }>
    return Icon
  }

  const [bitTypeName, setBitTypeName] = useState<string>('')
  const [bitTypeDescription, setBitTypeDescription] = useState<string>('')

  const [bitTypeIconName, setBitTypeIconName] = useState<string>('')
  const [bitTypePropertyName, setBitTypePropertyName] = useState<string>('')
  const [bitTypePropertyType, setBitTypePropertyType] = useState<BitTypePropertyDefinitionType>('text')
  const [bitTypePropertyRequired, setBitTypePropertyRequired] = useState<boolean>(false)
  const [bitTypePropertyDV, setBitTypePropertyDV] = useState<string>('')

  const [currentProperties, setCurrentProperties] = useState<BitTypePropertyDefinition[]>([])

  const onPropertyTypeSelect = (e: any) => {
    setBitTypePropertyType(e.target.value)
  }
  const addProperty = () => {
    const length = currentProperties.length
    const newBitTypePropertyDefinition: BitTypePropertyDefinition = {
      id: crypto.randomUUID(),
      name: bitTypePropertyName,
      type: bitTypePropertyType,
      required: bitTypePropertyRequired,
      defaultValue: bitTypePropertyDV,
      order: length
    }
    setCurrentProperties((prev) => [...prev, newBitTypePropertyDefinition])
    setBitTypePropertyName('')
    setBitTypePropertyType('text')
    setBitTypePropertyRequired(false)
    setBitTypePropertyDV('')
  }
  const handleAddBitType = () => {
    const id = crypto.randomUUID()

    addBitType(id, bitTypeName, bitTypeDescription, bitTypeIconName, currentProperties)
    setCurrentProperties([])
    setBitTypePropertyName('')
    setBitTypePropertyType('text')
    setBitTypeName('')
    setBitTypeDescription('')
    setBitTypeIconName('')
  }

  const [selectedBitType, setSelectedBitType] = useState<BitTypeDefinition>()
  const [data, setData] = useState<BitData[]>([])

  const handleDataValueChange = (prop: BitTypePropertyDefinition, value: any) => {
    setData((prevData) => {
      const existingItemIndex = prevData.findIndex((item) => item.propertyId === prop.id)

      const newItem: BitData = {
        bitId: crypto.randomUUID(),
        propertyId: prop.id,
        value,
        isTitle: false
      }

      if (existingItemIndex >= 0) {
        // Update existing item
        const newData = [...prevData]
        newData[existingItemIndex] = newItem
        return newData
      } else {
        // Add new item
        return [...prevData, newItem]
      }
    })
  }
  const onBitTypeSelect = (e: any) => {
    const bitType = bitTypes.find((type: BitTypeDefinition) => type.id === e.target.value)
    setSelectedBitType(bitType)
  }
  const handleAddBit = () => {
    if (!selectedBitType) return
    addBit(selectedBitType, data)
  }
  const renderLogPropertyInputs = (prop: BitTypePropertyDefinition) => {
    switch (prop.type) {
      case 'text' as BitTypePropertyDefinitionType:
        return (
          <Input
            variant={'ghost'}
            type="text"
            placeholder="Enter..."
            onChange={(e) => handleDataValueChange(prop, e.target.value || prop.defaultValue)}
            required={prop.required}
          />
        )
      case 'number' as BitTypePropertyDefinitionType:
        return <NumberInput value={parseFloat(prop.defaultValue as string)} onChange={(e) => handleDataValueChange(prop, e || prop.defaultValue)} />
      case 'select' as BitTypePropertyDefinitionType:
        return <div>Select WIP</div>
      case 'multiselect' as BitTypePropertyDefinitionType:
        return <div>Multi-Select WIP</div>
      case 'date' as BitTypePropertyDefinitionType:
        return (
          <CalendarInput
            ghost
            className="w-full"
            placeholder={format(prop.defaultValue as string, 'dd MM yyyy') as string}
            setCurrentDisplayDate={(e) => handleDataValueChange(prop, e.toISOString())}
            horizontalAlign="right"
          />
        )
      case 'file' as BitTypePropertyDefinitionType:
        return (
          <Input
            variant={'ghost'}
            type="file"
            placeholder="Enter..."
            onChange={(e) => handleDataValueChange(prop, e.target.value || prop.defaultValue)}
            required={prop.required}
          />
        )
      case 'checkbox' as BitTypePropertyDefinitionType:
        return (
          <>
            <Input type="checkbox" onChange={(e) => handleDataValueChange(prop, e.target.checked || prop.defaultValue)} />
          </>
        )
      case 'url' as BitTypePropertyDefinitionType:
        return (
          <Input
            variant={'ghost'}
            type="url"
            placeholder="Enter..."
            onChange={(e) => handleDataValueChange(prop, e.target.value || prop.defaultValue)}
            required={prop.required}
          />
        )
      case 'email' as BitTypePropertyDefinitionType:
        return (
          <Input
            variant={'ghost'}
            type="email"
            placeholder="Enter..."
            onChange={(e) => handleDataValueChange(prop, e.target.value || prop.defaultValue)}
            required={prop.required}
            className="focus:outline-none px-1 w-full flex-1"
          />
        )
      case 'phone' as BitTypePropertyDefinitionType:
        return (
          <Input
            variant={'ghost'}
            type="tel"
            placeholder="Enter..."
            onChange={(e) => handleDataValueChange(prop, e.target.value || prop.defaultValue)}
            required={prop.required}
          />
        )
      default:
        return <p className="text-red-500">Unsupported property type: {prop.type}</p>
    }
  }

  return (
    <div className="w-full h-full flex gap-2">
      <div className="p-2 flex flex-col gap-2">
        <Button variant={'icon'} onClick={() => setSetting('theme.mode', settings.theme.mode == 'light' ? 'dark' : 'light')}>
          {settings.theme.mode == 'light' ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
        </Button>

        <div>
          <TimeInput twelveHours={false} includeSeconds={false} placeholder="Set time" horizontalAlign="left" setCurrentDisplayTime={() => {}} />
        </div>
      </div>
      <div className="overflow-auto flex flex-col p-2 gap-2 flex-1">
        <div>
          <div className="flex flex-col gap-2">
            <select value={selectedBitType?.id} onChange={onBitTypeSelect}>
              {bitTypes.map((bitType, index) => {
                return (
                  <option key={index} value={bitType.id}>
                    {bitType.name}
                  </option>
                )
              })}
            </select>

            <div className="flex flex-col w-full">
              {selectedBitType?.properties.map((prop, index) => (
                <div
                  className={`flex gap-2 w-full ${
                    index == 0 ? '' : 'border-t'
                  } border-border dark:border-border-dark  dark:border-border dark:border-border-dark -dark`}
                >
                  <div className="w-36 flex items-center p-1 border-r border-border dark:border-border-dark  dark:border-border dark:border-border-dark -dark px-4">
                    <p>{prop.name}</p>
                  </div>
                  <div className="p-1 flex items-center">
                    {' '}
                    {renderLogPropertyInputs(prop)} <Checkbox className="p-1" checked={false} onChange={() => {}} />{' '}
                    <p className="text-sm">Is title?</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {' '}
              <Button onClick={handleAddBit} variant={'default'}>
                <Plus size={16} strokeWidth={1.5} />
                Add bit
              </Button>
            </div>
          </div>
        </div>
        {/* <div className="flex flex-col gap-2 overflow-auto">{bits && bits.map((bit, index) => <BitCard bit={bit} index={index} />)}</div> */}
      </div>
      <div className="overflow-auto flex flex-col p-2 gap-2 flex-1">
        <div className="flex flex-col gap-2 p-2">
          <Input variant={'default'} value={bitTypeName} onChange={(e) => setBitTypeName(e.target.value)} placeholder="Bit Type Name" />
          <textarea
            className="h-32 resize-none focus:outline-none border rounded-md border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover hover:border-input-border-hover dark:hover:border-input-border-hover-dark p-1 text-sm placeholder:text-text-muted"
            value={bitTypeDescription}
            onChange={(e) => setBitTypeDescription(e.target.value)}
            placeholder="Bit Type Description"
          />

          <Input variant={'default'} value={bitTypeIconName} onChange={(e) => setBitTypeIconName(e.target.value)} placeholder="Bit Type Icon Name" />
          <div className="flex flex-col gap-2 border border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark rounded-md p-2">
            <p className="font-semibold">Properties</p>
            <Input value={bitTypePropertyName} onChange={(e) => setBitTypePropertyName(e.target.value)} placeholder="Bit Type Property Name" />
            <select value={bitTypePropertyType} onChange={onPropertyTypeSelect}>
              <option value="text">text</option>
              <option value="number">number</option>
            </select>
            <div className="flex gap-2 items-center">
              <label>Required</label>

              <Checkbox checked={bitTypePropertyRequired} onChange={(e) => setBitTypePropertyRequired(e)} />
            </div>
            <Input value={bitTypePropertyDV} onChange={(e) => setBitTypePropertyDV(e.target.value)} placeholder="Default Value" />
            <Button onClick={addProperty} variant={'default'}>
              Add Property
            </Button>
          </div>

          <Button onClick={handleAddBitType} variant={'default'}>
            Add Bit Type
          </Button>
          <div>
            {currentProperties?.map((prop) => (
              <div className="flex gap-2">
                <p>{prop.name}</p>
                <p>{prop.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-auto w-64">
        {bitTypes.map((bitType, index) => (
          <div
            key={index}
            className="p-2 border border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark rounded-md flex flex-col gap-2"
          >
            <div className="flex gap-2 items-center">
              {(() => {
                const Icon = getIconComponent(bitType.iconName)
                return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
              })()}
              <p className="font-semibold">{bitType.name}</p>
              <Button onClick={() => deleteBitType(bitType.id)} variant={'icon'} className="ml-auto">
                <X size={16} strokeWidth={1.5} />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {bitType.properties.map((prop, index) => (
                <div key={index} className="px-2 border border-border dark:border-border-dark bg-bg-hover/50 dark:bg-bg-hover-dark/50 rounded-md ">
                  <div className="flex gap-2 items-center justify-between">
                    {getPropertyIcon(prop.type)}
                    <p className="mr-auto font-medium"> {prop.name}</p>
                    <p className="text-text-muted text-sm"> {prop.defaultValue}</p>
                    <p className="text-text-muted text-xs">{prop.required ? 'required' : 'Not Required'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestingPage

// import React from 'react'

// const TestingPage = () => {
//   return <div>TestingPage</div>
// }

// export default TestingPage
