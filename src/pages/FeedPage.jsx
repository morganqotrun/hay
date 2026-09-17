import React, { useState } from 'react'
import { Heart, MessageCircle, Lock, Plus, Sparkles } from 'lucide-react'

export default function FeedPage() {
  const [dummyPosts] = useState([
    {
      id: '1',
      author: 'Alya Rahma',
      username: '@alya',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      konten_teks: 'Pagi yang tenang dengan secangkir teh hangat dan buku baru 🌿 Mengambil jeda sejenak dari hiruk pikuk kota.',
      mood: 'Calm 🍵',
      circle: 'Sahabat Dekat',
      circleColor: '#5A8A6F',
      reactions: 4,
      time: '2 jam yang lalu'
    },
    {
      id: '2',
      author: 'Dimas Kurnia',
      username: '@dimas',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      konten_teks: 'Akhirnya draft pertama proposal selesai! Besok saatnya review bersama tim kecil.',
      mood: 'Productive 💻',
      circle: 'Kolega Dekat',
      circleColor: '#C79E59',
      reactions: 6,
      time: '5 jam yang lalu'
    }
  ])

  return (
    <div className="p-4 space-y-4">
      {/* Mood prompt card */}
      <div className="bg-gradient-to-br from-hay-100 to-amber-100/50 p-4 rounded-2xl border border-hay-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-hay-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-hay-600" /> Bagaimana kabarmu hari ini?
          </span>
          <span className="text-[11px] text-hay-700/80 bg-white/70 px-2 py-0.5 rounded-full">
            Privat & Aman
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <input
            type="text"
            placeholder="Bagikan ceritamu ke lingkaran terpilih..."
            className="w-full text-sm bg-white px-3.5 py-2.5 rounded-xl border border-hay-200 focus:outline-none focus:ring-2 focus:ring-hay-500/30 text-stone-700 placeholder:text-stone-400 shadow-sm"
            readOnly
          />
          <button className="bg-hay-600 hover:bg-hay-700 text-white p-2.5 rounded-xl shadow-sm flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
            Cerita Lingkaranmu
          </h2>
          <span className="text-xs text-stone-500">Hanya anggota circle</span>
        </div>

        {dummyPosts.map((post) => (
          <article key={post.id} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover border border-hay-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    {post.author}
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-none mt-0.5">
                    {post.username} • {post.time}
                  </p>
                </div>
              </div>
              
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                style={{
                  backgroundColor: `${post.circleColor}15`,
                  borderColor: `${post.circleColor}40`,
                  color: post.circleColor
                }}
              >
                <Lock className="w-2.5 h-2.5" />
                {post.circle}
              </span>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed font-sans">
              {post.konten_teks}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                {post.mood}
              </span>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{post.reactions}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-stone-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>Komentar</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
