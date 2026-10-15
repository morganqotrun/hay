import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function RegisterPage({ onNavigateLogin, onSuccess }) {
  const { signUp } = useAuth()

  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Realtime debounce username validation state
  const [usernameStatus, setUsernameStatus] = useState('idle') // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
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
          // Jika offline atau mock
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
      setErrorMessage('Username tersebut sudah digunakan oleh pengguna lain.')
      return
    }

    if (!email.trim() || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.')
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
        email: email.trim(),
        password,
        nama: nama.trim(),
        username: cleanUsername,
        phone: phone.trim(),
      })

      if (error) {
        setErrorMessage(error.message || 'Gagal mendaftar. Silakan coba lagi.')
      } else {
        if (onSuccess) onSuccess(data?.user)
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala saat menghubungkan ke database.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white flex flex-col justify-between px-6 py-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6 max-w-md mx-auto w-full"
      >
        {/* Header Branding */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161726] border border-[#232339]">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8]" />
            <span className="text-xs font-bold tracking-wider text-white uppercase font-sans">
              Hay!
            </span>
          </div>

          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight pt-1">
            Buat Akun <span className="text-[#3ED9E8] italic font-semibold">Baru</span>
          </h1>
          <p className="text-[14px] text-[#B8B8C4]">
            Mulai bangun circle privat dan catat jurnal harianmu.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-[#FF5A36]/15 border border-[#FF5A36]/40 flex items-start gap-2.5 text-xs text-[#FF5A36]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Field Nama */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
              Nama Lengkap
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Farhan Syahputra"
                required
                className="w-full bg-[#1A1A24] text-white text-[14px] pl-10 pr-4 py-3 rounded-2xl border border-[#232339] focus:outline-none focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8] transition-all placeholder:text-[#B8B8C4]/40"
              />
            </div>
          </div>

          {/* Field Username with Realtime Debounce 400ms Validation */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
              Username Unik
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                <AtSign className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="farhan_s"
                required
                className={`w-full bg-[#1A1A24] text-white text-[14px] pl-10 pr-11 py-3 rounded-2xl border transition-all placeholder:text-[#B8B8C4]/40 focus:outline-none ${
                  usernameStatus === 'available'
                    ? 'border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F]'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]'
                    : 'border-[#232339] focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8]'
                }`}
              />

              {/* Status Indicator Icon */}
              <div className="absolute right-3.5 flex items-center pointer-events-none">
                {usernameStatus === 'checking' && (
                  <Loader2 className="w-4 h-4 text-[#3ED9E8] animate-spin" />
                )}
                {usernameStatus === 'available' && (
                  <span className="w-5 h-5 rounded-full bg-[#8CC63F] text-black flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <span className="w-5 h-5 rounded-full bg-[#FF5A36] text-white flex items-center justify-center">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </div>

            {/* Helper feedback text */}
            {usernameFeedback && (
              <p
                className={`text-[11px] font-medium pl-1 ${
                  usernameStatus === 'available'
                    ? 'text-[#8CC63F]'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'text-[#FF5A36]'
                    : 'text-[#B8B8C4]'
                }`}
              >
                {usernameFeedback}
              </p>
            )}
          </div>

          {/* Field Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
                className="w-full bg-[#1A1A24] text-white text-[14px] pl-10 pr-4 py-3 rounded-2xl border border-[#232339] focus:outline-none focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8] transition-all placeholder:text-[#B8B8C4]/40"
              />
            </div>
          </div>

          {/* Field Nomor Telepon */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
              Nomor Telepon (Opsional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-[#1A1A24] text-white text-[14px] pl-10 pr-4 py-3 rounded-2xl border border-[#232339] focus:outline-none focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8] transition-all placeholder:text-[#B8B8C4]/40"
              />
            </div>
          </div>

          {/* Field Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                autoComplete="new-password"
                className="w-full bg-[#1A1A24] text-white text-[14px] pl-10 pr-11 py-3 rounded-2xl border border-[#232339] focus:outline-none focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8] transition-all placeholder:text-[#B8B8C4]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#B8B8C4]/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.4]" />}
              className="shadow-[0_8px_20px_rgba(59,143,232,0.45)] font-bold text-base py-3"
            >
              Daftar Akun
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="pt-8 text-center space-y-3 max-w-md mx-auto w-full">
        <p className="text-[14px] text-[#B8B8C4]">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-[#3ED9E8] font-bold hover:underline"
          >
            Masuk sekarang
          </button>
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#B8B8C4]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
          <span>Otomatis membuat Circle "Terdekat" & RLS terisolasi</span>
        </div>
      </div>
    </div>
  )
}
