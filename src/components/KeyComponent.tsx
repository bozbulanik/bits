import React from 'react'

interface KeyComponentProps {
  children: React.ReactNode
}

const KeyComponent: React.FC<KeyCompponentProps> = ({ children }) => {
  return (
    <div className="w-8 h-6 p-1 bg-button-bg dark:bg-button-bg-dark flex items-center justify-center shadow-[inset_0px_-1px_1px_0px_rgba(0,_0,_0,_0.4)] dark:shadow-[inset_0px_-1px_1px_0px_rgba(255,_255,_255,_0.4)] border border-button-border dark:border-button-border-dark rounded-md">
      {children}
    </div>
  )
}

export default KeyComponent
