import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { ChevronRight, MessageSquare, Search, Trash, X } from 'lucide-react'
import Input from '../../components/Input'
import { AIChat } from '../../types/Bit'
import { format } from 'date-fns'

interface ChatComponentProps {
  chat: AIChat
}
const ChatComponent: React.FC<ChatComponentProps> = ({ chat }) => {
  const [hovered, setHovered] = useState<boolean>(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.ipcRenderer.invoke('openWindow', 'ai_window', `ai/${chat.id}`, 'Bit | AI', 480, 720, true)}
      className="bg-scry-bg dark:bg-scry-bg-dark border border-transparent hover:border-button-border dark:hover:border-button-border-dark flex items-center gap-2 cursor-pointer rounded-md"
    >
      <div className="p-4 w-full flex items-center gap-2">
        <div className="flex flex-col w-full">
          <p className="text-xs text-text-muted flex items-center gap-1">
            <MessageSquare size={16} strokeWidth={1.5} /> {chat.messages.length - 1}
          </p>
          <p className="line-clamp-1 text-sm">{chat.title ? chat.title : chat.messages[chat.messages.length - 1].content}</p>
          <p className="text-xs text-text-muted italic">Last message at {format(new Date(chat.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>
      <div className="p-2">
        {hovered ? (
          <Button className="ml-auto" variant={'iconDestructiveGhost'}>
            <Trash size={16} strokeWidth={1.5} />
          </Button>
        ) : (
          <div className="p-1 ml-auto">
            <ChevronRight size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE = 10

const AIChats = () => {
  const [chats, setChats] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadMoreChats = async () => {
    const newChats = await window.ipcRenderer.invoke('getAIChats', PAGE_SIZE, PAGE_SIZE * page)

    if (newChats.length < PAGE_SIZE) setHasMore(false)
    setChats((prev) => [...prev, ...newChats])
    setPage((prev) => prev + 1)
  }

  useEffect(() => {
    loadMoreChats()
  }, [])
  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center p-2 gap-2">
        <div className="flex-1 h-full flex items-center gap-2 drag-bar">
          <p className="font-semibold text-lg ml-1">AI Chats</p>
          <p className="text-text-muted text-xs">Page {page}</p>
        </div>

        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="p-2">
        <Input
          leftSection={
            <div className="pl-1 text-text-muted">
              <Search size={16} strokeWidth={1.5} />
            </div>
          }
          placeholder="Search chats..."
        />
      </div>
      <div
        onScroll={(e) => {
          const el = e.target as HTMLElement
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && hasMore) {
            loadMoreChats()
          }
        }}
        className="p-2 flex flex-col gap-1 overflow-auto"
      >
        {chats.map((chat) => (
          <ChatComponent chat={chat} />
        ))}
        {!hasMore && <div className="text-center text-text-muted text-sm">No more chats</div>}
      </div>
    </div>
  )
}

export default AIChats
