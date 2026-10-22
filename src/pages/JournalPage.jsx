import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fire,
  CalendarBlank,
  Lock,
  PencilSimple,
  Trash,
  Pencil,
  X,
  WarningCircle,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'
import { EmptyJournalSketch } from '../components/ui/EmptyStateIllustrations'
import { useContentContext } from '../context/ContentContext'

const MOODS = [
  { id: 'Senang', label: 'Senang', hex: '#F2B134' },
  { id: 'Santai', label: 'Santai', hex: '#4FA05A' },
  { id: 'Sibuk', label: 'Sibuk', hex: '#1E9C93' },
  { id: 'Lelah', label: 'Lelah', hex: '#4A63D6' },
  { id: 'Sedih', label: 'Sedih', hex: '#F08CAE' },
  { id: 'Semangat', label: 'Semangat', hex: '#E8452C' },
]

export default function JournalPage() {
  const { user } = useAuth()
  const { t } = useContentContext()

  const [entries, setEntries] = useState([])
  const [streakDays, setStreakDays] = useState(0)
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

      const list = (!error && data) ? data : []
      setEntries(list)
      calculateStreak(list)
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

    const uniqueDates = Array.from(
      new Set(entriesList.map((e) => e.tanggal || e.created_at?.split('T')[0]))
    ).sort((a, b) => new Date(b) - new Date(a))

    const todayStr = new Date().toISOString().split('T')[0]
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let currentStreak = 0
    let checkDate = new Date()

    if (uniqueDates[0] === todayStr) {
      currentStreak = 1
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (uniqueDates[0] === yesterdayStr) {
      currentStreak = 0
    } else {
      setStreakDays(0)
      return
    }

    for (let i = currentStreak ? 1 : 0; i < uniqueDates.length; i++) {
      const dateExpected = checkDate.toISOString().split('T')[0]
      if (uniqueDates[i] === dateExpected) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    setStreakDays(currentStreak)
  }

  useEffect(() => {
    loadEntries()
  }, [user])

  // Simpan Entri Hari Ini
  const handleSaveEntry = async (e) => {
    e.preventDefault()
    if (!kontenHariIni.trim()) {
      setFormError('Tulis beberapa kalimat refleksi terlebih dahulu.')
      return
    }

    setIsSaving(true)
    setFormError('')

    const today = new Date().toISOString().split('T')[0]

    try {
      const newEntry = {
        user_id: user?.id,
        konten: kontenHariIni.trim(),
        mood: selectedMood,
        tanggal: today,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(newEntry)
        .select()
        .single()

      if (error) throw error

      const updated = [data || newEntry, ...entries]
      setEntries(updated)
      calculateStreak(updated)
      setKontenHariIni('')
    } catch (err) {
      console.error(err)
      setFormError('Yah, gagal. Coba lagi sebentar.')
    } finally {
      setIsSaving(false)
    }
  }

  // Buka Modal Edit
  const openEditModal = (entry) => {
    setEditingEntry(entry)
    setEditKonten(entry.konten)
    setEditMood(entry.mood || 'Santai')
  }

  // Update Entri
  const handleUpdateEntry = async (e) => {
    e.preventDefault()
    if (!editKonten.trim()) return

    try {
      await supabase
        .from('journal_entries')
        .update({ konten: editKonten.trim(), mood: editMood })
        .eq('id', editingEntry.id)

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
      await supabase.from('journal_entries').delete().eq('id', entryId)
      const filtered = entries.filter((item) => item.id !== entryId)
      setEntries(filtered)
      calculateStreak(filtered)
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
      {/* 1. STREAK BADGE: "{n} hari beruntun" */}
      <div className="p-4 rounded-[18px] bg-surface-2 border border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#FF6A3D] text-[#15110E] flex items-center justify-center shadow-[0_2px_0_#B8431F]">
            <Fire size={22} weight="fill" />
          </div>
          <div>
            <span className="font-serif text-base font-bold text-main leading-tight block">
              {t('journal_streak_format', '{n} hari beruntun', { n: streakDays })}
            </span>
            <p className="font-sans text-xs text-muted mt-0.5">
              {t('journal_subtitle', 'Tiga kalimat saja cukup.')}
            </p>
          </div>
        </div>

        <span className="font-serif text-xs font-bold px-3 py-1 rounded-full bg-surface border border-border text-main shrink-0">
          Streak
        </span>
      </div>

      {/* 2. Banner Privat */}
      <div className="p-3.5 rounded-[14px] bg-surface-2/60 border border-border flex items-start gap-2.5">
        <Lock size={16} weight="bold" className="text-[#4FA05A] shrink-0 mt-0.5" />
        <div className="text-xs text-muted leading-relaxed font-sans">
          <span className="font-bold text-main block">100% Privat</span>
          Catatan jurnal Anda hanya bisa dibaca oleh Anda sendiri.
        </div>
      </div>

      {/* 3. Tulis Entri Hari Ini */}
      <Card variant="default" className="p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PencilSimple size={18} weight="bold" className="text-accent" />
            <h3 className="font-serif text-base font-bold text-main">
              {t('journal_title', 'Tiga kalimat saja cukup.')}
            </h3>
          </div>
          <span className="font-sans text-xs text-muted">
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {formError && (
          <div className="p-2.5 rounded-[12px] bg-[#E8452C]/10 text-[#E8452C] text-xs flex items-center gap-2">
            <WarningCircle size={16} weight="bold" className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEntry} className="space-y-3">
          <textarea
            rows={3}
            value={kontenHariIni}
            onChange={(e) => setKontenHariIni(e.target.value)}
            placeholder="Hari ini apa yang paling kamu syukuri atau pelajari?"
            className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent transition-all resize-none leading-relaxed placeholder:text-muted/60"
          />

          {/* Mood Selector Chips (Stiker Mood) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider block">
              Suasana Hati
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id
                return (
                  <Chip
                    key={m.id}
                    isSticker={true}
                    colorHex={m.hex}
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
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSaving}
          >
            {t('journal_btn_save', 'Simpan Catatan')}
          </Button>
        </form>
      </Card>

      {/* 4. Riwayat Jurnal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-sm font-bold text-muted">
            Riwayat ({entries.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted font-sans">
            Memuat catatan jurnal...
          </div>
        ) : Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="space-y-2.5">
              {/* Month Header Pill */}
              <div className="sticky top-16 z-20">
                <span className="font-serif text-xs font-bold px-3 py-1 rounded-full bg-surface-2 border border-border text-main inline-block">
                  {monthYear}
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
                      className="p-4 space-y-2.5"
                    >
                      {/* Entry Top Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <CalendarBlank size={14} weight="bold" />
                          <span>{entryDateFormatted}</span>
                        </div>

                        {/* Mood Sticker & Actions */}
                        <div className="flex items-center gap-2">
                          <Chip
                            isSticker={true}
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
                              <Pencil size={14} weight="bold" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item.id)}
                              aria-label="Hapus"
                              className="p-1 rounded-full text-muted hover:text-[#E8452C]"
                            >
                              <Trash size={14} weight="bold" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content text */}
                      <p className="font-sans text-sm text-main leading-relaxed">
                        "{item.konten}"
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="flex justify-center">
              <EmptyJournalSketch className="w-24 h-24" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-main">
                {t('journal_empty_title', 'Jurnal masih kosong')}
              </h4>
              <p className="font-sans text-xs text-muted max-w-xs mx-auto">
                {t(
                  'journal_empty_desc',
                  'Tiga kalimat saja cukup. Mulai tulis refleksi singkat hari ini.'
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-[22px] sm:rounded-[22px] p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-serif text-base font-bold text-main">Edit Catatan Jurnal</h3>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="p-1 rounded-full text-muted hover:text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <form onSubmit={handleUpdateEntry} className="space-y-3">
                <textarea
                  rows={4}
                  value={editKonten}
                  onChange={(e) => setEditKonten(e.target.value)}
                  className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent resize-none"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider block">
                    Ubah Mood
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {MOODS.map((m) => (
                      <Chip
                        key={m.id}
                        isSticker={true}
                        colorHex={m.hex}
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
                  <Button type="submit" variant="primary" className="flex-1">
                    Simpan
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
