import Button from '../../components/Button'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBitTypesStore } from '../../stores/bitTypesStore'
import { BitData, BitDataValue, BitTypeDefinition, BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../../types/Bit'
import NumberInput from '../../components/NumberInput'
import { useBitsStore } from '../../stores/bitsStore'
import Combobox from '../../components/Combobox'
import { getIconComponent } from '../../utils/getIcon'
import SegmentedControl from '../../components/SegmentedControl'
import Input from '../../components/Input'
import { countryOptions } from '../../utils/getCountries'
import { currencyOptions } from '../../utils/getCurrency'
import { languageOptions } from '../../utils/getLanguages'
import { measurementOptions } from '../../utils/getMeasurements'
import { programmingLanguageOptions } from '../../utils/getProgrammingLanguages'
import { timezoneOptions } from '../../utils/getTimeZones'
import DateInput from '../../components/DateInput'

interface StepProps {
  prev: () => void
  next: () => void
  isFirst: boolean
  isLast: boolean
  prop: BitTypePropertyDefinition
  updateForm: (propId: string, value: BitDataValue) => void
  value: BitDataValue
}

const Step: React.FC<StepProps> = ({ prev, next, updateForm, isFirst, isLast, prop, value }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const input = textAreaRef.current
    if (input) {
      input.focus()
      const len = input.value?.toString().length || 0
      input.setSelectionRange(len, len)
    }
  }, [])

  const handlePrev = () => {
    if (!isFirst) {
      prev()
    }
  }

  const handleNext = () => {
    if (!isLast) {
      next()
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        handleNext()
      }
      if (event.shiftKey && event.code === 'Tab') {
        event.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFirst, isLast])

  const getInputDiv = (type: BitTypePropertyDefinitionType) => {
    switch (type) {
      case 'text':
        return (
          <textarea
            ref={textAreaRef}
            value={value || ''}
            onChange={(e) => updateForm(prop.id, e.target.value)}
            spellCheck={false}
            placeholder="Enter here..."
            className="placeholder:text-text-muted/75 w-full w-full h-full p-1 text-4xl resize-none focus:outline-none "
          />
        )
      case 'number':
        return <NumberInput size="4xl" placeholderValue={0} ghost autoFocus value={Number(value)} onChange={(val) => updateForm(prop.id, val)} />
      case 'checkbox':
        return (
          <SegmentedControl
            selectedOptionValue={(value as boolean) ? 'checked' : 'unchecked'}
            segments={[
              { value: 'checked', label: 'True' },
              { value: 'unchecked', label: 'False' }
            ]}
            onChange={(e) => updateForm(prop.id, e === 'checked' ? true : false)}
          />
        )
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              className=""
              value={value as string}
              onChange={(e) => updateForm(prop.id, e.target.value)}
              placeholder="Enter color code"
            />{' '}
            <div
              className="w-7 h-7 border rounded-md border-input-border dark:border-input-border-dark"
              style={{ backgroundColor: `${value}` }}
            ></div>
          </div>
        )

      case 'country':
        return (
          <div className="flex items-center gap-2">
            <Combobox
              className="w-48"
              maxH={32}
              placeholder="Select a country"
              searchable
              selectedValues={value as string}
              options={countryOptions}
              onChange={(e) => updateForm(prop.id, e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
          </div>
        )
      case 'currency':
        return (
          <div className="flex items-center gap-2">
            <Combobox
              className="w-48"
              maxH={32}
              placeholder="Select a currency"
              searchable
              selectedValues={value as string}
              options={currencyOptions}
              onChange={(e) => updateForm(prop.id, e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
          </div>
        )
      case 'language':
        return (
          <div className="flex items-center gap-2">
            <Combobox
              className="w-48"
              maxH={32}
              placeholder="Select a language"
              searchable
              selectedValues={value as string}
              options={languageOptions}
              onChange={(e) => updateForm(prop.id, e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
          </div>
        )
      case 'measurement':
        return (
          <div className="flex items-center gap-2">
            <Combobox
              className="w-48"
              maxH={32}
              placeholder="Select a measurement"
              searchable
              selectedValues={value as string}
              options={measurementOptions}
              onChange={(e) => updateForm(prop.id, e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
          </div>
        )
      case 'planguage':
        return (
          <div className="flex items-center gap-2">
            <Combobox
              className="min-w-48"
              maxH={32}
              placeholder="Select a programming language"
              searchable
              selectedValues={value as string}
              options={programmingLanguageOptions}
              onChange={(e) => updateForm(prop.id, e)}
            />
            <p className="text-sm text-center text-text-muted">or</p>

            <Input placeholder="Enter custom..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
          </div>
        )
      case 'phone':
        return <Input autoFocus placeholder="Enter phone number..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />

      case 'url':
        return <Input autoFocus placeholder="Enter URL..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
      case 'email':
        return <Input autoFocus placeholder="Enter e-mail..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
      case 'timezone':
        return (
          <Combobox
            maxH={32}
            className="max-w-96"
            placeholder="Select a time-zone"
            searchable
            selectedValues={value as string}
            options={timezoneOptions}
            onChange={(e) => updateForm(prop.id, e)}
          />
        )
      case 'document':
        return (
          <textarea
            ref={textAreaRef}
            value={value || ''}
            onChange={(e) => updateForm(prop.id, e.target.value)}
            spellCheck={false}
            placeholder="Enter here..."
            className="placeholder:text-text-muted/75 w-full w-full h-full p-1 text-xl resize-none focus:outline-none "
          />
        )
      case 'barcode':
        return <Input autoFocus placeholder="Enter barcode..." value={value as string} onChange={(e) => updateForm(prop.id, e.target.value)} />
      case 'date':
        return (
          <DateInput
            ghost
            className=""
            placeholder="Set date"
            setCurrentDisplayDate={(e) => updateForm(prop.id, e.toISOString())}
            horizontalAlign="right"
          />
        )
      default:
        return <div>No data</div>
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-1 flex items-center justify-center">{getInputDiv(prop.type)}</div>
      <div className="w-full mt-auto">
        <div className="flex items-center gap-2 justify-between w-full">
          {!isFirst && (
            <Button variant={'ghost'} onClick={handlePrev}>
              <ChevronLeft size={16} strokeWidth={1.5} />
              Previous
            </Button>
          )}
          {!isLast && (
            <Button className="ml-auto" variant={'ghost'} onClick={handleNext}>
              Next
              <ChevronRight size={16} strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface DataValues {
  propId: string
  value: BitDataValue
}

const FastCreate = () => {
  const { addBit } = useBitsStore()
  const { bitTypeId } = useParams<{ bitTypeId: string }>()
  const navigate = useNavigate()

  const { bitTypes, getBitTypeById } = useBitTypesStore()

  const [selectedBitTypeId, setSelectedBitTypeId] = useState<string>(bitTypeId || '')
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<DataValues[]>([])

  const currentBitType = getBitTypeById(selectedBitTypeId)

  useEffect(() => {
    if (selectedBitTypeId !== bitTypeId) {
      setStep(0)
      setFormData([])
    }
  }, [selectedBitTypeId, bitTypeId])

  useEffect(() => {
    if (bitTypeId && selectedBitTypeId !== bitTypeId) {
      setSelectedBitTypeId(bitTypeId)
    }
  }, [bitTypeId])

  const bitTypeOptions = [
    {
      options: bitTypes.map((bitType: BitTypeDefinition) => ({
        value: bitType.id,
        label: bitType.name,
        icon: (
          <div>
            {(() => {
              const Icon = getIconComponent(bitType.iconName)
              return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
            })()}
          </div>
        )
      }))
    }
  ]

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => s - 1)

  const updateForm = useCallback((propId: string, value: BitDataValue) => {
    setFormData((prev) => {
      const index = prev.findIndex((item) => item.propId === propId)

      if (index !== -1) {
        const updated = [...prev]
        updated[index] = { ...updated[index], value }
        return updated
      } else {
        return [...prev, { propId, value }]
      }
    })
  }, [])

  const getCurrentValue = (propId: string): BitDataValue => {
    const item = formData.find((item) => item.propId === propId)
    return item?.value || ''
  }

  const handleBitTypeChange = (values: string | string[]) => {
    const newBitTypeId = Array.isArray(values) ? values[0] : values
    if (newBitTypeId && newBitTypeId !== selectedBitTypeId) {
      // setSelectedBitTypeId(newBitTypeId)
      navigate(`/fastcreate/${newBitTypeId}`, { replace: true })
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Enter') {
        event.preventDefault()
        handleCreate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [formData, currentBitType])

  if (!currentBitType) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className=" flex items-center p-2 gap-2">
          <div className="flex-1 h-full flex items-center gap-2 drag-bar">
            <p className=" font-semibold text-lg ml-1">Create Bit</p>
          </div>
          <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'}>
            <X size={16} strokeWidth={1.5} />
          </Button>
        </div>
        <div className="p-2 w-full h-full flex flex-col gap-2 items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <p className="font-semibold">No bit type selected</p>
            <p className="text-sm text-text-muted">Please select a bit type to continue</p>
          </div>
          <div className="w-full max-w-xs">
            <Combobox
              maxH={24}
              searchable
              placeholder="Select a bit type"
              className="w-full"
              selectedValues={selectedBitTypeId}
              onChange={(values) => {
                const newBitTypeId = Array.isArray(values) ? values[0] : values
                if (newBitTypeId) {
                  navigate(`/fastcreate/${newBitTypeId}`, { replace: true })
                }
              }}
              options={bitTypeOptions}
            />
          </div>
        </div>
      </div>
    )
  }

  const currentProperty = currentBitType.properties[step]

  const handleCreate = () => {
    const currentBitId = crypto.randomUUID()
    const currentBitData = formData.map((data) => {
      return {
        bitId: currentBitId,
        propertyId: data.propId,
        value: data.value
      } as BitData
    })
    addBit(currentBitType, currentBitData)
    window.ipcRenderer.send('closeWindow')
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className=" flex items-center p-2 gap-2">
        <div className="flex-1 h-full flex items-center gap-2 drag-bar">
          <p className=" font-semibold text-lg ml-1">
            {currentBitType.name} - {currentProperty?.name}
          </p>
        </div>

        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="px-2">
        <p className="text-sm text-text-muted">
          Property {step + 1} of {currentBitType.properties.length}
        </p>
      </div>
      <div className="p-2 h-full">
        {currentBitType.properties.map((prop, i) =>
          step === i ? (
            <Step
              key={`${selectedBitTypeId}-${prop.id}-${i}`}
              prev={prev}
              next={next}
              updateForm={updateForm}
              isFirst={i === 0}
              isLast={i === currentBitType.properties.length - 1}
              prop={prop}
              value={getCurrentValue(prop.id)}
            />
          ) : null
        )}
      </div>
      <div className="p-2 flex items-center border-t border-border dark:border-border-dark">
        <Combobox
          maxH={32}
          searchable
          placeholder="Select a bit type"
          className="w-48"
          dropDirection="up"
          selectedValues={selectedBitTypeId}
          onChange={handleBitTypeChange}
          options={bitTypeOptions}
        />
        <Button className="ml-auto" variant={'default'} onClick={handleCreate}>
          <Plus size={16} strokeWidth={1.5} />
          Create
        </Button>
      </div>
    </div>
  )
}

export default FastCreate
