import { useEffect, useRef, useState } from 'react'
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
  Option,
  PenLine,
  RotateCcw,
  Search,
  Space,
  X
} from 'lucide-react'
import KeyCompponent from '../../components/KeyComponent'
import Button from '../../components/Button'
import { Tooltip } from '../../components/Tooltip'

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
  const { shortcuts, updateShortcut, resetShortcut, resetShortcuts } = useShortcutsStore()

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredShortuts = shortcuts.filter((shortcut) => shortcut.action.includes(searchQuery.toLocaleLowerCase()))

  const handleReset = async (action: string) => {
    await resetShortcut(action)
  }

  const [recordingAction, setRecordingAction] = useState<string | null>(null)
  const [currentInput, setCurrentInput] = useState<string>('')
  const startRecording = (action: string) => {
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

  const shortcutRecorder = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shortcutRecorder.current && !shortcutRecorder.current.contains(e.target as Node)) {
        cancelRecording()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <div className="relative w-full h-full flex-col gap-2">
      {recordingAction != null && (
        <>
          <div className="absolute inset-0 backdrop-blur-xs pointer-events-none z-0 top-0 left-0 w-full h-full" />
          <div
            ref={shortcutRecorder}
            tabIndex={0}
            autoFocus
            onKeyDown={handleKeyDown}
            className="focus:outline-none w-64 h-48 flex flex-col gap-2 p-2 absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-10 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-lg"
          >
            <div className="flex items-center">
              <p className="text-md font-semibold">{recordingAction}</p>
              <Button variant={'iconGhost'} className="ml-auto" onClick={cancelRecording}>
                <X size={16} strokeWidth={1.5} />
              </Button>
            </div>
            {currentInput ? (
              <div className="w-full h-full flex flex-col gap-2">
                <div className="w-full h-full bg-scry-bg dark:bg-scry-bg-dark rounded-md p-2 flex flex-col items-center justify-evenly">
                  <div className="flex items-center gap-2">
                    {currentInput.split('+').map((key, idx) => (
                      <KeyCompponent key={idx}>{keyIconMap[key] || key}</KeyCompponent>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">{currentInput}</p>
                </div>
                <div className="flex gap-2 items-center mt-auto w-full">
                  <Button onClick={saveShortcut} className="ml-auto w-full" variant={'default'}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm">Type on your keyboard</p>
              </div>
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
            leftSection={
              <div className="pl-2 pr-1">
                <Search size={16} strokeWidth={1.5} />
              </div>
            }
          />
          <Button onClick={resetShortcuts} variant={'default'} className="ml-auto">
            <RotateCcw size={16} strokeWidth={1.5} />
            Restore all to default
          </Button>
        </div>
        <div className="border border-border dark:border-border-dark rounded-md min-h-0 flex flex-col">
          <div className="grid grid-cols-[1fr_1fr_1fr_64px] font-semibold p-1 gap-4 text-sm border-b border-border dark:border-border-dark bg-scry-bg dark:bg-scry-bg-dark">
            <p>Name</p>
            <p>Default Shortcut</p>
            <p>Custom Shortcut</p>
            <p>Actions</p>
          </div>
          <div className="overflow-auto divide-y divide-border dark:divide-border-dark">
            {filteredShortuts.length > 0 ? (
              filteredShortuts.map((shortcut, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_64px] items-center p-1 gap-4 text-sm">
                  <div className="flex flex-col">
                    <p>{formatActionName(shortcut.action)}</p>
                    <p className="truncate text-xs text-text-muted">{shortcut.description}</p>
                  </div>
                  <Tooltip content={shortcut.defaultKey} mode="cursor" offsetPosition={[-16, -32]}>
                    <div className="flex items-center gap-1">
                      {shortcut.defaultKey.split('+').map((key, idx) => (
                        <KeyCompponent key={idx}>{keyIconMap[key] || key}</KeyCompponent>
                      ))}
                    </div>
                  </Tooltip>

                  <div>
                    {shortcut.customKey ? (
                      <Tooltip content={shortcut.customKey} mode="cursor" offsetPosition={[-16, -32]}>
                        <div className="flex items-center gap-1">
                          {shortcut.customKey.split('+').map((key, idx) => (
                            <KeyCompponent key={idx}>{keyIconMap[key] || key}</KeyCompponent>
                          ))}
                        </div>
                      </Tooltip>
                    ) : (
                      <p className="text-text-muted">No custom keys</p>
                    )}
                  </div>
                  <div>
                    {shortcut.customKey ? (
                      <div className="flex gap-2 justify-end mr-2">
                        <Tooltip content="Reset shortcut" mode="fixed" offsetPosition={[-105, -3]} delayShow={200}>
                          <Button variant={'iconGhost'} onClick={() => handleReset(shortcut.action)}>
                            <RotateCcw size={16} strokeWidth={1.5} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Change shortcut" mode="fixed" offsetPosition={[-120, -3]} delayShow={200}>
                          <Button className="focus:outline-none" variant={'iconGhost'} onClick={() => startRecording(shortcut.action)}>
                            <PenLine size={16} strokeWidth={1.5} />
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end mr-2">
                        <Tooltip content="Change shortcut" mode="fixed" offsetPosition={[-120, -3]} delayShow={200}>
                          <Button className="focus:outline-none" variant={'iconGhost'} onClick={() => startRecording(shortcut.action)}>
                            <PenLine size={16} strokeWidth={1.5} />
                          </Button>
                        </Tooltip>
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
