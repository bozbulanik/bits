import { Copyleft, ExternalLink, MessageCircleQuestion } from 'lucide-react'
import Button from '../../components/Button'
import { useSettingsStore } from '../../stores/settingsStore'

const SettingsAbout = () => {
  const { settings } = useSettingsStore()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center ">
      <div className="flex items-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 2326 2326"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1163 523V459C1163 338.32 1163 277.981 1125.51 240.49C1088.02 203 1027.68 203 907 203H779C658.32 203 597.981 203 560.49 240.49C523 277.981 523 338.32 523 459V587C523 707.68 523 768.019 560.49 805.51C597.981 843 658.32 843 779 843H843H907C1027.68 843 1088.02 843 1125.51 880.49C1163 917.981 1163 978.32 1163 1099V1163V1227C1163 1347.68 1163 1408.02 1125.51 1445.51C1088.02 1483 1027.68 1483 907 1483H843H779C658.32 1483 597.981 1483 560.49 1520.49C523 1557.98 523 1618.32 523 1739V1867C523 1987.68 523 2048.02 560.49 2085.51C597.981 2123 658.32 2123 779 2123H907C1027.68 2123 1088.02 2123 1125.51 2085.51C1163 2048.02 1163 1987.68 1163 1867V1803V1739C1163 1618.32 1163 1557.98 1200.49 1520.49C1237.98 1483 1298.32 1483 1419 1483H1483H1547C1667.68 1483 1728.02 1483 1765.51 1445.51C1803 1408.02 1803 1347.68 1803 1227V1099C1803 978.32 1803 917.981 1765.51 880.49C1728.02 843 1667.68 843 1547 843H1483H1419C1298.32 843 1237.98 843 1200.49 805.51C1163 768.019 1163 707.68 1163 587V523Z"
            fill={settings.theme.mode == 'light' ? 'black' : 'white'}
          />
        </svg>

        <div className="flex flex-col">
          <p className="font-bold text-xl">Bits</p>
          <p className="text-sm">Version 0.0.1</p>

          <div className="flex items-center gap-1">
            <Copyleft size={16} strokeWidth={1.5} />
            <p className="text-sm">All rights are not reserved.</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full items-center justify-center mt-12">
        <Button variant={'default'}>
          <a
            href="https://github.com/bozbulanik/bits"
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <ExternalLink size={16} strokeWidth={1.5} />
            Visit website
          </a>
        </Button>
        <Button variant={'default'}>
          <a
            href="https://github.com/bozbulanik/bits/issues/new/choose"
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <MessageCircleQuestion size={16} strokeWidth={1.5} />
            Feedback
          </a>
        </Button>
      </div>
    </div>
  )
}

export default SettingsAbout
