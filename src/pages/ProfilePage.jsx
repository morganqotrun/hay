import React from 'react'
import { User, Settings, Shield, Palette, Database, Check } from 'lucide-react'

export default function ProfilePage() {
  const profile = {
    nama: 'Pengguna Hay!',
    username: '@hay_user',
    email: 'user@hay.local',
    bio: 'Menulis cerita kecil setiap hari, berbagi hanya dengan lingkaran terdekat. 🌾',
    tema_preferensi: 'cerah'
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-hay-200 border-2 border-hay-400/50 flex items-center justify-center text-hay-800 text-3xl font-bold mx-auto shadow-inner">
            🌾
          </div>
          <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full border-2 border-white text-white">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900">{profile.nama}</h2>
          <p className="text-xs text-stone-400">{profile.username}</p>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
          {profile.bio}
        </p>

        <button className="text-xs font-semibold text-hay-700 bg-hay-50 hover:bg-hay-100 border border-hay-200 px-4 py-2 rounded-xl transition-colors">
          Edit Profil Pribadi
        </button>
      </div>

      {/* Preferensi & Keamanan */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-soft divide-y divide-stone-100">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-800">Tema Preferensi</h3>
              <p className="text-[11px] text-stone-400">Pilihan saat ini: {profile.tema_preferensi}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-hay-700 bg-hay-50 px-2.5 py-1 rounded-lg border border-hay-200">
            Cerah
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-800">Row Level Security (RLS)</h3>
              <p className="text-[11px] text-stone-400">Proteksi data level database Supabase</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Aktif
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-800">Skema Database</h3>
              <p className="text-[11px] text-stone-400">8 Tabel (Users, Posts, Circles, Journal, dll)</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            Siap Digunakan
          </span>
        </div>
      </div>
    </div>
  )
}
