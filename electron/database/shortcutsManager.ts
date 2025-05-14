import { globalShortcut } from 'electron'
import { db } from './database'

interface ShortcutAction {
  action: string
  description: string
  defaultKey: string
  customKey: string | null
  scope: 'main' | 'local'
  lastUpdated: number
}

type ActionHandler = () => void

class ShortcutsManager {
  private registeredShortcuts: Map<string, string> = new Map()
  private actionHandlers: Map<string, ActionHandler> = new Map()

  // Register an action with its handler function
  registerActionHandler(action: string, handler: ActionHandler): void {
    this.actionHandlers.set(action, handler)
  }

  // Load all main process shortcuts from the database
  loadMainShortcuts(): Promise<ShortcutAction[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT action, description, default_key as defaultKey, custom_key as customKey, scope, last_updated as lastUpdated ' +
          "FROM shortcuts WHERE scope = 'main'",
        (err: string, rows: ShortcutAction[]) => {
          if (err) {
            reject(err)
            return
          }
          resolve(rows)
        }
      )
    })
  }
  loadLocalShortcuts(): Promise<ShortcutAction[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT action, description, default_key as defaultKey, custom_key as customKey, scope, last_updated as lastUpdated ' +
          "FROM shortcuts WHERE scope = 'local'",
        (err: string, rows: ShortcutAction[]) => {
          if (err) {
            reject(err)
            return
          }
          resolve(rows)
        }
      )
    })
  }

  // Apply all registered shortcuts
  async applyShortcuts(): Promise<void> {
    try {
      // First unregister all existing shortcuts
      this.unregisterAll()

      // Load shortcuts from database
      const shortcuts = await this.loadMainShortcuts()

      // Register each shortcut
      shortcuts.forEach((shortcut) => {
        const key = shortcut.customKey || shortcut.defaultKey
        const handler = this.actionHandlers.get(shortcut.action)

        if (handler && key) {
          try {
            globalShortcut.register(key, handler)
            this.registeredShortcuts.set(shortcut.action, key)
            console.log(`Registered shortcut: ${key} for action: ${shortcut.action}`)
          } catch (error) {
            console.error(
              `Failed to register shortcut: ${key} for action: ${shortcut.action}`,
              error
            )
          }
        }
      })
    } catch (error) {
      console.error('Error applying shortcuts:', error)
    }
  }

  // Unregister all shortcuts
  unregisterAll(): void {
    this.registeredShortcuts.forEach((key, action) => {
      globalShortcut.unregister(key)
    })
    this.registeredShortcuts.clear()
    console.log('All shortcuts unregistered')
  }

  // Called when shortcut settings are updated in the database
  async refreshShortcuts(): Promise<void> {
    await this.applyShortcuts()
  }

  // Clean up when app is closing
  cleanup(): void {
    this.unregisterAll()
  }

  // Update a shortcut in the database
  updateShortcut(action: string, newKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE shortcuts SET custom_key = ?, last_updated = strftime('%s', 'now') WHERE action = ?",
        [newKey, action],
        (err: string) => {
          if (err) {
            reject(err)
            return
          }
          this.refreshShortcuts().then(resolve).catch(reject)
        }
      )
    })
  }

  // Reset a shortcut to its default
  resetShortcut(action: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE shortcuts SET custom_key = NULL, last_updated = strftime('%s', 'now') WHERE action = ?",
        [action],
        (err: string) => {
          if (err) {
            reject(err)
            return
          }
          this.refreshShortcuts().then(resolve).catch(reject)
        }
      )
    })
  }

  resetShortcuts(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE shortcuts SET custom_key = NULL, last_updated = strftime('%s', 'now')",
        [],
        (err: string) => {
          if (err) {
            reject(err)
            return
          }
          this.refreshShortcuts().then(resolve).catch(reject)
        }
      )
    })
  }
}

export const shortcutsManager = new ShortcutsManager()
