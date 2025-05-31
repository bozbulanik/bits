import { ChevronLeft, ChevronRight, GripVertical, Image, ImagePlus, Pencil, Plus, Trash, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { getIconComponent } from '../../utils/getIcon'
import LucideIconList from '../../components/LucideIconList'
import Input from '../../components/Input'
import { Bit, BitData, BitTypePropertyDefinition, CollectionItem } from '../../types/Bit'

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import CollectionItemPage from './CollectionItemPage'
import { useBitsStore } from '../../stores/bitsStore'
import { useCollectionsStore } from '../../stores/collectionsStore'

function CollectionItemComponent({
  id,
  collectionItem,
  setView,
  handleDeleteItem
}: {
  id: string
  collectionItem: CollectionItem
  setView: (view: string) => void
  handleDeleteItem: (id: string) => void
}) {
  const { getBitById } = useBitsStore()
  const referencedBit = getBitById(collectionItem.bitId)
  if (!referencedBit) return

  const IconComponent = getIconComponent(referencedBit.type.iconName)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  const [hovered, setHovered] = useState<boolean>(false)

  const getTextValue = (bit: Bit) => {
    const textProperty = bit.type.properties.find((property: BitTypePropertyDefinition) => property.type === 'text')
    const bitData = bit.data.find((data: BitData) => data.propertyId === textProperty?.id)
    return bitData?.value || 'Untitled'
  }
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-scry-bg dark:bg-scry-bg-dark border border-transparent hover:border-button-border dark:hover:border-button-border-dark cursor-pointer rounded-md"
      ref={setNodeRef}
      style={style}
    >
      <div className="w-full flex items-center gap-2 p-2">
        <GripVertical
          className="text-text-muted cursor-pointer focus:outline-none focus-visible:outline-none"
          size={16}
          strokeWidth={1.5}
          {...attributes}
          {...listeners}
        />
        <div
          onClick={() => {
            setView('editProperty')
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="bg-bg-hover dark:bg-bg-hover-dark p-2 rounded-md">{IconComponent && <IconComponent size={16} strokeWidth={1.5} />}</div>
          <div className="flex flex-col flex-1">
            <p className="text-sm">{getTextValue(referencedBit)}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center justify-center h-6.5 w-6.5">
          {hovered ? (
            <Button onClick={() => handleDeleteItem(collectionItem.id)} variant={'iconDestructiveGhost'}>
              <Trash size={16} strokeWidth={1.5} />
            </Button>
          ) : (
            <ChevronRight size={16} strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
const CollectionEdit = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { collections, updateCollection } = useCollectionsStore()

  const collection = collectionId ? collections.find((collection) => collection.id === collectionId) : undefined

  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setIconName(collection.iconName)
      setCurrentCollectionItems(collection.items)
    }
  }, [collection])

  const [view, setView] = useState<string>('mainView')

  const navigate = useNavigate()
  const [name, setName] = useState<string>('')
  const [iconName, setIconName] = useState<string>('')
  const [collectionIconHovered, setCollectionIconHovered] = useState<boolean>(false)
  const iconButtonRef = useRef(null)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
  const IconComponent = getIconComponent(iconName)
  const [collectionWarningMessage, setCollectionWarningMessage] = useState<string>('')
  const [currentCollectionItems, setCurrentCollectionItems] = useState<CollectionItem[]>([])

  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = currentCollectionItems.findIndex((p) => p.id === active.id)
    const newIndex = currentCollectionItems.findIndex((p) => p.id === over.id)

    const newItems = arrayMove(currentCollectionItems, oldIndex, newIndex)

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      orderIndex: index
    }))

    setCurrentCollectionItems(updatedItems)
  }

  const handleUpdateBits = (bitIds: Set<string>) => {
    setCurrentCollectionItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => bitIds.has(item.bitId))

      const existingBitIds = new Set(filteredItems.map((item) => item.bitId))

      const newItems: CollectionItem[] = []
      bitIds.forEach((id) => {
        if (!existingBitIds.has(id)) {
          newItems.push({
            id: crypto.randomUUID(),
            bitId: id,
            orderIndex: filteredItems.length + newItems.length
          })
        }
      })

      const allItems = [...filteredItems, ...newItems]
      return allItems.map((item, index) => ({
        ...item,
        orderIndex: index
      }))
    })
  }
  const handleDeleteItem = (id: string) => {
    setCurrentCollectionItems(currentCollectionItems.filter((ci) => ci.id !== id))
  }

  const getCurrentlySelectedBitIds = (): Set<string> => {
    return new Set(currentCollectionItems.map((item) => item.bitId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collection) return
    if (!name.trim()) {
      setCollectionWarningMessage('Collection name is required.')
      return
    }
    if (!iconName.trim()) {
      setCollectionWarningMessage('Collection icon is required.')
      return
    }

    setCollectionWarningMessage('')
    try {
      await updateCollection(collection?.id, name, iconName, collection?.createdAt, new Date().toISOString(), currentCollectionItems)
      navigate('/collections')
    } catch (error) {
      console.error('Error updating collection:', error)
    }
  }

  switch (view) {
    case 'mainView':
      return (
        <div className="w-full h-full flex flex-col">
          <div className=" flex items-center p-2 gap-2">
            <Button onClick={() => navigate('/collections')} variant={'iconGhost'}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Button>
            <div className="flex-1 h-full flex items-center drag-bar">
              <p className="ml-1 font-semibold text-lg">{name == '' ? 'Update Collection' : name}</p>
            </div>
            <Button onClick={() => window.ipcRenderer.invoke('closeWindow', 'collections')} variant={'iconGhost'} className="ml-auto">
              <X size={16} strokeWidth={1.5} />
            </Button>
          </div>
          <div className="flex flex-col h-full min-h-0">
            <div className="p-2">
              <div className="flex flex-col gap-2">
                <p className="text-text-muted font-semibold uppercase text-sm">Details</p>
                <div className="relative flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-muted">Collection Icon</p>
                  <div
                    ref={iconButtonRef}
                    onMouseEnter={() => setCollectionIconHovered(true)}
                    onMouseLeave={() => setCollectionIconHovered(false)}
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className={`text-text-muted relative p-1 cursor-pointer h-16 w-full border border-dashed border-border-dark/25 dark:border-border/25 rounded-md flex items-center justify-center `}
                  >
                    {iconName != '' ? IconComponent && <IconComponent size={28} strokeWidth={1.5} /> : <Image size={28} strokeWidth={1.5} />}
                    {collectionIconHovered && (
                      <div
                        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md ${
                          iconName == '' && collectionWarningMessage
                            ? 'bg-input-bg-error dark:bg-input-bg-error-dark '
                            : 'bg-button-bg dark:bg-button-bg-dark '
                        }`}
                      >
                        <ImagePlus size={28} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <LucideIconList
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelectIcon={setIconName}
                    containerRef={iconButtonRef}
                    initialIcon={iconName}
                    className="top-12 left-1/2 translate-x-[-50%]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-muted">Collection Name</p>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." />
                </div>
              </div>
            </div>

            <div className="p-2 flex flex-col gap-2 overflow-auto">
              <p className="text-text-muted font-semibold uppercase text-sm">Bits in this collection</p>
              <Button onClick={() => setView('addCollectionItem')} variant={'ghost'} className="bg-scry-bg dark:bg-scry-bg-dark">
                {currentCollectionItems.length > 0 ? (
                  <>
                    <Pencil size={16} strokeWidth={1.5} />
                    Update bits in this collection
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={1.5} />
                    Add bits to this collection
                  </>
                )}
              </Button>
              <div className="overflow-auto">
                {currentCollectionItems.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext items={currentCollectionItems.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1">
                        {currentCollectionItems.map((collectionItem) => (
                          <CollectionItemComponent
                            key={collectionItem.id}
                            id={collectionItem.id}
                            collectionItem={collectionItem}
                            handleDeleteItem={handleDeleteItem}
                            setView={setView}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-text-muted text-sm">No bit added yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 mt-auto">
            <Button className="w-full" onClick={handleSubmit}>
              Update Collection
            </Button>
          </div>
        </div>
      )
    case 'addCollectionItem':
      return <CollectionItemPage setView={setView} handleUpdateBits={handleUpdateBits} initialSelectedBitIds={getCurrentlySelectedBitIds()} />
  }
}

export default CollectionEdit
