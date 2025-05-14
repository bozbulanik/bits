import { ImagePlus, Trash, User } from 'lucide-react'
import Input from '../../components/Input'
import { useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import Button from '../../components/Button'

const SettingsProfile = () => {
  const { settings, setSetting } = useSettingsStore()
  useEffect(() => {
    setProfileImagePath(settings.user.profileImage)
    setName(settings.user.name)
    setSurname(settings.user.surname)
    setEmail(settings.user.email)
    setBio(settings.user.bio)
  }, [settings])
  const [profileImageHovered, setProfileImageHovered] = useState<boolean>(false)
  const [profileImagePath, setProfileImagePath] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [surname, setSurname] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [bio, setBio] = useState<string>('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    setSetting('user.name', value)
  }

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSurname(value)
    setSetting('user.surname', value)
  }

  const handleMailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setSetting('user.email', value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setBio(value)
    setSetting('user.bio', value)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileImageClick = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      window.ipcRenderer.send('useProfileImage', file.path)
    }
  }
  useEffect(() => {
    window.ipcRenderer.on('profileImageSet', (_event, customPath) => {
      setProfileImagePath(customPath)
      setSetting('user.profileImage', customPath)
    })
  }, [])

  const handleProfileImageRemoval = () => {
    setProfileImagePath('')
    setSetting('user.profileImage', '')
  }
  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-auto">
      <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2 ">
        <p className="text-text-muted uppercase text-sm font-semibold">Profile</p>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <div
              onMouseEnter={() => setProfileImageHovered(true)}
              onMouseLeave={() => setProfileImageHovered(false)}
              onClick={handleProfileImageClick}
              className="relative p-1 cursor-pointer h-26 w-26 border border-button-border dark:border-button-border-dark rounded-md bg-button-bg dark:bg-button-bg-dark hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark hover:border-button-border-hover dark:hover:border-button-border-hover-dark flex items-center justify-center text-text-muted"
            >
              {profileImagePath != '' ? (
                <img
                  className="w-full h-full rounded-lg p-0.5 object-cover"
                  src={profileImagePath}
                />
              ) : (
                <User size={48} strokeWidth={1} />
              )}
              {profileImageHovered && (
                <div
                  className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-button-bg dark:bg-button-bg-dark rounded-md  ${
                    profileImagePath == ''
                      ? 'opacity-100 text-text-muted'
                      : 'opacity-75 text-text dark:text-text-dark'
                  }`}
                >
                  <ImagePlus size={48} strokeWidth={1} />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            {profileImagePath != '' && (
              <Button
                onClick={handleProfileImageRemoval}
                className="w-full"
                variant={'destructive'}
              >
                <Trash size={16} strokeWidth={1.5} />
                Remove
              </Button>
            )}
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex items-center">
              <p className="text-sm font-semibold">Name</p>
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="John"
                className="ml-auto"
              />
            </div>
            <div className="flex items-center">
              <p className="text-sm font-semibold">Last Name</p>
              <Input
                value={surname}
                onChange={handleSurnameChange}
                placeholder="Smith"
                className="ml-auto"
              />
            </div>
            <div className="flex items-center">
              <p className="text-sm font-semibold">E-mail</p>
              <Input
                value={email}
                onChange={handleMailChange}
                placeholder="example@mail.com"
                className="ml-auto"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <p className="text-text-muted uppercase text-sm font-semibold">AI</p>
        <div className="flex flex-col">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <p className="font-semibold text-sm">Bio</p>
              <p className="text-text-muted text-sm">Define how AI interacts with you.</p>
            </div>
            <textarea
              value={bio}
              onChange={handleBioChange}
              placeholder="I am 25 years old linguist interested in programming."
              className="placeholder:text-text-muted/75 w-full h-24 p-1 text-sm ml-auto resize-none focus:outline-none bg-input-bg dark:bg-input-bg-dark border border-input-border dark:border-input-border-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsProfile
