import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Home,
  Briefcase,
  Heart,
  Star,
  Coffee,
  Music,
  Sparkles,
  Lock,
  Trash2,
  Edit2,
  UserPlus,
  UserMinus,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'

// Preset Ikon Circle
const ICON_PRESETS = [
  { id: 'users', label: 'Circle', icon: Users },
  { id: 'heart', label: 'Cinta/Keluarga', icon: Heart },
  { id: 'home', label: 'Rumah', icon: Home },
  { id: 'star', label: 'Spesial', icon: Star },
  { id: 'briefcase', label: 'Kantor', icon: Briefcase },
  { id: 'coffee', label: 'Nongkrong', icon: Coffee },
  { id: 'music', label: 'Hobi', icon: Music },
  { id: 'balloon', label: 'Momen Seru', icon: Sparkles },
]

// Palet Identitas Circle (WAJIB SOLID & KONTRAS TINGGI)
const COLOR_PRESETS = [
  { id: 'coral', name: 'Coral', hex: '#FF5A36' },
  { id: 'magenta', name: 'Magenta', hex: '#E8467C' },
  { id: 'mustard', name: 'Mustard', hex: '#FFB627' },
  { id: 'lime', name: 'Lime', hex: '#8CC63F' },
  { id: 'biru', name: 'Biru', hex: '#3B8FE8' },
  { id: 'ungu', name: 'Ungu', hex: '#9B6DE8' },
]

