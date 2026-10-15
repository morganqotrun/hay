import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  X,
  Check,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'

// 6 Mood Resmi (Chip Solid, Teks Putih)
const MOOD_OPTIONS = [
  { id: 'Senang', label: 'Senang ☀️', color: 'senang', hex: '#FFB627' },
  { id: 'Santai', label: 'Santai 🍃', color: 'santai', hex: '#3ED9E8' },
  { id: 'Sibuk', label: 'Sibuk ⚡', color: 'sibuk', hex: '#8CC63F' },
  { id: 'Lelah', label: 'Lelah 🌙', color: 'lelah', hex: '#9B6DE8' },
  { id: 'Sedih', label: 'Sedih 🌧️', color: 'sedih', hex: '#2B5FA8' },
  { id: 'Semangat', label: 'Semangat 🔥', color: 'semangat', hex: '#FF5A36' },
]

export default function CreatePostPage({ onBack, onPostCreated }) {
  const { user } = useAuth()

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
            { id: 'c-terdekat', nama: 'Terdekat', warna_hex: '#FF5A36' },
            { id: 'c-keluarga', nama: 'Keluarga', warna_hex: '#E8467C' },
            { id: 'c-kolega', nama: 'Kolega Kerja', warna_hex: '#3B8FE8' },
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
        if (prev.length === 1) {
          // Tetap minimal 1 circle
          return prev
        }
        return prev.filter((id) => id !== circleId)
      } else {
        return [...prev, circleId]
      }
    })
  }

  // Back confirmation if has content
  const handleBackWithConfirm = () => {
    if (kontenTeks.trim() || fotoPreview) {
      if (window.confirm('Batalkan post ini? Tulisan dan foto yang belum dibagikan akan hilang.')) {
        onBack()
      }
    } else {
      onBack()
    }
  }

  // Submit Post
  const handleBagikanPost = async (e) => {
    e.preventDefault()

    if (!kontenTeks.trim() && !fotoPreview) {
      setErrorMessage('Tuliskan cerita atau pilih minimal 1 foto terlebih dahulu.')
      return
    }

    if (selectedCircleIds.length === 0) {
      setErrorMessage('Pilih minimal 1 circle tujuan postingan ini.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      let finalFotoUrl = fotoPreview

      // 1. Upload foto ke Supabase Storage 'posts' jika ada file
      if (fotoFile && user?.id) {
        const fileExt = fotoFile.name.split('.').pop()
        const fileName = `${user.id}_post_${Date.now()}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, fotoFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath)
          finalFotoUrl = publicData?.publicUrl || fotoPreview
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

      // 3. Insert ke relasi many-to-many `post_circles`
      if (postData?.id) {
        const relations = selectedCircleIds.map((cId) => ({
          post_id: postData.id,
          circle_id: cId,
        }))
        await supabase.from('post_circles').insert(relations)
      }

      // Success callback
      if (onPostCreated) {
        onPostCreated({
          ...newPostPayload,
          id: postData?.id || 'post-' + Date.now(),
          circles: userCircles.filter((c) => selectedCircleIds.includes(c.id)),
        })
      }
      onBack()
    } catch (err) {
      setErrorMessage('Gagal membagikan postingan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled =
    (!kontenTeks.trim() && !fotoPreview) || selectedCircleIds.length === 0

  return (
    <div className="min-h-screen bg-app text-main flex flex-col justify-between select-none">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackWithConfirm}
            className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/80 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <h2 className="text-[17px] font-bold text-main tracking-tight leading-none">
            Buat Post Baru
          </h2>
        </div>

        <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
          <Lock className="w-3 h-3 text-[#8CC63F]" /> Circle Privat
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-[#FF5A36]/15 border border-[#FF5A36]/40 text-xs text-[#FF5A36] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Area Media Foto */}
        <div>
          {fotoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-md max-h-72 w-full group">
              <img
                src={fotoPreview}
                alt="Preview Post"
                className="w-full h-full object-cover max-h-72"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Tombol X Hapus */}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-[#FF5A36] transition-all active:scale-95 shadow-md"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border hover:border-[#3ED9E8]/60 bg-surface-subtle/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.99] group">
              <div className="p-3 rounded-full bg-surface border border-border text-[#3ED9E8] group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="text-center">
                <span className="text-xs font-semibold text-main block">
                  Bagikan momen foto
                </span>
                <span className="text-[11px] text-muted">
                  Mendukung foto format JPG, PNG, atau WebP
                </span>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white shadow-sm mt-1">
                Tambah Foto +
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Textarea Konten (Auto-expand) */}
        <div className="space-y-1">
          <textarea
            ref={textareaRef}
            rows={4}
            value={kontenTeks}
            onChange={handleTextChange}
            placeholder="Apa yang kamu rasakan hari ini? Ceritakan apa adanya..."
            className="w-full bg-surface text-main text-[15px] p-4 rounded-2xl border border-border focus:outline-none focus:border-[#3B8FE8] transition-all resize-none leading-relaxed placeholder:text-muted/50"
          />
        </div>

        {/* Pilih Mood (Horizontal Scrolling Chips Solid) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted px-1 block">
            Pilih Suasana Hati (Mood)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.id
              return (
                <Chip
                  key={mood.id}
                  colorHex={isSelected ? mood.hex : undefined}
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

        {/* Bagikan ke Circle (MULTI-SELECT CHIP DENGAN CHECKMARK) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Bagikan ke Circle (Multi-select)
            </label>
            <span className="text-[10px] text-muted">Wajib minimal 1 circle</span>
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
                    backgroundColor: isSelected ? circle.warna_hex || '#FF5A36' : 'transparent',
                    borderColor: circle.warna_hex || '#FF5A36',
                  }}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: circle.warna_hex || '#FF5A36' }}
                    />
                  )}
                  <span>{circle.nama}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="p-4 bg-surface/95 backdrop-blur-xl border-t border-border">
        <Button
          type="button"
          variant="gradient"
          size="lg"
          fullWidth
          disabled={isButtonDisabled || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleBagikanPost}
          className="shadow-[0_8px_20px_rgba(59,143,232,0.45)] font-bold text-base py-3.5"
        >
          {isSubmitting ? 'Membagikan...' : 'Bagikan Cerita'}
        </Button>
      </div>
    </div>
  )
}
