import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/ui/Button'
import { ArrowRight } from '@phosphor-icons/react'
import { useContentContext } from '../context/ContentContext'
import {
  EmptyFeedSketch,
  EmptyFriendsSketch,
  EmptySearchSketch,
  EmptyJournalSketch,
} from '../components/ui/EmptyStateIllustrations'

const ONBOARDING_STORAGE_KEY = 'hay_onboarding_completed'

const slides = [
  {
    id: 1,
    image: '/onboarding/1.jpg',
    illustration: EmptyFeedSketch,
    fallbackBg: 'bg-[#1F1915]',
    defaultTitle: 'Satu ruang untuk **lingkaranmu** yang terdekat.',
    defaultDesc: 'Bagikan momen hanya ke circle yang kamu percaya tanpa kebisingan publik.',
    tag: 'Circle Privat',
  },
  {
    id: 2,
    image: '/onboarding/2.jpg',
    illustration: EmptyFriendsSketch,
    fallbackBg: 'bg-[#2A221C]',
    defaultTitle: 'Cerita hari ini, **apa adanya**.',
    defaultDesc: 'Bagikan foto, cerita, dan suasana hati tanpa tekanan like palsu & algoritma.',
    tag: 'Tanpa Tekanan',
  },
  {
    id: 3,
    image: '/onboarding/3.jpg',
    illustration: EmptySearchSketch,
    fallbackBg: 'bg-[#1F1915]',
    defaultTitle: 'Koneksi yang **berarti** di setiap lingkaran.',
    defaultDesc: 'Hanya teman yang kamu undang yang dapat melihat dan memberi reaksi.',
    tag: 'Hanya Teman',
  },
  {
    id: 4,
    image: '/onboarding/4.jpg',
    illustration: EmptyJournalSketch,
    fallbackBg: 'bg-[#2A221C]',
    defaultTitle: 'Ruang privat untuk **refleksimu**.',
    defaultDesc: 'Tiga kalimat saja cukup. Jurnal harian yang 100% rahasia untuk dirimu sendiri.',
    tag: 'Jurnal Pribadi',
  },
]

export default function OnboardingPage({ onFinish }) {
  const { getContent, renderContent } = useContentContext()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgErrors, setImgErrors] = useState({})

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
  const hasImgError = imgErrors[slide.id]
  const IllustrationComp = slide.illustration

  const currentTitle = renderContent(`onboarding_slide${slide.id}_title`, slide.defaultTitle)
  const currentDesc = getContent(`onboarding_slide${slide.id}_desc`, slide.defaultDesc)

  return (
    <div className="relative min-h-screen bg-[#15110E] text-[#F6EEE1] flex flex-col justify-between overflow-hidden select-none">
      {/* Visual media container with full-bleed top ~60% */}
      <div className="relative w-full h-[58vh] max-h-[520px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {!hasImgError ? (
              <img
                src={slide.image}
                alt="Visual Onboarding"
                className="w-full h-full object-cover object-center"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [slide.id]: true }))
                }
              />
            ) : (
              <div className={`w-full h-full ${slide.fallbackBg} flex flex-col items-center justify-center p-8 relative`}>
                <IllustrationComp className="w-32 h-32" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gradient Fade to #15110E */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#15110E] via-[#15110E]/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#15110E]/60 to-transparent" />

        {/* Top Wordmark & Tag */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1915]/80 border border-[#3A2F27]">
            <span className="font-serif text-sm font-bold text-[#F6EEE1]">Hay!</span>
          </div>

          <span className="text-[11px] font-sans font-semibold tracking-wide px-3 py-1 rounded-full bg-[#1F1915]/80 text-[#FF6A3D] border border-[#3A2F27]">
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
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? 'w-7 bg-[#FF6A3D]'
                    : 'w-2 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Headline & Subtext */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h1 className="font-serif text-2xl font-bold text-[#F6EEE1] leading-tight tracking-tight">
                {currentTitle}
              </h1>

              <p className="font-sans text-sm text-[#A79A8A] leading-relaxed max-w-sm">
                {currentDesc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="pt-8">
          <div className="flex items-center gap-3">
            {currentSlide < slides.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  {getContent('onboarding_btn_skip', 'Lewati')}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  rightIcon={<ArrowRight size={16} weight="bold" />}
                  className="flex-[1.5]"
                >
                  {getContent('onboarding_btn_next', 'Lanjut')}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleComplete}
                rightIcon={<ArrowRight size={18} weight="bold" />}
              >
                {getContent('onboarding_btn_start', 'Mulai')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
