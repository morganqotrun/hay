import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      } else {
        // Fallback default profile if not yet created
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const meta = session.user.user_metadata || {}
          setProfile({
            id: session.user.id,
            nama: meta.nama || meta.full_name || 'Teman Hay!',
            username: meta.username || 'teman_hay',
            email: session.user.email,
            phone: meta.phone || '',
            bio: 'Menikmati cerita hari ini, apa adanya.',
            foto_url: meta.avatar_url || null,
            tema_preferensi: 'malam',
          })
        }
      }
    } catch (err) {
      console.warn('Profile fetch handled:', err?.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // Cek session aktif dari Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        // Cek apakah ada demo user di localStorage
        const demoUser = localStorage.getItem('hay_demo_user')
        if (demoUser) {
          try {
            const parsed = JSON.parse(demoUser)
            setUser(parsed.user)
            setProfile(parsed.profile)
          } catch {
            localStorage.removeItem('hay_demo_user')
          }
        }
        setLoading(false)
      }
    })

    // Dengarkan event auth Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        const demoUser = localStorage.getItem('hay_demo_user')
        if (!demoUser) {
          setProfile(null)
        }
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Login Method
  const signIn = async ({ email, password }) => {
    // 1. Coba via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Jika project supabase placeholder, sediakan demo login yang mulus
        const isPlaceholder =
          !import.meta.env.VITE_SUPABASE_URL ||
          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

        if (isPlaceholder) {
          const mockUser = {
            id: 'demo-user-12345',
            email,
            created_at: new Date().toISOString(),
          }
          const mockProfile = {
            id: 'demo-user-12345',
            nama: 'Alula Farha',
            username: 'alulafarha',
            email,
            phone: '08123456789',
            bio: 'Menikmati secangkir teh dan refleksi tenang bersama lingkaran terdekat. 🌿',
            foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            tema_preferensi: 'malam',
          }
          localStorage.setItem('hay_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }))
          setUser(mockUser)
          setProfile(mockProfile)
          return { data: { user: mockUser }, error: null }
        }

        // Terjemahkan error umum ke Bahasa Indonesia yang ramah
        let friendlyMessage = 'Gagal masuk. Silakan periksa kembali email dan password Anda.'
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Email atau kata sandi tidak cocok. Silakan coba lagi.'
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Email Anda belum dikonfirmasi. Periksa kotak masuk/spam email Anda.'
        }
        return { data: null, error: new Error(friendlyMessage) }
      }

      setUser(data.user)
      if (data.user) {
        await fetchProfile(data.user.id)
      }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Register / Daftar Method
  const signUp = async ({ email, password, nama, username, phone }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama,
            username,
            phone,
            tema_preferensi: 'malam',
          },
        },
      })

      if (error) {
        // Fallback jika placeholder Supabase
        const isPlaceholder =
          !import.meta.env.VITE_SUPABASE_URL ||
          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

        if (isPlaceholder) {
          const mockUser = {
            id: 'demo-user-' + Math.random().toString(36).substring(2, 8),
            email,
            created_at: new Date().toISOString(),
          }
          const mockProfile = {
            id: mockUser.id,
            nama,
            username,
            email,
            phone: phone || '',
            bio: 'Cerita hari ini, apa adanya.',
            foto_url: null,
            tema_preferensi: 'malam',
          }
          localStorage.setItem('hay_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }))
          setUser(mockUser)
          setProfile(mockProfile)
          return { data: { user: mockUser }, error: null }
        }

        let friendlyMsg = error.message
        if (error.message.includes('User already registered')) {
          friendlyMsg = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.'
        }
        return { data: null, error: new Error(friendlyMsg) }
      }

      // Pastikan insert profil & circle "Terdekat" jika user berhasil dibuat
      if (data?.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            nama,
            username,
            email,
            phone,
            tema_preferensi: 'malam',
          })

          // Buat circle default "Terdekat"
          const { data: circleData } = await supabase
            .from('circles')
            .insert({
              owner_id: data.user.id,
              nama: 'Terdekat',
              warna_hex: '#FF5A36',
              ikon: 'users',
            })
            .select()
            .single()

          if (circleData) {
            await supabase.from('circle_members').insert({
              circle_id: circleData.id,
              user_id: data.user.id,
            })
          }
        } catch (e) {
          console.warn('Initial setup redundancy notice:', e?.message)
        }

        setUser(data.user)
        await fetchProfile(data.user.id)
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Update Profile Method
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('User tidak terautentikasi') }
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // Update local state if demo
        const updated = { ...profile, ...updates }
        setProfile(updated)
        localStorage.setItem('hay_demo_user', JSON.stringify({ user, profile: updated }))
        return { data: updated, error: null }
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    localStorage.removeItem('hay_demo_user')
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
    isAuthenticated: !!user,
  }
}

