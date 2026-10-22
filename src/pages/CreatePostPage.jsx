import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  X,
  Check,
  WarningCircle,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import { CIRCLE_COLORS } from '../constants/circleColors'
import { useContentContext } from '../context/ContentContext'

// 6 Mood Resmi (Tanpa Emoji UI, ditulis Fraunces Italic)
const MOOD_OPTIONS = [
  { id: 'Senang', label: 'Senang', hex: '#F2B134' },
  { id: 'Santai', label: 'Santai', hex: '#4FA05A' },
  { id: 'Sibuk', label: 'Sibuk', hex: '#1E9C93' },
  { id: 'Lelah', label: 'Lelah', hex: '#4A63D6' },
  { id: 'Sedih', label: 'Sedih', hex: '#F08CAE' },
  { id: 'Semangat', label: 'Semangat', hex: '#E8452C' },
]

export default function CreatePostPage({ onBack, onPostCreated }) {
  const { user } = useAuth()
  const { t } = useContentContext()

  const [kontenTeks, setKontenTeks] = useState('')
  const [selectedMood, setSelectedMood] = useState('Senang')
  const [userCircles, setUserCircles] = useState([])
  const [selectedCircleIds, setSelectedCircleIds] = useState([])
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const textareaRef = useRef(null)

  // Fetch available circles for user
  useEffect(() => {
    async function loadCircles() {
      if (!user?.id) return
      try {
        const { data, error } = await supabase
          .from('circles')
          .select('id, nama, warna_hex, ikon')
          .order('created_at', { ascending: true })

        if (error || !data || data.length === 0) {
          const fallback = [
            { id: 'c-terdekat', nama: 'Terdekat', warna_hex: CIRCLE_COLORS[0].hex },
            { id: 'c-keluarga', nama: 'Keluarga', warna_hex: CIRCLE_COLORS[1].hex },
            { id: 'c-sahabat', nama: 'Sahabat', warna_hex: CIRCLE_COLORS[2].hex },
          ]
          setUserCircles(fallback)
          setSelectedCircleIds([fallback[0].id])
        } else {
          setUserCircles(data)
          if (data.length > 0) {
            setSelectedCircleIds([data[0].id])
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadCircles()
  }, [user])

  // Auto-expand textarea
  const handleTextChange = (e) => {
    setKontenTeks(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  // Handle Photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFotoFile(null)
    setFotoPreview(null)
  }

  // Multi-select toggle circle
  const handleToggleCircle = (circleId) => {
    setSelectedCircleIds((prev) => {
      if (prev.includes(circleId)) {
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== circleId)
      } else {
        return [...prev, circleId]
      }
    })
  }

  // Submit Post
  const handleBagikanPost = async () => {
    if (!kontenTeks.trim() && !fotoFile) {
      setErrorMessage('Tulis cerita atau pilih foto terlebih dahulu.')
      return
    }

    if (selectedCircleIds.length === 0) {
      setErrorMessage('Pilih minimal satu circle tujuan.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      let finalFotoUrl = null

      // 1. Upload foto ke Supabase Storage 'posts' jika ada file (folder auth.uid())
      if (fotoFile && user?.id) {
        const fileExt = fotoFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, fotoFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          finalFotoUrl = filePath
        } else {
          console.error('Upload foto post error:', uploadError)
        }
      }

      // 2. Insert ke tabel `posts`
      const newPostPayload = {
        user_id: user?.id,
        konten_teks: kontenTeks.trim(),
        foto_url: finalFotoUrl,
        mood: selectedMood,
        created_at: new Date().toISOString(),
      }

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert(newPostPayload)
        .select()
        .single()

      if (postError) {
        throw new Error(postError.message)
      }

      // 3. Insert ke relasi many-to-many `post_circles`
      if (postData?.id) {
        const relations = selectedCircleIds.map((cId) => ({
          post_id: postData.id,
          circle_id: cId,
        }))

        await supabase.from('post_circles').insert(relations)
      }

      if (onPostCreated) {
        onPostCreated()
      } else if (onBack) {
        onBack()
      }
    } catch (err) {
      console.error('Create post error:', err)
      setErrorMessage('Yah, gagal. Coba lagi sebentar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = (!kontenTeks.trim() && !fotoFile) || selectedCircleIds.length === 0

  return (
    <div className="min-h-screen bg-app text-main flex flex-col justify-between">
      {/* Header Modal */}
      <div className="sticky top-0 z-20 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="p-2 rounded-full hover:bg-surface-2 text-main transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <h1 className="font-serif text-lg font-bold text-main">
            {t('post_title', 'Cerita Baru')}
          </h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={isButtonDisabled || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleBagikanPost}
        >
          {t('post_btn_share', 'Bagikan')}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5 flex-1 max-w-lg mx-auto w-full">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-[#E8452C]/10 border border-[#E8452C]/30 text-[#E8452C] rounded-[14px] flex items-center gap-2 text-xs">
            <WarningCircle size={16} weight="bold" className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Textarea Konten (Auto-expand, Placeholder baru) */}
        <div className="space-y-1">
          <textarea
            ref={textareaRef}
            rows={4}
            value={kontenTeks}
            onChange={handleTextChange}
            placeholder={t('post_placeholder', 'Hari ini ada cerita apa?')}
            className="w-full bg-surface text-main font-sans text-sm p-4 rounded-[18px] border border-border focus:outline-none focus:border-accent transition-all resize-none leading-relaxed placeholder:text-muted/60"
          />
        </div>

        {/* Upload Foto Polaroid Frame */}
        <div className="space-y-2">
          {fotoPreview ? (
            <div className="relative inline-block my-2">
              <div className="bg-[#FFFDF9] dark:bg-[#261F1A] border border-[#E8DCC8] dark:border-[#4A3C32] p-1.5 pb-4 rounded-[4px] shadow-[0_3px_10px_rgba(0,0,0,0.15)] max-w-xs">
                <img
                  src={fotoPreview}
                  alt="Pratinjau Foto"
                  className="w-full max-h-60 object-cover rounded-[2px]"
                />
              </div>

              {/* Tombol X Hapus */}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-[#E8452C] transition-colors"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border hover:border-accent/60 bg-surface-2/40 rounded-[18px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
              <div className="p-3 rounded-full bg-surface border border-border text-accent group-hover:scale-105 transition-transform">
                <Camera size={22} weight="bold" />
              </div>
              <div className="text-center">
                <span className="text-xs font-semibold text-main block font-sans">
                  Sertakan foto cetak
                </span>
                <span className="text-[11px] text-muted font-sans">
                  Format JPG, PNG, atau WebP
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Pilih Mood (Stiker Mood Fraunces Italic) */}
        <div className="space-y-2">
          <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted px-1 block">
            Suasana Hati (Mood)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.id
              return (
                <Chip
                  key={mood.id}
                  isSticker={true}
                  colorHex={mood.hex}
                  variant={isSelected ? 'solid' : 'outline'}
                  size="md"
                  onClick={() => setSelectedMood(mood.id)}
                  className="shrink-0"
                >
                  {mood.label}
                </Chip>
              )
            })}
          </div>
        </div>

        {/* Bagikan ke Circle (Multi-select) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
              Bagikan ke Circle
            </label>
            <span className="text-[11px] text-muted">Minimal 1 circle</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {userCircles.map((circle) => {
              const isSelected = selectedCircleIds.includes(circle.id)
              return (
                <button
                  key={circle.id}
                  type="button"
                  onClick={() => handleToggleCircle(circle.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-transparent border border-border text-main hover:border-current'
                  }`}
                  style={{
                    backgroundColor: isSelected ? circle.warna_hex || '#FF6A3D' : 'transparent',
                    borderColor: circle.warna_hex || '#FF6A3D',
                  }}
                >
                  {isSelected ? (
                    <Check size={12} weight="bold" className="text-white" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: circle.warna_hex || '#FF6A3D' }}
                    />
                  )}
                  <span className="font-serif">{circle.nama}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
