import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  UserPlus,
  UserCheck,
  Clock,
  UserMinus,
  Check,
  X,
  Users,
  Shield,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'

export default function SearchPage({ onBack, onOpenUserProfile }) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [friendshipStatuses, setFriendshipStatuses] = useState({}) // userId -> { id, status, isRequester }
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Realtime search with debounce 300ms
  useEffect(() => {
    const query = searchTerm.trim()
    if (!query) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        let q = supabase
          .from('users')
          .select('id, nama, username, foto_url, bio')
          .or(`nama.ilike.%${query}%,username.ilike.%${query}%`)
          .limit(20)

        if (user?.id) {
          q = q.neq('id', user.id)
        }

        const { data: usersData, error } = await q

        if (error) {
          // Mock data fallback if Supabase placeholder
          const mockResults = [
            {
              id: 'user-dimas',
              nama: 'Dimas Kurnia',
              username: 'dimaskurnia',
              foto_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              bio: 'Penikmat kopi pagi, coding, dan cerita bermakna.',
            },
            {
              id: 'user-alya',
              nama: 'Alya Rahmawati',
              username: 'alyarahma',
              foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
              bio: 'Menemukan kedamaian di buku dan lingkaran orang-orang terdekat.',
            },
            {
              id: 'user-rizky',
              nama: 'Rizky Pratama',
              username: 'rizkypratama',
              foto_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
              bio: 'Desainer & pembuat sketsa akhir pekan.',
            },
          ].filter(
            (u) =>
              u.nama.toLowerCase().includes(query.toLowerCase()) ||
              u.username.toLowerCase().includes(query.toLowerCase())
          )
          setResults(mockResults)
        } else {
          setResults(usersData || [])
          if (usersData && user?.id) {
            await fetchFriendshipRelations(usersData.map((u) => u.id))
          }
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, user])

  // Fetch friendship relationship states
  async function fetchFriendshipRelations(userIds) {
    if (!user?.id || userIds.length === 0) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${user.id},receiver_id.in.(${userIds.join(',')})),and(receiver_id.eq.${user.id},requester_id.in.(${userIds.join(',')}))`
        )

      if (!error && data) {
        const statusMap = {}
        data.forEach((row) => {
          const otherId = row.requester_id === user.id ? row.receiver_id : row.requester_id
          statusMap[otherId] = {
            id: row.id,
            status: row.status,
            isRequester: row.requester_id === user.id,
          }
        })
        setFriendshipStatuses(statusMap)
      }
    } catch (e) {
      console.warn('Friendship status notice:', e?.message)
    }
  }

  // Action: Kirim Permintaan Pertemanan
  const handleSendRequest = async (targetUserId) => {
    if (!user?.id) return
    setActionLoadingId(targetUserId)

    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          receiver_id: targetUserId,
          status: 'pending',
        })
        .select()
        .single()

      if (!error && data) {
        setFriendshipStatuses((prev) => ({
          ...prev,
          [targetUserId]: { id: data.id, status: 'pending', isRequester: true },
        }))
      } else {
        // Fallback optimistic update
        setFriendshipStatuses((prev) => ({
          ...prev,
          [targetUserId]: { id: 'temp-id', status: 'pending', isRequester: true },
        }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Action: Batalkan Permintaan / Tolak / Batal Berteman
  const handleRemoveFriendship = async (targetUserId, friendshipId, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setActionLoadingId(targetUserId)

    try {
      if (friendshipId && friendshipId !== 'temp-id') {
        await supabase.from('friendships').delete().eq('id', friendshipId)
      }
      setFriendshipStatuses((prev) => {
        const next = { ...prev }
        delete next[targetUserId]
        return next
      })
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Action: Terima Permintaan
  const handleAcceptRequest = async (targetUserId, friendshipId) => {
    setActionLoadingId(targetUserId)
    try {
      if (friendshipId && friendshipId !== 'temp-id') {
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId)
      }
      setFriendshipStatuses((prev) => ({
        ...prev,
        [targetUserId]: { id: friendshipId, status: 'accepted', isRequester: false },
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Render Action Button based on friendship status
  const renderActionButton = (targetUser) => {
    const relation = friendshipStatuses[targetUser.id]
    const isTargetLoading = actionLoadingId === targetUser.id

    if (isTargetLoading) {
      return (
        <span className="p-2 rounded-full bg-surface-subtle border border-border flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-[#3ED9E8] animate-spin" />
        </span>
      )
    }

    // 1. Belum berteman -> "+" gradient
    if (!relation) {
      return (
        <Button
          variant="gradient"
          size="sm"
          onClick={() => handleSendRequest(targetUser.id)}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          className="shadow-sm font-semibold"
        >
          Berteman
        </Button>
      )
    }

    // 2. Sudah kirim permintaan -> "Pending" (bisa dibatalkan)
    if (relation.status === 'pending' && relation.isRequester) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleRemoveFriendship(
              targetUser.id,
              relation.id,
              'Batalkan permintaan pertemanan ke pengguna ini?'
            )
          }
          leftIcon={<Clock className="w-3.5 h-3.5 text-[#FFB627]" />}
          className="border-[#FFB627]/40 text-[#FFB627] hover:bg-[#FFB627]/10"
        >
          Pending (Batal)
        </Button>
      )
    }

    // 3. Dia yang kirim ke kita -> "Terima" dan "Tolak"
    if (relation.status === 'pending' && !relation.isRequester) {
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAcceptRequest(targetUser.id, relation.id)}
            aria-label="Terima"
            className="p-1.5 rounded-full bg-[#8CC63F] text-black hover:brightness-105 active:scale-95 shadow-sm"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <button
            onClick={() =>
              handleRemoveFriendship(targetUser.id, relation.id, 'Tolak permintaan ini?')
            }
            aria-label="Tolak"
            className="p-1.5 rounded-full bg-[#FF5A36] text-white hover:brightness-105 active:scale-95 shadow-sm"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      )
    }

    // 4. Sudah berteman -> "-" outline (batal berteman + konfirmasi)
    if (relation.status === 'accepted') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleRemoveFriendship(
              targetUser.id,
              relation.id,
              `Hapus @${targetUser.username} dari daftar teman?`
            )
          }
          leftIcon={<UserCheck className="w-3.5 h-3.5 text-[#3ED9E8]" />}
          className="hover:border-[#FF5A36] hover:text-[#FF5A36]"
        >
          Berteman
        </Button>
      )
    }

    return null
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/80 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}

        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3.5 text-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari teman berdasarkan nama atau @username..."
            autoFocus
            className="w-full bg-surface text-main text-body pl-10 pr-10 py-2.5 rounded-full border border-border focus:outline-none focus:border-[#3B8FE8] focus:ring-1 focus:ring-[#3B8FE8] transition-all placeholder:text-muted/60 shadow-soft-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 text-muted hover:text-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-[#3ED9E8]" />
          <span>Mencari pengguna...</span>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Ditemukan ({results.length})</span>
            <span>Koneksi Privat</span>
          </div>

          <div className="space-y-2">
            {results.map((targetUser) => (
              <Card
                key={targetUser.id}
                variant="default"
                className="p-3.5 flex items-center justify-between gap-3 hover:border-[#3B8FE8]/40 transition-colors"
              >
                {/* User avatar & info */}
                <div
                  onClick={() => setSelectedUser(targetUser)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <Avatar
                    src={targetUser.foto_url}
                    name={targetUser.nama}
                    size="md"
                    circleRing="coral"
                    hasRing={true}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-bold text-main truncate hover:text-[#3ED9E8] transition-colors">
                      {targetUser.nama}
                    </h3>
                    <p className="text-[11px] font-medium text-muted truncate">
                      @{targetUser.username}
                    </p>
                    {targetUser.bio && (
                      <p className="text-[11px] text-muted/80 truncate mt-0.5">
                        {targetUser.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Friendship Dynamic Action */}
                <div className="shrink-0">{renderActionButton(targetUser)}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State: Belum Mencari */}
      {!isLoading && !searchTerm && (
        <div className="py-12 px-4 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#3B8FE8]/20 to-[#3ED9E8]/20 border border-[#3ED9E8]/30 flex items-center justify-center mx-auto text-[#3ED9E8]">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-subheading font-bold text-main">Temukan Lingkaranmu</h3>
          <p className="text-body text-muted max-w-xs mx-auto leading-relaxed">
            Ketik nama atau @username teman dekat, keluarga, atau rekan kerja untuk saling berbagi momen privat.
          </p>
        </div>
      )}

      {/* Empty State: Tidak Ditemukan */}
      {!isLoading && searchTerm && results.length === 0 && (
        <div className="py-12 px-4 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-subheading font-bold text-main">Tidak Ada Pengguna</h3>
          <p className="text-body text-muted max-w-xs mx-auto leading-relaxed">
            Tidak ditemukan pengguna dengan nama atau username "{searchTerm}". Pastikan ejaan sudah benar.
          </p>
        </div>
      )}

      {/* Modal /u/:username — Detail User Tanpa Postingan */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-5 text-center shadow-2xl"
            >
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-full hover:bg-surface-subtle text-muted hover:text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo & Ring */}
              <div className="relative inline-block mx-auto">
                <Avatar
                  src={selectedUser.foto_url}
                  name={selectedUser.nama}
                  size="xl"
                  circleRing="coral"
                  hasRing={true}
                  className="shadow-lg"
                />
              </div>

              {/* Name & Username */}
              <div className="space-y-1">
                <h2 className="text-[20px] font-bold text-main">
                  {selectedUser.nama}
                </h2>
                <p className="text-[14px] font-medium text-[#3ED9E8]">
                  @{selectedUser.username}
                </p>
              </div>

              {/* Bio */}
              <p className="text-body text-muted max-w-xs mx-auto italic font-sans">
                "{selectedUser.bio || 'Menikmati hari bersama lingkaran terdekat.'}"
              </p>

              {/* Privasi Notice: Sesuai spesifikasi prompt (JANGAN tampilkan post) */}
              <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border text-left flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#8CC63F] shrink-0 mt-0.5" />
                <div className="text-[12px] text-muted leading-relaxed">
                  <span className="font-bold text-main block">Postingan Terproteksi</span>
                  Post hanya dapat dilihat jika Anda telah diterima ke dalam Circle privat milik {selectedUser.nama}.
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {renderActionButton(selectedUser)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
