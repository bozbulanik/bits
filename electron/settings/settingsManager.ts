import { ipcMain } from 'electron'
import Store from 'electron-store'
import { BrowserWindow } from 'electron'
import { UserSettings } from '../../src/types/UserSettings'

export class SettingsManager {
  private store: Store<UserSettings>
  private windows: BrowserWindow[] = []

  constructor() {
    this.store = new Store<UserSettings>({
      name: 'app-settings',
      defaults: {
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
      }
    })

    this.setupIpcHandlers()
  }

  registerWindow(window: BrowserWindow): void {
    if (!this.windows.includes(window)) {
      this.windows.push(window)

      window.on('closed', () => {
        this.windows = this.windows.filter((w) => w !== window)
      })
    }
  }

  getSetting<T = any>(path?: string): T {
    if (!path) {
      return this.store.store as T
    }
    return this.getValueByPath(this.store.store, path) as T
  }

  setSetting<T = any>(path: string, value: T): void {
    const settings = { ...this.store.store }
    this.setValueByPath(settings, path, value)
    this.store.set(settings)
    this.broadcastSettingsUpdate()
  }

  private getValueByPath(obj: any, path: string): any {
    const keys = path.split('.')
    return keys.reduce((acc, key) => {
      return acc !== undefined && acc !== null ? acc[key] : undefined
    }, obj)
  }

  private setValueByPath(obj: any, path: string, value: any): void {
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

  resetSettings(): void {
    this.store.clear()
    this.broadcastSettingsUpdate()
  }

  private broadcastSettingsUpdate(): void {
    const settings = this.store.store
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('settings-updated', settings)
      }
    }
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('getSettings', (_, key?: keyof UserSettings) => {
      return this.getSetting(key)
    })

    ipcMain.handle('setSettings', (_, key: keyof UserSettings, value: any) => {
      this.setSetting(key, value)
      return true
    })

    ipcMain.handle('resetSettings', () => {
      this.resetSettings()
      return true
    })
  }
}

export const settingsManager = new SettingsManager()
