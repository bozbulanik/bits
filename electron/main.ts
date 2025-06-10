import { app, BrowserWindow, clipboard, ipcMain, protocol } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { settingsManager } from './settings/settingsManager'
import { shortcutsManager } from './database/shortcutsManager'
import { fetchGoogleFonts } from './fonts/fontService'
import dotenv from 'dotenv'
import { windowsManager } from './windows/windowsManager'
dotenv.config()

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let tempWindow: BrowserWindow | null

function createTempWindow() {
  if (tempWindow) {
    if (VITE_DEV_SERVER_URL) {
      tempWindow.loadURL(`${VITE_DEV_SERVER_URL}`)
    } else {
      tempWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
    return
  }
  tempWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
    }
  })

  if (VITE_DEV_SERVER_URL) {
    tempWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    tempWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    tempWindow = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createTempWindow()
  }
})

app.whenReady().then(() => {
  initializeShortcutDatabase()
  registerShortcutActions()
  registerShortcutHandlers()
  protocol.registerFileProtocol('local-image', (request, callback) => {
    const url = request.url.replace('local-image://', '')
    const decodedPath = decodeURIComponent(url)
    callback({ path: decodedPath })
  })
  protocol.registerFileProtocol('local-file', (request, callback) => {
    const url = request.url.replace('local-file://', '')
    const decodedPath = decodeURIComponent(url)
    callback({ path: decodedPath })
  })

  createTempWindow()
  // createConfigurationWindow()

  app.on('will-quit', () => {
    shortcutsManager.cleanup()
  })
})

function initializeShortcutDatabase() {
  // This function would populate your database with default shortcuts if it's empty
}

function registerShortcutActions() {
  shortcutsManager.registerActionHandler('open_system_test', () => {
    const newWindow = windowsManager.createOrFocusWindow('test_window', 'testing', 'Test Window', 960, 960, false)
    return newWindow.id
  })
  shortcutsManager.registerActionHandler('open_settings', () => {
    const newWindow = windowsManager.createOrFocusWindow('settings_window', 'settings/general', 'Bits | Settings', 720, 480, false)
    return newWindow.id
  })
  shortcutsManager.registerActionHandler('open_search', () => {
    const newWindow = windowsManager.createOrFocusWindow('search_window', 'search', 'Bits | Search', 720, 480, false)
    return newWindow.id
  })
  shortcutsManager.registerActionHandler('open_bit_types', () => {
    const newWindow = windowsManager.createOrFocusWindow('bittypes_window', 'bittypes', 'Bits | Bit Types', 480, 720, false)
    return newWindow.id
  })
  shortcutsManager.registerActionHandler('open_calendar', () => {
    const newWindow = windowsManager.createOrFocusWindow('calendar_window', 'calendar/agenda', 'Bits | Bit Types', 720, 720, false)
    return newWindow.id
  })

  shortcutsManager.registerActionHandler('open_advanced_search', () => {
    const newWindow = windowsManager.createOrFocusWindow('advancedsearch_window', 'advancedsearch', 'Bits | Advanced Search', 960, 960, false)
    return newWindow.id
  })

  shortcutsManager.registerActionHandler('open_fast_create', () => {
    const newWindow = windowsManager.createOrFocusWindow(
      'fastcreate_window',
      `fastcreate/${settingsManager.getSetting('bitCreator.defaultBitType')}`,
      'Bits | Fast Create',
      720,
      480,
      false
    )
    return newWindow.id
  })

  shortcutsManager.registerActionHandler('open_ai', () => {
    const newWindow = windowsManager.createOrFocusWindow('ai_window', 'ai', 'Bits | AI', 480, 720, false)
    return newWindow.id
  })
  shortcutsManager.registerActionHandler('quit_app', () => {
    app.quit()
  })

  shortcutsManager.applyShortcuts()
}

function registerShortcutHandlers() {
  ipcMain.handle('getShortcuts', async () => {
    try {
      const mainShortcuts = await shortcutsManager.loadMainShortcuts()
      const localShortcuts = await shortcutsManager.loadLocalShortcuts()
      const shortcuts = [...mainShortcuts, ...localShortcuts]
      return shortcuts
    } catch (error) {
      console.error('Error loading shortcuts:', error)
      throw error
    }
  })

  ipcMain.handle('updateShortcut', async (_event, action, newKey) => {
    try {
      await shortcutsManager.updateShortcut(action, newKey)
      return true
    } catch (error) {
      console.error(`Error updating shortcut ${action}:`, error)
      throw error
    }
  })

  ipcMain.handle('resetShortcut', async (_event, action) => {
    try {
      await shortcutsManager.resetShortcut(action)
      return true
    } catch (error) {
      console.error(`Error resetting shortcut ${action}:`, error)
      throw error
    }
  })

  ipcMain.handle('resetShortcuts', async (_event) => {
    try {
      await shortcutsManager.resetShortcuts()
      return true
    } catch (error) {
      console.error(`Error resetting shortcuts:`, error)
      throw error
    }
  })
}

ipcMain.handle('openWindow', async (_, name: string, url: string, title: string, width: number, height: number, multi: boolean) => {
  const window = windowsManager.createOrFocusWindow(name, url, title, width, height, multi)
  return window.id
})

ipcMain.on('closeWindow', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window) {
    window.close()
  }
})

ipcMain.on('useProfileImage', (event, filePath) => {
  event.reply('profileImageSet', `local-image://${encodeURIComponent(filePath)}`)
})

ipcMain.on('useImage', (event, filePath) => {
  event.reply('imageSet', `local-image://${encodeURIComponent(filePath)}`)
})

ipcMain.on('useFile', (event, filePath) => {
  event.reply('fileSet', `local-file://${encodeURIComponent(filePath)}`)
})

ipcMain.handle('fetchFonts', async () => {
  try {
    const fonts = await fetchGoogleFonts()
    return { success: true, fonts }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('getMemoryUsage', () => {
  return {
    heap: process.memoryUsage(),
    system: process.getSystemMemoryInfo?.() || null
  }
})

ipcMain.handle('getOpenWindows', () => {
  const openWindows = windowsManager.getOpenWindows()
  return openWindows
})
ipcMain.handle('getOpenBits', () => {
  const openBits = windowsManager.getOpenBits()
  return openBits
})

ipcMain.handle('getFocusedWindows', () => {
  const focusedWindows = windowsManager.getFocusedWindows()
  return focusedWindows
})

ipcMain.handle('copyText', (_, text: string) => {
  clipboard.writeText(text)
})
