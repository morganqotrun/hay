import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ThemeContext = createContext({
  theme: 'cerah',
  toggleTheme: () => {},
  setTheme: () => {},
  isMalam: false,
})

const THEME_STORAGE_KEY = 'hay_theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // 1. Baca dari localStorage terlebih dahulu
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'cerah' || stored === 'malam') {
      return stored
    }
    // 2. Default: 'cerah' (sesuai spesifikasi)
    return 'cerah'
  })

  // Sinkronkan class ke <html> element
  const applyThemeToDOM = useCallback((currentTheme) => {
    const root = document.documentElement
    root.classList.remove('theme-cerah', 'theme-malam', 'dark')

    if (currentTheme === 'malam') {
      root.classList.add('theme-malam', 'dark')
      root.setAttribute('data-theme', 'malam')
    } else {
      root.classList.add('theme-cerah')
      root.setAttribute('data-theme', 'cerah')
    }
  }, [])

  // Efek saat tema berubah: simpan ke localStorage, update DOM, dan sinkron ke Supabase jika login
  useEffect(() => {
    applyThemeToDOM(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)

    // Sinkronkan ke database Supabase jika pengguna sedang terautentikasi
    async function syncToSupabase() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          await supabase
            .from('users')
            .update({ tema_preferensi: theme })
            .eq('id', session.user.id)
        }
      } catch (err) {
        // Silent fail jika Supabase belum terhubung / user belum login
        // console.debug('Supabase theme sync skipped:', err)
      }
    }

    syncToSupabase()
  }, [theme, applyThemeToDOM])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'cerah' ? 'malam' : 'cerah'))
  }, [])

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'cerah' || newTheme === 'malam') {
      setThemeState(newTheme)
    }
  }, [])

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isMalam: theme === 'malam',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default useTheme
