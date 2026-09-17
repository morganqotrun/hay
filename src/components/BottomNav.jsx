import React from 'react'
import { Home, BookOpen, Users, User } from 'lucide-react'

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'feed', label: 'Circles Feed', icon: Home },
    { id: 'journal', label: 'Jurnal Saya', icon: BookOpen },
    { id: 'circles', label: 'Lingkaran', icon: Users },
    { id: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-2 flex items-center justify-around shadow-float">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-hay-700 font-semibold scale-105'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-hay-100 text-hay-800' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-none">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
