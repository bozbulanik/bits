import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCollectionsStore } from '../../stores/collectionsStore'
import Button from '../../components/Button'
import {
  ArrowDownNarrowWide,
  ChevronLeft,
  ChevronRight,
  Filter,
  GripVertical,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash,
  X
} from 'lucide-react'

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import CollectionItemPage from './CollectionItemPage'
import { useBitsStore } from '../../stores/bitsStore'
import { getIconComponent } from '../../utils/getIcon'
import { Bit, BitData, BitTypePropertyDefinition, CollectionItem } from '../../types/Bit'
import Input from '../../components/Input'

function CollectionItemComponent({
  id,
  collectionItem,
  handleDeleteItem
}: {
  id: string
  collectionItem: CollectionItem
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
        <div className="flex-1 flex items-center gap-2">
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

function CollectionItemComp({
  id,
  collectionItem,
  handleDeleteItem
}: {
  id: number
  collectionItem: CollectionItem
  handleDeleteItem: (id: string) => void
}) {
  return <div key={id}>{collectionItem.bitId}</div>
}

const CollectionView = () => {
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
  return (
    <div className="w-full h-full flex flex-col">
      <div className=" flex items-center p-2 gap-2">
        {/* <Button onClick={() => window.ipcRenderer.invoke('openWindow', 'collections', '', '', 480, 720)} variant={'iconGhost'}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button> */}
        <div className="flex-1 h-full flex gap-2 items-center drag-bar">
          <div className="p-1"> {IconComponent && <IconComponent size={16} strokeWidth={1.5} />}</div>
          <p className="ml-1 font-semibold text-lg">{collection?.name}</p>
        </div>
        <Button variant={'iconGhost'} className="ml-auto">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </Button>
        <Button onClick={() => window.ipcRenderer.invoke('closeWindow', 'collections')} variant={'iconGhost'}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 p-2">
          <Input
            leftSection={
              <div className="p-2 text-text-muted">
                <Search size={16} strokeWidth={1.5} />
              </div>
            }
            className=""
            autoFocus
            placeholder="Search for bits..."
          />
          <Button variant={'ghost'} className="ml-auto">
            <Filter size={16} strokeWidth={1.5} /> Filter
          </Button>
          <Button variant={'ghost'}>
            <ArrowDownNarrowWide size={16} strokeWidth={1.5} /> Sort
          </Button>
          <Button variant={'default'} className="bg-scry-bg dark:bg-scry-bg-dark">
            <Plus size={16} strokeWidth={1.5} />
            Add new item
          </Button>
        </div>
        <div className="p-2 flex flex-col gap-2 overflow-auto h-full">
          <div className="overflow-auto h-full">
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
    </div>
  )
}

export default CollectionView
//  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
//                 <SortableContext items={currentCollectionItems.map((p) => p.id)} strategy={verticalListSortingStrategy}>
//                   <div className="flex flex-col gap-1">
//                     {currentCollectionItems.map((collectionItem) => (
//                       <CollectionItemComponent
//                         key={collectionItem.id}
//                         id={collectionItem.id}
//                         collectionItem={collectionItem}
//                         handleDeleteItem={handleDeleteItem}
//                       />
//                     ))}
//                   </div>
//                 </SortableContext>
//               </DndContext>
