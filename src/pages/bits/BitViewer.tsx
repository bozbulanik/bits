import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBitsStore } from '../../stores/bitsStore'
import { Bit, BitTypePropertyDefinitionType } from '../../types/Bit'
import Button from '../../components/Button'
import { AtSign, CalendarArrowDown, CalendarArrowUp, MoreHorizontal, PanelRightClose, PanelRightOpen, SmilePlus, Trash, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import ToggleButton from '../../components/ToggleButton'
import { Tooltip } from '../../components/Tooltip'
import { renderTextualDataValue } from '../../utils/getDataValue'
const getTextValue = (bit: Bit) => {
  if (!bit) return undefined
  const textProperty = bit.type.properties.find((property) => property.isTitle === true)
  if (!textProperty) return 'Untitled'
  const bitData = bit.data.find((data) => data.propertyId === textProperty.id)

  if (!bitData) return 'Untitled'

  return bitData.value as string
}

const BitViewer = () => {
  const { addBitNote, deleteBitNote } = useBitsStore()
  const [notesPanelOpened, setNotesPanelOpened] = useState<boolean>(true)
  const [bitNote, setBitNote] = useState<string>('')
  const [hoveredNoteId, setHoveredNoteId] = useState<string>('')
  const [notesSort, setNotesSort] = useState<string>('Oldest First')
  const [noteMode, setNoteMode] = useState<boolean>(false)
  const noteContainerRef = useRef<HTMLDivElement>(null)

  const { bitId } = useParams<{ bitId: string }>()
  if (!bitId) return <div>Invalid bit ID</div>

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (noteContainerRef.current && !noteContainerRef.current.contains(event.target as Node)) {
        setNoteMode(false)
      }
    }

    if (noteMode) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [noteMode])
  useEffect(() => {
    const fetchPinnedData = async () => {
      try {
        const bit = await useBitsStore.getState().getBitById(bitId)
        setBit(bit)
      } catch (error) {
        console.error('Error loading bits:', error)
      }
    }

    fetchPinnedData()

    const handleBitsUpdated = () => {
      fetchPinnedData()
    }

    window.ipcRenderer.on('bits-updated', handleBitsUpdated)
  }, [])

  const [bit, setBit] = useState<Bit>()

  useEffect(() => {
    if (bitId && bit === undefined) {
      const timeout = setTimeout(() => {
        window.ipcRenderer.send('closeWindow')
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [bitId, bit])

  if (!bit) return null

  const handleBitNoteAdd = () => {
    if (bitNote.trim()) addBitNote(bitId, bitNote)
  }

  const sortOptions = [
    { value: 'Oldest First', icon: <CalendarArrowDown size={16} strokeWidth={1.5} /> },
    { value: 'Newest First', icon: <CalendarArrowUp size={16} strokeWidth={1.5} /> }
  ]

  return (
    <div className="w-full h-full flex flex-col">
      <div className=" flex items-center p-2 gap-2 border-b border-border dark:border-border-dark">
        <div className="flex-1 h-full flex items-center gap-2 drag-bar">
          <p className=" font-semibold text-lg ml-1">{getTextValue(bit)}</p>
        </div>
        <Tooltip className="ml-auto " mode="fixed" delayShow={500} content={'Open Notes Panel'} offsetPosition={[-128, -4]}>
          <Button onClick={() => setNotesPanelOpened((prev) => !prev)} variant={'iconGhost'} className="">
            {notesPanelOpened ? <PanelRightClose size={16} strokeWidth={1.5} /> : <PanelRightOpen size={16} strokeWidth={1.5} />}
          </Button>{' '}
        </Tooltip>
        <Button onClick={() => {}} variant={'iconGhost'} className="">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </Button>
        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex items-center min-h-0 overflow-hidden relative h-full">
        <motion.div
          className="flex p-2 overflow-auto h-full flex-col"
          initial={{ width: '100%' }}
          animate={{
            width: notesPanelOpened ? '60%' : '100%'
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut'
          }}
        >
          <div className="flex flex-col gap-2">
            {bit.type.properties.map((prop, index) => {
              const bitData = bit.data.find((data: any) => data.propertyId === prop.id)

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-2 border border-transparent hover:border-border hover:dark:border-border-dark rounded-md bg-scry-bg dark:bg-scry-bg-dark"
                >
                  <p className="text-md text-text-muted font-semibold">{prop.name}</p>
                  {bitData ? (
                    <span className="text-sm">{renderTextualDataValue(prop.type, bitData.value, 15)}</span>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-text-muted italic">No data</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
        <motion.div
          ref={noteContainerRef}
          className="overflow-auto flex flex-col border-l border-border dark:border-border-dark absolute right-0 h-full"
          style={{ width: '40%' }}
          initial={{ x: '100%' }}
          animate={{
            x: notesPanelOpened ? '0%' : '100%'
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut'
          }}
        >
          <div className="p-2 flex items-center">
            <p className="px-2 font-semibold text-lg truncate">Notes</p>
            <Tooltip className="ml-auto " mode="fixed" delayShow={500} content={notesSort} offsetPosition={[-96, -2]}>
              <ToggleButton
                className="text-text-muted  hover:text-text hover:dark:text-text-dark"
                value={notesSort}
                variant="ghost"
                options={sortOptions}
                onChange={setNotesSort}
              />
            </Tooltip>
          </div>
          <div className="px-2 pb-2">
            <div
              className={`flex flex-col gap-2 transition-all duration-300 ease-in-out ${
                noteMode ? 'bg-scry-bg dark:bg-scry-bg-dark rounded-lg' : ''
              }`}
            >
              <textarea
                value={bitNote}
                onChange={(e) => setBitNote(e.target.value)}
                onClick={() => {
                  setNoteMode(true)
                }}
                spellCheck={false}
                placeholder="Add note..."
                className="p-2 placeholder:text-text-muted/75 w-full field-sizing-content max-h-32 text-sm ml-auto resize-none focus:outline-none "
              />
              <AnimatePresence>
                {noteMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.4 }}
                    className="p-1 flex items-center gap-2"
                  >
                    <Button className="text-text-muted" variant={'iconGhost'}>
                      <SmilePlus size={16} strokeWidth={1.5} />
                    </Button>
                    <Button className="text-text-muted" variant={'iconGhost'}>
                      <AtSign size={16} strokeWidth={1.5} />
                    </Button>
                    <Button onClick={handleBitNoteAdd} className="ml-auto" variant={'default'}>
                      Add Note
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="p-2 flex flex-col gap-2 overflow-auto w-full h-full">
            {bit.notes.length > 0 ? (
              bit.notes
                .slice()
                .sort((a, b) => {
                  if (notesSort === 'Oldest First') {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  } else if (notesSort === 'Newest First') {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  }
                  return 0
                })
                .map((note, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredNoteId(note.id)}
                    onMouseLeave={() => setHoveredNoteId('')}
                    className="bg-scry-bg dark:bg-scry-bg-dark rounded-md p-2"
                  >
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <p>{formatDistanceToNow(note.createdAt, { addSuffix: true, includeSeconds: true })}</p>
                      <Button
                        onClick={() => {
                          deleteBitNote(note.id)
                        }}
                        className={`ml-auto ${hoveredNoteId === note.id ? 'opacity-100' : 'opacity-0'}`}
                        variant={'iconDestructiveGhost'}
                      >
                        <Trash size={16} strokeWidth={1.5} />
                      </Button>
                    </div>
                    <div className="py-2">
                      <p className="text-sm select-text">{note.content}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="font-semibold">No notes yet</p>
                <p className="text-sm text-text-muted">Add some notes</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BitViewer
