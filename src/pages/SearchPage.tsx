import React, { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { BrushCleaning, Search, X } from 'lucide-react'
import { clearBitsHistory, getBitIdsFromHistory } from '../utils/searchHistory'
import { useBitsStore } from '../stores/bitsStore'
import { Bit } from '../types/Bit'

const SearchPage = () => {
  const { getBitById } = useBitsStore()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [recentlyOpenedBitIds, setRecentlyOpenedBitIds] = useState<string[]>([])
  useEffect(() => {
    const history = getBitIdsFromHistory()
    setRecentlyOpenedBitIds(history)
  }, [])

  const [pinnedBits, setPinnedBits] = useState<Bit[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const data = await window.ipcRenderer.invoke('getStructuredPinnedBits')
      setPinnedBits(data)
    }
    fetchAll()
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="h-12 p-2 flex gap-2 items-center border-b border-border dark:border-border-dark">
        <Input
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<Search size={16} strokeWidth={1.5} />}
          inputSize={'md'}
          placeholder="Search..."
          variant={'ghost'}
        />
        <div className="drag-bar h-full flex-1">&nbsp;</div>

        <Button
          className="ml-auto"
          onClick={() => {
            if (searchQuery != '') {
              setSearchQuery('')
            } else {
              window.ipcRenderer.invoke('closeWindow', 'search')
            }
          }}
          variant={'icon'}
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex gap-2 flex-1 w-full overflow-auto">
        <div className="flex flex-col gap-2 flex-1 ">
          <div className="p-2 flex flex-col gap-2">
            <p className="text-sm uppercase font-semibold text-text-muted">Recent</p>
            <div className="flex flex-col">
              {recentlyOpenedBitIds.map((bitId, index) => {
                const bit = getBitById(bitId)
                if (!bit) return null
                return <div>{bit.id}</div>
              })}
            </div>
          </div>
          <div className="p-2 flex flex-col gap-2">
            <p className="text-sm uppercase font-semibold text-text-muted">Pinned</p>
            <div className="flex flex-col">
              {pinnedBits.map((bit, index) => (
                <div>{bit.id}</div>
              ))}
            </div>
          </div>
          <div className="p-2 flex flex-col gap-2">
            <p className="text-sm uppercase font-semibold text-text-muted">Collections</p>
            <div className="flex flex-col"></div>
          </div>
          <div className="p-2 flex flex-col gap-2">
            <p className="text-sm uppercase font-semibold text-text-muted">Quick Actions</p>
            <div className="flex flex-col"></div>
          </div>
        </div>
        {searchQuery && (
          <div className="w-48 border-l border-border dark:border-border-dark">
            <div className="w-full h-full flex flex-col">
              <div className="p-2 flex gap-2 border-b border-border dark:border-border-dark">
                <p>Name</p>
              </div>
              <div className="p-2 flex-1 flex flex-col">
                <p className="text-sm uppercase font-semibold text-text-muted">Details</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
