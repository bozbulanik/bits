import { create } from 'zustand'
import { Bit, Collection, CollectionItem } from '../types/Bit'

interface CollectionsStore {
  isLoading: boolean
  loadError: Error | null
  collections: Collection[]
  loadCollections: () => Promise<void>
  addCollection: (name: string, iconName: string, items: CollectionItem[]) => Promise<void>
  updateCollection: (id: string, name: string, iconName: string, createdAt: string, updatedAt: string, items: CollectionItem[]) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  reorderCollectionItems: (collectionId: string, itemIds: string[]) => Promise<void>
  getBitCount: (id: string) => number
}

export const useCollectionsStore = create<CollectionsStore>((set, get) => {
  if (typeof window !== 'undefined' && window.ipcRenderer) {
    window.ipcRenderer.on('collections-updated', (_, structuredCollections) => {
      set({ collections: structuredCollections, isLoading: false })
    })
  }
  return {
    collections: [],
    isLoading: false,
    loadError: null,
    loadCollections: async () => {
      set({ isLoading: true, loadError: null })
      try {
        const structuredCollections = await window.ipcRenderer.invoke('getStructuredCollections')
        set({ collections: structuredCollections, isLoading: false })
      } catch (err) {
        console.error('Failed to fetch collections', err)
        set({ loadError: err as Error, isLoading: false })
      }
    },
    addCollection: async (name, iconName, items) => {
      const newCollection: Collection = {
        id: crypto.randomUUID(),
        name,
        iconName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items
      }

      set((state) => ({ collections: [...state.collections, newCollection] }))

      try {
        await window.ipcRenderer.invoke(
          'addCollection',
          newCollection.id,
          newCollection.name,
          newCollection.iconName,
          newCollection.createdAt,
          newCollection.updatedAt,
          newCollection.items
        )
      } catch (error) {
        console.error('Failed to add collection:', error)
        set((state) => ({
          collections: state.collections.filter((collection) => collection.id !== newCollection.id),
          loadError: error as Error
        }))
      }
    },
    updateCollection: async (id, name, iconName, createdAt, updatedAt, items) => {
      const previousCollections = get().collections

      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === id ? { ...collection, name, iconName, createdAt, updatedAt, items } : collection
        )
      }))

      try {
        await window.ipcRenderer.invoke('updateCollection', id, name, iconName, createdAt, updatedAt, items)
      } catch (error) {
        console.error('Failed to update collection:', error)
        set({
          collections: previousCollections,
          loadError: error as Error
        })
      }
    },
    deleteCollection: async (id) => {
      const previousCollections = get().collections

      set((state) => ({
        collections: state.collections.filter((collection) => collection.id !== id)
      }))

      try {
        await window.ipcRenderer.invoke('deleteCollection', id)
      } catch (error) {
        console.error('Failed to delete collection:', error)
        set({
          collections: previousCollections,
          loadError: error as Error
        })
      }
    },
    reorderCollectionItems: async (collectionId, itemIds) => {
      const { collections } = get()
      const collectionToUpdate = collections.find((collection) => collection.id === collectionId)

      if (!collectionToUpdate) {
        console.error(`Collection with id ${collectionId} not found`)
        return
      }

      const itemMap = Object.fromEntries(collectionToUpdate.items.map((collection) => [collection.id, collection]))

      const reorderedItems = itemIds.map((id, index) => ({
        ...itemMap[id],
        order: index
      }))

      const updatedCollection = {
        ...collectionToUpdate,
        items: reorderedItems
      }

      // Update state
      set((state) => ({
        collections: state.collections.map((collection) => (collection.id === collectionId ? updatedCollection : collection))
      }))

      // Send to backend
      try {
        await window.ipcRenderer.invoke(
          'updateCollection',
          collectionId,
          updatedCollection.name,
          updatedCollection.iconName,
          updatedCollection.createdAt,
          new Date(),
          reorderedItems
        )
      } catch (error) {
        console.error('Failed to reorder collection items:', error)
        // Revert to previous state
        set((state) => ({
          collections: state.collections.map((collection) => (collection.id === collectionId ? collectionToUpdate : collection)),
          loadError: error as Error
        }))
      }
    },
    getBitCount: (id) => {
      const { collections } = get()
      return collections.find((collection) => collection.id === id)?.items.length || 0
    }
  }
})
