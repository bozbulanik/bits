import React, { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { loadGoogleFonts } from '../utils/loadGoogleFonts'

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { settings } = useSettingsStore()

  useEffect(() => {
    if (!settings.theme.fontFamily) return

    loadGoogleFonts(settings.theme.fontFamily)
  }, [settings.theme.fontFamily])
  return (
    <div
      style={{ fontFamily: settings.theme.fontFamily }}
      className="bg-scry-bg dark:bg-scry-bg-dark rounded-rounded border border-scry-border dark:border-scry-border-dark overflow-hidden h-screen w-screen text-text dark:text-text-dark"
    >
      <div className="flex flex-row w-full h-full p-1.5">
        <div className="bg-bg dark:bg-bg-dark w-full h-full flex flex-col rounded-[12px] border border-border dark:border-border-dark">
          {children}
        </div>
      </div>
    </div>
  )
}

export default RootLayout
