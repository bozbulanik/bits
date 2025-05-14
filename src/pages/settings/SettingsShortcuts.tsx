import { useEffect, useState } from 'react'
import { useShortcutsStore } from '../../stores/shortcutsStore'
import Input from '../../components/Input'
import {
  ArrowBigUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  Keyboard,
  MessageCircleQuestion,
  Option,
  PenLine,
  RotateCcw,
  Search,
  Space
} from 'lucide-react'
import KeyCompponent from '../../components/KeyComponent'
import Button from '../../components/Button'
import { PulseLoader } from 'react-spinners'
import { useSettingsStore } from '../../stores/settingsStore'

const keyIconMap: Record<string, JSX.Element> = {
  CommandOrControl: <ChevronUp size={16} strokeWidth={1.5} />,
  Command: <Command size={16} strokeWidth={1.5} />,
  Control: <ChevronUp size={16} strokeWidth={1.5} />,
  Space: <Space size={16} strokeWidth={1.5} />,
  Alt: <Option size={16} strokeWidth={1.5} />,
  Shift: <ArrowBigUp size={16} strokeWidth={1.5} />,
  Enter: <CornerDownLeft size={16} strokeWidth={1.5} />,
  Backspace: <Delete size={16} strokeWidth={1.5} />,
  ArrowUp: <ArrowUp size={16} strokeWidth={1.5} />,
  ArrowDown: <ArrowDown size={16} strokeWidth={1.5} />,
  ArrowLeft: <ArrowLeft size={16} strokeWidth={1.5} />,
  ArrowRight: <ArrowRight size={16} strokeWidth={1.5} />
}

const SettingsShortcuts = () => {
  const { settings } = useSettingsStore()
  const { shortcuts, updateShortcut, resetShortcut, resetShortcuts } = useShortcutsStore()

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredShortuts = shortcuts.filter((shortcut) =>
    shortcut.action.includes(searchQuery.toLocaleLowerCase())
  )

  const handleReset = async (action: string) => {
    await resetShortcut(action)
  }

  const [recordingAction, setRecordingAction] = useState<string | null>(null)
  const [currentInput, setCurrentInput] = useState<string>('')
  const startRecording = (action: string) => {
    console.log('recording')
    setRecordingAction(action)
    setCurrentInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recordingAction) return

    e.preventDefault()

    const modifiers = []
    if (e.ctrlKey) modifiers.push('Control')
    if (e.metaKey) modifiers.push('Command')
    if (e.altKey) modifiers.push('Alt')
    if (e.shiftKey) modifiers.push('Shift')

    const key = e.key === ' ' ? 'Space' : e.key
    const shortcut = [...modifiers, key].join('+')

    setCurrentInput(shortcut)
    console.log(shortcut)
  }

  const saveShortcut = async () => {
    if (recordingAction && currentInput) {
      await updateShortcut(recordingAction, currentInput)
      setRecordingAction(null)
      setCurrentInput('')
    }
  }

  const cancelRecording = () => {
    setRecordingAction(null)
    setCurrentInput('')
  }

  return (
    <div className="relative w-full h-full flex-col gap-2">
      {recordingAction != null && (
        <>
          <div className="absolute inset-0 backdrop-blur-xs pointer-events-none z-0 top-0 left-0 w-full h-full" />
          <div
            tabIndex={0}
            autoFocus
            onKeyDown={handleKeyDown}
            className="focus:outline-none w-48 h-32 flex items-center justify-center absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-10 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-md"
          >
            {currentInput ? (
              <div className="w-full h-full flex flex-col items-center p-2">
                <div className="flex items-center">
                  {currentInput.split('+').map((key, idx) => (
                    <div className="px-0.5 content-center text-sm">{keyIconMap[key] || key}</div>
                  ))}
                </div>
                <p className="text-xs text-text-muted">{currentInput}</p>
                <div className="flex gap-2 items-center mt-auto w-full">
                  <Button onClick={saveShortcut} className="ml-auto" variant={'default'}>
                    Save
                  </Button>
                  <Button onClick={cancelRecording} variant={'destructive'}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">Please press keys.</p>
            )}
          </div>
        </>
      )}
      <div className="flex flex-col gap-2 p-2 h-full">
        <p className="font-semibold text-sm text-text-muted uppercase">Shortcuts</p>
        <div className="flex">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shortcuts..."
            leftIcon={<Search size={16} strokeWidth={1.5} />}
          />

          <Button onClick={resetShortcuts} variant={'default'} className="ml-auto">
            <RotateCcw size={16} strokeWidth={1.5} />
            Restore all to default
          </Button>
        </div>
        <div className="border border-border dark:border-border-dark rounded-md min-h-0 flex flex-col">
          <div className="grid grid-cols-[1fr_1fr_1fr_64px] font-semibold p-1 gap-4 text-sm border-b border-border dark:border-border-dark">
            <p>Name</p>
            <p>Default Shortcut</p>
            <p>Custom Shortcut</p>
            <p>Actions</p>
          </div>
          <div className="overflow-auto divide-y divide-border dark:divide-border-dark">
            {filteredShortuts.length > 0 ? (
              filteredShortuts.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_1fr_1fr_64px] items-center p-1 gap-4 text-sm"
                >
                  <div className="flex flex-col">
                    <p>{formatActionName(shortcut.action)}</p>
                    <p className="truncate text-xs text-text-muted">{shortcut.description}</p>
                  </div>

                  <div className="flex items-center">
                    {shortcut.defaultKey.split('+').map((key, idx) => (
                      <div className="px-0.5 content-center text-sm">{keyIconMap[key] || key}</div>
                    ))}
                  </div>
                  <div>
                    {shortcut.customKey ? (
                      <div className="flex items-center">
                        {shortcut.customKey.split('+').map((key, idx) => (
                          <div className="px-0.5 content-center text-sm">
                            {keyIconMap[key] || key}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted">No custom keys</p>
                    )}
                  </div>
                  <div>
                    {shortcut.customKey ? (
                      <div className="flex gap-2 justify-end mr-2">
                        <Button variant={'iconGhost'} onClick={() => handleReset(shortcut.action)}>
                          <RotateCcw size={16} strokeWidth={1.5} />
                        </Button>
                        <Button
                          className="focus:outline-none"
                          variant={'iconGhost'}
                          onClick={() => startRecording(shortcut.action)}
                        >
                          <PenLine size={16} strokeWidth={1.5} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end mr-2">
                        <Button
                          className="focus:outline-none"
                          variant={'iconGhost'}
                          onClick={() => startRecording(shortcut.action)}
                        >
                          <PenLine size={16} strokeWidth={1.5} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-1 text-sm text-text-muted">No shortcuts found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsShortcuts
