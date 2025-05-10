import { app, BrowserWindow, globalShortcut, shell } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { settingsManager } from './settings/settingsManager'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let tempWindow: BrowserWindow | null
let searchWindow: BrowserWindow | null
let testingWindow: BrowserWindow | null

function createWindow() {
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
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('CommandOrControl+H', () => {
    createTestWindow()
    testingWindow?.focus()
  })
})
