import React from 'react'
import { BitTypePropertyDefinition, BitTypePropertyDefinitionType } from '../types/Bit'
import Checkbox from './Checkbox'
import Input from './Input'
import Combobox from './Combobox'
import { getPropertyIcon } from '../utils/getIcon'
interface PropertyEditorProps {
  property: BitTypePropertyDefinition
  bitTypeWarningMessage: string
  onChange: (property: BitTypePropertyDefinition) => void
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({
  property,
  bitTypeWarningMessage,
  onChange
}) => {
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
            value={property.defaultValue || ''}
            onChange={(e) => handleChange('defaultValue', e.target.value)}
            placeholder="Default value"
            className="w-full"
          />
        )
      case 'date':
        return (
          <Input
            variant={'ghost'}
            value={property.defaultValue || ''}
            onChange={(e) => handleChange('defaultValue', e.target.value)}
            placeholder="YYYY-MM-DD"
            className="w-full"
          />
        )

      default:
        return (
          <Input
            variant={'ghost'}
            id={`prop-default-${property.id}`}
            value={property.defaultValue || ''}
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
  return (
    <div className="w-full flex gap-2 items-center">
      <Combobox
        ghost
        className="w-64"
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
      <Checkbox
        label="Required"
        checked={!!property.required}
        onChange={(checked) => handleChange('required', checked === true)}
      />
    </div>
  )
}

export default PropertyEditor
