import { Check, Notebook } from 'lucide-react'
import React from 'react'

interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  onClick?: (event: React.MouseEvent) => void
  className?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, onClick, className }) => {
  return (
    <label className={`flex gap-2 items-center cursor-pointer ${className}`}>
      <div
        onClick={onClick}
        className="h-4.5 w-4.5
          rounded-md border border-input-border dark:border-input-border-dark
          bg-input-bg dark:bg-input-bg-dark hover:bg-input-bg-hover dark:hover:bg-input-bg-hover-dark
          hover:border-input-border-hover dark:hover:border-input-border-hover-dark
          transition-all duration-200 flex items-center justify-center
        "
      >
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer hidden" />
        <Check size={16} strokeWidth={1.5} className="transition-all duration-200 ease-out opacity-0 peer-checked:opacity-100" />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
}

export default Checkbox
