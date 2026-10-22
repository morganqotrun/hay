import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UsersThree,
  Plus,
  Heart,
  House,
  Star,
  Briefcase,
  Coffee,
  MusicNotes,
  Sparkle,
  Trash,
  Pencil,
  UserPlus,
  UserMinus,
  Check,
  X,
  Lock,
  ArrowLeft,
  WarningCircle,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import { CIRCLE_COLORS, getCircleColorByHexOrName } from '../constants/circleColors'
import { EmptyFriendsSketch } from '../components/ui/EmptyStateIllustrations'

// Preset Ikon Circle Phosphor
const ICON_PRESETS = [
  { id: 'users', label: 'Circle', icon: UsersThree },
  { id: 'heart', label: 'Cinta/Keluarga', icon: Heart },
  { id: 'home', label: 'Rumah', icon: House },
  { id: 'star', label: 'Spesial', icon: Star },
  { id: 'briefcase', label: 'Kantor', icon: Briefcase },
  { id: 'coffee', label: 'Nongkrong', icon: Coffee },
  { id: 'music', label: 'Hobi', icon: MusicNotes },
  { id: 'sparkle', label: 'Momen', icon: Sparkle },
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
  const [selectedWarna, setSelectedWarna] = useState(CIRCLE_COLORS[0].hex)
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

      if (error || !data) {
        setCircles([])
      } else {
        const enriched = data.map((c) => ({
          ...c,
          memberCount: (c.circle_members?.length || 0) + 1,
        }))
        setCircles(enriched)
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
    setSelectedWarna(CIRCLE_COLORS[0].hex)
    setModalError('')
    setIsCreateModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (circle, e) => {
    if (e) e.stopPropagation()
    setEditingCircle(circle)
    setCircleNama(circle.nama)
    setSelectedIkon(circle.ikon || 'users')
    setSelectedWarna(circle.warna_hex || CIRCLE_COLORS[0].hex)
    setModalError('')
    setIsCreateModalOpen(true)
  }

  // Handle Save (Create or Update)
  const handleSaveCircle = async (e) => {
    e.preventDefault()
    if (!circleNama.trim()) {
      setModalError('Nama circle tidak boleh kosong.')
      return
    }

    setModalLoading(true)
    setModalError('')

    const colorObj = getCircleColorByHexOrName(selectedWarna)

    try {
      if (editingCircle) {
        const { error } = await supabase
          .from('circles')
          .update({
            nama: circleNama.trim(),
            warna_hex: colorObj.hex,
            ikon: selectedIkon,
          })
          .eq('id', editingCircle.id)

        if (error) throw error

        setCircles((prev) =>
          prev.map((c) =>
            c.id === editingCircle.id
              ? {
                  ...c,
                  nama: circleNama.trim(),
                  warna_hex: colorObj.hex,
                  ikon: selectedIkon,
                }
              : c
          )
        )
      } else {
        const newCirclePayload = {
          owner_id: user?.id,
          nama: circleNama.trim(),
          warna_hex: colorObj.hex,
          ikon: selectedIkon,
        }

        const { data, error } = await supabase
          .from('circles')
          .insert(newCirclePayload)
          .select()
          .single()

        if (error) throw error

        if (data) {
          setCircles((prev) => [
            ...prev,
            { ...data, memberCount: 1, circle_members: [] },
          ])
        }
      }

      setIsCreateModalOpen(false)
    } catch (err) {
      console.error(err)
      setModalError('Yah, gagal. Coba lagi sebentar.')
    } finally {
      setModalLoading(false)
    }
  }

  // Handle Delete Circle
  const handleDeleteCircle = async (circle, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm(`Hapus circle "${circle.nama}"? Anggota dan postingan di circle ini akan disesuaikan.`)) {
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

  // Open Detail / Manage Members Modal
  const handleOpenDetail = async (circle) => {
    setActiveCircleDetail(circle)
    setIsDetailLoading(true)

    try {
      // 1. Ambil list anggota
      const { data: membersData, error: memErr } = await supabase
        .from('circle_members')
        .select(`
          id,
          circle_id,
          user_id,
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
        setCircleMembers([])
      } else {
        setCircleMembers(membersData.map((m) => ({ id: m.id, user: m.user })))
      }

      // 2. Ambil teman yang statusnya accepted
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
          setAcceptedFriends([])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDetailLoading(false)
    }
  }

  // Add Member to Circle
  const handleAddMember = async (friendUser) => {
    if (!activeCircleDetail || !friendUser) return

    try {
      const payload = {
        circle_id: activeCircleDetail.id,
        user_id: friendUser.id,
      }

      const { data, error } = await supabase
        .from('circle_members')
        .insert(payload)
        .select()
        .single()

      if (!error) {
        const newMember = {
          id: data?.id || `mem-${Date.now()}`,
          user: friendUser,
        }
        setCircleMembers((prev) => [...prev, newMember])
        setCircles((prev) =>
          prev.map((c) =>
            c.id === activeCircleDetail.id
              ? { ...c, memberCount: (c.memberCount || 1) + 1 }
              : c
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Remove Member from Circle
  const handleRemoveMember = async (memberRecordId, targetUserId) => {
    if (!activeCircleDetail) return
    if (!window.confirm('Keluarkan anggota ini dari circle?')) return

    try {
      await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', activeCircleDetail.id)
        .eq('user_id', targetUserId)

      setCircleMembers((prev) => prev.filter((m) => m.id !== memberRecordId && m.user?.id !== targetUserId))
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeCircleDetail.id
            ? { ...c, memberCount: Math.max(1, (c.memberCount || 2) - 1) }
            : c
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const getPresetIconComponent = (iconId) => {
    const found = ICON_PRESETS.find((p) => p.id === iconId)
    return found ? found.icon : UsersThree
  }

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-main tracking-tight">
            Circle Teman
          </h1>
          <p className="font-sans text-xs text-muted mt-0.5">
            Lingkaran cerita yang terisolasi dan privat
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus size={16} weight="bold" />}
        >
          Buat Circle
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center text-xs text-muted font-sans">
          Memuat circle teman...
        </div>
      )}

      {/* Circle Cards List */}
      {!isLoading && (
        <div className="space-y-3">
          {circles.map((circle) => {
            const IconComponent = getPresetIconComponent(circle.ikon)
            const isOwner = circle.owner_id === user?.id
            const isDefault = circle.nama.toLowerCase() === 'terdekat'
            const circleColorObj = getCircleColorByHexOrName(circle.warna_hex)

            return (
              <Card
                key={circle.id}
                variant="default"
                onClick={() => handleOpenDetail(circle)}
                className="p-4 cursor-pointer hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Circle Color Badge Icon (SOLID warna bernama) */}
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm shrink-0"
                      style={{
                        backgroundColor: circleColorObj.hex,
                        color: circleColorObj.text,
                      }}
                    >
                      <IconComponent size={22} weight="bold" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-main truncate">
                          {circle.nama}
                        </h3>
                        {isDefault && (
                          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 shrink-0">
                            Utama
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <UsersThree size={14} weight="bold" />
                        <span>{circle.memberCount} anggota • circle {circleColorObj.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditModal(circle, e)}
                      aria-label="Edit Circle"
                      className="p-2 rounded-full hover:bg-surface-2 text-muted hover:text-main transition-colors"
                    >
                      <Pencil size={16} weight="bold" />
                    </button>

                    {!isDefault && isOwner && (
                      <button
                        onClick={(e) => handleDeleteCircle(circle, e)}
                        aria-label="Hapus Circle"
                        className="p-2 rounded-full hover:bg-surface-2 text-muted hover:text-[#E8452C] transition-colors"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-xs">
                  <span className="text-muted flex items-center gap-1">
                    <Lock size={12} weight="bold" /> Terisolasi privat
                  </span>
                  <span className="text-accent font-semibold hover:underline">
                    Kelola Anggota →
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && circles.length === 0 && (
        <div className="py-12 text-center space-y-3">
          <div className="flex justify-center">
            <EmptyFriendsSketch className="w-24 h-24" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base font-bold text-main">Belum punya circle teman</h4>
            <p className="font-sans text-xs text-muted max-w-xs mx-auto">
              Buat circle pertamamu seperti 'Keluarga' atau 'Sahabat Dekat' untuk berbagi cerita.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Buat Circle Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Modal Buat / Edit Circle */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-[22px] sm:rounded-[22px] p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-serif text-lg font-bold text-main">
                  {editingCircle ? 'Edit Circle' : 'Buat Circle Baru'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-muted hover:text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-[#E8452C]/10 text-[#E8452C] rounded-[12px] flex items-center gap-2 text-xs">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCircle} className="space-y-4">
                {/* Nama Circle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Nama Circle
                  </label>
                  <input
                    type="text"
                    value={circleNama}
                    onChange={(e) => setCircleNama(e.target.value)}
                    placeholder="misal: Sahabat Dekat, Keluarga, Teman Kantor"
                    className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Pilih Warna Identitas (6 Warna Solid Bernama) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Warna Identitas
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CIRCLE_COLORS.map((c) => {
                      const isSelected = selectedWarna.toLowerCase() === c.hex.toLowerCase()
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedWarna(c.hex)}
                          className={`flex items-center gap-2 p-2 rounded-[12px] border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-accent shadow-sm'
                              : 'border-border hover:bg-surface-2'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && <Check size={10} weight="bold" style={{ color: c.text }} />}
                          </span>
                          <span className="font-serif truncate">{c.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Pilih Ikon */}
                <div className="space-y-2">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Ikon Circle
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
                          className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-[12px] border transition-all ${
                            isSelected
                              ? 'bg-accent/15 border-accent text-accent'
                              : 'bg-surface-2 border-border text-muted hover:text-main'
                          }`}
                        >
                          <IconComp size={20} weight={isSelected ? 'fill' : 'regular'} />
                          <span className="text-[10px] font-sans">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={modalLoading}
                  >
                    {editingCircle ? 'Simpan Perubahan' : 'Buat Circle'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Kelola Anggota Circle */}
      <AnimatePresence>
        {activeCircleDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-[22px] sm:rounded-[22px] p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header Detail */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: activeCircleDetail.warna_hex || '#FF6A3D' }}
                  />
                  <h3 className="font-serif text-lg font-bold text-main">
                    {activeCircleDetail.nama}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveCircleDetail(null)}
                  className="p-1 rounded-full text-muted hover:text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Tambah Anggota dari Teman yang Accepted */}
              <div className="space-y-2">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                  Tambah Teman ke Circle Ini
                </label>

                {acceptedFriends.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFriendToAdd}
                      onChange={(e) => setSelectedFriendToAdd(e.target.value)}
                      className="flex-1 bg-surface-2 text-main font-sans text-xs p-2.5 rounded-[12px] border border-border focus:outline-none"
                    >
                      <option value="">Pilih teman terhubung...</option>
                      {acceptedFriends
                        .filter(
                          (fr) =>
                            fr &&
                            fr.id !== user?.id &&
                            !circleMembers.some((m) => m.user?.id === fr.id)
                        )
                        .map((fr) => (
                          <option key={fr.id} value={fr.id}>
                            {fr.nama} (@{fr.username})
                          </option>
                        ))}
                    </select>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!selectedFriendToAdd}
                      onClick={() => {
                        const target = acceptedFriends.find(
                          (f) => f.id === selectedFriendToAdd
                        )
                        if (target) {
                          handleAddMember(target)
                          setSelectedFriendToAdd('')
                        }
                      }}
                      leftIcon={<UserPlus size={14} weight="bold" />}
                    >
                      Tambah
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    Belum ada teman terhubung. Cari dan tambah teman terlebih dahulu.
                  </p>
                )}
              </div>

              {/* Daftar Anggota Circle */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                  Daftar Anggota ({circleMembers.length + 1})
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {/* Pemilik (Owner) */}
                  <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-surface-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={user?.user_metadata?.avatar_url}
                        name={user?.user_metadata?.nama || 'Saya'}
                        size="sm"
                      />
                      <div>
                        <h4 className="font-sans text-xs font-bold text-main">
                          {user?.user_metadata?.nama || 'Saya (Pemilik)'}
                        </h4>
                        <span className="text-[10px] text-muted font-sans">Pemilik Circle</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                      Owner
                    </span>
                  </div>

                  {/* Anggota Lain */}
                  {circleMembers.map((member) => {
                    const memberUser = member.user || {
                      nama: 'Teman',
                      username: 'friend',
                    }
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 rounded-[12px] bg-surface-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={memberUser.foto_url}
                            name={memberUser.nama}
                            size="sm"
                          />
                          <div>
                            <h4 className="font-sans text-xs font-bold text-main">
                              {memberUser.nama}
                            </h4>
                            <span className="text-[10px] text-muted">
                              @{memberUser.username}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveMember(member.id, memberUser.id)
                          }
                          aria-label="Keluarkan"
                          className="p-1.5 rounded-full text-muted hover:text-[#E8452C] hover:bg-surface"
                        >
                          <UserMinus size={16} weight="bold" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
