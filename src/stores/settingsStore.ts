import { create } from 'zustand'
import { UserSettings } from '../types/UserSettings'

const setValueByPath = (obj: any, path: string, value: any): void => {
  const keys = path.split('.')
  const lastKey = keys.pop()!

  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined) {
      acc[key] = {}
    }
    return acc[key]
  }, obj)

  target[lastKey] = value
}

interface SettingsStore {
  settings: UserSettings
  initialized: boolean

  initializeSettings: () => Promise<void>
  setSetting: <T = any>(path: string, value: T) => Promise<void>
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
            weekendDays: ['saturday', 'sunday']
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

    setSetting: async <T = any>(path: string, value: T) => {
      try {
        await window.ipcRenderer.invoke('setSettings', path, value)
        set((state) => {
          const newSettings = { ...state.settings }
          setValueByPath(newSettings, path, value)
          return { settings: newSettings }
        })
      } catch (error) {
        console.error(`Failed to update setting at path ${path}:`, error)
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
