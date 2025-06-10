import React, { useEffect, useState } from 'react'
import Input from './Input'
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'

const calculateWidth = (val: number, charWidth: number, padding: number) => {
  return `${val.toString().length * charWidth + padding}px`
}

const sizeMap = {
  xs: { wrapperHeight: 'h-7', btn: 'w-4 h-4', icon: 12, mw: '120px', cw: 16, pd: 6 },
  sm: { wrapperHeight: 'h-7', btn: 'w-5 h-5', icon: 14, mw: '120px', cw: 16, pd: 6 },
  md: { wrapperHeight: 'h-7', btn: 'w-6 h-6', icon: 16, mw: '120px', cw: 16, pd: 6 },
  lg: { wrapperHeight: 'h-8', btn: 'w-7 h-7', icon: 18, mw: '240px', cw: 16, pd: 6 },
  xl: { wrapperHeight: 'h-10', btn: 'w-8 h-8', icon: 20, mw: '240px', cw: 16, pd: 6 },
  '2xl': { wrapperHeight: 'h-12', btn: 'w-9 h-9', icon: 24, mw: '240px', cw: 20, pd: 6 },
  '4xl': { wrapperHeight: 'h-16', btn: 'w-12 h-12', icon: 32, mw: '480px', cw: 24, pd: 6 },
  '8xl': { wrapperHeight: 'h-32', btn: 'w-24 h-24', icon: 64, mw: '480px', cw: 64, pd: 6 },
  default: { wrapperHeight: 'h-7', btn: 'w-6 h-6', icon: 16, mw: '120px', cw: 16, pd: 6 }
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholderValue?: number
  className?: string
  autoFocus?: boolean
  ghost?: boolean
  size?: string
}
const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  placeholderValue = 0,
  className,
  autoFocus,
  ghost,
  size
}) => {
  const [internalValue, setInternalValue] = useState(placeholderValue ? placeholderValue : value)

  const updateValue = (newValue: number) => {
    const clamped = Math.min(Math.max(newValue, min), max)
    setInternalValue(clamped)
    onChange?.(clamped)
  }

  const increment = () => updateValue(internalValue + step)
  const decrement = () => updateValue(internalValue - step)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value)
    if (!isNaN(num)) updateValue(num)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') increment()
    if (e.key === 'ArrowDown') decrement()
  }
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const {
    wrapperHeight: wrapperHeight,
    btn: btnSize,
    icon: iconSize,
    mw: mw,
    cw: cw,
    pd: pd
  } = sizeMap[size as keyof typeof sizeMap] || sizeMap.default

  return (
    <div
      className={`${wrapperHeight} p-0.5 flex items-center gap-2 rounded-md ${
        ghost
          ? ''
          : 'bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-input-border dark:border-input-border-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark '
      } ${className}`}
    >
      <div
        onClick={decrement}
        className={`
    ${internalValue <= min ? 'cursor-not-allowed' : 'cursor-pointer'}
    hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark
    flex items-center justify-center ${btnSize} rounded-md
  `}
      >
        <Minus size={iconSize} strokeWidth={1.5} />
      </div>
      <Input
        autoFocus={autoFocus}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="number-input"
        variant={'ghost'}
        style={{ width: calculateWidth(internalValue, cw, pd), maxWidth: mw }}
        inputSize={size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '8xl' | null | undefined}
      />

      <div
        onClick={increment}
        className={`
    ${internalValue >= max ? 'cursor-not-allowed' : 'cursor-pointer'}
    hover:bg-button-bg-hover dark:hover:bg-button-bg-hover-dark
    flex items-center justify-center ${btnSize} rounded-md
  `}
      >
        <Plus size={iconSize} strokeWidth={1.5} />
      </div>
    </div>
  )
}

export default NumberInput
