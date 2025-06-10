import { useEffect, useState, useRef } from 'react'
import Button from '../../components/Button'
import { ArrowUp, Clock, Copy, Plus, Sparkles, Trash, TriangleAlert, X } from 'lucide-react'
import { useBitsStore } from '../../stores/bitsStore'
import { AIChat, AIMessage, Bit } from '../../types/Bit'
import { useSettingsStore } from '../../stores/settingsStore'
import { format } from 'date-fns'
import Combobox from '../../components/Combobox'
import { Tooltip } from '../../components/Tooltip'

import ollama from 'ollama/browser'
import { systemPrompt } from '../../utils/getSystemPrompt'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

interface MessageProps {
  message: AIMessage
  deleteMessage: (id: string) => void
  aiIsTyping: boolean
}

const MessageComponent: React.FC<MessageProps> = ({ message, deleteMessage, aiIsTyping }) => {
  const [messageHovered, setMessageHovered] = useState<boolean>(false)

  const handleCopy = (text: string) => {
    window.ipcRenderer.invoke('copyText', text)
  }

  return (
    <div
      onMouseEnter={() => setMessageHovered(true)}
      onMouseLeave={() => setMessageHovered(false)}
      className={`${message.role === 'user' ? 'ml-auto' : ''} w-96 flex flex-col gap-2`}
    >
      <div
        className={`p-2 flex flex-col gap-1 ${
          message.role === 'user' ? 'border border-input-border dark:border-input-border-dark rounded-md bg-input-bg dark:bg-input-bg-dark ' : ''
        }`}
      >
        <pre className="text-sm select-text whitespace-pre-wrap break-words font-sans">{message.content}</pre>
      </div>
      <div
        className={`flex items-center gap-2 transition-opacity duration-200 ${
          message.role === 'user'
            ? messageHovered
              ? 'opacity-100'
              : 'opacity-0'
            : message.role === 'assistant'
            ? messageHovered
              ? aiIsTyping
                ? 'opacity-0'
                : 'opacity-100'
              : 'opacity-0'
            : ''
        }`}
      >
        <p className="text-sm text-text-muted">{format(message.timestamp, 'MMM dd, yyyy HH:mm')}</p>
        <div className={`ml-auto flex items-center gap-2`}>
          <Tooltip content="Copy message" mode="fixed" offsetPosition={[-110, -4]}>
            <Button onClick={() => handleCopy(message.content)} variant={'iconGhost'}>
              <Copy size={16} strokeWidth={1.5} />
            </Button>
          </Tooltip>
          {message.role === 'user' && (
            <Button onClick={() => deleteMessage(message.id)} variant={'iconGhost'}>
              <Trash size={16} strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const getSystemPromptText = (name: string, surname: string, bio: string, systemPrompt: string) => {
  return `The bio of the user with the name and surname ${name} ${surname}: 
    ${bio}
    
    RULES OF ENGAGE:
    ${systemPrompt}`
}

const AIPage = () => {
  const { settings } = useSettingsStore()
  const [openWindows, setOpenWindows] = useState<string[]>()
  const [focusedWindows, setFocusedWindows] = useState<string[]>()
  const [openBitIds, setOpenBitIds] = useState<string[]>()
  const [openBits, setOpenBits] = useState<Bit[]>()

  const [messageQuery, setMessageQuery] = useState<string>('')
  const [currentMessages, setCurrentMessages] = useState<AIMessage[]>([
    {
      id: 'system-prompt',
      role: 'system',
      content: getSystemPromptText(settings.user.name, settings.user.surname, settings.user.bio, systemPrompt),
      timestamp: new Date()
    }
  ])
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null)
  const [loadingDots, setLoadingDots] = useState('')
  const [aiThinking, setAiThinking] = useState<boolean>(false)
  const [aiTyping, setAiTyping] = useState<boolean>(false)
  const [currentAIModel, setCurrentAIModel] = useState<string>('llama3.2')
  const [currentTitle, setCurrentTitle] = useState<string>('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, aiThinking, loadingDots])

  useEffect(() => {
    const initializeChat = () => {
      const now = new Date().toISOString()
      const newChat: AIChat = {
        id: crypto.randomUUID(),
        title: 'Untitled',
        createdAt: now,
        updatedAt: now,
        messages: currentMessages
      }
      setCurrentChat(newChat)
    }
    initializeChat()
  }, [])

  useEffect(() => {
    const getOpenedWindows = async () => {
      try {
        const currentlyOpenWindows = await window.ipcRenderer.invoke('getOpenWindows')
        const currentlyFocusedWindows = await window.ipcRenderer.invoke('getFocusedWindows')
        const currentlyOpenBitIds = await window.ipcRenderer.invoke('getOpenBits')

        setOpenWindows(currentlyOpenWindows)
        setFocusedWindows(currentlyFocusedWindows)
        setOpenBitIds(currentlyOpenBitIds)
      } catch (error) {
        console.error('Error loading:', error)
      }
    }

    getOpenedWindows()
  }, [openWindows, focusedWindows, openBitIds])

  useEffect(() => {
    const getBits = async () => {
      try {
        const bitPromises = openBitIds?.map((id: string) => useBitsStore.getState().getBitById(id)) ?? []
        const currentlyOpenBits = await Promise.all(bitPromises)
        const validBits = currentlyOpenBits.filter((bit): bit is Bit => bit !== undefined)

        setOpenBits(validBits)
      } catch (error) {
        console.error('Error loading bits:', error)
      }
    }

    getBits()
  }, [openBitIds])

  useEffect(() => {
    if (!aiThinking) return

    let i = 0
    const interval = setInterval(() => {
      setLoadingDots(['.', '..', '...'][i % 3])
      i++
    }, 500)

    return () => clearInterval(interval)
  }, [aiThinking])

  const handleSendMessage = async () => {
    if (!messageQuery.trim() || aiThinking || aiTyping) return

    const userMessage = { role: 'user', content: messageQuery, timestamp: new Date(), id: crypto.randomUUID() }
    setCurrentMessages((prev) => [...prev, userMessage])
    setMessageQuery('')
    setAiThinking(true)

    try {
      const response = await ollama.chat({
        model: currentAIModel,
        messages: [...currentMessages, userMessage]
      })

      setAiThinking(false)
      setLoadingDots('')
      const newTitle = await getAITitle(messageQuery, response.message.content)
      typeWriterEffect(response.message.content, newTitle)
    } catch (error) {
      console.error('Error:', error)
      setAiThinking(false)
      setLoadingDots('')
    }
  }

  const getAITitle = async (query: string, response: string) => {
    const msgs: AIMessage[] = [
      {
        id: 'TITLE_EXTRACTION',
        role: 'user',
        content: `QUESTION: ${query} ANSWER: ${response} Based on this conversation, what would be the description of this conversation? Just give me the maximum 100 characters long description. JUST THE DESCRIPTION, DO NOT USE I THINK, I GUESS OR ANYTHING LIKE THAT.`,
        timestamp: new Date()
      }
    ]
    try {
      const res = await ollama.chat({
        model: currentAIModel,
        messages: msgs
      })
      const newTitle = res.message.content
      setCurrentTitle(newTitle)
      return newTitle
    } catch (error) {
      console.error('Error:', error)
      return 'Untitled'
    }
  }

  const typeWriterEffect = (text: string, title: string) => {
    let i = 0
    const aiMessage = { role: 'assistant', content: '', timestamp: new Date(), id: crypto.randomUUID() }
    setCurrentMessages((prev) => [...prev, aiMessage])
    setAiTyping(true)
    const interval = setInterval(() => {
      setCurrentMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        const updatedMessages = [...prev.slice(0, -1), { ...lastMessage, content: text.slice(0, i + 1) }]
        return updatedMessages
      })

      i++
      if (i >= text.length) {
        clearInterval(interval)
        setAiTyping(false)
        if (currentChat) {
          setCurrentMessages((finalMessages) => {
            const updatedChat: AIChat = {
              ...currentChat,
              title: title || currentTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMessages
            }
            setCurrentChat(updatedChat)
            window.ipcRenderer.invoke('updateChat', updatedChat)
            return finalMessages
          })
        }
      }
    }, 25)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const [messageDeletePanelOpened, setMessageDeletePanelOpened] = useState<boolean>(false)
  const [selectedMessageIdToDelete, setSelectedMessageIdToDelete] = useState<string>()
  const messageDeletePanel = useRef<HTMLDivElement>(null)

  const handleDeleteMessage = (id: string) => {
    setCurrentMessages((prevMessages) => prevMessages.filter((message) => message.id !== id))
    setMessageDeletePanelOpened(false)
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!messageDeletePanel.current?.contains(event.target as Node)) {
        setMessageDeletePanelOpened(false)
      }
    }
    if (messageDeletePanelOpened) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [messageDeletePanelOpened])

  return (
    <div className="relative w-full h-full flex flex-col">
      <AnimatePresence mode="wait">
        {messageDeletePanelOpened && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full h-full pointer-events-auto z-50 backdrop-blur-xs bg-bg/75 dark:bg-bg-dark/75"
          >
            <div
              ref={messageDeletePanel}
              className="absolute w-96 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border border-border dark:border-border-dark bg-bg dark:bg-bg-dark rounded-md flex flex-col items-center"
            >
              <div className="flex flex-col pb-2 px-4 pt-4 w-full">
                <p className="font-semibold">Delete Message</p>
              </div>

              <div className="w-full p-2">
                <div className="p-1 flex rounded-lg items-center text-orange-500 gap-2 bg-warning-bg dark:bg-warning-bg-dark sborder border-warning-border dark:border-warning-border-dark w-full">
                  <TriangleAlert size={24} strokeWidth={1.5} color="var(--color-orange-500)" />
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-semibold">This action cannot be undone.</p>
                    <p className="text-sm">
                      All data will be lost and the AI ​​will no longer be able to retrieve any information from this message.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center w-full p-2">
                <Button onClick={() => setMessageDeletePanelOpened(false)} className="ml-auto" variant={'ghost'}>
                  Cancel
                </Button>
                <Button onClick={() => handleDeleteMessage(selectedMessageIdToDelete || '')} variant={'destructive'}>
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center p-2 gap-2">
        <div className="flex-1 h-full flex items-center gap-2 drag-bar">
          <p className="font-semibold text-lg ml-1 line-clamp-1">{currentTitle ? currentTitle : 'AI'}</p>
        </div>
        <Button
          onClick={() => window.ipcRenderer.invoke('openWindow', 'ai_window', 'ai/chats', 'Bits | AI Chat', 480, 720, false)}
          className="text-text-muted"
          variant={'iconGhost'}
        >
          <Clock size={16} strokeWidth={1.5} />
        </Button>
        <Button onClick={() => window.ipcRenderer.send('closeWindow')} variant={'iconGhost'}>
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>

      <div className="w-full h-full min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={messagesContainerRef} className="p-2 flex flex-col overflow-auto gap-2 scroll-smooth">
            {currentMessages
              .filter((msg) => msg.role !== 'system')
              .map((msg, idx) => (
                <MessageComponent
                  key={idx}
                  message={msg}
                  deleteMessage={(id) => {
                    setSelectedMessageIdToDelete(id)
                    setMessageDeletePanelOpened(true)
                  }}
                  aiIsTyping={aiTyping}
                />
              ))}
            {aiThinking && (
              <div className="p-2 flex items-center gap-2 text-purple-500">
                <Sparkles size={16} strokeWidth={1.5} /> AI is thinking{loadingDots}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="mt-auto p-2">
          <div className="bg-scry-bg dark:bg-scry-bg-dark rounded-md p-2 flex flex-col gap-2 rounded-md">
            <div className="flex items-center gap-2">
              <div className="h-7 flex items-center gap-1 rounded-md justify-center border border-border dark:border-border-dark px-2">
                <X size={16} strokeWidth={1.5} />
                <p className="text-sm">Test Bit</p>
              </div>
              <div className="h-7 flex items-center gap-1 rounded-md justify-center border border-border dark:border-border-dark px-2">
                <X size={16} strokeWidth={1.5} />
                <p className="text-sm">Test Bit 2</p>
              </div>
              <div className="h-7 flex items-center gap-1 rounded-md justify-center border border-border dark:border-border-dark px-2">
                <X size={16} strokeWidth={1.5} />
                <p className="text-sm">AI Notes</p>
              </div>
              <Button>
                <Plus size={16} strokeWidth={1.5} />
                <p className="text-sm">Add context</p>
              </Button>
            </div>

            <textarea
              autoFocus
              value={messageQuery}
              onChange={(e) => setMessageQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              disabled={aiThinking || aiTyping}
              className={`w-full field-sizing-content max-h-48 resize-none focus:outline-none placeholder-text-muted text-sm p-1 ${
                aiThinking || aiTyping ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex items-center">
              <Combobox dropDirection="up" placeholder="Select model" className="w-36" options={[]} selectedValues={[]} onChange={() => {}} />
              <Button disabled={aiThinking || !messageQuery.trim() || aiTyping} onClick={handleSendMessage} variant={'icon'} className="ml-auto">
                <ArrowUp size={16} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPage
