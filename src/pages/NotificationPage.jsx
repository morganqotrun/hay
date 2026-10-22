import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Check,
  X,
  Clock,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import { EmptyFriendsSketch } from '../components/ui/EmptyStateIllustrations'

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

        if (isMounted) {
          setRequests((!error && data) ? data : [])
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

  // Terima Permintaan Pertemanan
  const handleAccept = async (requestId, requesterUser) => {
    setActionLoadingId(requestId)
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (!error) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
        if (onFriendshipChange) onFriendshipChange()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Tolak / Hapus Permintaan
  const handleReject = async (requestId) => {
    setActionLoadingId(requestId)
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)

      if (!error) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
        if (onFriendshipChange) onFriendshipChange()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Top Header */}
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
            Notifikasi
          </h1>
          <p className="font-sans text-xs text-muted">
            Permintaan pertemanan lingkaran
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 text-center text-xs text-muted font-sans">
          Memeriksa permintaan baru...
        </div>
      )}

      {/* List Permintaan */}
      {!isLoading && requests.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted px-1 block">
            Permintaan Pertemanan ({requests.length})
          </span>

          <div className="space-y-2.5">
            {requests.map((item) => {
              const reqUser = item.requester || {
                nama: 'Pengguna Hay!',
                username: 'user',
                foto_url: null,
              }
              const isActionLoading = actionLoadingId === item.id

              return (
                <Card
                  key={item.id}
                  variant="default"
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      src={reqUser.foto_url}
                      name={reqUser.nama}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-sans text-sm font-bold text-main truncate">
                        {reqUser.nama}
                      </h3>
                      <p className="font-sans text-xs text-muted truncate">
                        @{reqUser.username}
                      </p>
                      <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} weight="bold" /> Ingin terhubung
                      </span>
                    </div>
                  </div>

                  {/* Actions: Terima & Tolak */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isActionLoading}
                      onClick={() => handleAccept(item.id, reqUser)}
                      leftIcon={<Check size={14} weight="bold" />}
                    >
                      Terima
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isActionLoading}
                      onClick={() => handleReject(item.id)}
                      leftIcon={<X size={14} weight="bold" />}
                    >
                      Tolak
                    </Button>
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
          <div className="flex justify-center">
            <EmptyFriendsSketch className="w-24 h-24" />
          </div>
          <h3 className="font-serif text-lg font-bold text-main">Belum ada notifikasi baru</h3>
          <p className="font-sans text-xs text-muted max-w-xs mx-auto leading-relaxed">
            Semua permintaan pertemanan telah kamu tanggapi.
          </p>
        </div>
      )}
    </div>
  )
}
