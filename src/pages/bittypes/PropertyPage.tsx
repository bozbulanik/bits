import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { Check, ChevronLeft, File, FileAudio, FilePlus, GripVertical, Image, ImagePlus, Plus, Trash } from 'lucide-react'
import Combobox from '../../components/Combobox'
import Input from '../../components/Input'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { reverseGeocode } from '../../utils/reverseGeocode'
import { Bit, BitTypePropertyDefinition, BitTypePropertyDefinitionDVType, BitTypePropertyDefinitionType } from '../../types/Bit'
import { getIconComponent, getPropertyIcon } from '../../utils/getIcon'
import useNetworkStatus from '../../utils/useNetworkStatus'
import { useBitsStore } from '../../stores/bitsStore'
import { isoCurrencies } from '../../utils/getCurrency'
import { useSettingsStore } from '../../stores/settingsStore'
import SegmentedControl from '../../components/SegmentedControl'
import Checkbox from '../../components/Checkbox'
import DateInput from '../../components/DateInput'
import NumberInput from '../../components/NumberInput'

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { programmingLanguages } from '../../utils/getProgrammingLanguages'
import { countries } from '../../utils/getCountries'
import { languages } from '../../utils/getLanguages'
import { timezones } from '../../utils/getTimeZones'
import {
  measurementArea,
  measurementEnergy,
  measurementFrequency,
  measurementLength,
  measurementMass,
  measurementSpeed,
  measurementTemperature,
  measurementVolume
} from '../../utils/getMeasurements'
import TimeInput from '../../components/TimeInput'
import DateTimeComponent from '../../components/DateTimeComponent'
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

function LocationClickHandler({ onClick }: { onClick: (loc: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      const latlng = [e.latlng.lat, ((((e.latlng.lng + 180) % 360) + 360) % 360) - 180] as [number, number]
      onClick(latlng)
    }
  })

  return null
}

interface PropertyPageProps {
  mode: string
  setView: (value: string) => void
  handleAddProperty?: (
    name: string,
    type: BitTypePropertyDefinitionType,
    required: boolean,
    defaultValue: BitTypePropertyDefinitionDVType,
    options: any
  ) => void
  handleUpdateProperty?: (property: BitTypePropertyDefinition) => void
  selectedProperty?: BitTypePropertyDefinition
}

