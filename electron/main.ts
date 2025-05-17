import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { settingsManager } from './settings/settingsManager'
import { shortcutsManager } from './database/shortcutsManager'
import { bitDatabaseManager } from './database/databaseManager'

import { fetchGoogleFonts } from './fonts/fontService'
import dotenv from 'dotenv'
dotenv.config()

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let tempWindow: BrowserWindow | null
let configurationWindow: BrowserWindow | null
let settingsWindow: BrowserWindow | null

let searchWindow: BrowserWindow | null
let bitViewerWindow: BrowserWindow | null
let bitTypeManagerWindow: BrowserWindow | null
let calendarWindow: BrowserWindow | null
let testingWindow: BrowserWindow | null

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

function createConfigurationWindow() {
  if (configurationWindow) {
    if (VITE_DEV_SERVER_URL) {
      configurationWindow.loadURL(`${VITE_DEV_SERVER_URL}configuration`)
    } else {
      configurationWindow.loadFile(path.join(RENDERER_DIST, 'configuration'))
    }
    return
  }
  configurationWindow = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | Configuration',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  configurationWindow.on('closed', () => {
    app.quit()
  })

  configurationWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(configurationWindow)
  bitDatabaseManager.registerWindow(configurationWindow)

  if (VITE_DEV_SERVER_URL) {
    configurationWindow.loadURL(`${VITE_DEV_SERVER_URL}configuration`)
  } else {
    configurationWindow.loadFile(path.join(RENDERER_DIST, 'configuration'))
  }
}

