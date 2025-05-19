import { create } from 'zustand'
import { BitTypeAnalytics, BitTypeDefinition, BitTypePropertyDefinition } from '../types/Bit'

interface BitTypesStore {
  isLoading: boolean
  loadError: Error | null
  bitTypes: BitTypeDefinition[]
  loadBitTypes: () => Promise<void>
  addBitType: (
    name: string,
    iconName: string,
    properties: BitTypePropertyDefinition[]
  ) => Promise<void>
  updateBitType: (
    id: string,
    name: string,
    iconName: string,
    properties: BitTypePropertyDefinition[]
  ) => Promise<void>
  reorderBitTypeProperties: (typeId: string, propertyIds: string[]) => Promise<void>
  deleteBitType: (id: string) => Promise<void>
  getBitTypeById: (id: string) => BitTypeDefinition | undefined
}

export const useBitTypesStore = create<BitTypesStore>((set, get) => {
  if (typeof window !== 'undefined' && window.ipcRenderer) {
    window.ipcRenderer.on('bittypes-updated', (_, structuredBitTypes) => {
      set({ bitTypes: structuredBitTypes, isLoading: false })
    })
  }

  return {
    bitTypes: [],
    isLoading: false,
    loadError: null,
    loadBitTypes: async () => {
      set({ isLoading: true, loadError: null })
      try {
        const structuredBitTypes = await window.ipcRenderer.invoke('getStructuredBitTypes')
        set({ bitTypes: structuredBitTypes, isLoading: false })
      } catch (err) {
        console.error('Failed to fetch bit types', err)
        set({ loadError: err as Error, isLoading: false })
      }
    },

    addBitType: async (name, iconName, properties) => {
      const id = crypto.randomUUID()

      // Add order property to each property
      const propertiesWithOrder = properties.map((prop, index) => ({
        ...prop,
        order: index
      }))

      const newBitType: BitTypeDefinition = {
        id,
        origin: 'user',
        name,
        iconName,
        properties: propertiesWithOrder
      }

      set((state) => ({ bitTypes: [...state.bitTypes, newBitType] }))

      try {
        await window.ipcRenderer.invoke('addBitType', id, name, iconName, propertiesWithOrder)
      } catch (error) {
        console.error('Failed to add bit type:', error)
        set((state) => ({
          bitTypes: state.bitTypes.filter((type) => type.id !== id),
          loadError: error as Error
        }))
      }
    },

    updateBitType: async (id, name, iconName, properties) => {
      const previousBitTypes = get().bitTypes

      set((state) => ({
        bitTypes: state.bitTypes.map((type) =>
          type.id === id ? { ...type, name, iconName, properties } : type
        )
      }))

      try {
        await window.ipcRenderer.invoke('updateBitType', id, name, iconName, properties)
      } catch (error) {
        console.error('Failed to update bit type:', error)
        set({
          bitTypes: previousBitTypes,
          loadError: error as Error
        })
      }
    },

    reorderBitTypeProperties: async (typeId, propertyIds) => {
      const { bitTypes } = get()
      const bitType = bitTypes.find((type) => type.id === typeId)

      if (!bitType) {
        console.error(`BitType with id ${typeId} not found`)
        return
      }

      // Create a map of property id to property
      const propertyMap = Object.fromEntries(bitType.properties.map((prop) => [prop.id, prop]))

      // Create properties array with new order
      const reorderedProperties = propertyIds.map((id, index) => ({
        ...propertyMap[id],
        order: index
      }))

      // Update bitType with reordered properties
      const updatedBitType = {
        ...bitType,
        properties: reorderedProperties
      }

      // Update state
      set((state) => ({
        bitTypes: state.bitTypes.map((type) => (type.id === typeId ? updatedBitType : type))
      }))

      // Send to backend
      try {
        await window.ipcRenderer.invoke(
          'updateBitType',
          typeId,
          updatedBitType.name,
          updatedBitType.iconName,
          reorderedProperties
        )
      } catch (error) {
        console.error('Failed to reorder properties:', error)
        // Revert to previous state
        set((state) => ({
          bitTypes: state.bitTypes.map((type) => (type.id === typeId ? bitType : type)),
          loadError: error as Error
        }))
      }
    },

    deleteBitType: async (id) => {
      const previousBitTypes = get().bitTypes

      set((state) => ({
        bitTypes: state.bitTypes.filter((type) => type.id !== id)
      }))

      try {
        await window.ipcRenderer.invoke('deleteBitType', id)
      } catch (error) {
        console.error('Failed to delete bit type:', error)
        set({
          bitTypes: previousBitTypes,
          loadError: error as Error
        })
      }
    },

    getBitTypeById: (id) => {
      const { bitTypes } = get()
      return bitTypes.find((type) => type.id === id)
    }
  }
})
