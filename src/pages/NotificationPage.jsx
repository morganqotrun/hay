import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Check,
  X,
  Users,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'

export default function NotificationPage({ onBack, onFriendshipChange }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Fetch pending friend requests targeting current user
  useEffect(() => {
    let isMounted = true

    async function loadIncomingRequests() {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            requester_id,
            receiver_id,
            status,
            created_at,
            requester:users!friendships_requester_id_fkey(id, nama, username, foto_url, bio)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) {
          // Fallback mock pending requests
          const mockRequests = [
            {
              id: 'req-1',
              requester_id: 'user-dimas',
              status: 'pending',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              requester: {
                id: 'user-dimas',
                nama: 'Dimas Kurnia',
                username: 'dimaskurnia',
                foto_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                bio: 'Penikmat kopi pagi & coding.',
              },
            },
            {
              id: 'req-2',
              requester_id: 'user-alya',
              status: 'pending',
              created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
              requester: {
                id: 'user-alya',
                nama: 'Alya Rahmawati',
                username: 'alyarahma',
                foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                bio: 'Menemukan kedamaian di buku dan lingkaran kecil.',
              },
            },
          ]
          if (isMounted) setRequests(mockRequests)
        } else {
          if (isMounted) setRequests(data || [])
        }
      } catch (err) {
        console.error('Fetch requests error:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadIncomingRequests()

    return () => {
      isMounted = false
    }
  }, [user])

  // Terima permintaan (Update status -> accepted)
  const handleAccept = async (requestId, requesterUser) => {
    setActionLoadingId(requestId)
    try {
      if (!requestId.startsWith('req-')) {
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', requestId)
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (onFriendshipChange) onFriendshipChange()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Tolak permintaan (Delete friendship row)
  const handleReject = async (requestId) => {
    setActionLoadingId(requestId)
    try {
      if (!requestId.startsWith('req-')) {
        await supabase.from('friendships').delete().eq('id', requestId)
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (onFriendshipChange) onFriendshipChange()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/80 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}

        <div>
          <h2 className="text-[18px] font-bold text-main tracking-tight leading-tight">
            Notifikasi
          </h2>
          <p className="text-[11px] text-muted">
            Permintaan masuk untuk bergabung dalam circle pertemanan
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-xs text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-[#3ED9E8]" />
          <span>Memuat notifikasi...</span>
        </div>
      )}

      {/* List Permintaan Masuk */}
      {!isLoading && requests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Permintaan Pertemanan ({requests.length})</span>
            <span>Menunggu Konfirmasi</span>
          </div>

          <div className="space-y-2.5">
            {requests.map((item) => {
              const reqUser = item.requester || {
                nama: 'Pengguna Hay!',
                username: 'user',
              }
              const isActionLoading = actionLoadingId === item.id

              return (
                <Card
                  key={item.id}
                  variant="default"
                  className="p-4 flex items-center justify-between gap-3 shadow-soft"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      src={reqUser.foto_url}
                      name={reqUser.nama}
                      size="md"
                      circleRing="coral"
                      hasRing={true}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold text-main truncate">
                        {reqUser.nama}
                      </h3>
                      <p className="text-[11px] font-medium text-muted truncate">
                        @{reqUser.username}
                      </p>
                      <span className="text-[10px] text-muted/80 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#3ED9E8]" /> Ingin berteman denganmu
                      </span>
                    </div>
                  </div>

                  {/* Actions: Terima & Tolak */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 text-[#3ED9E8] animate-spin" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleAccept(item.id, reqUser)}
                          aria-label="Terima Pertemanan"
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:brightness-105 active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                          <span>Terima</span>
                        </button>

                        <button
                          onClick={() => handleReject(item.id)}
                          aria-label="Tolak"
                          className="p-2 rounded-full border border-border hover:bg-surface-elevated text-muted hover:text-[#FF5A36] text-xs font-semibold active:scale-95 transition-all"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.4]" />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State: Tidak ada notifikasi */}
      {!isLoading && requests.length === 0 && (
        <div className="py-16 px-4 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-surface-subtle border border-border flex items-center justify-center mx-auto text-muted">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-subheading font-bold text-main">Belum Ada Notifikasi</h3>
          <p className="text-body text-muted max-w-xs mx-auto leading-relaxed">
            Semua permintaan pertemanan telah Anda tanggapi. Bagikan nama pengguna Anda agar teman dapat menambahkan Anda.
          </p>
        </div>
      )}
    </div>
  )
}
