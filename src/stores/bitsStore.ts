import { create } from 'zustand'
import { Bit, BitData, BitTypeDefinition } from '../types/Bit'
import { useBitTypesStore } from './bitTypesStore'

interface BitsStore {
  isLoading: boolean
  loadError: Error | null
  bits: Bit[]
  loadBits: () => Promise<void>
  addBit: (type: BitTypeDefinition, data: BitData[]) => Promise<void>
  updateBit: (id: string, createdAt: string, updatedAt: string, pinned: number, data: BitData[]) => Promise<void>
  deleteBit: (id: string) => Promise<void>
}
export const useBitsStore = create<BitsStore>((set) => ({
  bits: [],
  isLoading: false,
  loadError: null,
  loadBits: async () => {
    set({ isLoading: true, loadError: null })
    console.log('LOADING triggered')

    try {
      const databaseRows = await window.ipcRenderer.invoke('getBits')
      const currentBitTypes = useBitTypesStore.getState().bitTypes
      const parsedBitRows = await Promise.all(
        databaseRows.map(async (bit: any) => {
          const bit_datas = await window.ipcRenderer.invoke('getBitDataById', bit.id)
          if (!bit_datas) {
            console.warn(`Unknown data for bit id ${bit.id}`)
            return null
          }

          const data = bit_datas.map(
            (data: any) =>
              ({
                propertyId: data.property_id,
                value: data.value
              } as BitData)
          )

          const type = currentBitTypes.find((t: any) => t.id === bit.type_id)
          if (!type) {
            console.warn(`Unknown type_id "${bit.type_id}" for bit id ${bit.id}`)
            return null
          }

          return {
            id: bit.id,
            type,
            createdAt: bit.created_at,
            updatedAt: bit.updated_at,
            pinned: bit.pinned,
            data
          } as Bit
        })
      )

      set({ bits: [...parsedBitRows], isLoading: false })
    } catch (err) {
      console.log('Failed to fetch bits', err)
      set({ loadError: err as Error, isLoading: false })
    }
  },
  addBit: async (type, data) => {
    const newBit: Bit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: 0,
      type,
      data
    }
    set((state) => ({ bits: [...state.bits, newBit] }))
    await window.ipcRenderer.invoke(
      'addBit',
      newBit.id,
      newBit.type.id,
      newBit.createdAt,
      newBit.updatedAt,
      newBit.pinned,
      newBit.data
    )
  },
  updateBit: async (id, createdAt, updatedAt, pinned, data) => {
    set((state) => ({
      bits: state.bits.map((type) => (type.id === id ? { ...type, createdAt, updatedAt, pinned, data } : type))
    }))
    await window.ipcRenderer.invoke('updateBit', id, createdAt, updatedAt, pinned, data)
  },
  deleteBit: async (id) => {
    set((state) => ({
      bits: state.bits.filter((type) => type.id !== id)
    }))
    await window.ipcRenderer.invoke('deleteBit', id)
  }
}))
