import Button from './Button'

interface ToggleOption {
  value: string
  label?: string
  icon?: React.ReactNode
}

interface ToggleButtonProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  variant?: 'default' | 'icon' | 'ghost' | 'destructive' | 'tab' | 'selectedTab'
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ options, value, onChange, className, variant }) => {
  const currentIndex = options.findIndex((opt) => opt.value === value)
  const current = options[currentIndex]

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % options.length
    onChange(options[nextIndex].value)
  }
  return (
    <Button className={className} variant={variant} onClick={handleClick}>
      {current?.icon}
    </Button>
  )
}
export default ToggleButton
