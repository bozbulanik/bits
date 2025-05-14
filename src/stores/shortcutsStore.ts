import { create } from 'zustand'

export type Shortcut = {
  action: string
  description: string
  defaultKey: string
  customKey: string | null
  scope: 'main' | 'local'
  lastUpdated: number
}

type ShortcutsStore = {
  shortcuts: Shortcut[]
  fetchShortcuts: () => Promise<void>
  updateShortcut: (action: string, newKey: string) => Promise<void>
  resetShortcut: (action: string) => Promise<void>
  resetShortcuts: () => Promise<void>

  error: string | null
  isLoading: boolean
}

export const useShortcutsStore = create<ShortcutsStore>((set, get) => ({
  error: null,
  isLoading: false,
  shortcuts: [],
  fetchShortcuts: async () => {
    try {
      set({ isLoading: true, error: null })
      const shortcuts = await window.ipcRenderer.invoke('getShortcuts')
      set({ shortcuts, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch shortcuts:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch shortcuts',
        isLoading: false
      })
    }
  },

  updateShortcut: async (action: string, newKey: string) => {
    try {
      set({ isLoading: true, error: null })
      await window.ipcRenderer.invoke('updateShortcut', action, newKey)

      // Update the local state
      const shortcuts = get().shortcuts.map((shortcut) =>
        shortcut.action === action
          ? { ...shortcut, customKey: newKey, lastUpdated: Math.floor(Date.now() / 1000) }
          : shortcut
      )

      set({ shortcuts, isLoading: false })
    } catch (error) {
      console.error(`Failed to update shortcut ${action}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to update shortcut ${action}`,
        isLoading: false
      })
    }
  },

  resetShortcut: async (action: string) => {
    try {
      set({ isLoading: true, error: null })
      await window.ipcRenderer.invoke('resetShortcut', action)

      // Update the local state
      const shortcuts = get().shortcuts.map((shortcut) =>
        shortcut.action === action
          ? { ...shortcut, customKey: null, lastUpdated: Math.floor(Date.now() / 1000) }
          : shortcut
      )

      set({ shortcuts, isLoading: false })
    } catch (error) {
      console.error(`Failed to reset shortcut ${action}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to reset shortcut ${action}`,
        isLoading: false
      })
    }
  },

  resetShortcuts: async () => {
    try {
      set({ isLoading: true, error: null })
      await window.ipcRenderer.invoke('resetShortcuts')
      const shortcuts = get().shortcuts.map((shortcut) => {
        return { ...shortcut, customKey: null, lastUpdated: Math.floor(Date.now() / 1000) }
      })
      set({ shortcuts, isLoading: false })
    } catch (error) {
      console.error('Failed to reset shortcuts')
      set({
        error: error instanceof Error ? error.message : 'Failed to reset shortcuts',
        isLoading: false
      })
    }
  }
}))
