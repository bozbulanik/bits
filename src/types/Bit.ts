export interface Bit {
  id: string // Unique ID for the bit
  createdAt: string // Creation date ISO string
  updatedAt: string // Update date ISO string
  pinned: number // Is pinned on search window? 0/1
  type: BitTypeDefinition // Bit type
  data: BitData[] // Bit data
  notes: Note[] // Notes for the bit
}

export interface BitData {
  bitId: string // Bit id
  propertyId: string // ID of the linked property
  value: BitTypePropertyDefinitionDVType // Value of the data
}

export interface Note {
  id: string // Unique ID for the note
  bitId: string // Bit id
  createdAt: string // ISO string
  updatedAt: string // ISO string (optional if needed)
  content: string // Markdown content
}

export interface Collection {
  id: string // Unique ID for the collection
  name: string // Name of the collection
  iconName: string // Icon name of the collection / parsed to get lucide-react icons with name
  createdAt: string // Creation date ISO string
  updatedAt: string // Update date ISO string
  items: CollectionItem[] // Items of the collection
}

export interface CollectionItem {
  id: string // Unique ID for the collection item
  bitId: string // Referenced bit id
  orderIndex: number // Local index for the collection
}

export interface BitTypeDefinition {
  id: string // Unique ID for the bit type
  origin: string // Use or builtin
  name: string // Name of the bit type
  description: string // Description for the bit type
  iconName: string // Icon name of the bit type / parsed to get lucide-react icons with name
  properties: BitTypePropertyDefinition[] // Property list of the type / Helps to create different types of bit type.
}

export interface BitTypePropertyDefinition {
  id: string // Unique ID for the property
  name: string // Name of the bit type property
  type: BitTypePropertyDefinitionType // Type of the bit type property
  required: boolean // Is it required?
  defaultValue?: BitTypePropertyDefinitionDVType // Default value for the bit type property
  options?: string[] | [number, number, number] // Multi select or select options
  order: number
}

export type BitTypePropertyDefinitionType = //Data type
  // MULTI SELECT / SELECT SHOULD ALSO BE USABLE FOR ALL OTHER TYPES
  | 'bit' // Bit id
  | 'text' // Regular string data
  | 'document' // String
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
  | 'currency' // Currency ISO
  | 'location' // Location ISO
  | 'color' // hex, rgb
  | 'measurement' // Measurement unit
  | 'rating' // Star ratings or numeric scores (1-5, 1-10)
  | 'percentage' // Percentage values (0-100%)
  | 'range' // Min/max numeric ranges
  | 'time' // Time of day (HH:MM:SS format)
  | 'datetime' // Combined date and time with timezone
  | 'language' // ISO 639
  | 'country' // ISO 3166
  | 'timezone' // Timezone identifiers
  | 'barcode' //UPC/EAN/QR codes
  | 'audio' // Audio file source location
  | 'planguage' // Programming language

/*
                     IN DATABASE             IN APP
  bit                 string                  Bit
  text                string                  string
  document            string                  string
  number              number                  number
  select              JSON                    string array
  multiselect         JSON                    string array
  date                string                  Date
  file                string                  string // Maybe a File structure later
  checkbox            number                  boolean
  url                 string                  string
  email               string                  string
  phone               string                  string
  image               string                  string
  currency            string                  string 
  location            string                  string
  color               string                  string
  measurement         string                  string
  rating              JSON                    number array with stars
  percentage          number                  number // With % symbol
  range               JSON                    number array
  time                string                  Date
  datetime            string                  Date
  language            string                  string // Maybe an emoji?
  country             string                  string // Maybe an emoji?
  timezone            string                  string 
  barcode             string                  img or string
  audio               string                  string
  planguage           string                  string
    
*/

export type BitTypePropertyDefinitionDVType = any | any[] | [number, number]
