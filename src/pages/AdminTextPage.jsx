import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MagnifyingGlass,
  FloppyDisk,
  ArrowCounterClockwise,
  Check,
  WarningCircle,
  ShieldWarning,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { useContentContext } from '../context/ContentContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// Default fallback reference dictionary
const DEFAULT_FALLBACKS = {
  onboarding_slide1_title: 'Satu ruang untuk **lingkaranmu** yang terdekat.',
  onboarding_slide1_desc: 'Bagikan momen hanya ke circle yang kamu percaya tanpa kebisingan publik.',
  onboarding_slide2_title: 'Cerita hari ini, **apa adanya**.',
  onboarding_slide2_desc: 'Bagikan foto, cerita, dan suasana hati tanpa tekanan like palsu & algoritma.',
  onboarding_slide3_title: 'Koneksi yang **berarti** di setiap lingkaran.',
  onboarding_slide3_desc: 'Hanya teman yang kamu undang yang dapat melihat dan memberi reaksi.',
  onboarding_slide4_title: 'Ruang privat untuk **refleksimu**.',
  onboarding_slide4_desc: 'Tiga kalimat saja cukup. Jurnal harian yang 100% rahasia untuk dirimu sendiri.',
  onboarding_btn_next: 'Lanjut',
  onboarding_btn_skip: 'Lewati',
  onboarding_btn_start: 'Mulai',
  login_title: 'Selamat datang di **Hay!**',
  login_desc: 'Masuk untuk membaca kabar lingkaran terdekatmu.',
  login_btn_submit: 'Masuk',
  register_title: 'Buat akun **Hay!**',
  register_desc: 'Mulai berbagi cerita dengan lingkaran terdekatmu.',
  register_btn_submit: 'Daftar',
  feed_greeting_morning: 'Selamat pagi, {nama}.',
  feed_greeting_afternoon: 'Siang, {nama}.',
  feed_greeting_evening: 'Sore, {nama}.',
  feed_greeting_night: 'Malam, {nama}.',
  feed_empty_title: 'Masih sepi.',
  feed_empty_desc: 'Ajak satu teman masuk ke circle-mu, atau bagikan cerita pertamamu hari ini.',
  feed_btn_search: 'Cari Teman',
  feed_btn_post: 'Bagikan',
  post_placeholder: 'Hari ini ada cerita apa?',
  post_btn_share: 'Bagikan',
  post_btn_cancel: 'Batal',
  journal_title: 'Tiga kalimat saja cukup.',
  journal_streak_format: '{n} hari beruntun',
  journal_placeholder: 'Hari ini apa yang paling kamu syukuri atau pelajari?',
  journal_btn_save: 'Simpan Catatan',
  journal_empty_desc: 'Tiga kalimat saja cukup. Mulai tulis refleksi singkat hari ini.',
  circle_header_title: 'Circle Teman',
  circle_header_desc: 'Lingkaran cerita yang terisolasi dan privat',
  circle_btn_create: 'Buat Circle',
  circle_empty_desc: "Buat circle pertamamu seperti 'Keluarga' atau 'Sahabat Dekat' untuk berbagi cerita.",
  profile_btn_edit: 'Edit Profil',
  profile_btn_logout: 'Keluar dari Akun',
  profile_admin_menu: 'Kelola Teks',
  common_error_retry: 'Yah, gagal. Coba lagi sebentar.',
  notification_empty_desc: 'Semua permintaan pertemanan telah kamu tanggapi.',
}

