import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'

import MobileContainer from './components/MobileContainer'
import Header from './components/Header'
import BottomNav from './components/ui/BottomNav'

// Pages
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import JournalPage from './pages/JournalPage'
import CirclesPage from './pages/CirclesPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import SearchPage from './pages/SearchPage'
import NotificationPage from './pages/NotificationPage'
import DesignSystemShowcase from './pages/DesignSystemShowcase'

import {
  Palette,
  Sparkles,
  BookOpen,
  Users,
  LogOut,
  RotateCcw,
  X,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'

function MainApp() {
  const { user, loading, isAuthenticated, signOut } = useAuth()

  // Onboarding status in localStorage
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hay_onboarding_completed') === 'true'
  })

  // Auth screen toggle: 'login' | 'register'
  const [authView, setAuthView] = useState('login')

  // Main navigation tab: 'beranda' | 'jurnal' | 'circle' | 'profil'
  const [activeTab, setActiveTab] = useState('beranda')

  // Modal / Subscreen overlays: null | 'create_post' | 'search' | 'notifications' | 'design_system'
  const [activeOverlay, setActiveOverlay] = useState(null)

  // Hamburger drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Real incoming notification count for header badge
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Fetch pending friend requests count
  const fetchNotificationCount = async () => {
    if (!user?.id) {
      setUnreadNotifications(1) // Demo badge
      return
    }
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      if (!error && typeof count === 'number') {
        setUnreadNotifications(count)
      } else {
        setUnreadNotifications(1)
      }
    } catch {
      setUnreadNotifications(0)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCount()
    }
  }, [isAuthenticated, user])

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A12] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#3ED9E8] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-[#B8B8C4] uppercase">
            Memuat Hay!...
          </span>
        </div>
      </div>
    )
  }

  // 2. Onboarding Screen (jika belum selesai)
  if (!hasCompletedOnboarding) {
    return (
      <MobileContainer>
        <OnboardingPage
          onFinish={() => {
            setHasCompletedOnboarding(true)
          }}
        />
      </MobileContainer>
    )
  }

  // 3. Auth Screens (jika belum login/session tidak ada)
  if (!isAuthenticated) {
    return (
      <MobileContainer>
        {authView === 'login' ? (
          <LoginPage
            onNavigateRegister={() => setAuthView('register')}
            onSuccess={() => setActiveTab('beranda')}
          />
        ) : (
          <RegisterPage
            onNavigateLogin={() => setAuthView('login')}
            onSuccess={() => setActiveTab('beranda')}
          />
        )}
      </MobileContainer>
    )
  }

  // 4. Overlays: Create Post
  if (activeOverlay === 'create_post') {
    return (
      <MobileContainer>
        <CreatePostPage
          onBack={() => setActiveOverlay(null)}
          onPostCreated={() => {
            setActiveOverlay(null)
            setActiveTab('beranda')
          }}
        />
      </MobileContainer>
    )
  }

  // 5. Overlays: Search User
  if (activeOverlay === 'search') {
    return (
      <MobileContainer>
        <SearchPage onBack={() => setActiveOverlay(null)} />
      </MobileContainer>
    )
  }

  // 6. Overlays: Notifications
  if (activeOverlay === 'notifications') {
    return (
      <MobileContainer>
        <NotificationPage
          onBack={() => setActiveOverlay(null)}
          onFriendshipChange={fetchNotificationCount}
        />
      </MobileContainer>
    )
  }

  // 7. Overlays: Design System Showcase
  if (activeOverlay === 'design_system') {
    return (
      <DesignSystemShowcase onBackToApp={() => setActiveOverlay(null)} />
    )
  }

  // Tab Title mapping
  const tabTitles = {
    beranda: 'Beranda',
    jurnal: 'Jurnal Privat',
    circle: 'Circle Saya',
    profil: 'Profil',
  }

  return (
    <MobileContainer>
      {/* Top Header */}
      <Header
        title={tabTitles[activeTab] || 'Beranda'}
        unreadCount={unreadNotifications}
        onMenuClick={() => setIsDrawerOpen(true)}
        onSearchClick={() => setActiveOverlay('search')}
        onNotificationClick={() => setActiveOverlay('notifications')}
      />

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'beranda' && (
          <FeedPage
            onOpenCreatePost={() => setActiveOverlay('create_post')}
            onOpenSearch={() => setActiveOverlay('search')}
          />
        )}
        {activeTab === 'jurnal' && <JournalPage />}
        {activeTab === 'circle' && <CirclesPage />}
        {activeTab === 'profil' && (
          <ProfilePage onNavigateLogin={() => setAuthView('login')} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFabClick={() => setActiveOverlay('create_post')}
      />

      {/* Hamburger Side Drawer Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm">
          <div className="w-72 max-w-[80vw] bg-surface h-full p-5 flex flex-col justify-between shadow-2xl border-r border-border animate-fade-slide-up">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8]" />
                  <span className="text-base font-bold text-main tracking-tight font-sans">
                    Hay! Journal
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-subtle text-muted hover:text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Quick Links */}
              <div className="space-y-1 text-sm font-semibold">
                <button
                  onClick={() => {
                    setActiveTab('beranda')
                    setIsDrawerOpen(false)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left text-main flex items-center gap-3"
                >
                  <Sparkles className="w-4 h-4 text-[#3ED9E8]" />
                  <span>Beranda Cerita</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('jurnal')
                    setIsDrawerOpen(false)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left text-main flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 text-[#FFB627]" />
                  <span>Jurnal Refleksi Pribadi</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('circle')
                    setIsDrawerOpen(false)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left text-main flex items-center gap-3"
                >
                  <Users className="w-4 h-4 text-[#FF5A36]" />
                  <span>Kelola Circle Teman</span>
                </button>

                <div className="pt-3 border-t border-border/60">
                  <button
                    onClick={() => {
                      setActiveOverlay('design_system')
                      setIsDrawerOpen(false)
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left text-[#3ED9E8] flex items-center gap-3"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Showcase Design System</span>
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('hay_onboarding_completed')
                      setHasCompletedOnboarding(false)
                      setIsDrawerOpen(false)
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left text-muted hover:text-main flex items-center gap-3 text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Onboarding</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-4 border-t border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span>Supabase RLS Enforced</span>
              </div>

              <button
                onClick={() => {
                  signOut()
                  setIsDrawerOpen(false)
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#FF5A36]/40 text-[#FF5A36] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#FF5A36]/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
