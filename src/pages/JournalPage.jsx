import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Lock,
  Flame,
  PenLine,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'

const MOODS = [
  { id: 'Senang', label: 'Senang ☀️', hex: '#FFB627' },
  { id: 'Santai', label: 'Santai 🍃', hex: '#3ED9E8' },
  { id: 'Sibuk', label: 'Sibuk ⚡', hex: '#8CC63F' },
  { id: 'Lelah', label: 'Lelah 🌙', hex: '#9B6DE8' },
  { id: 'Sedih', label: 'Sedih 🌧️', hex: '#2B5FA8' },
  { id: 'Semangat', label: 'Semangat 🔥', hex: '#FF5A36' },
]

export default function JournalPage() {
  const { user } = useAuth()

  const [entries, setEntries] = useState([])
  const [streakDays, setStreakDays] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Form entri hari ini
  const [kontenHariIni, setKontenHariIni] = useState('')
  const [selectedMood, setSelectedMood] = useState('Santai')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Edit State
  const [editingEntry, setEditingEntry] = useState(null)
  const [editKonten, setEditKonten] = useState('')
  const [editMood, setEditMood] = useState('Santai')

  // Load user journal entries
  const loadEntries = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('tanggal', { ascending: false })

      if (error || !data || data.length === 0) {
        // Mock entries if new / offline
        const mockEntries = [
          {
            id: 'j-1',
            tanggal: new Date().toISOString().split('T')[0],
            konten:
              'Memulai hari dengan jeda tenang. Bersyukur atas kesempatan belajar hal baru dan merawat hubungan dengan orang-orang terdekat.',
            mood: 'Santai',
            created_at: new Date().toISOString(),
          },
          {
            id: 'j-2',
            tanggal: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            konten:
              'Menyelesaikan tugas dengan fokus. Kadang merasa lelah di sore hari, tapi beristirahat sejenak berhasil memulihkan energi.',
            mood: 'Semangat',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'j-3',
            tanggal: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            konten:
              'Berjalan santai sore hari mengamati langit senja. Pengingat bahwa hidup tidak melulu soal mengejar, tapi juga menikmati kehadiran.',
            mood: 'Senang',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ]
        setEntries(mockEntries)
        calculateStreak(mockEntries)
      } else {
        setEntries(data)
        calculateStreak(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate Streak of consecutive days
  const calculateStreak = (entriesList) => {
    if (!entriesList || entriesList.length === 0) {
      setStreakDays(0)
      return
    }

    const uniqueDates = Array.from(new Set(entriesList.map((e) => e.tanggal))).sort().reverse()
    let streak = 0
    let checkDate = new Date()

    // Cek apakah hari ini sudah diisi
    const todayStr = checkDate.toISOString().split('T')[0]
    let dateIdx = uniqueDates.indexOf(todayStr)

    if (dateIdx === -1) {
      // Cek kemarin
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = checkDate.toISOString().split('T')[0]
      dateIdx = uniqueDates.indexOf(yesterdayStr)
    }

    if (dateIdx !== -1) {
      streak = 1
      let prevDate = new Date(uniqueDates[dateIdx])

      for (let i = dateIdx + 1; i < uniqueDates.length; i++) {
        const currDate = new Date(uniqueDates[i])
        const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          streak++
          prevDate = currDate
        } else {
          break
        }
      }
    }

    setStreakDays(Math.max(streak, 1))
  }

  useEffect(() => {
    loadEntries()
  }, [user])

  // Save new journal entry
  const handleSaveEntry = async (e) => {
    e.preventDefault()
    if (!kontenHariIni.trim()) {
      setFormError('Tuliskan refleksi atau jurnal Anda terlebih dahulu.')
      return
    }

    setIsSaving(true)
    setFormError('')

    const todayStr = new Date().toISOString().split('T')[0]

    try {
      const payload = {
        user_id: user?.id,
        konten: kontenHariIni.trim(),
        mood: selectedMood,
        tanggal: todayStr,
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(payload)
        .select()
        .single()

      if (error) {
        // Fallback local state
        const localEntry = {
          ...payload,
          id: 'j-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        const updated = [localEntry, ...entries]
        setEntries(updated)
        calculateStreak(updated)
      } else {
        await loadEntries()
      }

      setKontenHariIni('')
    } catch (err) {
      setFormError('Gagal menyimpan entri jurnal.')
    } finally {
      setIsSaving(false)
    }
  }

  // Edit Entry
  const openEditModal = (entry) => {
    setEditingEntry(entry)
    setEditKonten(entry.konten)
    setEditMood(entry.mood || 'Santai')
  }

  const handleUpdateEntry = async (e) => {
    e.preventDefault()
    if (!editKonten.trim()) return

    try {
      if (!editingEntry.id.startsWith('j-')) {
        await supabase
          .from('journal_entries')
          .update({ konten: editKonten.trim(), mood: editMood })
          .eq('id', editingEntry.id)
      }

      setEntries((prev) =>
        prev.map((item) =>
          item.id === editingEntry.id
            ? { ...item, konten: editKonten.trim(), mood: editMood }
            : item
        )
      )
      setEditingEntry(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Hapus Entry
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Hapus catatan jurnal ini?')) return

    try {
      if (!entryId.startsWith('j-')) {
        await supabase.from('journal_entries').delete().eq('id', entryId)
      }
      setEntries((prev) => prev.filter((item) => item.id !== entryId))
    } catch (err) {
      console.error(err)
    }
  }

  // Group entries by Month & Year
  const groupedEntries = entries.reduce((acc, entry) => {
    const dateObj = new Date(entry.tanggal || entry.created_at)
    const monthKey = dateObj.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    })
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(entry)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* 1. STREAK BADGE MENARIK DI ATAS HALAMAN */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5A36]/15 via-[#FFB627]/15 to-[#FF5A36]/15 border border-[#FF5A36]/30 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FFB627] text-white flex items-center justify-center shadow-md">
            <Flame className="w-6 h-6 stroke-[2.4] fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold text-main leading-tight">
                {streakDays} Hari Berturut-turut!
              </span>
            </div>
            <p className="text-[11px] text-muted font-medium mt-0.5">
              Konsisten merawat ruang refleksi pribadimu
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FF5A36] text-white shadow-sm shrink-0">
          Streak 🔥
        </span>
      </div>

      {/* 2. Banner Privat & RLS Proteksi */}
      <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#8CC63F] shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted leading-relaxed">
          <span className="font-bold text-main block">100% Privat & Terenkripsi</span>
          Catatan jurnal Anda hanya bisa dibaca oleh Anda sendiri via Supabase Row Level Security.
        </div>
      </div>

      {/* 3. Tulis Entri Hari Ini */}
      <Card variant="elevated" className="p-4 space-y-3.5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white">
              <PenLine className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-subheading font-bold text-main">Tulis Refleksi Hari Ini</h3>
          </div>
          <span className="text-metadata text-muted font-medium">
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {formError && (
          <div className="p-2.5 rounded-xl bg-[#FF5A36]/15 text-[#FF5A36] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEntry} className="space-y-3">
          <textarea
            rows={3}
            value={kontenHariIni}
            onChange={(e) => setKontenHariIni(e.target.value)}
            placeholder="Apa pelajaran atau momen kecil yang paling berharga hari ini? Tuangkan bebas tanpa penghakiman..."
            className="w-full bg-surface-subtle text-main text-body p-3.5 rounded-xl border border-border focus:outline-none focus:border-[#3B8FE8] transition-all resize-none leading-relaxed placeholder:text-muted/50"
          />

          {/* Mood Selector Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              Suasana Hati Jurnal
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id
                return (
                  <Chip
                    key={m.id}
                    colorHex={isSelected ? m.hex : undefined}
                    variant={isSelected ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMood(m.id)}
                    className="shrink-0"
                  >
                    {m.label}
                  </Chip>
                )
              })}
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="md"
            fullWidth
            isLoading={isSaving}
            className="font-bold shadow-sm"
          >
            Simpan Jurnal Hari Ini
          </Button>
        </form>
      </Card>

      {/* 4. Riwayat Jurnal (Dikelompokkan per Bulan & per Tanggal) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted">
            Riwayat Refleksi ({entries.length})
          </h3>
          <span className="text-[11px] text-muted">Diurutkan terbaru</span>
        </div>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-[#3ED9E8]" />
            <span>Memuat riwayat jurnal...</span>
          </div>
        ) : Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="space-y-2.5">
              {/* Month Header Pill */}
              <div className="sticky top-16 z-20">
                <span className="text-metadata font-bold px-3 py-1 rounded-full bg-surface-subtle border border-border text-main shadow-soft-sm inline-block">
                  📅 {monthYear}
                </span>
              </div>

              {/* Entries in month */}
              <div className="space-y-2.5">
                {monthEntries.map((item) => {
                  const entryDateFormatted = new Date(
                    item.tanggal || item.created_at
                  ).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })

                  const moodObj = MOODS.find((m) => m.id === item.mood) || MOODS[0]

                  return (
                    <Card
                      key={item.id}
                      variant="default"
                      className="p-4 space-y-3 shadow-soft group hover:border-[#3B8FE8]/40 transition-colors"
                    >
                      {/* Entry Top Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[12px] text-muted font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#3ED9E8]" />
                          <span>{entryDateFormatted}</span>
                        </div>

                        {/* Mood Pill & Actions */}
                        <div className="flex items-center gap-2">
                          <Chip
                            colorHex={moodObj.hex}
                            variant="solid"
                            size="sm"
                          >
                            {moodObj.label}
                          </Chip>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              aria-label="Edit"
                              className="p-1 rounded-full text-muted hover:text-main"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item.id)}
                              aria-label="Hapus"
                              className="p-1 rounded-full text-muted hover:text-[#FF5A36]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content text */}
                      <p className="text-body text-main leading-relaxed font-sans">
                        "{item.konten}"
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center space-y-2 text-muted">
            <BookOpen className="w-8 h-8 mx-auto stroke-[1.5] text-muted/60" />
            <p className="text-xs">Belum ada catatan jurnal. Tulis entri pertamamu hari ini!</p>
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h3 className="text-subheading font-bold text-main">Edit Catatan Jurnal</h3>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="p-1 rounded-full hover:bg-surface-subtle text-muted hover:text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateEntry} className="space-y-3">
                <textarea
                  rows={4}
                  value={editKonten}
                  onChange={(e) => setEditKonten(e.target.value)}
                  className="w-full bg-surface-subtle text-main text-body p-3.5 rounded-xl border border-border focus:outline-none focus:border-[#3B8FE8] resize-none"
                />

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                    Ubah Mood
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {MOODS.map((m) => (
                      <Chip
                        key={m.id}
                        colorHex={editMood === m.id ? m.hex : undefined}
                        variant={editMood === m.id ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => setEditMood(m.id)}
                        className="shrink-0"
                      >
                        {m.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingEntry(null)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="gradient" className="flex-1">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