export default function AdminTextPage({ onBack }) {
  const { profile } = useAuth()
  const { contentList, contentMap, updateContent } = useContentContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Semua')
  const [editValues, setEditValues] = useState({})
  const [savingKey, setSavingKey] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const isAdmin = !!profile?.is_admin

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2400)
  }

  // Handle Text Change
  const handleChange = (key, val) => {
    setEditValues((prev) => ({ ...prev, [key]: val }))
  }

  // Save Item
  const handleSave = async (item) => {
    const newVal = editValues[item.key] !== undefined ? editValues[item.key] : item.value
    setSavingKey(item.key)

    const res = await updateContent(item.key, newVal)
    setSavingKey(null)

    if (res?.success) {
      showToast('Tersimpan')
    } else {
      showToast('Gagal menyimpan perubahan')
    }
  }

  // Restore Default
  const handleRestoreDefault = async (item) => {
    const defaultVal = DEFAULT_FALLBACKS[item.key] || item.value
    setEditValues((prev) => ({ ...prev, [item.key]: defaultVal }))
    setSavingKey(item.key)

    const res = await updateContent(item.key, defaultVal)
    setSavingKey(null)

    if (res?.success) {
      showToast('Teks dikembalikan ke default')
    }
  }

  // If not admin, access denied
  if (!isAdmin) {
    return (
      <div className="p-6 min-h-screen bg-app text-main flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-[#E8452C]/10 text-[#E8452C]">
          <ShieldWarning size={40} weight="bold" />
        </div>
        <h2 className="font-serif text-xl font-bold text-main">
          Akses Khusus Admin
        </h2>
        <p className="font-sans text-xs text-muted max-w-xs leading-relaxed">
          Halaman ini hanya dapat diakses oleh akun admin Hay!. Jalankan query di Supabase SQL Editor untuk memberikan status is_admin.
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={onBack}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  // Collect all items (from database or fallbacks)
  const items = contentList.length > 0
    ? contentList
    : Object.keys(DEFAULT_FALLBACKS).map((k) => ({
        key: k,
        value: DEFAULT_FALLBACKS[k],
        label: k.replace(/_/g, ' '),
        grup: k.startsWith('onboarding') ? 'Onboarding' : k.startsWith('login') || k.startsWith('register') ? 'Autentikasi' : k.startsWith('journal') ? 'Jurnal' : k.startsWith('circle') ? 'Circle' : 'Umum',
      }))

  // Extract unique groups
  const groups = ['Semua', ...Array.from(new Set(items.map((i) => i.grup))).filter(Boolean)]

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesGroup = selectedGroup === 'Semua' || item.grup === selectedGroup
    const q = searchQuery.toLowerCase()
    const matchesQuery =
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      (item.value && item.value.toLowerCase().includes(q))
    return matchesGroup && matchesQuery
  })

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#FF6A3D] text-[#15110E] font-sans font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <Check size={16} weight="bold" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Kembali"
          className="p-2 rounded-full hover:bg-surface-2 text-main transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-main tracking-tight">
            Kelola Teks Aplikasi
          </h1>
          <p className="font-sans text-xs text-muted">
            Kustomisasi mikrocopy & headline secara langsung
          </p>
        </div>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative flex items-center">
        <MagnifyingGlass size={18} weight="bold" className="absolute left-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari label, kata kunci, atau isi teks..."
          className="w-full bg-surface-2 text-main font-sans text-sm pl-10 pr-4 py-2.5 rounded-[14px] border border-border focus:outline-none focus:border-accent placeholder:text-muted/60"
        />
      </div>

      {/* Tab Filter Grup */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setSelectedGroup(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGroup === g
                ? 'bg-accent text-[#15110E] shadow-sm'
                : 'bg-surface-2 text-muted hover:text-main border border-border'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Petunjuk Sintaks */}
      <div className="p-3 rounded-[14px] bg-surface-2/60 border border-border text-xs text-muted font-sans space-y-1">
        <p className="font-bold text-main">Tip Penulisan Teks:</p>
        <p>• Gunakan tanda <code className="text-accent font-bold">**kata**</code> untuk memberikan sorotan garis bawah bergelombang.</p>
        <p>• Template <code className="text-accent font-bold">{'{nama}'}</code> atau <code className="text-accent font-bold">{'{n}'}</code> akan diganti secara dinamis.</p>
      </div>

      {/* Daftar Teks per Grup */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const currentValue =
            editValues[item.key] !== undefined
              ? editValues[item.key]
              : contentMap[item.key] !== undefined
              ? contentMap[item.key]
              : item.value

          const isModified = currentValue !== (contentMap[item.key] ?? item.value)
          const isSaving = savingKey === item.key

          return (
            <Card key={item.key} variant="default" className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-sm font-bold text-main">
                    {item.label}
                  </h3>
                  <span className="font-mono text-[10px] text-muted block mt-0.5">
                    {item.key} • grup: {item.grup}
                  </span>
                </div>
              </div>

              {/* Textarea Konten */}
              <textarea
                rows={2}
                value={currentValue}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="w-full bg-surface-2 text-main font-sans text-xs p-3 rounded-[12px] border border-border focus:outline-none focus:border-accent resize-none leading-relaxed"
              />

              {/* Action Buttons: Simpan & Kembalikan default */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleRestoreDefault(item)}
                  className="font-sans text-xs text-muted hover:text-main flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowCounterClockwise size={13} weight="bold" />
                  <span>Kembalikan default</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={() => handleSave(item)}
                  leftIcon={<FloppyDisk size={14} weight="bold" />}
                >
                  Simpan
                </Button>
              </div>
            </Card>
          )
        })}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs text-muted font-sans">
            Tidak ada teks yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  )
}
