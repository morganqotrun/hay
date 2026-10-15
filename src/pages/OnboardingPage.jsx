import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/ui/Button'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

const ONBOARDING_STORAGE_KEY = 'hay_onboarding_completed'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=85',
    headlinePrefix: 'Satu ruang untuk ',
    highlight: 'Lingkaranmu',
    headlineSuffix: ' yang terdekat',
    subtext: 'Bagikan momen hanya ke circle yang kamu percaya tanpa kebisingan publik.',
    tag: 'Circle Privat',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1000&auto=format&fit=crop&q=85',
    headlinePrefix: 'Cerita hari ini, ',
    highlight: 'Apa Adanya',
    headlineSuffix: '',
    subtext: 'Bagikan foto, cerita, dan suasana hati tanpa tekanan like palsu & validasi algoritma.',
    tag: 'Tanpa Tekanan',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=85',
    headlinePrefix: 'Kenangan yang ',
    highlight: 'Kembali',
    headlineSuffix: ' di waktu yang tepat',
    subtext: 'Hay! mengingatkan momen berhargamu setahun lalu bersama orang-orang terkasih.',
    tag: 'Flashback Hangat',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=85',
    headlinePrefix: 'Ruang privat untuk ',
    highlight: 'Refleksimu',
    headlineSuffix: '',
    subtext: 'Tulis jurnal harian yang hanya bisa kamu lihat sendiri, dilindungi enkripsi RLS.',
    tag: '100% Rahasia',
  },
]

export default function OnboardingPage({ onFinish }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    if (onFinish) onFinish()
  }

  const slide = slides[currentSlide]

  return (
    <div className="relative min-h-screen bg-[#0A0A12] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Visual media container with full-bleed top ~60% */}
      <div className="relative w-full h-[58vh] max-h-[520px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt="Hay Story Visual"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Deep Studio Gradient Fade from ~60% to #0A0A12 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-[#0A0A12]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Brand Top Tag */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-white uppercase font-sans">
              Hay!
            </span>
          </div>

          <span className="text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#3ED9E8] border border-[#3ED9E8]/30">
            {slide.tag}
          </span>
        </div>
      </div>

      {/* Content & Typography Area */}
      <div className="relative z-10 px-6 pb-8 flex-1 flex flex-col justify-between -mt-6">
        <div>
          {/* Dot Pagination */}
          <div className="flex items-center gap-2 mb-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-8 bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8]'
                    : 'w-2 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Headline & Subtext */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="space-y-3"
            >
              <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight">
                {slide.headlinePrefix}
                <span className="text-[#3ED9E8] italic font-semibold">
                  {slide.highlight}
                </span>
                {slide.headlineSuffix}
              </h1>

              <p className="text-[14px] text-[#B8B8C4] leading-relaxed max-w-sm">
                {slide.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Actions: Lewati & Lanjut / Mulai */}
        <div className="pt-8">
          <div className="flex items-center gap-3.5">
            {currentSlide < slides.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSkip}
                  className="flex-1 border-white/20 text-white hover:bg-white/5 active:scale-95"
                >
                  Lewati
                </Button>

                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.4]" />}
                  className="flex-[1.5] shadow-[0_8px_20px_rgba(59,143,232,0.4)] active:scale-95"
                >
                  Lanjut
                </Button>
              </>
            ) : (
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                onClick={handleComplete}
                rightIcon={<ArrowRight className="w-5 h-5 stroke-[2.6]" />}
                className="shadow-[0_10px_26px_rgba(59,143,232,0.5)] font-bold text-base py-3.5"
              >
                Mulai Gunakan Hay!
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#B8B8C4]/70 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span>Terkoneksi aman dengan Supabase Auth & RLS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