export default function CirclesPage() {
  const { user } = useAuth()
  const [circles, setCircles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal Create / Edit Circle State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCircle, setEditingCircle] = useState(null)
  const [circleNama, setCircleNama] = useState('')
  const [selectedIkon, setSelectedIkon] = useState('users')
  const [selectedWarna, setSelectedWarna] = useState('#FF5A36')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Modal Detail Circle State (/circle/:id)
  const [activeCircleDetail, setActiveCircleDetail] = useState(null)
  const [circleMembers, setCircleMembers] = useState([])
  const [acceptedFriends, setAcceptedFriends] = useState([])
  const [selectedFriendToAdd, setSelectedFriendToAdd] = useState('')
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // Fetch Circles list from Supabase
  const loadCircles = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Ambil circle milik user atau di mana user adalah anggotanya
      const { data, error } = await supabase
        .from('circles')
        .select(`
          id,
          owner_id,
          nama,
          warna_hex,
          ikon,
          created_at,
          circle_members (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) {
        // Fallback default circle jika Supabase mock / baru
        const defaultCircles = [
          {
            id: 'c-terdekat',
            owner_id: user.id,
            nama: 'Terdekat',
            warna_hex: '#FF5A36',
            ikon: 'users',
            circle_members: [{ id: 'cm-1', user_id: user.id }],
            memberCount: 3,
            isDefault: true,
          },
          {
            id: 'c-keluarga',
            owner_id: user.id,
            nama: 'Keluarga',
            warna_hex: '#E8467C',
            ikon: 'heart',
            circle_members: [{ id: 'cm-2', user_id: user.id }],
            memberCount: 4,
            isDefault: false,
          },
          {
            id: 'c-kolega',
            owner_id: user.id,
            nama: 'Kolega Kerja',
            warna_hex: '#3B8FE8',
            ikon: 'briefcase',
            circle_members: [{ id: 'cm-3', user_id: user.id }],
            memberCount: 5,
            isDefault: false,
          },
        ]
        setCircles(defaultCircles)
      } else {
        const mapped = data.map((c) => ({
          ...c,
          memberCount: c.circle_members?.length || 1,
          isDefault: c.nama.toLowerCase() === 'terdekat',
        }))
        setCircles(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCircles()
  }, [user])

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCircle(null)
    setCircleNama('')
    setSelectedIkon('users')
    setSelectedWarna('#FF5A36')
    setModalError('')
    setIsCreateModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (circle, e) => {
    if (e) e.stopPropagation()
    setEditingCircle(circle)
    setCircleNama(circle.nama)
    setSelectedIkon(circle.ikon || 'users')
    setSelectedWarna(circle.warna_hex || '#FF5A36')
    setModalError('')
    setIsCreateModalOpen(true)
  }

  // Handle Save (Create or Update Circle)
  const handleSaveCircle = async (e) => {
    e.preventDefault()
    if (!circleNama.trim()) {
      setModalError('Nama circle tidak boleh kosong.')
      return
    }

    setModalLoading(true)
    setModalError('')

    try {
      if (editingCircle) {
        // Update circle
        const { error } = await supabase
          .from('circles')
          .update({
            nama: circleNama.trim(),
            ikon: selectedIkon,
            warna_hex: selectedWarna,
          })
          .eq('id', editingCircle.id)

        if (error) {
          // Local optimistic update
          setCircles((prev) =>
            prev.map((c) =>
              c.id === editingCircle.id
                ? { ...c, nama: circleNama.trim(), ikon: selectedIkon, warna_hex: selectedWarna }
                : c
            )
          )
        } else {
          await loadCircles()
        }
      } else {
        // Buat circle baru
        const { data, error } = await supabase
          .from('circles')
          .insert({
            owner_id: user.id,
            nama: circleNama.trim(),
            ikon: selectedIkon,
            warna_hex: selectedWarna,
          })
          .select()
          .single()

        if (error || !data) {
          // Local fallback
          const newCircle = {
            id: 'circle-' + Date.now(),
            owner_id: user?.id,
            nama: circleNama.trim(),
            ikon: selectedIkon,
            warna_hex: selectedWarna,
            memberCount: 1,
            isDefault: false,
          }
          setCircles((prev) => [...prev, newCircle])
        } else {
          // Tambahkan diri sendiri sebagai anggota
          await supabase.from('circle_members').insert({
            circle_id: data.id,
            user_id: user.id,
          })
          await loadCircles()
        }
      }

      setIsCreateModalOpen(false)
    } catch (err) {
      setModalError('Gagal menyimpan circle.')
    } finally {
      setModalLoading(false)
    }
  }

  // Hapus Circle (Circle Terdekat TIDAK BISA DIHAPUS)
  const handleDeleteCircle = async (circle, e) => {
    if (e) e.stopPropagation()
    if (circle.nama.toLowerCase() === 'terdekat') {
      alert('Circle "Terdekat" adalah circle bawaan utama dan tidak dapat dihapus.')
      return
    }

    if (!window.confirm(`Yakin ingin menghapus circle "${circle.nama}"? Postingan yang hanya dibagikan ke circle ini tidak akan lagi terlihat oleh anggota.`)) {
      return
    }

    try {
      await supabase.from('circles').delete().eq('id', circle.id)
      setCircles((prev) => prev.filter((c) => c.id !== circle.id))
      if (activeCircleDetail?.id === circle.id) {
        setActiveCircleDetail(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Buka Detail Circle (/circle/:id)
  const handleOpenDetail = async (circle) => {
    setActiveCircleDetail(circle)
    setIsDetailLoading(true)

    try {
      // 1. Ambil anggota circle
      const { data: membersData, error: memErr } = await supabase
        .from('circle_members')
        .select(`
          id,
          joined_at,
          user:users (
            id,
            nama,
            username,
            foto_url
          )
        `)
        .eq('circle_id', circle.id)

      if (memErr || !membersData) {
        // Fallback mock members
        setCircleMembers([
          {
            id: 'm-1',
            user: {
              id: user?.id,
              nama: user?.user_metadata?.nama || 'Saya (Pemilik)',
              username: user?.user_metadata?.username || 'me',
              foto_url: null,
            },
          },
          {
            id: 'm-2',
            user: {
              id: 'u-2',
              nama: 'Alya Rahmawati',
              username: 'alyarahma',
              foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            },
          },
        ])
      } else {
        setCircleMembers(membersData.map((m) => ({ id: m.id, user: m.user })))
      }

      // 2. Ambil teman yang statusnya accepted untuk opsi "Tambah Anggota"
      if (user?.id) {
        const { data: friendData } = await supabase
          .from('friendships')
          .select(`
            id,
            requester_id,
            receiver_id,
            requester:users!friendships_requester_id_fkey(id, nama, username, foto_url),
            receiver:users!friendships_receiver_id_fkey(id, nama, username, foto_url)
          `)
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

        if (friendData) {
          const friendsList = friendData.map((f) =>
            f.requester_id === user.id ? f.receiver : f.requester
          )
          setAcceptedFriends(friendsList)
        } else {
          setAcceptedFriends([
            { id: 'u-dimas', nama: 'Dimas Kurnia', username: 'dimaskurnia' },
            { id: 'u-rizky', nama: 'Rizky Pratama', username: 'rizkypratama' },
          ])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDetailLoading(false)
    }
  }

  // Tambah Anggota ke Circle
  const handleAddMember = async () => {
    if (!selectedFriendToAdd || !activeCircleDetail?.id) return

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .insert({
          circle_id: activeCircleDetail.id,
          user_id: selectedFriendToAdd,
        })
        .select()
        .single()

      const friendObj = acceptedFriends.find((f) => f.id === selectedFriendToAdd)
      if (friendObj) {
        setCircleMembers((prev) => [
          ...prev,
          { id: data?.id || 'temp-' + Date.now(), user: friendObj },
        ])
      }
      setSelectedFriendToAdd('')
      loadCircles()
    } catch (err) {
      console.error(err)
    }
  }

  // Keluarkan Anggota dari Circle (Hanya Owner)
  const handleRemoveMember = async (memberUserId, memberRecordId) => {
    if (memberUserId === user?.id) {
      alert('Anda tidak bisa mengeluarkan diri Anda sendiri dari circle milik Anda.')
      return
    }

    if (!window.confirm('Keluarkan anggota ini dari circle?')) return

    try {
      if (memberRecordId && !memberRecordId.startsWith('temp-')) {
        await supabase.from('circle_members').delete().eq('id', memberRecordId)
      }
      setCircleMembers((prev) => prev.filter((m) => m.user?.id !== memberUserId))
      loadCircles()
    } catch (err) {
      console.error(err)
    }
  }

  const getPresetIconComponent = (iconId) => {
    const found = ICON_PRESETS.find((p) => p.id === iconId)
    return found ? found.icon : Users
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-main tracking-tight leading-tight">
            Lingkaran Privat
          </h2>
          <p className="text-[12px] text-muted">
            Atur siapa saja yang dapat membaca postinganmu
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold"
        >
          Buat Circle
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-xs text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-[#3ED9E8]" />
          <span>Memuat lingkaran circle...</span>
        </div>
      )}

      {/* Circle Cards List */}
      {!isLoading && (
        <div className="space-y-3">
          {circles.map((circle) => {
            const IconComponent = getPresetIconComponent(circle.ikon)
            const isOwner = circle.owner_id === user?.id
            const isDefault = circle.isDefault || circle.nama.toLowerCase() === 'terdekat'

            return (
              <Card
                key={circle.id}
                variant="default"
                onClick={() => handleOpenDetail(circle)}
                className="p-4 cursor-pointer hover:border-[#3B8FE8]/40 transition-all duration-200 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Circle Color Badge Icon (SOLID & KONTRAS TINGGI) */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: circle.warna_hex || '#FF5A36' }}
                    >
                      <IconComponent className="w-5 h-5 stroke-[2.4]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-main truncate">
                          {circle.nama}
                        </h3>
                        {isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5A36]/15 text-[#FF5A36] border border-[#FF5A36]/30 shrink-0">
                            Utama
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#3ED9E8]" />
                        <span>{circle.memberCount} anggota aktif</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditModal(circle, e)}
                      aria-label="Edit Circle"
                      className="p-2 rounded-full hover:bg-surface-elevated text-muted hover:text-main transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!isDefault && (
                      <button
                        onClick={(e) => handleDeleteCircle(circle, e)}
                        aria-label="Hapus Circle"
                        className="p-2 rounded-full hover:bg-surface-elevated text-muted hover:text-[#FF5A36] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-[11px]">
                  <span className="text-muted flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#8CC63F]" /> Terisolasi via Post Circles RLS
                  </span>
                  <span className="text-[#3ED9E8] font-semibold hover:underline">
                    Kelola Anggota →
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Buat / Edit Circle */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h3 className="text-[18px] font-bold text-main">
                  {editingCircle ? 'Edit Circle' : 'Buat Circle Baru'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-subtle text-muted hover:text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-[#FF5A36]/15 border border-[#FF5A36]/30 text-xs text-[#FF5A36] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCircle} className="space-y-4">
                {/* Field Nama */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    Nama Circle
                  </label>
                  <input
                    type="text"
                    value={circleNama}
                    onChange={(e) => setCircleNama(e.target.value)}
                    placeholder="Contoh: Sahabat Kuliah, Keluarga Besar"
                    required
                    className="w-full bg-surface-subtle text-main text-body px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#3B8FE8]"
                  />
                </div>

                {/* Preset Ikon */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    Pilih Ikon Preset
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_PRESETS.map((item) => {
                      const IconComp = item.icon
                      const isSelected = selectedIkon === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedIkon(item.id)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected
                              ? 'border-[#3ED9E8] bg-[#3ED9E8]/15 text-[#3ED9E8] font-bold scale-105'
                              : 'border-border bg-surface-subtle text-muted hover:text-main'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                          <span className="text-[10px] truncate max-w-full">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Preset Warna Identitas (WAJIB SOLID & KONTRAS TINGGI) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    Pilih Warna Identitas
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    {COLOR_PRESETS.map((color) => {
                      const isSelected = selectedWarna === color.hex
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedWarna(color.hex)}
                          aria-label={color.name}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-sm hover:scale-110 active:scale-95"
                          style={{
                            backgroundColor: color.hex,
                            outline: isSelected ? '3px solid white' : 'none',
                            outlineOffset: '2px',
                          }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Live Preview Chip (Sesuai Spesifikasi) */}
                <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                    Preview Live Chip
                  </span>
                  <div className="flex items-center gap-2">
                    <Chip
                      colorHex={selectedWarna}
                      variant="solid"
                      icon={React.createElement(getPresetIconComponent(selectedIkon), {
                        className: 'w-3.5 h-3.5',
                      })}
                    >
                      {circleNama || 'Nama Circle'}
                    </Chip>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    isLoading={modalLoading}
                    className="flex-1"
                  >
                    {editingCircle ? 'Simpan' : 'Buat Sekarang'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Detail Circle (/circle/:id) */}
      <AnimatePresence>
        {activeCircleDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header Warna Circle */}
              <div
                className="p-4 rounded-2xl text-white flex items-center justify-between shadow-md"
                style={{ backgroundColor: activeCircleDetail.warna_hex || '#FF5A36' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black/20 text-white">
                    {React.createElement(getPresetIconComponent(activeCircleDetail.ikon), {
                      className: 'w-6 h-6 stroke-[2.4]',
                    })}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold leading-tight">
                      {activeCircleDetail.nama}
                    </h3>
                    <p className="text-[12px] opacity-90">
                      {circleMembers.length} anggota tergabung
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCircleDetail(null)}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tambah Anggota dari Teman Accepted */}
              <div className="p-3.5 bg-surface-subtle border border-border rounded-2xl space-y-2">
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Tambah Anggota (Dari Teman Terhubung)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedFriendToAdd}
                    onChange={(e) => setSelectedFriendToAdd(e.target.value)}
                    className="flex-1 bg-surface text-main text-xs px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-[#3B8FE8]"
                  >
                    <option value="">Pilih teman untuk dimasukkan...</option>
                    {acceptedFriends
                      .filter((f) => !circleMembers.some((m) => m.user?.id === f.id))
                      .map((friend) => (
                        <option key={friend.id} value={friend.id}>
                          {friend.nama} (@{friend.username})
                        </option>
                      ))}
                  </select>

                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={!selectedFriendToAdd}
                    onClick={handleAddMember}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Tambah
                  </Button>
                </div>
              </div>

              {/* Daftar Anggota Circle */}
              <div className="space-y-2">
                <h4 className="text-[12px] font-bold text-main uppercase tracking-wider">
                  Daftar Anggota Circle
                </h4>

                {isDetailLoading ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-[#3ED9E8]" />
                    <span>Memuat anggota...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {circleMembers.map((member) => {
                      const memberUser = member.user || {
                        nama: 'Pengguna Hay!',
                        username: 'user',
                      }
                      const isCurrentUser = memberUser.id === user?.id
                      const isOwner = memberUser.id === activeCircleDetail.owner_id

                      return (
                        <div
                          key={member.id}
                          className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Avatar
                              src={memberUser.foto_url}
                              name={memberUser.nama}
                              size="sm"
                              circleRing="coral"
                              hasRing={true}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-bold text-main truncate">
                                  {memberUser.nama}
                                </span>
                                {isOwner && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#3ED9E8]/20 text-[#3ED9E8]">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted truncate block">
                                @{memberUser.username}
                              </span>
                            </div>
                          </div>

                          {/* Action: Keluarkan Anggota (Hanya Owner) */}
                          {user?.id === activeCircleDetail.owner_id && !isCurrentUser && (
                            <button
                              onClick={() => handleRemoveMember(memberUser.id, member.id)}
                              aria-label="Keluarkan Anggota"
                              className="text-[11px] text-[#FF5A36] hover:underline font-semibold px-2 py-1"
                            >
                              Keluarkan
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
