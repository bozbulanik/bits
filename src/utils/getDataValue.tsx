import { format } from 'date-fns'
import { truncateText } from '.'
import { BitTypePropertyDefinitionType } from '../types/Bit'

export const renderTextualDataValue = (type: BitTypePropertyDefinitionType, value: any, charThreshold: number) => {
  switch (type) {
    case 'bit':
      return truncateText(value, charThreshold)
    case 'text':
      return truncateText(value, charThreshold)
    case 'checkbox':
      return value ? 'Checked' : 'Unchecked'
    case 'currency':
      return value
    case 'date':
      return value != '' && format(value, 'MMM dd, yyyy')
    case 'document':
      return truncateText(value, charThreshold)
    case 'email':
      return truncateText(value, charThreshold)
    case 'file':
      return truncateText(value, charThreshold)
    case 'image':
      return truncateText(value, charThreshold)
    case 'location':
      return value != '' && 'Lat' + value[0].toFixed(2) + 'Lng' + value[1].toFixed(2)
    case 'number':
      return truncateText(value, charThreshold)
    case 'phone':
      return truncateText(value, charThreshold)
    case 'select':
      return truncateText(value, charThreshold)
    case 'multiselect':
      return truncateText(value.length + ' default options', charThreshold)
    case 'url':
      return truncateText(value, charThreshold)
    case 'audio':
      return truncateText(value, charThreshold)
    case 'percentage':
      return truncateText('%' + value, charThreshold)
    case 'color':
      return <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: `${value}` }}></span>
    case 'country':
      return truncateText(value, charThreshold)
    case 'language':
      return truncateText(value, charThreshold)
    case 'planguage':
      return truncateText(value, charThreshold)
    case 'timezone':
      return truncateText(value, charThreshold)
    case 'barcode':
      return truncateText(value, charThreshold)
    case 'time':
      return value != '' && format(value, 'HH:mm')
    case 'datetime':
      return value != '' && format(value, 'MMM dd, yyyy HH:mm')
    case 'measurement':
      return truncateText(value, charThreshold)
    case 'range':
      return truncateText(value, charThreshold)
    case 'rating':
      return truncateText(value, charThreshold)
  }
}
