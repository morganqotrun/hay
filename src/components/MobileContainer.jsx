import React from 'react'

export default function MobileContainer({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#05050A] flex justify-center selection:bg-[#3ED9E8]/30 transition-colors duration-200">
      {/* Responsive layout: mobile full width, tablet (max-w-lg), desktop (max-w-xl) */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-app text-main min-h-screen shadow-2xl relative flex flex-col pb-28 sm:border-x border-border/70 transition-colors duration-200">
        {children}
      </div>
    </div>
  )
}
