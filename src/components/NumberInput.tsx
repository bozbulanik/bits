import React, { useState } from 'react'
import Input from './Input'
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'

const charWidth = 8 // adjust to match your font, or measure with canvas
const padding = 16 // some buffer for cursor/padding

const calculateWidth = (val: number) => {
  return `${val.toString().length * charWidth + padding}px`
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}
const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1
}) => {
  const [internalValue, setInternalValue] = useState(value)

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

  return (
    <div className="h-8 p-0.5 flex items-center rounded-md bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark border border-input-border dark:border-input-border-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark">
      <div
        onClick={decrement}
        className={`${
          internalValue <= min ? 'cursor-not-allowed' : 'cursor-pointer'
        } hover:bg-input-border-hover dark:hover:bg-input-border-hover-dark flex items-center justify-center w-6.5 h-6.5 rounded-md`}
      >
        <Minus size={14} strokeWidth={1.5} />
      </div>
      <Input
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        type="number"
        className="number-input"
        variant={'ghost'}
        style={{ width: calculateWidth(internalValue), maxWidth: '120px' }}
      />

      <div
        onClick={increment}
        className={`${
          internalValue >= max ? 'cursor-not-allowed' : 'cursor-pointer'
        } hover:bg-input-border-hover dark:hover:bg-input-border-hover-dark flex items-center justify-center w-6.5 h-6.5 rounded-md`}
      >
        <Plus size={14} strokeWidth={1.5} />
      </div>
    </div>
  )
}

export default NumberInput
