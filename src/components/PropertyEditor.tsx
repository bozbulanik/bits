import React from 'react'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../types/Bit'
import Checkbox from './Checkbox'
import Input from './Input'
import Combobox from './Combobox'
import { getPropertyIcon } from '../utils/getIcon'
import CalendarInput from './DateInput'
interface PropertyEditorProps {
  property: BitTypePropertyDefinition
  bitTypeWarningMessage: string
  onChange: (property: BitTypePropertyDefinition) => void
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ property, bitTypeWarningMessage, onChange }) => {
  const handleChange = (field: keyof BitTypePropertyDefinition, value: any) => {
    onChange({
      ...property,
      [field]: value
    })
  }

  const renderDefaultValueInput = () => {
    switch (property.type) {
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              label="Default checked"
              checked={property.defaultValue === 'true'}
              onChange={(checked) => handleChange('defaultValue', checked ? 'true' : 'false')}
            />
          </div>
        )
      case 'number':
        return (
          <Input
            variant={'ghost'}
            value={(property.defaultValue as string) || ''}
            onChange={(e) => handleChange('defaultValue', e.target.value)}
            placeholder="Default value"
            className="w-full"
          />
        )
      case 'date':
        return (
          <CalendarInput
            ghost
            className="w-full"
            placeholder="Set date"
            setCurrentDisplayDate={(e) => handleChange('defaultValue', e)}
            horizontalAlign="right"
          />
        )

      default:
        return (
          <Input
            variant={'ghost'}
            id={`prop-default-${property.id}`}
            value={(property.defaultValue as string) || ''}
            onChange={(e) => handleChange('defaultValue', e.target.value)}
            placeholder="Default value"
            className="w-full"
          />
        )
    }
  }
  const propertyOptions = [
    {
      options: [
        { value: 'bit', label: 'Another bit' },
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'select', label: 'Select' },
        { value: 'multiselect', label: 'Multi-select' },
        { value: 'date', label: 'Date' },
        { value: 'file', label: 'File' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'url', label: 'URL' },
        { value: 'email', label: 'E-mail' },
        { value: 'phone', label: 'Phone number' },
        { value: 'image', label: 'Image' }
      ]
    }
  ]
  return (
    <div className="w-full grid grid-cols-4 gap-2 items-center">
      <Combobox
        ghost
        selectedValues={property.type}
        options={propertyOptions}
        onChange={(e) => handleChange('type', e as BitTypePropertyDefinitionType)}
      />
      <Input
        variant={property.name == '' && bitTypeWarningMessage ? 'ghostError' : 'ghost'}
        id={`prop-name-${property.id}`}
        value={property.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Property name"
      />
      <div>{renderDefaultValueInput()}</div>
      <Checkbox label="Required" checked={!!property.required} onChange={(checked) => handleChange('required', checked === true)} />
    </div>
  )
}

export default PropertyEditor
