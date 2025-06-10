import { create } from 'zustand'
import { Bit, BitData, BitTypeDefinition, Note } from '../types/Bit'

interface BitsStore {
  pinnedBits: Bit[]
  searchBits: (query: string) => Promise<Bit[]>
  addBit: (type: BitTypeDefinition, data: BitData[]) => Promise<void>
  addBitNote: (bitId: string, content: string) => Promise<void>

  updateBit: (id: string, data: BitData[]) => Promise<void>
  updateBitNote: (id: string, bitId: string, content: string) => Promise<void>
  togglePin: (id: string, newPinnedValue: number) => Promise<void>

  deleteBit: (id: string) => Promise<void>
  deleteBitNote: (id: string) => Promise<void>

  getPinnedBits: () => Promise<void>
  getBitsBetweenDate: (from: Date, to: Date) => Promise<Bit[]>
  getBitsWithDateDataBetweenDate: (from: Date, to: Date) => Promise<Bit[]>

  getBitById: (id: string) => Promise<Bit>
}

export const useBitsStore = create<BitsStore>((set) => {
  return {
    pinnedBits: [],

    searchBits: async (query) => {
      try {
        const bits = await window.ipcRenderer.invoke('searchBits', query)
        return bits
      } catch (error) {
        console.error('Failed to get bits:', error)
      }
    },

    addBit: async (type, data) => {
      const newBit: Bit = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: 0,
        type,
        notes: [],
        data
      }

      try {
        await window.ipcRenderer.invoke('addBit', newBit.id, newBit.type.id, newBit.createdAt, newBit.updatedAt, newBit.pinned, newBit.data)
      } catch (error) {
        console.error('Failed to add bit:', error)
      }
    },
    addBitNote: async (bitId, content) => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        bitId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content
      }

      try {
        await window.ipcRenderer.invoke('addBitNote', newNote)
      } catch (error) {
        console.error('Failed to add note:', error)
      }
    },

    updateBit: async (id, data) => {
      const timeStamp = new Date().toISOString()

      try {
        await window.ipcRenderer.invoke('updateBit', id, data, timeStamp)
      } catch (error) {
        console.error('Failed to update bit:', error)
      }
    },
    updateBitNote: async (id, content) => {
      const timeStamp = new Date().toISOString()

      try {
        await window.ipcRenderer.invoke('updateBitNote', id, content, timeStamp)
      } catch (error) {
        console.error('Failed to update note:', error)
      }
    },
    togglePin: async (id, newPinnedValue) => {
      const timeStamp = new Date().toISOString()

      try {
        await window.ipcRenderer.invoke('togglePin', id, newPinnedValue, timeStamp)
      } catch (error) {
        console.error('Failed to pin/unpin bit:', error)
      }
    },

    deleteBit: async (id) => {
      try {
        await window.ipcRenderer.invoke('deleteBit', id)
      } catch (error) {
        console.error('Failed to delete bit:', error)
      }
    },
    deleteBitNote: async (id) => {
      try {
        await window.ipcRenderer.invoke('deleteBitNote', id)
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
    },

    getPinnedBits: async () => {
      try {
        const structuredPinnedBits = await window.ipcRenderer.invoke('getStructuredPinnedBits')
        set({ pinnedBits: structuredPinnedBits })
      } catch (err) {
        console.error('Failed to fetch bits', err)
      }
    },
    getBitsBetweenDate: async (from, to) => {
      try {
        const structuredBitsBetweenDate = await window.ipcRenderer.invoke('getBitsBetweenDate', from, to)
        return structuredBitsBetweenDate
      } catch (err) {
        console.error('Failed to fetch bits', err)
      }
    },
    getBitsWithDateDataBetweenDate: async (from, to) => {
      try {
        const structuredBitsBetweenDate = await window.ipcRenderer.invoke('getBitsWithDateDataBetweenDate', from, to)
        return structuredBitsBetweenDate
      } catch (err) {
        console.error('Failed to fetch bits', err)
      }
    },
    getBitById: async (id) => {
      try {
        const structuredBit = await window.ipcRenderer.invoke('getBitById', id)
        return structuredBit[0]
      } catch (err) {
        console.error('Failed to fetch bit', err)
      }
    }
  }
})
