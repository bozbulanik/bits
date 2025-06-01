import { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { BadgeAlert, ChevronRight, Library, Plus, Trash, TriangleAlert, X } from 'lucide-react'
import { useCollectionsStore } from '../../stores/collectionsStore'
import { useNavigate } from 'react-router-dom'
import { Collection } from '../../types/Bit'
import { getIconComponent } from '../../utils/getIcon'
import { AnimatePresence, motion } from 'framer-motion'

const Collections = () => {
  const navigate = useNavigate()
  const { collections, deleteCollection, getBitCount } = useCollectionsStore()

  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>('')
  const [collectionDeletePanelOpened, setCollectionDeletePanelOpened] = useState<boolean>(false)
  const [collectionIdToDelete, setCollectionIdToDelete] = useState<string>('')
  const [bitCount, setBitCount] = useState<number>()

  const panelRef = useRef<HTMLDivElement>(null)

  const openCollectionDeletePanel = (id: string) => {
    setCollectionDeletePanelOpened(true)
    setCollectionIdToDelete(id)
    setBitCount(getBitCount(id))
  }
  const handleCollectionDelete = () => {
    deleteCollection(collectionIdToDelete)
    setCollectionIdToDelete('')
    setCollectionDeletePanelOpened(false)
    setBitCount(0)
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setCollectionDeletePanelOpened(false)
      }
    }
    if (collectionDeletePanelOpened) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [collectionDeletePanelOpened])

  return (
    <div className="w-full h-full flex flex-col relative">
      <AnimatePresence mode="wait">
        {collectionDeletePanelOpened && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full h-full pointer-events-auto z-50 backdrop-blur-xs bg-bg/75 dark:bg-bg-dark/75"
          >
            <div
              ref={panelRef}
              className="absolute w-96 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border border-border dark:border-border-dark bg-bg dark:bg-bg-dark rounded-md flex flex-col items-center"
            >
              <div className="flex flex-col pb-2 px-4 pt-4 w-full">
                <p className="font-semibold">Delete Collection</p>
              </div>

              {bitCount && bitCount > 0 ? (
                <div className="w-full p-2">
                  <div className="p-1 flex rounded-lg items-center text-orange-500 gap-2 bg-warning-bg dark:bg-warning-bg-dark sborder border-warning-border dark:border-warning-border-dark w-full">
                    <TriangleAlert size={24} strokeWidth={1.5} color="var(--color-orange-500)" />
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">This action cannot be undone.</p>
                      <p className="text-sm">
                        {bitCount && bitCount > 1 ? (
                          <>
                            There are <span className="font-semibold ">{bitCount} bits</span>{' '}
                          </>
                        ) : (
                          <>
                            There is <span className="font-semibold"> {bitCount} bit </span>{' '}
                          </>
                        )}
                        in this collection.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}

              <div className="flex gap-2 items-center w-full p-2">
                <Button onClick={() => setCollectionDeletePanelOpened(false)} className="ml-auto" variant={'ghost'}>
                  Cancel
                </Button>
                <Button onClick={handleCollectionDelete} variant={'destructive'}>
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className=" flex items-center p-2 gap-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold text-lg">Collections</p>
        </div>
        <Button onClick={() => window.ipcRenderer.invoke('closeWindow', 'collections')} variant={'iconGhost'} className="ml-auto">
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="p-2 flex items-center justify-center gap-2">
        <Button onClick={() => navigate('/collections/create-collection')} className="w-full" variant={'default'}>
          <Plus size={16} strokeWidth={1.5} />
          New Collection
        </Button>
      </div>
      <div className="flex flex-col gap-2 flex-1 w-full overflow-auto p-2">
        {collections.length > 0 ? (
          <>
            <p className="text-sm uppercase font-semibold text-text-muted">All Collections</p>
            <div className="flex flex-col gap-1">
              {collections.map((collection: Collection, index: number) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCollectionId(collection.id)}
                  onMouseLeave={() => setHoveredCollectionId(null)}
                  className="bg-scry-bg dark:bg-scry-bg-dark border border-transparent hover:border-button-border dark:hover:border-button-border-dark flex items-center gap-2 cursor-pointer rounded-md"
                >
                  <div
                    onClick={() => window.ipcRenderer.invoke('openWindow', 'collections', 'view', collection.id, 720, 720)}
                    className="p-2 w-full flex items-center gap-2"
                  >
                    <div className="bg-bg-hover dark:bg-bg-hover-dark p-2 rounded-md">
                      {collection.iconName ? (
                        (() => {
                          const Icon = getIconComponent(collection.iconName)
                          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
                        })()
                      ) : (
                        <BadgeAlert size={16} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm">{collection.name}</p>
                      <>
                        {(() => {
                          const bitCount = getBitCount(collection.id)
                          const label = bitCount === 1 ? 'bit' : 'bits'

                          return (
                            <p className="text-xs text-text-muted line-clamp-1">
                              {bitCount} {label}
                            </p>
                          )
                        })()}
                      </>
                    </div>
                  </div>
                  <div className="p-2">
                    {hoveredCollectionId === collection.id ? (
                      <Button className="ml-auto" onClick={() => openCollectionDeletePanel(collection.id)} variant={'iconDestructiveGhost'}>
                        <Trash size={16} strokeWidth={1.5} />
                      </Button>
                    ) : (
                      <div className="p-1 ml-auto">
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <Library size={48} strokeWidth={1} className="text-text-muted" />
              <p className="font-semibold text-lg">No collections</p>
              <p className="text-text-muted text-sm">Add your first collection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collections
