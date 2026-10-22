import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { EmptyFriendsSketch } from '../components/ui/EmptyStateIllustrations'
import { useContentContext } from '../context/ContentContext'

export default function LoginPage({ onNavigateRegister, onSuccess }) {
  const { signIn } = useAuth()
  const { t, renderContent } = useContentContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [hasImgError, setHasImgError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Silakan isi email dan kata sandi Anda.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setInfoMessage('')

    try {
      const { data, error } = await signIn({ email, password })
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

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMessage('Ketik email Anda terlebih dahulu di kotak input di atas.')
      return
    }
    setInfoMessage(
      `Tautan pemulihan kata sandi telah disiapkan untuk ${email}. Silakan periksa inbox/spam email Anda.`
    )
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-[#15110E] text-[#F6EEE1] flex flex-col justify-between select-none">
      {/* Visual media container with full-bleed top */}
      <div className="relative w-full h-[40vh] max-h-[360px] overflow-hidden">
        {!hasImgError ? (
          <img
            src="/login.jpg"
            alt="Visual Komunitas Hay!"
            className="w-full h-full object-cover object-center"
            onError={() => setHasImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#1F1915] flex flex-col items-center justify-center p-8">
            <EmptyFriendsSketch className="w-28 h-28" />
          </div>
        )}

        {/* Gradient Fade to #15110E */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#15110E] via-[#15110E]/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#15110E]/60 to-transparent" />

        {/* Brand Tag Top Left */}
        <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1915]/80 border border-[#3A2F27]">
          <span className="font-serif text-sm font-bold text-[#F6EEE1]">Hay!</span>
        </div>
      </div>

      {/* Main Content & Login Form */}
      <div className="relative z-10 px-6 pb-8 flex-1 flex flex-col justify-between -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Headline */}
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#F6EEE1] leading-tight tracking-tight">
              {renderContent('login_title', 'Selamat datang di **Hay!**')}
            </h1>
            <p className="font-sans text-xs text-[#A79A8A] mt-1">
              {t('login_desc', 'Masuk untuk membaca kabar lingkaran terdekatmu.')}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-[12px] bg-[#E8452C]/10 border border-[#E8452C]/30 text-[#E8452C] flex items-center gap-2 text-xs">
              <WarningCircle size={16} weight="bold" className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-[12px] bg-[#4FA05A]/10 border border-[#4FA05A]/30 text-[#4FA05A] text-xs">
              {infoMessage}
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
                Email
              </label>
              <div className="relative flex items-center">
                <EnvelopeSimple size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-[#1F1915] text-[#F6EEE1] font-sans text-sm pl-10 pr-4 py-3 rounded-[14px] border border-[#3A2F27] focus:outline-none focus:border-[#FF6A3D] transition-colors placeholder:text-[#A79A8A]/50"
                />
              </div>
            </div>

            {/* Input Kata Sandi */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A79A8A] block">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-[#FF6A3D] hover:underline"
                >
                  Lupa sandi?
                </button>
              </div>

              <div className="relative flex items-center">
                <Lock size={18} weight="bold" className="absolute left-3.5 text-[#A79A8A] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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

            {/* Tombol Masuk */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {t('login_btn_submit', 'Masuk')}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Footer: Navigasi ke Daftar */}
        <div className="pt-6 text-center">
          <p className="font-sans text-xs text-[#A79A8A]">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="font-bold text-[#FF6A3D] hover:underline cursor-pointer ml-1"
            >
              {t('login_btn_register', 'Daftar sekarang')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
