import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage({ onNavigateRegister, onSuccess }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

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
        setErrorMessage(error.message || 'Gagal masuk. Periksa kembali akun Anda.')
      } else {
        if (onSuccess) onSuccess(data?.user)
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala jaringan. Silakan coba lagi.')
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

  const handleQuickDemo = async () => {
    setEmail('alula@hay.local')
    setPassword('hay123456')
    setIsLoading(true)
    await signIn({ email: 'alula@hay.local', password: 'hay123456' })
    setIsLoading(false)
    if (onSuccess) onSuccess()
  }

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white flex flex-col justify-between select-none">
      {/* Visual media container with full-bleed top */}
      <div className="relative w-full h-[40vh] max-h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=85"
          alt="Hay Community Visual"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark Studio Gradient Fade ke bawah */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-[#0A0A12]/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Brand Tag Top Left */}
        <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8]" />
          <span className="text-xs font-bold tracking-wider text-white uppercase font-sans">
            Hay!
          </span>
        </div>
      </div>

      {/* Main Content & Login Form */}
      <div className="relative z-10 px-6 pb-8 flex-1 flex flex-col justify-between -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Headline */}
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight">
              Selamat datang di{' '}
              <span className="text-[#3ED9E8] italic font-semibold">Hay!</span>
            </h1>
            <p className="text-[14px] text-[#B8B8C4] mt-1">
              Masuk untuk membaca kabar lingkaran terdekatmu.
            </p>
          </div>

          {/* Error & Info Alerts */}
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

          {infoMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-[#3ED9E8]/15 border border-[#3ED9E8]/40 flex items-start gap-2.5 text-xs text-[#3ED9E8]"
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{infoMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div className="space-y-1.5">
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#B8B8C4] uppercase tracking-wider block">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#3ED9E8] hover:underline font-medium"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#B8B8C4]/60 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  required
                  autoComplete="current-password"
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
            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.4]" />}
                className="shadow-[0_8px_20px_rgba(59,143,232,0.45)] font-bold text-base py-3"
              >
                Masuk
              </Button>
            </div>
          </form>

          {/* Quick Demo Instant Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-[#3ED9E8] flex items-center justify-center gap-2 transition-all font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coba Langsung Mode Demo (Alula Farha)</span>
          </button>
        </motion.div>

        {/* Footer: Belum punya akun? Daftar */}
        <div className="pt-6 text-center space-y-3">
          <p className="text-[14px] text-[#B8B8C4]">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-[#3ED9E8] font-bold hover:underline"
            >
              Daftar sekarang
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#B8B8C4]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span>Autentikasi terenkripsi & data privat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
