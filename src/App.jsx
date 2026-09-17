import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import DesignSystemShowcase from './pages/DesignSystemShowcase'
import MobileContainer from './components/MobileContainer'
import Header from './components/Header'
import BottomNav from './components/ui/BottomNav'
import FeedPage from './pages/FeedPage'
import JournalPage from './pages/JournalPage'
import CirclesPage from './pages/CirclesPage'
import ProfilePage from './pages/ProfilePage'
import { Palette, Smartphone } from 'lucide-react'

function MainApp() {
  const [showDemo, setShowDemo] = useState(true)
  const [activeTab, setActiveTab] = useState('beranda')

  if (showDemo) {
    return <DesignSystemShowcase onBackToApp={() => setShowDemo(false)} />
  }

  return (
    <MobileContainer>
      {/* Quick toggle to return to Design System showcase */}
      <div className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between z-40">
        <span className="text-metadata text-muted font-medium">Tampilan Aplikasi Hay!</span>
        <button
          onClick={() => setShowDemo(true)}
          className="text-metadata text-coral font-bold flex items-center gap-1.5 hover:underline"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Buka Showcase Design System</span>
        </button>
      </div>

      <Header />
      
      <main className="flex-1 overflow-y-auto px-1">
        {activeTab === 'beranda' && <FeedPage />}
        {activeTab === 'jurnal' && <JournalPage />}
        {activeTab === 'circle' && <CirclesPage />}
        {activeTab === 'profil' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </MobileContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  )
}
