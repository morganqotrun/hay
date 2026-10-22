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
import AdminTextPage from './pages/AdminTextPage'

function MainApp() {
  const { user, loading, isAuthenticated } = useAuth()

  // Onboarding status in localStorage
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hay_onboarding_completed') === 'true'
  })

  // Auth screen toggle: 'login' | 'register'
  const [authView, setAuthView] = useState('login')

  // Main navigation tab: 'beranda' | 'jurnal' | 'circle' | 'profil'
  const [activeTab, setActiveTab] = useState('beranda')

  // Modal / Subscreen overlays: null | 'create_post' | 'search' | 'notifications' | 'admin_teks'
  const [activeOverlay, setActiveOverlay] = useState(null)

  // Real incoming notification count for header badge
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Fetch pending friend requests count
  const fetchNotificationCount = async () => {
    if (!user?.id) {
      setUnreadNotifications(0)
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
        setUnreadNotifications(0)
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
      <div className="min-h-screen bg-[#15110E] flex items-center justify-center text-[#F6EEE1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF6A3D] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-[#A79A8A] font-sans">
            Memuat Hay!...
          </span>
        </div>
      </div>
    )
  }

  // 2. Onboarding Screen
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

  // 3. Auth Screens
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

  // 7. Overlays: Admin Kelola Teks
  if (activeOverlay === 'admin_teks') {
    return (
      <MobileContainer>
        <AdminTextPage onBack={() => setActiveOverlay(null)} />
      </MobileContainer>
    )
  }

  // Tab Title mapping
  const tabTitles = {
    beranda: 'Beranda',
    jurnal: 'Jurnal',
    circle: 'Circle Teman',
    profil: 'Profil',
  }

  return (
    <MobileContainer>
      {/* Top Header */}
      <Header
        title={tabTitles[activeTab] || 'Beranda'}
        unreadCount={unreadNotifications}
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
          <ProfilePage
            onNavigateLogin={() => setAuthView('login')}
            onNavigateAdmin={() => setActiveOverlay('admin_teks')}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFabClick={() => setActiveOverlay('create_post')}
      />
    </MobileContainer>
  )
}

import { ContentProvider } from './context/ContentContext'

export default function App() {
  return (
    <ThemeProvider>
      <ContentProvider>
        <MainApp />
      </ContentProvider>
    </ThemeProvider>
  )
}
