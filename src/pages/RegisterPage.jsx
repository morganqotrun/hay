import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  At,
  EnvelopeSimple,
  Phone,
  Lock,
  Eye,
  EyeSlash,
  Check,
  X,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useContentContext } from '../context/ContentContext'

export default function RegisterPage({ onNavigateLogin, onSuccess }) {
  const { signUp } = useAuth()
  const { t, renderContent } = useContentContext()

  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Realtime debounce username validation state
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameFeedback, setUsernameFeedback] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Debounced realtime username uniqueness validator (400ms)
  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')

    if (!cleanUsername) {
      setUsernameStatus('idle')
      setUsernameFeedback('')
      return
    }

    if (cleanUsername.length < 3) {
      setUsernameStatus('invalid')
      setUsernameFeedback('Minimal 3 karakter (huruf, angka, _, .)')
      return
    }

    setUsernameStatus('checking')
    setUsernameFeedback('Memeriksa ketersediaan...')

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle()

        if (error) {
          setUsernameStatus('available')
          setUsernameFeedback(`@${cleanUsername} dapat digunakan`)
          return
        }

        if (data) {
          setUsernameStatus('taken')
          setUsernameFeedback(`@${cleanUsername} sudah digunakan. Pilih username lain.`)
        } else {
          setUsernameStatus('available')
          setUsernameFeedback(`@${cleanUsername} tersedia!`)
        }
      } catch (err) {
        setUsernameStatus('available')
        setUsernameFeedback(`@${cleanUsername} tersedia!`)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nama.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.')
      return
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
    if (cleanUsername.length < 3) {
      setErrorMessage('Username harus minimal 3 karakter.')
      return
    }

    if (usernameStatus === 'taken') {
      setErrorMessage('Username sudah dipakai orang lain. Pilih yang lain.')
      return
    }

    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await signUp({
        email,
        password,
        nama: nama.trim(),
        username: cleanUsername,
        phone: phone.trim() || null,
      })

      if (error) {
        setErrorMessage(error.message || 'Yah, gagal. Coba lagi sebentar.')
      } else {
        if (onSuccess) onSuccess(data?.user)
      }
    } catch (err) {
      setErrorMessage('Yah, gagal. Coba lagi sebentar.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#15110E] text-[#F6EEE1] p-6 flex flex-col justify-between select-none">
      <div className="space-y-6 max-w-sm mx-auto w-full pt-4">
        {/* Header Wordmark */}
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl font-black text-[#F6EEE1]">
            Hay!
          </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-sans text-xs text-[#A79A8A] hover:text-[#F6EEE1]"
          >
            Sudah punya akun? <span className="text-[#FF6A3D] font-bold">{t('register_btn_login', 'Masuk')}</span>
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-[#F6EEE1] leading-tight">
            {renderContent('register_title', 'Buat akun **Hay!**')}
          </h1>
          <p className="font-sans text-xs text-[#A79A8A]">
            {t('register_desc', 'Mulai berbagi cerita dengan lingkaran terdekatmu.')}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-[#E8452C]/10 border border-[#E8452C]/30 text-[#E8452C] rounded-[12px] flex items-center gap-2 text-xs">
            <WarningCircle size={16} weight="bold" className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Register */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama Lengkap */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
              Nama Lengkap
            </label>
            <div className="relative flex items-center">
              <User size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="misal: Farhan Syahputra"
                required
                className="w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-4 py-3 rounded-[14px] border border-[#3A2F27] focus:outline-none focus:border-[#FF6A3D] transition-colors placeholder:text-[#A79A8A]/50"
              />
            </div>
          </div>

          {/* Username Unik */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
              Username Unik
            </label>
            <div className="relative flex items-center">
              <At size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="farhan_s"
                required
                className={`w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-10 py-3 rounded-[14px] border transition-colors placeholder:text-[#A79A8A]/50 focus:outline-none ${
                  usernameStatus === 'available'
                    ? 'border-[#4FA05A]'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-[#E8452C]'
                    : 'border-[#3A2F27] focus:border-[#FF6A3D]'
                }`}
              />
              <div className="absolute right-3.5 flex items-center pointer-events-none">
                {usernameStatus === 'available' && (
                  <Check size={16} weight="bold" className="text-[#4FA05A]" />
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <X size={16} weight="bold" className="text-[#E8452C]" />
                )}
              </div>
            </div>
            {usernameFeedback && (
              <p
                className={`text-[11px] font-sans pl-1 ${
                  usernameStatus === 'available'
                    ? 'text-[#4FA05A]'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'text-[#E8452C]'
                    : 'text-[#A79A8A]'
                }`}
              >
                {usernameFeedback}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
              Email
            </label>
            <div className="relative flex items-center">
              <EnvelopeSimple size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-4 py-3 rounded-[14px] border border-[#3A2F27] focus:outline-none focus:border-[#FF6A3D] transition-colors placeholder:text-[#A79A8A]/50"
              />
            </div>
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
              Nomor Telepon (Opsional)
            </label>
            <div className="relative flex items-center">
              <Phone size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-4 py-3 rounded-[14px] border border-[#3A2F27] focus:outline-none focus:border-[#FF6A3D] transition-colors placeholder:text-[#A79A8A]/50"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div className="space-y-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-10 py-3 rounded-[14px] border border-[#3A2F27] focus:outline-none focus:border-[#FF6A3D] transition-colors placeholder:text-[#A79A8A]/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#A79A8A] hover:text-[#F6EEE1]"
              >
                {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
              </button>
            </div>
          </div>

          {/* Tombol Daftar */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={usernameStatus === 'taken' || usernameStatus === 'invalid'}
            >
              {t('register_btn_submit', 'Daftar')}
            </Button>
          </div>
        </form>
      </div>

      <div className="pt-4 text-center">
        <p className="font-sans text-[11px] text-[#A79A8A]">
          Dengan mendaftar, kamu menyetujui ruang privat & aman Hay!
        </p>
      </div>
    </div>
  )
}
