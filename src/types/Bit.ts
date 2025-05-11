export interface Bit {
  id: string // Unique ID for the bit
  createdAt: string // Creation date ISO string
  updatedAt: string // Update date ISO string
  pinned: number // Is pinned on search window? 0/1
  type: BitTypeDefinition // Bit type
  data: BitData[] // Bit data
}

export interface BitData {
  propertyId: string // ID of the linked property
  value: any // Value of the data
}

export interface BitTypeDefinition {
  id: string // Unique ID for the bit type
  origin: string // Use or builtin
  name: string // Name of the bit type
  iconName: string // Icon name of the bit type / parsed to get lucide-react icons with name
  properties: BitTypePropertyDefinition[] // Property list of the type / Helps to create different types of bit type.
}

export interface BitTypePropertyDefinition {
  id: string // Unique ID for the property
  sortId: number // Local ID relative to Bit Type
  name: string // Name of the bit type property
  type: BitTypePropertyDefinitionType // Type of the bit type property
  required?: boolean // Is it required?
  defaultValue?: string // Default value for the bit type property
}

export type BitTypePropertyDefinitionType = //Data type

    | 'text' // Regular string data
    | 'number' // Numeric data
    | 'select' // Array of data from which only one can be selected
    | 'multiselect' // Array of data from which any one can be selected
    | 'date' // ISO formatted date data
    | 'file' // File source location data
    | 'checkbox' // Boolean type data / true or false
    | 'url' // Website url data
    | 'email' // E-mail formatted data
    | 'phone' // Phone number data
    | 'image' // Image source location data
