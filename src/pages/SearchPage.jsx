import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass,
  UserPlus,
  UserCheck,
  Clock,
  UserMinus,
  Check,
  X,
  Shield,
  ArrowLeft,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import { EmptySearchSketch } from '../components/ui/EmptyStateIllustrations'

export default function SearchPage({ onBack }) {
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

        if (error || !usersData) {
          setResults([])
        } else {
          setResults(usersData)
          if (user?.id && usersData.length > 0) {
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

  // Fetch friendship status with found users
  const fetchFriendshipRelations = async (targetUserIds) => {
    if (!user?.id || targetUserIds.length === 0) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id, requester_id, receiver_id, status')
        .or(
          `and(requester_id.eq.${user.id},receiver_id.in.(${targetUserIds.join(
            ','
          )})),and(receiver_id.eq.${user.id},requester_id.in.(${targetUserIds.join(
            ','
          )}))`
        )

      if (!error && data) {
        const statusMap = {}
        data.forEach((rel) => {
          const otherId = rel.requester_id === user.id ? rel.receiver_id : rel.requester_id
          statusMap[otherId] = {
            id: rel.id,
            status: rel.status,
            isRequester: rel.requester_id === user.id,
          }
        })
        setFriendshipStatuses(statusMap)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Action: Kirim Permintaan Pertemanan
  const handleSendFriendRequest = async (targetUser) => {
    if (!user?.id) return
    setActionLoadingId(targetUser.id)

    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          receiver_id: targetUser.id,
          status: 'pending',
        })
        .select()
        .single()

      if (!error && data) {
        setFriendshipStatuses((prev) => ({
          ...prev,
          [targetUser.id]: {
            id: data.id,
            status: 'pending',
            isRequester: true,
          },
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Action: Terima Permintaan Pertemanan
  const handleAcceptFriendRequest = async (targetUser) => {
    const relation = friendshipStatuses[targetUser.id]
    if (!relation?.id) return

    setActionLoadingId(targetUser.id)
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', relation.id)

      if (!error) {
        setFriendshipStatuses((prev) => ({
          ...prev,
          [targetUser.id]: {
            ...relation,
            status: 'accepted',
          },
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Action: Batalkan / Hapus Pertemanan
  const handleRemoveFriendship = async (targetUser) => {
    const relation = friendshipStatuses[targetUser.id]
    if (!relation?.id) return
    if (!window.confirm('Hapus atau batalkan relasi pertemanan ini?')) return

    setActionLoadingId(targetUser.id)
    try {
      const { error } = await supabase.from('friendships').delete().eq('id', relation.id)
      if (!error) {
        setFriendshipStatuses((prev) => {
          const next = { ...prev }
          delete next[targetUser.id]
          return next
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Render Action Button based on current Friendship Status
  const renderActionButton = (targetUser) => {
    const relation = friendshipStatuses[targetUser.id]
    const isLoadingAction = actionLoadingId === targetUser.id

    if (!relation) {
      return (
        <Button
          variant="primary"
          size="sm"
          isLoading={isLoadingAction}
          onClick={() => handleSendFriendRequest(targetUser)}
          leftIcon={<UserPlus size={14} weight="bold" />}
        >
          Tambah
        </Button>
      )
    }

    if (relation.status === 'pending') {
      if (relation.isRequester) {
        return (
          <Button
            variant="outline"
            size="sm"
            isLoading={isLoadingAction}
            onClick={() => handleRemoveFriendship(targetUser)}
            leftIcon={<Clock size={14} weight="bold" />}
            className="text-xs"
          >
            Menunggu
          </Button>
        )
      } else {
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              isLoading={isLoadingAction}
              onClick={() => handleAcceptFriendRequest(targetUser)}
              leftIcon={<Check size={14} weight="bold" />}
            >
              Terima
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isLoading={isLoadingAction}
              onClick={() => handleRemoveFriendship(targetUser)}
            >
              Tolak
            </Button>
          </div>
        )
      }
    }

    if (relation.status === 'accepted') {
      return (
        <Button
          variant="outline"
          size="sm"
          isLoading={isLoadingAction}
          onClick={() => handleRemoveFriendship(targetUser)}
          leftIcon={<UserCheck size={14} weight="bold" className="text-[#4FA05A]" />}
        >
          Berteman
        </Button>
      )
    }

    return null
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Header: Tombol Back & Search Input */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          aria-label="Kembali"
          className="p-2 rounded-full hover:bg-surface-2 text-main transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        <div className="relative flex-1 flex items-center">
          <MagnifyingGlass size={18} weight="bold" className="absolute left-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau @username teman..."
            className="w-full bg-surface-2 text-main font-sans text-sm pl-10 pr-10 py-2.5 rounded-[14px] border border-border focus:outline-none focus:border-accent transition-colors placeholder:text-muted/60"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 text-muted hover:text-main"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 text-center text-xs text-muted font-sans">
          Mencari...
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-sans font-bold uppercase tracking-wider text-muted">
            <span>Ditemukan ({results.length})</span>
            <span>Koneksi Privat</span>
          </div>

          <div className="space-y-2">
            {results.map((targetUser) => (
              <Card
                key={targetUser.id}
                variant="default"
                className="p-3.5 flex items-center justify-between gap-3"
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
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-sm font-bold text-main truncate hover:text-accent transition-colors">
                      {targetUser.nama}
                    </h3>
                    <p className="font-sans text-xs text-muted truncate">
                      @{targetUser.username}
                    </p>
                    {targetUser.bio && (
                      <p className="font-sans text-xs text-muted/80 truncate mt-0.5">
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
          <div className="flex justify-center">
            <EmptySearchSketch className="w-24 h-24" />
          </div>
          <h3 className="font-serif text-lg font-bold text-main">Temukan Lingkaranmu</h3>
          <p className="font-sans text-xs text-muted max-w-xs mx-auto leading-relaxed">
            Ketik nama atau @username teman dekat, keluarga, atau rekan kerja untuk saling berbagi momen privat.
          </p>
        </div>
      )}

      {/* Empty State: Tidak Ditemukan */}
      {!isLoading && searchTerm && results.length === 0 && (
        <div className="py-12 px-4 text-center space-y-3">
          <div className="flex justify-center">
            <EmptySearchSketch className="w-24 h-24" />
          </div>
          <h3 className="font-serif text-lg font-bold text-main">Hasil pencarian kosong</h3>
          <p className="font-sans text-xs text-muted max-w-xs mx-auto leading-relaxed">
            Tidak ditemukan pengguna dengan nama atau username "{searchTerm}".
          </p>
        </div>
      )}

      {/* Modal /u/:username — Detail User Tanpa Postingan */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-surface border border-border rounded-t-[22px] sm:rounded-[22px] p-6 space-y-4 text-center shadow-2xl"
            >
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-full text-muted hover:text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Photo & Ring */}
              <div className="relative inline-block mx-auto">
                <Avatar
                  src={selectedUser.foto_url}
                  name={selectedUser.nama}
                  size="xl"
                />
              </div>

              {/* Name & Username */}
              <div className="space-y-0.5">
                <h2 className="font-serif text-xl font-bold text-main">
                  {selectedUser.nama}
                </h2>
                <p className="font-sans text-xs font-semibold text-accent">
                  @{selectedUser.username}
                </p>
              </div>

              {/* Bio */}
              <p className="font-serif italic text-xs text-muted max-w-xs mx-auto">
                "{selectedUser.bio || 'Menikmati hari bersama lingkaran terdekat.'}"
              </p>

              {/* Privasi Notice */}
              <div className="p-3.5 rounded-[14px] bg-surface-2 border border-border text-left flex items-start gap-2.5">
                <Shield size={18} weight="bold" className="text-[#4FA05A] shrink-0 mt-0.5" />
                <div className="text-xs text-muted leading-relaxed font-sans">
                  <span className="font-bold text-main block">Postingan Terproteksi</span>
                  Post hanya dapat dilihat jika Anda telah diterima ke dalam Circle privat milik {selectedUser.nama}.
                </div>
              </div>

              {/* Action Button inside modal */}
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
