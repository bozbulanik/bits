import { BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { settingsManager } from '../settings/settingsManager'
import { bitDatabaseManager } from '../database/databaseManager'
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main'
import { fileURLToPath } from 'node:url'

interface WindowInfo {
  window: BrowserWindow
  name: string
  url: string
}

class WindowManager {
  private windows = new Map<string, WindowInfo>()
  __dirname = path.dirname(fileURLToPath(import.meta.url))

  createOrFocusWindow(name: string, url: string, title: string, width: number, height: number, openMulti: boolean): BrowserWindow {
    const existingInfo = this.windows.get(url)

    if (existingInfo && !existingInfo.window.isDestroyed() && !openMulti) {
      existingInfo.window.focus()

      if (existingInfo.window.isMinimized()) {
        existingInfo.window.restore()
      }

      if (VITE_DEV_SERVER_URL) {
        existingInfo.window.loadURL(`${VITE_DEV_SERVER_URL}${url}`)
      } else {
        existingInfo.window.loadFile(path.join(RENDERER_DIST, `${url}`))
      }

      return existingInfo.window
    }

    const newWindow = new BrowserWindow({
      width: width,
      height: height,
      resizable: false,
      autoHideMenuBar: true,
      transparent: true,
      center: true,
      title: title,
      frame: false,
      vibrancy: 'under-window',
      backgroundMaterial: 'acrylic',
      visualEffectState: 'active',
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 12, y: 10 },
      webPreferences: {
        preload: path.join(this.__dirname, 'preload.mjs'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: true
      }
    })

    this.windows.set(url, {
      window: newWindow,
      name,
      url
    })

    newWindow.on('closed', () => {
      this.windows.delete(url)
    })

    newWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    settingsManager.registerWindow(newWindow)
    bitDatabaseManager.registerWindow(newWindow)

    if (VITE_DEV_SERVER_URL) {
      newWindow.loadURL(`${VITE_DEV_SERVER_URL}${url}`)
    } else {
      newWindow.loadFile(path.join(RENDERER_DIST, `${url}`))
    }

    return newWindow
  }

  getOpenWindows(): string[] {
    return Array.from(this.windows.keys()).filter((url) => !this.windows.get(url)!.window.isDestroyed())
  }
  getOpenBits(): string[] {
    return Array.from(this.windows.values())
      .filter((info) => info.name === 'bits_window' && !info.window.isDestroyed())
      .map((info) => {
        const parts = info.url.split('/')
        return parts[parts.length - 1]
      })
  }
  getFocusedWindows(): string[] {
    return Array.from(this.windows.values())
      .filter((info) => !info.window.isDestroyed() && info.window.isFocused())
      .map((info) => info.name)
  }
  //   closeWindow(url: string): boolean {
  //     const windowInfo = this.windows.get(url)
  //     if (windowInfo && !windowInfo.window.isDestroyed()) {
  //       windowInfo.window.close()
  //       return true
  //     }
  //     return false
  //   }
}

export const windowsManager = new WindowManager()

// if (newWindow) {
//   const [currentX, currentY] = newWindow.getPosition()

//   newWindow.setBounds(
//     {
//       x: currentX,
//       y: currentY,
//       width,
//       height
//     },
//     true
//   )

//   if (VITE_DEV_SERVER_URL) {
//     newWindow.loadURL(`${VITE_DEV_SERVER_URL}${win}`)
//   } else {
//     newWindow.loadFile(path.join(RENDERER_DIST, `${win}`))
//   }
//   return
// }
