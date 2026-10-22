import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Camera,
  Pencil,
  Moon,
  Sun,
  SignOut,
  UsersThree,
  Image,
  Calendar,
  X,
  WarningCircle,
  Gear,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'

export default function ProfilePage({ onNavigateLogin, onNavigateAdmin }) {
  const { user, profile, updateProfile, signOut, refreshProfile } = useAuth()
  const { theme, toggleTheme, isMalam } = useTheme()

  const [postCount, setPostCount] = useState(0)
  const [friendCount, setFriendCount] = useState(0)
  const [isLoadingCounts, setIsLoadingCounts] = useState(true)

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false)
  const [editNama, setEditNama] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editFotoUrl, setEditFotoUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Fetch counts from Supabase
  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      if (!user?.id) {
        setIsLoadingCounts(false)
        return
      }

      try {
        // 1. Hitung jumlah post milik user
        const { count: postsTotal } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // 2. Hitung jumlah teman (friendships accepted)
        const { data: friendships } = await supabase
          .from('friendships')
          .select('id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

        if (isMounted) {
          setPostCount(postsTotal ?? 0)
          setFriendCount(friendships?.length ?? 0)
        }
      } catch (err) {
        if (isMounted) {
          setPostCount(0)
          setFriendCount(0)
        }
      } finally {
        if (isMounted) setIsLoadingCounts(false)
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [user])

  const openEditModal = () => {
    setEditNama(profile?.nama || '')
    setEditBio(profile?.bio || '')
    setEditPhone(profile?.phone || '')
    setEditFotoUrl(profile?.foto_url || '')
    setEditError('')
    setIsEditing(true)
  }

  // Upload avatar to 'avatars' storage bucket in folder auth.uid()
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setUploadingAvatar(true)
    setEditError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFotoUrl(reader.result)
          setUploadingAvatar(false)
        }
        reader.readAsDataURL(file)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setEditFotoUrl(publicUrlData.publicUrl)
    } catch (err) {
      setEditError('Gagal mengunggah foto profil. Silakan coba file lain.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editNama.trim()) {
      setEditError('Nama profil tidak boleh kosong.')
      return
    }

    setIsSaving(true)
    setEditError('')

    try {
      const updates = {
        nama: editNama.trim(),
        bio: editBio.trim(),
        phone: editPhone.trim(),
        foto_url: editFotoUrl,
      }

      const { error } = await updateProfile(updates)
      if (error) throw error

      if (refreshProfile) await refreshProfile()
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setEditError('Yah, gagal. Coba lagi sebentar.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    if (onNavigateLogin) onNavigateLogin()
  }

  const joinDateFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : '2026'

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Profile Overview Card */}
      <Card variant="default" className="p-6 text-center space-y-4">
        {/* Avatar with Solid Ring */}
        <div className="relative inline-block mx-auto">
          <Avatar
            src={profile?.foto_url}
            name={profile?.nama || 'Pengguna Hay!'}
            size="xl"
          />
          <button
            onClick={openEditModal}
            aria-label="Ubah foto"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-[#FF6A3D] text-[#15110E] shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <Camera size={16} weight="bold" />
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-0.5">
          <h2 className="font-serif text-xl font-bold text-main tracking-tight">
            {profile?.nama || 'Pengguna Hay!'}
          </h2>
          <p className="font-sans text-xs font-semibold text-accent">
            @{profile?.username || 'user'}
          </p>
        </div>

        {/* Bio */}
        <p className="font-serif italic text-xs text-muted leading-relaxed max-w-xs mx-auto">
          "{profile?.bio || 'Belum ada bio singkat. Bagikan cerita harimu.'}"
        </p>

        {/* Counts: Teman & Post (Hitung Asli dari DB) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-surface-2 p-3 rounded-[14px] border border-border flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-main">
              {isLoadingCounts ? '...' : friendCount}
            </span>
            <span className="font-sans text-[11px] text-muted mt-0.5 flex items-center gap-1">
              <UsersThree size={14} weight="bold" /> Teman
            </span>
          </div>

          <div className="bg-surface-2 p-3 rounded-[14px] border border-border flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-main">
              {isLoadingCounts ? '...' : postCount}
            </span>
            <span className="font-sans text-[11px] text-muted mt-0.5 flex items-center gap-1">
              <Image size={14} weight="bold" /> Cerita
            </span>
          </div>
        </div>

        {/* Tombol Edit Profil */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={openEditModal}
            leftIcon={<Pencil size={16} weight="bold" />}
          >
            Edit Profil
          </Button>
        </div>
      </Card>

      {/* Preferences & Settings */}
      <div className="space-y-2">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted px-2 block">
          Pengaturan
        </span>

        <Card variant="default" className="divide-y divide-border">
          {/* Theme Toggle (Cerah / Malam) */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[12px] bg-surface-2 text-accent">
                {isMalam ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-main">Tema Tampilan</h3>
                <p className="font-sans text-xs text-muted">
                  Sedang aktif: <span className="font-bold capitalize">{theme}</span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              Ubah ke {isMalam ? 'Kertas' : 'Malam'}
            </Button>
          </div>

          {/* Anggota Sejak */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[12px] bg-surface-2 text-[#4FA05A]">
                <Calendar size={20} weight="bold" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-main">Anggota Sejak</h3>
                <p className="font-sans text-xs text-muted">{joinDateFormatted}</p>
              </div>
            </div>
            <span className="font-serif text-xs font-bold text-[#4FA05A] bg-[#4FA05A]/10 px-2.5 py-1 rounded-full border border-[#4FA05A]/25">
              Aktif
            </span>
          </div>

          {/* Kelola Teks Admin (Jika user is_admin) */}
          {profile?.is_admin && onNavigateAdmin && (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-[12px] bg-surface-2 text-accent">
                  <Gear size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-main">Kelola Teks</h3>
                  <p className="font-sans text-xs text-muted">Kustomisasi teks dan mikrocopy aplikasi</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={onNavigateAdmin}
              >
                Kelola
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={handleLogout}
          leftIcon={<SignOut size={16} weight="bold" className="text-[#E8452C]" />}
          className="text-[#E8452C] hover:bg-[#E8452C]/10"
        >
          Keluar dari Akun
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
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
                  Edit Profil
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full text-muted hover:text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-[#E8452C]/10 text-[#E8452C] rounded-[12px] flex items-center gap-2 text-xs">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Upload Foto Profil */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar
                    src={editFotoUrl}
                    name={editNama || 'Saya'}
                    size="xl"
                  />
                  <label className="text-xs font-semibold text-accent cursor-pointer hover:underline flex items-center gap-1.5 mt-1">
                    <Camera size={14} weight="bold" />
                    <span>{uploadingAvatar ? 'Mengunggah...' : 'Ubah Foto Profil'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Bio Singkat */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Bio Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {/* Nomor Telepon */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-surface-2 text-main font-sans text-sm p-3.5 rounded-[14px] border border-border focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    className="flex-1"
                  >
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
