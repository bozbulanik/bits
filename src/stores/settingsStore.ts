import { create } from 'zustand'
import { UserSettings } from '../types/UserSettings'

interface SettingsStore {
  settings: UserSettings
  initialized: boolean

  initializeSettings: () => Promise<void>
  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>
  resetSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set) => {
  if (typeof window !== 'undefined' && window.ipcRenderer) {
    window.ipcRenderer.on('settings-updated', (_, updatedSettings: UserSettings) => {
      set({ settings: updatedSettings, initialized: true })
    })
  }
  return {
    settings: {
      locale: {
        language: 'en-GB',
        timeSystem: {
          calendarType: 'gregorian',
          week: {
            startDay: 'monday',
            weekendDays: ['saturday', 'sunday'],
            length: 7
          },
          dateFormat: {
            type: 'yyyy-mm-dd',
            delimiter: '-',
            customPattern: null
          },
          timeFormat: {
            convention: '24-hour',
            includeSeconds: false,
            timeZoneDisplay: false
          }
        }
      },
      theme: {
        mode: 'dark',
        fontSize: 'medium',
        fontFamily: 'Montserrat'
      },
      user: {
        name: 'Rainer Maria',
        surname: 'Rilke',
        email: 'rainermariarilke@gmail.com',
        profileImage: '',
        bio: 'immer wieder gehn wir zu zweien hinaus unter die alten Bäume, lagern uns immer wieder zwischen die Blumen, gegenüber dem Himmel.'
      },
      notifications: {
        reminders: true,
        dailyCheckin: false,
        updates: true
      }
    },
    initialized: false,

    initializeSettings: async () => {
      try {
        const settings = await window.ipcRenderer.invoke('getSettings')
        set({ settings, initialized: true })
      } catch (error) {
        console.error('Failed to initialize settings:', error)
      }
    },

    setSetting: async (key, value) => {
      try {
        await window.ipcRenderer.invoke('setSettings', key, value)
        set((state) => ({
          settings: { ...state.settings, [key]: value }
        }))
      } catch (error) {
        console.error(`Failed to update setting ${String(key)}:`, error)
      }
    },

    resetSettings: async () => {
      try {
        await window.ipcRenderer.invoke('resetSettings')
        const defaultSettings = await window.ipcRenderer.invoke('getSettings')
        set({ settings: defaultSettings })
      } catch (error) {
        console.error('Failed to reset settings:', error)
      }
    }
  }
})
