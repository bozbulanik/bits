import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface ToggleProps {
  className?: string
  name?: string
  onText: string
  offText: string
  reversed?: boolean
  checked?: boolean
  onChange: (value: boolean) => void
}

const Switch: React.FC<ToggleProps> = ({
  className,
  name,
  onText,
  offText,
  reversed,
  checked,
  onChange
}) => {
  const handleCheckboxChange = () => {
    onChange(!checked)
  }

  return (
    <>
      <label
        className={twMerge(
          'relative inline-flex gap-2 cursor-pointer select-none items-center',
          className,
          reversed ? 'flex-row-reverse' : ''
        )}
      >
        <input
          type="checkbox"
          name={name}
          className="sr-only"
          checked={checked}
          onChange={handleCheckboxChange}
        />
        <span
          className={twMerge(
            'p-0.5 flex w-14 h-full items-center rounded-md  border bg-input-bg dark:bg-input-bg-dark border-input-border dark:border-input-border-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark hover:border-input-border-hover dark:hover:border-input-border-hover-dark'
          )}
        >
          <span
            className={`h-5 w-5 border bg-input-bg dark:bg-input-bg-dark duration-200 ${
              checked
                ? 'translate-x-7 rounded-md transition-all border-input-border-hover dark:border-input-border-hover-dark bg-input-bg-hover-dark/25 dark:bg-input-bg-hover/25'
                : 'rounded-md border-input-border-hover dark:border-input-border-hover-dark'
            }`}
          ></span>
        </span>
        <span className="flex items-center flex-1">
          <span className={`transition-all duration-400 ${checked ? '' : 'text-text-muted'}`}>
            {checked ? onText : offText}
          </span>
        </span>
      </label>
    </>
  )
}

export default Switch
