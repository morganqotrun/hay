import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DotsThreeVertical,
  Plus,
  Trash,
  UserPlus,
  PencilSimple,
  X,
  Lock,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Avatar from '../components/ui/Avatar'
import Chip from '../components/ui/Chip'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PostImage from '../components/ui/PostImage'
import LikeButton from '../components/ui/LikeButton'
import { EmptyFeedSketch } from '../components/ui/EmptyStateIllustrations'
import { useContentContext } from '../context/ContentContext'

export default function FeedPage({ onOpenCreatePost, onOpenSearch }) {
  const { user } = useAuth()
  const { t } = useContentContext()

  const getGreeting = () => {
    const hour = new Date().getHours()
    const nama = user?.user_metadata?.nama || ''
    if (hour >= 4 && hour < 11) return t('feed_greeting_pagi', 'Selamat pagi, {nama}.', { nama: nama || 'Kawan' })
    if (hour >= 11 && hour < 15) return t('feed_greeting_siang', 'Siang, {nama}.', { nama: nama || 'Kawan' })
    if (hour >= 15 && hour < 19) return t('feed_greeting_sore', 'Sore, {nama}.', { nama: nama || 'Kawan' })
    return t('feed_greeting_malam', 'Malam, {nama}.', { nama: nama || 'Kawan' })
  }

  const [posts, setPosts] = useState([])
  const [circles, setCircles] = useState([])
  const [stories, setStories] = useState([])
  const [selectedCircleId, setSelectedCircleId] = useState('all') // 'all' | circle_id
  const [isLoading, setIsLoading] = useState(true)

  // Track expanded captions per post id
  const [expandedCaptions, setExpandedCaptions] = useState({})

  // Dropdown menu hapus post sendiri
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)

  // Modal likers
  const [likersModalPost, setLikersModalPost] = useState(null)

  // Map of post_id -> { count, isLikedByMe, likers: [] }
  const [reactionsState, setReactionsState] = useState({})

  // Load circles & posts from Supabase
  useEffect(() => {
    loadFeedData()
  }, [user])

  const loadFeedData = async () => {
    setIsLoading(true)
    try {
      // 1. Ambil circles milik user atau yang user tergabung di dalamnya
      const { data: circleData } = await supabase
        .from('circles')
        .select('id, nama, warna_hex, ikon')
        .order('created_at', { ascending: true })

      setCircles(circleData || [])

      // 2. Ambil posts dengan relasi author & post_circles
      const postsQuery = supabase
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
      const rawPosts = (!postsErr && postsData) ? postsData : []
      setPosts(rawPosts)
      initReactionsState(rawPosts)

      // 3. Setup circle stories dinamis dari post teman (24 jam terakhir)
      const recentStoryMap = new Map()
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      rawPosts.forEach((p) => {
        if (p.author && p.author.id !== user?.id && new Date(p.created_at).getTime() > oneDayAgo) {
          if (!recentStoryMap.has(p.author.id)) {
            const firstCircle = p.post_circles?.[0]?.circle
            recentStoryMap.set(p.author.id, {
              id: p.author.id,
              name: p.author.nama || p.author.username,
              avatar: p.author.foto_url,
              colorHex: firstCircle?.warna_hex || '#FF6A3D',
              hasUnseen: true,
            })
          }
        }
      })
      setStories(Array.from(recentStoryMap.values()))
    } catch (err) {
      console.error('Feed loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const initReactionsState = (postList) => {
    const state = {}
    postList.forEach((post) => {
      const rxList = post.reactions || []
      const isLikedByMe = user?.id ? rxList.some((r) => r.user_id === user.id) : false
      state[post.id] = {
        count: rxList.length,
        isLikedByMe,
        likers: rxList.map((r) => r.user).filter(Boolean),
      }
    })
    setReactionsState(state)
  }

  // Handle Toggle Like
  const handleToggleLike = async (post, forceNextState) => {
    if (!user?.id) return

    const current = reactionsState[post.id] || { count: 0, isLikedByMe: false, likers: [] }
    const nextLiked = typeof forceNextState === 'boolean' ? forceNextState : !current.isLikedByMe
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1)

    let nextLikers = [...current.likers]
    if (nextLiked) {
      const myProfile = {
        id: user.id,
        nama: user.user_metadata?.nama || 'Saya',
        username: user.user_metadata?.username || 'me',
        foto_url: user.user_metadata?.avatar_url || null,
      }
      nextLikers.push(myProfile)
    } else {
      nextLikers = nextLikers.filter((l) => l.id !== user.id)
    }

    setReactionsState((prev) => ({
      ...prev,
      [post.id]: {
        count: nextCount,
        isLikedByMe: nextLiked,
        likers: nextLikers,
      },
    }))

    try {
      if (nextLiked) {
        await supabase.from('reactions').insert({
          post_id: post.id,
          user_id: user.id,
        })
      } else {
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
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
      {/* Sapaan Berdasarkan Jam */}
      <div className="px-4 pt-2">
        <h2 className="font-serif text-lg font-bold text-main">
          {getGreeting()}
        </h2>
      </div>

      {/* 1. Circle Stories (Scroll Horizontal) */}
      <div className="px-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {/* 'Ceritamu' dengan tombol + Jingga */}
          <div
            onClick={onOpenCreatePost}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="relative">
              <Avatar
                src={user?.user_metadata?.avatar_url}
                name={user?.user_metadata?.nama || 'Saya'}
                size="md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#FF6A3D] text-[#15110E] flex items-center justify-center shadow-sm">
                <Plus size={12} weight="bold" />
              </span>
            </div>
            <span className="text-[11px] font-sans font-medium text-main">Ceritamu</span>
          </div>

          {/* Anggota Circle yang posting dalam 24 jam (Cincin SOLID warna circle, jeda 3px) */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
            >
              <Avatar
                src={story.avatar}
                name={story.name}
                size="md"
                circleColor={story.colorHex}
                isSeen={!story.hasUnseen}
              />
              <span className="text-[11px] font-sans font-medium text-muted group-hover:text-main truncate max-w-[56px]">
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
            color="jingga"
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
                colorHex={c.warna_hex || '#FF6A3D'}
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
              className="bg-surface p-4 rounded-[18px] border border-border space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-28 h-3.5 bg-surface-2 rounded-md" />
                  <div className="w-16 h-2.5 bg-surface-2 rounded-md" />
                </div>
              </div>
              <div className="w-full h-40 bg-surface-2 rounded-[4px]" />
              <div className="w-3/4 h-3 bg-surface-2 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* 4. Empty State: Sketsa Garis Tangan & Microcopy Santai */}
      {!isLoading && filteredPosts.length === 0 && (
        <div className="px-6 py-12 text-center space-y-4">
          <div className="flex justify-center">
            <EmptyFeedSketch className="w-24 h-24" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-xl font-bold text-main">
              {t('feed_empty_title', 'Masih sepi.')}
            </h3>
            <p className="font-sans text-sm text-muted max-w-xs mx-auto leading-relaxed">
              {t(
                'feed_empty_desc',
                'Ajak satu teman masuk ke circle-mu, atau bagikan cerita pertamamu hari ini.'
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSearch}
              leftIcon={<UserPlus size={16} weight="bold" />}
            >
              Cari Teman
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreatePost}
              leftIcon={<PencilSimple size={16} weight="bold" />}
            >
              {t('feed_btn_share', 'Bagikan')}
            </Button>
          </div>
        </div>
      )}

      {/* 5. Feed List: Normal atau TIMELINE VERTIKAL jika Circle dipilih */}
      {!isLoading && filteredPosts.length > 0 && (
        <div
          className={`px-4 space-y-4 ${
            selectedCircleId !== 'all'
              ? 'relative border-l-2 border-dashed ml-6 pl-4'
              : ''
          }`}
          style={
            selectedCircleId !== 'all'
              ? { borderColor: `${activeCircleObject?.warna_hex || '#FF6A3D'}70` }
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
              warna_hex: '#FF6A3D',
            }

            const rx = reactionsState[post.id] || { count: 0, isLikedByMe: false, likers: [] }
            const isOwner = user?.id && post.user_id === user.id
            const isCaptionExpanded = expandedCaptions[post.id]

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                {/* Titik Stempel Bulat Warna Circle pada Timeline Vertikal (Lingkaran Outline Ganda) */}
                {selectedCircleId !== 'all' && (
                  <div
                    className="absolute -left-[25px] top-5 w-3.5 h-3.5 rounded-full timeline-stamp"
                    style={{
                      backgroundColor: activeCircleObject?.warna_hex || '#FF6A3D',
                      color: activeCircleObject?.warna_hex || '#FF6A3D',
                    }}
                  />
                )}

                <Card variant="default" className="p-4 space-y-3">
                  {/* Top Header: Avatar, Nama, Waktu + Mood, Badge Circle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        src={author.foto_url}
                        name={author.nama}
                        size="md"
                        circleColor={postCircle.warna_hex}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans text-sm font-bold text-main truncate leading-tight">
                          {author.nama}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                          <span>{formatRelativeTime(post.created_at)}</span>
                          {post.mood && (
                            <>
                              <span>•</span>
                              <Chip isSticker colorHex={postCircle.warna_hex} size="sm">
                                {post.mood}
                              </Chip>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge Pill NAMA CIRCLE di Kanan Atas */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: postCircle.warna_hex || '#FF6A3D' }}
                      >
                        <Lock size={11} weight="bold" />
                        <span className="font-serif">{postCircle.nama}</span>
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
                            aria-label="Pilihan Post"
                            className="p-1 rounded-full text-muted hover:text-main hover:bg-surface-2 transition-colors cursor-pointer"
                          >
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>

                          {activeMenuPostId === post.id && (
                            <div className="absolute right-0 top-7 z-20 w-36 bg-surface border border-border rounded-[12px] shadow-lg py-1">
                              <button
                                onClick={() => handleDeletePost(post)}
                                className="w-full px-3 py-2 text-left text-xs text-[#E8452C] hover:bg-surface-2 flex items-center gap-2"
                              >
                                <Trash size={14} weight="bold" />
                                <span>Hapus Post</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foto Post Polaroid Frame (-1.6deg s/d +1.6deg) */}
                  {post.foto_url && (
                    <PostImage
                      src={post.foto_url}
                      postId={post.id}
                      alt="Foto Post"
                    />
                  )}

                  {/* Caption Konten */}
                  {post.konten_teks && (
                    <div className="font-sans text-sm text-main leading-relaxed">
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
                          className="text-xs font-semibold text-[#FF6A3D] hover:underline mt-1 cursor-pointer"
                        >
                          {isCaptionExpanded ? 'Tutup selengkapnya' : 'lihat selengkapnya'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Aksi Post: Like Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted">
                    <div className="flex items-center gap-3">
                      <LikeButton
                        initialCount={rx.count}
                        initialLiked={rx.isLikedByMe}
                        onToggle={(nextState) => handleToggleLike(post, nextState)}
                      />

                      {/* Modal list likers */}
                      {rx.count > 0 && (
                        <button
                          onClick={() => setLikersModalPost(post)}
                          className="font-sans text-xs text-muted hover:text-main cursor-pointer"
                        >
                          {rx.count} suka
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal Daftar Siapa yang Like */}
      <AnimatePresence>
        {likersModalPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-surface border border-border rounded-t-[22px] sm:rounded-[22px] p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-serif text-base font-bold text-main">
                  Menyukai Postingan
                </h3>
                <button
                  onClick={() => setLikersModalPost(null)}
                  className="p-1 rounded-full text-muted hover:text-main hover:bg-surface-2"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {(reactionsState[likersModalPost.id]?.likers || []).length > 0 ? (
                  reactionsState[likersModalPost.id].likers.map((liker, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-[12px] bg-surface-2"
                    >
                      <Avatar src={liker.foto_url} name={liker.nama} size="sm" />
                      <div>
                        <h4 className="font-sans text-xs font-bold text-main leading-tight">
                          {liker.nama}
                        </h4>
                        <span className="text-[11px] text-muted">@{liker.username}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted text-center py-4">Belum ada penyuka.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
