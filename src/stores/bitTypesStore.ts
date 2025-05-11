import { create } from 'zustand'
import { BitTypeDefinition, BitTypePropertyDefinition } from '../types/Bit'
import { useBitsStore } from './bitsStore'

interface BitTypesStore {
  isLoading: boolean
  loadError: Error | null
  bitTypes: BitTypeDefinition[]
  loadBitTypes: () => Promise<void>
  addBitType: (name: string, iconName: string, properties: BitTypePropertyDefinition[]) => Promise<void>
  updateBitType: (id: string, name: string, iconName: string, properties: BitTypePropertyDefinition[]) => Promise<void>
  deleteBitType: (id: string) => Promise<void>
}

export const useBitTypesStore = create<BitTypesStore>((set) => ({
  bitTypes: [],
  isLoading: false,
  loadError: null,
  loadBitTypes: async () => {
    set({ isLoading: true, loadError: null })
    try {
      const bitTypeRows = await window.ipcRenderer.invoke('getBitTypes')
      const parsedBitTypeRows = await Promise.all(
        bitTypeRows.map(async (bitType: any) => {
          const bit_type_properties = await window.ipcRenderer.invoke('getBitTypePropertiesById', bitType.id)
          if (!bit_type_properties || bit_type_properties.length === 0) {
            console.warn(`Unknown property data for bit type id ${bitType.id}`)
            return null
          }

          const properties = bit_type_properties.map(
            (data: any) =>
              ({
                id: data.id,
                sortId: data.sort_id,
                name: data.name,
                type: data.type,
                required: data.required,
                defaultValue: data.default_value
              } as BitTypePropertyDefinition)
          )
          return {
            id: bitType.id,
            origin: bitType.origin,
            name: bitType.name,
            iconName: bitType.icon_name,
            occurrenceType: bitType.occurrence_type,
            properties
          } as BitTypeDefinition
        })
      )
      set({ bitTypes: [...parsedBitTypeRows], isLoading: false })
    } catch (err) {
      console.log('Failed to fetch bit types', err)
      set({ loadError: err as Error, isLoading: false })
    }
  },
  addBitType: async (name, iconName, properties) => {
    const newBitType: BitTypeDefinition = {
      id: crypto.randomUUID(),
      origin: 'user',
      name,
      iconName,
      properties
    }
    set((state) => ({ bitTypes: [...state.bitTypes, newBitType] }))
    await window.ipcRenderer.invoke(
      'addBitType',
      newBitType.id,
      newBitType.name,
      newBitType.iconName,
      newBitType.properties
    )
  },
  updateBitType: async (id, name, iconName, properties) => {
    set((state) => ({
      bitTypes: state.bitTypes.map((type) => (type.id === id ? { ...type, name, iconName, properties } : type))
    }))
    await window.ipcRenderer.invoke('updateBitType', id, name, iconName, properties)
  },
  deleteBitType: async (id) => {
    set((state) => ({
      bitTypes: state.bitTypes.filter((type) => type.id !== id)
    }))
    // Delete the bits as well.
    const currentBits = useBitsStore.getState().bits
    const deleteBit = useBitsStore.getState().deleteBit
    const bits = currentBits.filter((t) => t.type.id === id)
    bits.map((bit) => {
      deleteBit(bit.id)
    })
    await window.ipcRenderer.invoke('deleteBitType', id)
  }
}))
