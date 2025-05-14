import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Brush, FileCog, Keyboard, Settings, User, X } from 'lucide-react'

interface SettingsLayoutProps {
  children: React.ReactNode
  currentPage: string
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, currentPage }) => {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <p className="ml-1 font-semibold w-full h-full content-center drag-bar">Settings</p>
        <Button
          onClick={() => window.ipcRenderer.invoke('closeWindow', 'settings')}
          variant={'icon'}
          className="ml-auto"
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="w-full bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark p-2 flex items-center justify-center gap-2">
        <Button
          onClick={() => navigate('/settings/general')}
          variant={currentPage == 'general' ? 'selectedTab' : 'tab'}
          className="justify-start"
        >
          <Settings size={16} strokeWidth={1.5} /> General
        </Button>
        <Button
          onClick={() => navigate('/settings/profile')}
          variant={currentPage == 'profile' ? 'selectedTab' : 'tab'}
          className="justify-start"
        >
          <User size={16} strokeWidth={1.5} /> Profile
        </Button>

        <Button
          onClick={() => navigate('/settings/appearance')}
          variant={currentPage == 'appearance' ? 'selectedTab' : 'tab'}
          className="justify-start"
        >
          <Brush size={16} strokeWidth={1.5} /> Appearance
        </Button>

        <Button
          onClick={() => navigate('/settings/shortcuts')}
          variant={currentPage == 'shortcuts' ? 'selectedTab' : 'tab'}
          className="justify-start"
        >
          <Keyboard size={16} strokeWidth={1.5} /> Shortcuts
        </Button>
        <Button
          onClick={() => navigate('/settings/about')}
          variant={currentPage == 'about' ? 'selectedTab' : 'tab'}
          className="justify-start"
        >
          <FileCog size={16} strokeWidth={1.5} /> About
        </Button>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}

export default SettingsLayout