const PropertyPage: React.FC<PropertyPageProps> = ({ mode, setView, handleAddProperty, handleUpdateProperty, selectedProperty }) => {
  useEffect(() => {
    if (mode == 'edit' && selectedProperty) {
      setCurrentPropType(selectedProperty.type)
      setCurrentPropName(selectedProperty.name)
      setCurrentPropRequired(selectedProperty.required)
      setCurrentPropDV(selectedProperty.defaultValue || '')
      setCurrentPropOptions(selectedProperty.options || [])
    }
  }, [])

  const [currentPropType, setCurrentPropType] = useState<BitTypePropertyDefinitionType>('text')
  const [currentPropName, setCurrentPropName] = useState<string>('')
  const [currentPropDV, setCurrentPropDV] = useState<BitTypePropertyDefinitionDVType>()
  const [currentPropRequired, setCurrentPropRequired] = useState<boolean>(false)
  const [currentPropOptions, setCurrentPropOptions] = useState<string[] | [number, number, number]>([])
  const currentPropNameRef = useRef<HTMLInputElement>(null)
  const isOnline = useNetworkStatus()
  const { bits } = useBitsStore()
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

  const { settings } = useSettingsStore()
  //CURR
  const currencyOptions = [
    {
      options: Object.entries(isoCurrencies).map(([code, data]) => ({
        value: code,
        label: data.name,
        icon: <div className="w-8 text-text-muted">{data.symbol}</div>
      }))
    }
  ]
  //LOC
  const [locationName, setLocationName] = useState<string | null>(null)
  useEffect(() => {
    if (
      currentPropDV &&
      currentPropType === 'location' &&
      Array.isArray(currentPropDV) &&
      currentPropDV.length === 2 &&
      typeof currentPropDV[0] === 'number' &&
      typeof currentPropDV[1] === 'number'
    ) {
      const [lat, lng] = currentPropDV

      const fetchName = async () => {
        const name = await getLocationName(lat, lng)
        setLocationName(name)
      }
      fetchName()
    }
  }, [currentPropDV])
  const getLocationName = async (lat: number, long: number) => {
    return await reverseGeocode(lat, long)
  }

  const getTextValue = (bit: Bit) => {
    if (!bit) return undefined
    // If it includes a text property render that otherwise render untitled
    const textProperty = bit.type.properties.find((property) => property.type === 'text')
    if (!textProperty) return 'Untitled'
    const bitData = bit.data.find((data) => data.propertyId === textProperty.id)
    if (!bitData) return 'Untitled'
    return bitData.value as string
  }
  const bitOptions = [
    {
      options: bits.map((bit: Bit) => ({
        value: bit.id,
        label: getTextValue(bit),
        icon: (
          <div>
            {(() => {
              const Icon = getIconComponent(bit.type.iconName)
              return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
            })()}
          </div>
        )
      }))
    }
  ]

  //IMAGE
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0]
    if (image && image.type.startsWith('image/')) {
      window.ipcRenderer.send('useImage', image.path)
    }
    window.ipcRenderer.on('imageSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
    setImageSelectorHovered(false)
  }
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageSelectorHovered, setImageSelectorHovered] = useState<boolean>(false)

  //FILE
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    window.ipcRenderer.send('useFile', file.path)
    window.ipcRenderer.on('fileSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileSelectorHovered, setFileSelectorHovered] = useState<boolean>(false)

  // SELECT
  const selectOptions =
    Array.isArray(currentPropOptions) && currentPropOptions.every((item) => typeof item === 'string')
      ? [
          {
            options: currentPropOptions.map((opt) => ({
              value: opt,
              label: opt
            }))
          }
        ]
      : []
  // PLANG
  const programmingLanguageOptions = [
    {
      options: programmingLanguages.map((opt) => ({
        value: opt,
        label: opt
      }))
    }
  ]
  const countryOptions = [
    {
      options: countries.map((opt) => ({
        value: opt.name,
        label: opt.name,
        icon: <span className={`fi fi-${opt.code.toLowerCase()}`}></span>
      }))
    }
  ]
  const languageOptions = [
    {
      options: languages.map((opt) => ({
        value: opt.name,
        label: opt.name
      }))
    }
  ]
  const timezoneOptions = [
    {
      options: timezones.map((opt) => ({
        value: opt.value,
        label: opt.text + ', ' + opt.value
      }))
    }
  ]
  const measurementOptions = [
    {
      header: 'Mass',
      options: measurementMass.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Length',
      options: measurementLength.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Volume',
      options: measurementVolume.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Temperature',
      options: measurementTemperature.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Energy',
      options: measurementEnergy.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Speed',
      options: measurementSpeed.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Frequency',
      options: measurementFrequency.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    },
    {
      header: 'Area',
      options: measurementArea.map((opt) => ({
        value: opt.abbr,
        label: opt.name + ` (${opt.abbr})`
      })),
      divider: true
    }
  ]

  //AUDIO
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    window.ipcRenderer.send('useFile', file.path)
    window.ipcRenderer.on('fileSet', (_event, customPath) => {
      setCurrentPropDV(customPath)
    })
  }
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const [audioFileSelectorHovered, setAudioFileSelectorHovered] = useState<boolean>(false)

  const renderDefaultValue = (propType: BitTypePropertyDefinitionType) => {
    switch (propType) {
      case 'bit':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              searchable
              placeholder="Select a bit"
              selectedValues={currentPropDV as string}
              options={bitOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'text':
      case 'document':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="Enter default value" />
          </div>
        )
      case 'number':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput className="justify-between" placeholderValue={1} value={currentPropDV as number} onChange={(e) => setCurrentPropDV(e)} />
          </div>
        )
      case 'select':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              searchable
              placeholder="Select default option"
              options={selectOptions}
              selectedValues={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'multiselect':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              multiSelect
              searchable
              placeholder="Select default option"
              options={selectOptions}
              selectedValues={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'date':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div>
              <DateInput
                ghost
                className=""
                placeholder="Set date"
                setCurrentDisplayDate={(e) => setCurrentPropDV(e.toISOString())}
                horizontalAlign="left"
              />
            </div>
          </div>
        )
      case 'file':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div
              onMouseEnter={() => setFileSelectorHovered(true)}
              onMouseLeave={() => setFileSelectorHovered(false)}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <div className="p-2 w-full h-full flex flex-col items-center justify-center ">
                  <p>File selected</p>
                  <p className="w-full truncate text-sm">{currentPropDV as string}</p>
                </div>
              ) : (
                <File size={32} strokeWidth={1} />
              )}
              {fileSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <FilePlus size={32} strokeWidth={1} />

                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'checkbox':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div className="flex items-center gap-2 ">
              <Checkbox checked={currentPropDV as boolean} onChange={(e) => setCurrentPropDV(e)} />{' '}
              <p className="text-sm">{currentPropDV == true ? 'Checked' : 'Unchecked'}</p>
            </div>
          </div>
        )
      case 'url':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="https://www.example.com" />
          </div>
        )
      case 'email':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="example@mail.com" />
          </div>
        )
      case 'phone':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="5555-55-55" />
          </div>
        )
      case 'image':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>

            <div
              onMouseEnter={() => setImageSelectorHovered(true)}
              onMouseLeave={() => setImageSelectorHovered(false)}
              onClick={() => imageInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <img className="w-full h-full rounded-lg p-1 object-cover" src={currentPropDV as string} />
              ) : (
                <Image size={32} strokeWidth={1} />
              )}

              {imageSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <ImagePlus size={32} strokeWidth={1} />

                      <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'currency':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a currency"
              searchable
              selectedValues={currentPropDV as string}
              options={currencyOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input placeholder="Enter custom currency..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'location':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            {isOnline ? (
              <div className="z-10 w-full h-64 flex items-center justify-center rounded-xl ">
                <MapContainer
                  zoomControl={false}
                  worldCopyJump={false}
                  maxBoundsViscosity={1.0}
                  maxBounds={[
                    [-90, -180],
                    [90, 180]
                  ]}
                  center={[47.60885308607487, 97.55267161699676]}
                  zoom={5}
                  style={{
                    border: '1px solid rgb(83 83 83)',
                    borderRadius: '8px',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <TileLayer
                    url={`${
                      settings.theme.mode === 'light'
                        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    }`}
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    subdomains={'abcd'}
                  />
                  <LocationClickHandler onClick={setCurrentPropDV} />

                  {currentPropDV && (
                    <Marker position={currentPropDV as [number, number]}>
                      <Popup>
                        <div>
                          <strong>Selected location</strong>
                          <br />
                          {locationName || 'Loading location name...'}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            ) : (
              <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="Enter location" />
            )}
          </div>
        )
      case 'percentage':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput className="justify-between" placeholderValue={100} value={currentPropDV as number} onChange={(e) => setCurrentPropDV(e)} />
          </div>
        )
      case 'barcode':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Input value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} placeholder="Enter barcode number" />
          </div>
        )
      case 'planguage':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a programming language"
              searchable
              selectedValues={currentPropDV as string}
              options={programmingLanguageOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input
              placeholder="Enter custom programming language..."
              value={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e.target.value)}
            />
          </div>
        )
      case 'country':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a country"
              searchable
              selectedValues={currentPropDV as string}
              options={countryOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom country..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'language':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a language"
              searchable
              selectedValues={currentPropDV as string}
              options={languageOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input placeholder="Enter custom language..." value={currentPropDV as string} onChange={(e) => setCurrentPropDV(e.target.value)} />
          </div>
        )
      case 'audio':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div
              onMouseEnter={() => setAudioFileSelectorHovered(true)}
              onMouseLeave={() => setAudioFileSelectorHovered(false)}
              onClick={() => audioFileInputRef.current?.click()}
              className="relative w-full min-h-32 max-h-96 cursor-pointer text-text-muted bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-dashed border-input-border dark:border-input-border-dark rounded-md flex items-center justify-center"
            >
              {currentPropDV != '' ? (
                <div className="p-2 w-full h-full flex flex-col items-center justify-center ">
                  <p>File selected</p>
                  <p className="w-full truncate text-sm">{currentPropDV as string}</p>
                </div>
              ) : (
                <FileAudio size={32} strokeWidth={1} />
              )}
              {audioFileSelectorHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md  ${
                    currentPropDV == ''
                      ? 'bg-button-bg dark:bg-button-bg-dark opacity-100 text-text-muted'
                      : 'bg-button-bg dark:bg-button-bg-dark opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  {currentPropDV == '' ? (
                    <div className="w-full h-full text-center flex flex-col gap-1 items-center justify-center">
                      <Plus size={32} strokeWidth={1} />

                      <input type="file" accept="audio/*" ref={audioFileInputRef} className="hidden" onChange={handleAudioFileChange} />
                    </div>
                  ) : (
                    <div onClick={() => setCurrentPropDV('')} className="text-red-500 w-full h-full flex items-center justify-center">
                      <Trash size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case 'color':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={currentPropDV as string}
                onChange={(e) => setCurrentPropDV(e.target.value)}
                placeholder="Enter color code"
              />
              <div
                className="w-7 h-7 border rounded-md border-input-border dark:border-input-border-dark"
                style={{ backgroundColor: `${currentPropDV}` }}
              ></div>
            </div>
            <p className="text-sm text-text-muted">HEX, RGBA, HTML color names are accepted</p>
          </div>
        )
      case 'rating':
      case 'range':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <NumberInput
              className="justify-between"
              min={(currentPropOptions[0] as number) || 0}
              max={(currentPropOptions[1] as number) || 5}
              step={(currentPropOptions[2] as number) || 1}
              placeholderValue={0}
              value={(currentPropDV as number) || 0}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'timezone':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a time-zone"
              searchable
              selectedValues={currentPropDV as string}
              options={timezoneOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
          </div>
        )
      case 'measurement':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <Combobox
              placeholder="Select a measurement unit"
              searchable
              selectedValues={currentPropDV as string}
              options={measurementOptions}
              onChange={(e) => setCurrentPropDV(e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>
            <Input
              placeholder="Enter custom measurement unit..."
              value={currentPropDV as string}
              onChange={(e) => setCurrentPropDV(e.target.value)}
            />
          </div>
        )
      case 'time':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <div>
              <TimeInput
                twelveHours={false}
                includeSeconds={false}
                ghost
                className=""
                placeholder="Set time"
                setCurrentDisplayTime={(e) => setCurrentPropDV(e.toISOString())}
                horizontalAlign="left"
              />
            </div>
          </div>
        )
      case 'datetime':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-semibold">Default Value</p>
            <DateTimeComponent handlePropDV={setCurrentPropDV} />
          </div>
        )
    }
  }

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
        required: currentPropRequired,
        defaultValue: currentPropDV,
        options: currentPropOptions
      }
      handleUpdateProperty(newProperty)
    } else if (mode === 'add' && handleAddProperty) {
      handleAddProperty(currentPropName, currentPropType, currentPropRequired, currentPropDV, currentPropOptions)
    }

    setCurrentPropName('')
    setCurrentPropType('text')
    setCurrentPropRequired(false)
    setCurrentPropOptions([])
    setCurrentPropDV('')
    setPropOptionName('')
    setView('mainView')
  }
  const [isUnsavedChangesPanelOpen, setIsUnsavedChangesPanelOpen] = useState<boolean>(false)
  const handleBack = () => {
    if (currentPropName == '' && currentPropDV == undefined) {
      setView('mainView')
      setCurrentPropName('')
      setCurrentPropType('text')
      setCurrentPropRequired(false)
      setCurrentPropOptions([])
      setCurrentPropDV('')
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
                    setCurrentPropRequired(false)
                    setCurrentPropOptions([])
                    setCurrentPropDV('')
                    setPropOptionName('')
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
            searchable
            selectedValues={currentPropType}
            options={propertyOptions}
            onChange={(e) => {
              setCurrentPropDV('')
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
          <div className="flex">
            <SegmentedControl
              selectedOptionValue={currentPropRequired == true ? 'required' : 'notrequired'}
              segments={[
                { value: 'notrequired', label: 'Not Required' },
                { value: 'required', label: 'Required' }
              ]}
              onChange={(e) => setCurrentPropRequired(e == 'required' ? true : false)}
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
                <NumberInput className="justify-between" value={(currentPropOptions[1] as number) || 5} onChange={(v) => updateTupleValue(1, v)} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-text-muted">Increment</p>
                <NumberInput className="justify-between" value={(currentPropOptions[2] as number) || 1} onChange={(v) => updateTupleValue(2, v)} />
              </div>
            </div>
          </div>
        )}
        {renderDefaultValue(currentPropType)}
      </div>
    </div>
  )
}

export default PropertyPage
