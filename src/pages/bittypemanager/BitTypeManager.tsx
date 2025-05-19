import { ChevronDown, ChevronRight, Plus, Trash, X } from 'lucide-react'
import Button from '../../components/Button'
import { useBitTypesStore } from '../../stores/bitTypesStore'
import { BitTypeDefinition } from '../../types/Bit'
import { useState } from 'react'
import { getIconComponent, getPropertyIcon } from '../../utils/getIcon'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
const BitTypeManager = () => {
  const navigate = useNavigate()
  const { bitTypes, deleteBitType } = useBitTypesStore()
  const [hoveredBitTypeId, setHoveredBitTypeId] = useState<string | null>('')
  const [expandedBitTypeIds, setExpandedBitTypeIds] = useState<Set<string>>(new Set())

  const toggleBitType = (bitTypeId: string) => {
    setExpandedBitTypeIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(bitTypeId)) {
        newSet.delete(bitTypeId)
      } else {
        newSet.add(bitTypeId)
      }
      return newSet
    })
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold">Bit Type Manager</p>
        </div>
        <Button
          onClick={() => window.ipcRenderer.invoke('closeWindow', 'bittypemanager')}
          variant={'icon'}
          className="ml-auto"
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="p-2 bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark flex items-center gap-2">
        <Button
          onClick={() => navigate('/bittypemanager/create')}
          className="ml-auto"
          variant={'default'}
        >
          <Plus size={16} strokeWidth={1.5} />
          Create New Bit Type
        </Button>
      </div>
      <div className="flex flex-col gap-2 flex-1 w-full overflow-auto p-2">
        <p className="text-sm uppercase font-semibold text-text-muted">Bit Types</p>
        <div className="flex flex-col gap-1">
          {bitTypes.length > 0 ? (
            bitTypes.map((bitType: BitTypeDefinition) => (
              <div
                onMouseEnter={() => setHoveredBitTypeId(bitType.id)}
                onMouseLeave={() => setHoveredBitTypeId(null)}
                className={`flex flex-col border rounded-md p-0.5 bg-transparent hover:bg-scry-bg hover:dark:bg-scry-bg-dark ${
                  expandedBitTypeIds.has(bitType.id)
                    ? 'border-border dark:border-border-dark'
                    : 'border-transparent hover:border-border dark:hover:border-border-dark'
                }`}
              >
                <div
                  className={`cursor-pointer flex flex-1 gap-2 items-center ${
                    expandedBitTypeIds.has(bitType.id)
                      ? 'border-b border-border dark:border-border-dark'
                      : ''
                  }`}
                >
                  <div>
                    {hoveredBitTypeId == bitType.id ? (
                      <div className="rounded-md ">
                        <Button onClick={() => toggleBitType(bitType.id)} variant={'iconGhost'}>
                          {expandedBitTypeIds.has(bitType.id) ? (
                            <ChevronDown size={16} strokeWidth={1.5} />
                          ) : (
                            <ChevronRight size={16} strokeWidth={1.5} />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md p-1.25">
                        {(() => {
                          const Icon = getIconComponent(bitType.iconName)
                          return Icon ? <Icon size={16} strokeWidth={1.5} /> : null
                        })()}
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => navigate(`/bittypemanager/edit/${bitType.id}`)}
                    className="flex-1 h-full flex items-center"
                  >
                    <p className="text-sm font-semibold">{bitType.name}</p>
                  </div>
                  <div
                    className={`pl-2 flex ml-auto ${
                      hoveredBitTypeId == bitType.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Button
                      onClick={() => deleteBitType(bitType.id)}
                      variant={'iconDestructiveGhost'}
                    >
                      <Trash size={16} strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {expandedBitTypeIds.has(bitType.id) && (
                    <motion.div
                      layout
                      initial={{
                        opacity: 0,
                        height: 0
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto'
                      }}
                      exit={{
                        opacity: 0,
                        height: 0
                      }}
                      transition={{
                        duration: 0.2
                      }}
                      className="overflow-hidden flex flex-col text-sm divide-y divide-border/75 dark:divide-border-dark/75"
                    >
                      {bitType.properties.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex items-center divide-x divide-border/75 dark:divide-border-dark/75"
                        >
                          <span className="p-1 text-text-muted">{getPropertyIcon(prop.type)}</span>
                          <div className="flex w-full justify-between items-center divide-x divide-border/75 dark:divide-border-dark/75">
                            <span className="w-1/3 p-1 px-2 text-text-muted truncate">
                              {prop.name}
                            </span>
                            <span className="w-1/3 p-1 px-2 text-text-muted truncate">
                              {prop.defaultValue ? prop.defaultValue : 'No default value'}
                            </span>
                            <span className="w-1/3 p-1 px-2 text-text-muted">
                              {prop.required ? 'Required' : 'Not required'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No bit types</p>
          )}
        </div>
      </div>
      <div className="p-2 h-12 mt-auto border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default BitTypeManager