function createSettingsWindow() {
  if (settingsWindow) {
    if (VITE_DEV_SERVER_URL) {
      settingsWindow.loadURL(`${VITE_DEV_SERVER_URL}settings/general`)
    } else {
      settingsWindow.loadFile(path.join(RENDERER_DIST, 'settings/general'))
    }
    return
  }
  settingsWindow = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | Settings',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  settingsWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(settingsWindow)
  bitDatabaseManager.registerWindow(settingsWindow)

  if (VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${VITE_DEV_SERVER_URL}settings/general`)
  } else {
    settingsWindow.loadFile(path.join(RENDERER_DIST, 'settings/general'))
  }
}

function createSearchWindow() {
  if (searchWindow) {
    if (VITE_DEV_SERVER_URL) {
      searchWindow.loadURL(`${VITE_DEV_SERVER_URL}search`)
    } else {
      searchWindow.loadFile(path.join(RENDERER_DIST, 'search'))
    }
    return
  }
  searchWindow = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | Search',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  searchWindow.on('closed', () => {
    searchWindow = null
  })

  searchWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(searchWindow)
  bitDatabaseManager.registerWindow(searchWindow)

  if (VITE_DEV_SERVER_URL) {
    searchWindow.loadURL(`${VITE_DEV_SERVER_URL}search`)
  } else {
    searchWindow.loadFile(path.join(RENDERER_DIST, 'search'))
  }
}

function createBitViewerWindow(bitId: string) {
  if (bitViewerWindow) {
    if (VITE_DEV_SERVER_URL) {
      bitViewerWindow.loadURL(`${VITE_DEV_SERVER_URL}bitviewer/${bitId}`)
    } else {
      bitViewerWindow.loadFile(path.join(RENDERER_DIST, `bitviewer/${bitId}`))
    }
    return
  }
  bitViewerWindow = new BrowserWindow({
    width: 720,
    height: 480,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | Bit Viewer',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  bitViewerWindow.on('closed', () => {
    bitViewerWindow = null
  })

  bitViewerWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(bitViewerWindow)
  bitDatabaseManager.registerWindow(bitViewerWindow)

  if (VITE_DEV_SERVER_URL) {
    bitViewerWindow.loadURL(`${VITE_DEV_SERVER_URL}bitviewer/${bitId}`)
  } else {
    bitViewerWindow.loadFile(path.join(RENDERER_DIST, `bitviewer/${bitId}`))
  }
}

function createBitTypeManagerWindow() {
  if (bitTypeManagerWindow) {
    if (VITE_DEV_SERVER_URL) {
      bitTypeManagerWindow.loadURL(`${VITE_DEV_SERVER_URL}bittypemanager`)
    } else {
      bitTypeManagerWindow.loadFile(path.join(RENDERER_DIST, `bittypemanager`))
    }
    return
  }
  bitTypeManagerWindow = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | Bit Viewer',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  bitTypeManagerWindow.on('closed', () => {
    bitTypeManagerWindow = null
  })

  bitTypeManagerWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(bitTypeManagerWindow)
  bitDatabaseManager.registerWindow(bitTypeManagerWindow)

  if (VITE_DEV_SERVER_URL) {
    bitTypeManagerWindow.loadURL(`${VITE_DEV_SERVER_URL}bittypemanager`)
  } else {
    bitTypeManagerWindow.loadFile(path.join(RENDERER_DIST, `bittypemanager`))
  }
}

function createCalendarWindow() {
  if (calendarWindow) {
    if (VITE_DEV_SERVER_URL) {
      calendarWindow.loadURL(`${VITE_DEV_SERVER_URL}calendar/agenda`)
    } else {
      // logWindow.loadFile('dist/index.html')
      calendarWindow.loadFile(path.join(RENDERER_DIST, 'calendar/agenda'))
    }
    return
  }
  calendarWindow = new BrowserWindow({
    width: 720,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Frame | Search',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  calendarWindow.on('closed', () => {
    calendarWindow = null
  })

  calendarWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(calendarWindow)
  bitDatabaseManager.registerWindow(calendarWindow)

  if (VITE_DEV_SERVER_URL) {
    calendarWindow.loadURL(`${VITE_DEV_SERVER_URL}calendar/agenda`)
  } else {
    // logWindow.loadFile('dist/index.html')
    calendarWindow.loadFile(path.join(RENDERER_DIST, 'calendar/agenda'))
  }
}

function createTestWindow() {
  if (testingWindow) {
    if (VITE_DEV_SERVER_URL) {
      testingWindow.loadURL(`${VITE_DEV_SERVER_URL}testing`)
    } else {
      testingWindow.loadFile(path.join(RENDERER_DIST, 'testing'))
    }
    return
  }
  testingWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    center: true,
    title: 'Bits | System Test',
    frame: false,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  testingWindow.on('closed', () => {
    testingWindow = null
  })

  testingWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  settingsManager.registerWindow(testingWindow)
  bitDatabaseManager.registerWindow(testingWindow)

  if (VITE_DEV_SERVER_URL) {
    testingWindow.loadURL(`${VITE_DEV_SERVER_URL}testing`)
  } else {
    testingWindow.loadFile(path.join(RENDERER_DIST, 'testing'))
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

  createTempWindow()
  // createConfigurationWindow()

  app.on('will-quit', () => {
    shortcutsManager.cleanup()
  })
})

function initializeShortcutDatabase() {
  // This function would populate your database with default shortcuts if it's empty
  // You could use the node-sqlite3 API directly here or use your existing database setup
}

function registerShortcutActions() {
  shortcutsManager.registerActionHandler('open_system_test', () => {
    createTestWindow()
    testingWindow?.focus()
  })
  shortcutsManager.registerActionHandler('open_settings', () => {
    createSettingsWindow()
    settingsWindow?.focus()
  })
  shortcutsManager.registerActionHandler('open_search', () => {
    createSearchWindow()
    searchWindow?.focus()
  })
  shortcutsManager.registerActionHandler('open_bit_type_manager', () => {
    createBitTypeManagerWindow()
    bitTypeManagerWindow?.focus()
  })
  shortcutsManager.registerActionHandler('open_calendar', () => {
    createCalendarWindow()
    calendarWindow?.focus()
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

  ipcMain.handle('resetShortcuts', async (_event, action) => {
    try {
      await shortcutsManager.resetShortcuts()
      return true
    } catch (error) {
      console.error(`Error resetting shortcuts:`, error)
      throw error
    }
  })
}

ipcMain.handle('openWindow', async (_, windowName) => {
  switch (windowName) {
    case 'search':
      createSearchWindow()
      searchWindow?.focus()
      break
    case 'settings':
      createSettingsWindow()
      settingsWindow?.focus()
      break
    case 'bittypemanager':
      createBitTypeManagerWindow()
      bitTypeManagerWindow?.focus()
      break
    case 'calendar':
      createCalendarWindow()
      calendarWindow?.focus()
      break
    default:
      break
  }
})
ipcMain.handle('closeWindow', async (_, windowName) => {
  switch (windowName) {
    case 'search':
      searchWindow?.close()
      break
    case 'settings':
      settingsWindow?.close()
      break
    case 'bitviewer':
      bitViewerWindow?.close()
      break
    case 'bittypemanager':
      bitTypeManagerWindow?.close()
      break
    case 'calendar':
      calendarWindow?.close()
      break
    default:
      break
  }
})

ipcMain.on('useProfileImage', (event, filePath) => {
  event.reply('profileImageSet', `local-image://${encodeURIComponent(filePath)}`)
})

ipcMain.handle('fetchFonts', async () => {
  try {
    const fonts = await fetchGoogleFonts()
    return { success: true, fonts }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('openBitViewerWindow', async (_, bitId) => {
  createBitViewerWindow(bitId)
  bitViewerWindow?.focus()
})
