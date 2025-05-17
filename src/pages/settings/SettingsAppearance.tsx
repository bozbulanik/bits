import { useEffect, useState } from 'react'
import Combobox, { ComboboxOptionGroup } from '../../components/Combobox'
import { useSettingsStore } from '../../stores/settingsStore'
import { Tooltip } from '../../components/Tooltip'
import Button from '../../components/Button'

const SettingsAppearance = () => {
  const { settings, setSetting } = useSettingsStore()

  const [selectedFontOption, setSelectedFontOption] = useState<string>(settings.theme.fontFamily)
  const [fontOptions, setFontOptions] = useState<ComboboxOptionGroup[]>([])

  useEffect(() => {
    window.ipcRenderer.invoke('fetchFonts').then((res) => {
      const fonts = res.success && res.fonts ? res.fonts : fallbackFontOptions

      const groupedOptions: ComboboxOptionGroup[] = [
        {
          options: fonts.map((font: any) => ({
            value: font.value,
            label: font.label,
            icon: undefined
          }))
        }
      ]

      setFontOptions(groupedOptions)
    })
  }, [])

  const fallbackFontOptions = [{ value: 'system-ui', label: 'System' }]

  const handleFontFamilyChange = (value: string) => {
    setSelectedFontOption(value)
    setSetting('theme.fontFamily', value)
  }
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2">
        <p className="text-text-muted uppercase text-sm font-semibold">Typography</p>
        <div className="flex items-center">
          <p className="font-semibold text-sm">Font Family</p>
          <Combobox
            searchable
            className="w-48 ml-auto"
            selectedValues={selectedFontOption}
            onChange={(value) => handleFontFamilyChange(value as string)}
            options={fontOptions}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <p className="text-text-muted uppercase text-sm font-semibold">Theme</p>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 items-center">
            <div
              onClick={() => setSetting('theme.mode', 'light')}
              className={`p-1 w-48 h-32 rounded-md border ${
                settings.theme.mode == 'light'
                  ? 'border-button-border-dark'
                  : 'dark:border-button-border-dark dark:hover:border-button-border'
              }  cursor-pointer`}
            >
              <div className="hover:scale-102 transition-all duration-100 ease-in w-full h-full gap-2 flex flex-col bg-bg rounded-sm p-2">
                <div className="rounded-md border border-button-border flex-1 flex flex-col justify-evenly items-start p-1">
                  <div className="rounded-md w-[50%] bg-border h-1.5"></div>
                  <div className="rounded-md w-[75%] bg-border h-1.5"></div>
                  <div className="rounded-md w-[35%] bg-border h-1.5"></div>
                </div>
                <div className="rounded-md border border-button-border flex-1 flex justify-evenly items-center">
                  <div className="rounded-full bg-border w-3 h-3"></div>
                  <div className="rounded-full bg-border w-[75%] h-2"></div>
                </div>
                <div className="rounded-md border border-button-border flex-1 flex justify-evenly items-center">
                  <div className="rounded-full bg-border w-3 h-3"></div>
                  <div className="rounded-full bg-border w-[75%] h-2"></div>
                </div>
              </div>
            </div>
            <p className="font-semibold text-sm">Light</p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <div
              onClick={() => setSetting('theme.mode', 'dark')}
              className={`p-1 w-48 h-32 rounded-md border ${
                settings.theme.mode == 'dark'
                  ? 'border-button-border'
                  : 'border-button-border hover:border-button-border-dark'
              } cursor-pointer`}
            >
              <div className="hover:scale-102 transition-all duration-100 ease-in w-full h-full gap-2 flex flex-col bg-bg-dark rounded-sm p-2">
                <div className="rounded-md border border-button-border-dark flex-1 flex flex-col justify-evenly items-start p-1">
                  <div className="rounded-md w-[50%] bg-border-dark h-1.5"></div>
                  <div className="rounded-md w-[75%] bg-border-dark h-1.5"></div>
                  <div className="rounded-md w-[35%] bg-border-dark h-1.5"></div>
                </div>
                <div className="rounded-md border border-button-border-dark flex-1 flex justify-evenly items-center">
                  <div className="rounded-full bg-border-dark w-3 h-3"></div>
                  <div className="rounded-full bg-border-dark w-[75%] h-2"></div>
                </div>
                <div className="rounded-md border border-button-border-dark flex-1 flex justify-evenly items-center">
                  <div className="rounded-full bg-border-dark w-3 h-3"></div>
                  <div className="rounded-full bg-border-dark w-[75%] h-2"></div>
                </div>
              </div>
            </div>
            <p className="font-semibold text-sm">Dark</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsAppearance
