import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreVertical,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Lock,
  UserPlus,
  PenTool,
  X,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Avatar from '../components/ui/Avatar'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function FeedPage({ onOpenCreatePost, onOpenSearch }) {
  const { user } = useAuth()

  const [posts, setPosts] = useState([])
  const [circles, setCircles] = useState([])
  const [selectedCircleId, setSelectedCircleId] = useState('all') // 'all' or circle.id
  const [stories, setStories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Likes tracking: post_id -> { count, isLikedByMe, likers: [] }
  const [reactionsState, setReactionsState] = useState({})
  const [likersModalPost, setLikersModalPost] = useState(null)

  // Expandable caption state: post_id -> boolean
  const [expandedCaptions, setExpandedCaptions] = useState({})

  // Dropdown menu state: post_id -> boolean
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)

  // Fetch Circles and Posts from Supabase
  const loadFeedData = async () => {
    setIsLoading(true)
    try {
      // 1. Ambil circles
      const { data: circleData } = await supabase
        .from('circles')
        .select('id, nama, warna_hex, ikon')
        .order('created_at', { ascending: true })

      const safeCircles = circleData || [
        { id: 'c-terdekat', nama: 'Terdekat', warna_hex: '#FF5A36' },
        { id: 'c-keluarga', nama: 'Keluarga', warna_hex: '#E8467C' },
        { id: 'c-kolega', nama: 'Kolega Kerja', warna_hex: '#3B8FE8' },
      ]
      setCircles(safeCircles)

      // 2. Ambil posts dengan relasi author & post_circles
      let postsQuery = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          konten_teks,
          foto_url,
          mood,
          created_at,
          author:users (
            id,
            nama,
            username,
            foto_url
          ),
          post_circles (
            circle:circles (
              id,
              nama,
              warna_hex
            )
          ),
          reactions (
            id,
            user_id,
            user:users (
              id,
              nama,
              username,
              foto_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      const { data: postsData, error: postsErr } = await postsQuery

      if (postsErr || !postsData || postsData.length === 0) {
        // High fidelity fallback posts
        const mockPosts = [
          {
            id: 'post-1',
            user_id: user?.id || 'demo-author',
            konten_teks:
              'Pagi yang tenang dengan secangkir teh herbal hangat dan catatan kecil. Mengambil jeda sejenak dari kebisingan rutinitas harian untuk mendengarkan diri sendiri 🍵🌿',
            foto_url:
              'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&auto=format&fit=crop&q=85',
            mood: 'Santai',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            author: {
              id: user?.id || 'demo-author',
              nama: user?.user_metadata?.nama || 'Alya Rahma',
              username: user?.user_metadata?.username || 'alyarahma',
              foto_url:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            },
            post_circles: [
              { circle: { id: 'c-terdekat', nama: 'Terdekat', warna_hex: '#FF5A36' } },
            ],
            reactions: [
              {
                id: 'r-1',
                user_id: 'user-dimas',
                user: { nama: 'Dimas Kurnia', username: 'dimas' },
              },
              {
                id: 'r-2',
                user_id: 'user-rizky',
                user: { nama: 'Rizky Pratama', username: 'rizky' },
              },
            ],
          },
          {
            id: 'post-2',
            user_id: 'u-dimas',
            konten_teks:
              'Menyelesaikan sketsa interior studio baru bersama tim kecil kami. Terkadang langkah sederhana hari ini adalah fondasi besar untuk hari esok 📐✨',
            foto_url:
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=85',
            mood: 'Semangat',
            created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
            author: {
              id: 'u-dimas',
              nama: 'Dimas Kurnia',
              username: 'dimaskurnia',
              foto_url:
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            },
            post_circles: [
              { circle: { id: 'c-kolega', nama: 'Kolega Kerja', warna_hex: '#3B8FE8' } },
            ],
            reactions: [
              {
                id: 'r-3',
                user_id: user?.id || 'me',
                user: { nama: 'Saya', username: 'me' },
              },
            ],
          },
        ]
        setPosts(mockPosts)
        initReactionsState(mockPosts)
      } else {
        setPosts(postsData)
        initReactionsState(postsData)
      }

      // 3. Setup circle stories (24 jam terakhir)
      setStories([
        {
          id: 'story-1',
          name: 'Dimas',
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          hasUnseen: true,
        },
        {
          id: 'story-2',
          name: 'Alya',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          hasUnseen: true,
        },
        {
          id: 'story-3',
          name: 'Rizky',
          avatar:
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          hasUnseen: false,
        },
      ])
    } catch (err) {
      console.error('Feed loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const initReactionsState = (postList) => {
    const map = {}
    postList.forEach((p) => {
      const rxList = p.reactions || []
      const isLiked = rxList.some((r) => r.user_id === user?.id)
      map[p.id] = {
        count: rxList.length,
        isLikedByMe: isLiked,
        likers: rxList.map((r) => r.user || { nama: 'Pengguna', username: 'user' }),
      }
    })
    setReactionsState(map)
  }

  useEffect(() => {
    loadFeedData()
  }, [user])

  // Like Toggle with Optimistic UI & Bounce Animation
  const handleToggleLike = async (post) => {
    const current = reactionsState[post.id] || { count: 0, isLikedByMe: false, likers: [] }
    const newIsLiked = !current.isLikedByMe
    const newCount = newIsLiked ? current.count + 1 : Math.max(0, current.count - 1)

    // Optimistic Update
    setReactionsState((prev) => ({
      ...prev,
      [post.id]: {
        ...current,
        isLikedByMe: newIsLiked,
        count: newCount,
        likers: newIsLiked
          ? [
              ...current.likers,
              {
                id: user?.id,
                nama: user?.user_metadata?.nama || 'Saya',
                username: user?.user_metadata?.username || 'me',
              },
            ]
          : current.likers.filter((l) => l.id !== user?.id),
      },
    }))

    try {
      if (newIsLiked) {
        await supabase.from('reactions').insert({
          post_id: post.id,
          user_id: user?.id,
        })
      } else {
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user?.id)
      }
    } catch (err) {
      console.warn('Reaction sync notice:', err?.message)
    }
  }

  // Hapus Post Sendiri
  const handleDeletePost = async (post) => {
    if (!window.confirm('Hapus post ini? Tindakan ini tidak dapat dibatalkan.')) return

    try {
      await supabase.from('posts').delete().eq('id', post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      setActiveMenuPostId(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Relative Time Formatter
  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Baru saja'
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Baru saja'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m yang lalu`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} jam yang lalu`
    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay} hari yang lalu`
  }

  // Filter posts based on selected circle
  const filteredPosts =
    selectedCircleId === 'all'
      ? posts
      : posts.filter((p) =>
          p.post_circles?.some((pc) => pc.circle?.id === selectedCircleId)
        )

  const activeCircleObject =
    selectedCircleId !== 'all' ? circles.find((c) => c.id === selectedCircleId) : null

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Circle Stories (Scroll Horizontal) */}
      <div className="pt-2 px-4">
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {/* 'Ceritamu' dengan ikon + */}
          <div
            onClick={onOpenCreatePost}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-surface-subtle border-2 border-border p-0.5 flex items-center justify-center">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  name={user?.user_metadata?.nama || 'Saya'}
                  size="md"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>
            <span className="text-[11px] font-medium text-main">Ceritamu</span>
          </div>

          {/* Anggota Circle yang posting dalam 24 jam */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => alert(`Membuka story 24 jam dari ${story.name}`)}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
            >
              <div
                className={`p-0.5 rounded-full ${
                  story.hasUnseen
                    ? 'bg-gradient-to-tr from-[#3B8FE8] to-[#9B6DE8]'
                    : 'bg-border/70'
                }`}
              >
                <div className="p-0.5 bg-app rounded-full">
                  <Avatar src={story.avatar} name={story.name} size="md" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted group-hover:text-main truncate max-w-[56px]">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Chip Circle Filter */}
      <div className="px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Filter 'Semua' */}
          <Chip
            color="neutral"
            variant={selectedCircleId === 'all' ? 'solid' : 'outline'}
            size="md"
            onClick={() => setSelectedCircleId('all')}
            className="shrink-0"
          >
            Semua Circle
          </Chip>

          {/* Filter per Circle */}
          {circles.map((c) => {
            const isSelected = selectedCircleId === c.id
            return (
              <Chip
                key={c.id}
                colorHex={isSelected ? c.warna_hex || '#FF5A36' : undefined}
                variant={isSelected ? 'solid' : 'outline'}
                size="md"
                onClick={() => setSelectedCircleId(c.id)}
                className="shrink-0"
              >
                {c.nama}
              </Chip>
            )
          })}
        </div>
      </div>

      {/* 3. Skeleton Loading */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-surface p-4 rounded-2xl border border-border/70 shadow-soft space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-subtle" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-28 h-3.5 bg-surface-subtle rounded-md" />
                  <div className="w-16 h-2.5 bg-surface-subtle rounded-md" />
                </div>
              </div>
              <div className="w-full h-44 bg-surface-subtle rounded-xl" />
              <div className="w-3/4 h-3 bg-surface-subtle rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* 4. Empty State Menarik */}
      {!isLoading && filteredPosts.length === 0 && (
        <div className="px-4 py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3B8FE8]/15 to-[#3ED9E8]/15 border border-[#3ED9E8]/30 flex items-center justify-center mx-auto text-[#3ED9E8]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-subheading font-bold text-main">
              {selectedCircleId !== 'all'
                ? `Belum Ada Cerita di "${activeCircleObject?.nama}"`
                : 'Belum Ada Cerita Lingkaran'}
            </h3>
            <p className="text-body text-muted max-w-xs mx-auto leading-relaxed">
              Jadilah yang pertama membagikan momen hari ini, atau cari teman dekat untuk saling terhubung.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSearch}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Cari Teman
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={onOpenCreatePost}
              leftIcon={<PenTool className="w-3.5 h-3.5" />}
            >
              Buat Post Pertama
            </Button>
          </div>
        </div>
      )}

      {/* 5. Feed List: Tampil Normal ATAU TIMELINE VERTIKAL jika 1 Circle dipilih */}
      {!isLoading && filteredPosts.length > 0 && (
        <div
          className={`px-4 space-y-4 ${
            selectedCircleId !== 'all'
              ? 'relative border-l-2 ml-5 pl-4'
              : ''
          }`}
          style={
            selectedCircleId !== 'all'
              ? { borderColor: `${activeCircleObject?.warna_hex || '#FF5A36'}40` }
              : {}
          }
        >
          {filteredPosts.map((post) => {
            const author = post.author || {
              nama: 'Pengguna Hay!',
              username: 'user',
              foto_url: null,
            }
            const postCircle = post.post_circles?.[0]?.circle || {
              nama: 'Terdekat',
              warna_hex: '#FF5A36',
            }

            const rx = reactionsState[post.id] || { count: 0, isLikedByMe: false, likers: [] }
            const isOwner = user?.id && post.user_id === user.id
            const isCaptionExpanded = expandedCaptions[post.id]

            return (
              <div key={post.id} className="relative">
                {/* Titik Bulat Warna Circle pada Timeline Vertikal */}
                {selectedCircleId !== 'all' && (
                  <div
                    className="absolute -left-[23px] top-5 w-3.5 h-3.5 rounded-full border-2 border-app shadow-sm"
                    style={{ backgroundColor: activeCircleObject?.warna_hex || '#FF5A36' }}
                  />
                )}

                <Card variant="default" className="p-4 space-y-3.5 shadow-soft">
                  {/* Top Header: Avatar, Nama, Waktu + Mood, Badge Circle di Kanan Atas */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        src={author.foto_url}
                        name={author.nama}
                        size="md"
                        circleRing={postCircle.warna_hex || 'coral'}
                        hasRing={true}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-username font-bold text-main truncate leading-tight">
                          {author.nama}
                        </h3>
                        <div className="flex items-center gap-1.5 text-metadata text-muted mt-0.5">
                          <span>{formatRelativeTime(post.created_at)}</span>
                          {post.mood && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-[#3ED9E8]">{post.mood}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge Pill NAMA CIRCLE di Kanan Atas (SOLID & KONTRAS TINGGI) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: postCircle.warna_hex || '#FF5A36' }}
                      >
                        <Lock className="w-2.5 h-2.5 stroke-[2.8]" />
                        <span>{postCircle.nama}</span>
                      </span>

                      {/* Dropdown 3 Titik untuk Hapus Post Sendiri */}
                      {isOwner && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuPostId(
                                activeMenuPostId === post.id ? null : post.id
                              )
                            }
                            className="p-1 rounded-full text-muted hover:text-main"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuPostId === post.id && (
                            <div className="absolute right-0 top-6 z-20 w-32 bg-surface border border-border shadow-soft-lg rounded-xl py-1 text-xs">
                              <button
                                onClick={() => handleDeletePost(post)}
                                className="w-full px-3 py-2 text-left text-[#FF5A36] hover:bg-[#FF5A36]/10 flex items-center gap-1.5 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Post</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foto Post: Full-width rounded-xl */}
                  {post.foto_url && (
                    <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm max-h-80 w-full bg-black/20">
                      <img
                        src={post.foto_url}
                        alt="Foto Post"
                        className="w-full h-full object-cover max-h-80"
                      />
                    </div>
                  )}

                  {/* Caption Konten (2 Baris + 'lihat selengkapnya') */}
                  {post.konten_teks && (
                    <div className="text-body text-main leading-relaxed">
                      <p
                        className={`${
                          !isCaptionExpanded ? 'line-clamp-2' : ''
                        } transition-all`}
                      >
                        {post.konten_teks}
                      </p>
                      {post.konten_teks.length > 100 && (
                        <button
                          onClick={() =>
                            setExpandedCaptions((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="text-[12px] font-semibold text-[#3ED9E8] hover:underline mt-1"
                        >
                          {isCaptionExpanded ? 'Tutup selengkapnya' : 'lihat selengkapnya'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Aksi Post: Hati + Jumlah Like terbuka, Komentar, Bookmark */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-metadata text-muted">
                    <div className="flex items-center gap-4">
                      {/* Like button with bounce */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleLike(post)}
                          aria-label="Suka"
                          className={`p-1.5 rounded-full transition-transform active:scale-125 ${
                            rx.isLikedByMe ? 'text-[#FF5A36]' : 'hover:text-[#FF5A36]'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              rx.isLikedByMe
                                ? 'fill-[#FF5A36] stroke-[#FF5A36] animate-heart-bounce'
                                : 'stroke-[1.8]'
                            }`}
                          />
                        </button>

                        {/* Tap angka like -> modal siapa yang like */}
                        <button
                          onClick={() => setLikersModalPost(post)}
                          className="font-bold text-main hover:text-[#3ED9E8] cursor-pointer"
                        >
                          {rx.count > 999 ? `${(rx.count / 1000).toFixed(1)}K` : rx.count} suka
                        </button>
                      </div>

                      {/* Komentar */}
                      <button
                        onClick={() => alert('Fitur komentar privat circle')}
                        className="flex items-center gap-1.5 hover:text-main"
                      >
                        <MessageCircle className="w-5 h-5 stroke-[1.8]" />
                        <span>Komentar</span>
                      </button>
                    </div>

                    {/* Bookmark (Privat tanpa share publik) */}
                    <button
                      onClick={() => alert('Postingan disimpan ke bookmark privat Anda')}
                      aria-label="Simpan Bookmark"
                      className="p-1.5 rounded-full hover:text-[#3ED9E8] transition-colors"
                    >
                      <Bookmark className="w-5 h-5 stroke-[1.8]" />
                    </button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Daftar Siapa yang Like */}
      <AnimatePresence>
        {likersModalPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h3 className="text-subheading font-bold text-main">
                  Menyukai Postingan
                </h3>
                <button
                  onClick={() => setLikersModalPost(null)}
                  className="p-1 rounded-full hover:bg-surface-subtle text-muted hover:text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {(reactionsState[likersModalPost.id]?.likers || []).length > 0 ? (
                  reactionsState[likersModalPost.id].likers.map((liker, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-xl bg-surface-subtle"
                    >
                      <Avatar src={liker.foto_url} name={liker.nama} size="sm" />
                      <div>
                        <h4 className="text-username font-bold text-main leading-tight">
                          {liker.nama}
                        </h4>
                        <span className="text-metadata text-muted">@{liker.username}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-muted py-4">
                    Belum ada yang menyukai postingan ini.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
