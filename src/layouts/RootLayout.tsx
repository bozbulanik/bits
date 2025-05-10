import React from 'react'

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="rounded-rounded border-scry-border dark:border-scry-border-dark overflow-hidden h-screen w-screen bg-bg dark:bg-bg-dark text-text dark:text-text-dark font-font ">
      <div className="flex flex-row w-full h-full p-1.5">
        <div className="w-full h-full flex flex-col rounded-[12px] border border-border dark:border-border-dark">
          {children}
        </div>
      </div>
    </div>
  )
}

export default RootLayout
