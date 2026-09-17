import React from 'react'

export default function MobileContainer({ children }) {
  return (
    <div className="min-h-screen bg-stone-900/5 dark:bg-black/40 flex justify-center selection:bg-coral/20">
      <div className="w-full max-w-md bg-app text-main min-h-screen shadow-2xl relative flex flex-col pb-24 border-x border-border transition-colors duration-200">
        {children}
      </div>
    </div>
  )
}
