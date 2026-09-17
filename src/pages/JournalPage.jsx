import React, { useState } from 'react'
import { BookOpen, Calendar, Lock, PenLine, ShieldCheck } from 'lucide-react'

export default function JournalPage() {
  const [journals] = useState([
    {
      id: '1',
      tanggal: '17 September 2026',
      mood: 'Bersyukur & Tenang ✨',
      konten: 'Memulai hari dengan refleksi pribadi. Bersyukur atas kesempatan baru dan belajar untuk lebih hadir dalam setiap momen kecil bersama orang-orang terdekat.'
    },
    {
      id: '2',
      tanggal: '15 September 2026',
      mood: 'Fokus & Antusias 🚀',
      konten: 'Berhasil menyelesaikan target penting minggu ini. Merasa bangga dengan kemajuan langkah demi langkah tanpa harus membandingkan diri dengan orang lain.'
    }
  ])

  return (
    <div className="p-4 space-y-4">
      {/* Banner privat */}
      <div className="bg-sage-50 border border-sage-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-soft">
        <div className="p-2 bg-sage-500 text-white rounded-xl">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            Jurnal Pribadi (100% Privat)
          </h2>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            Hanya Anda yang memiliki akses melalui kebijakan Supabase RLS. Tidak ada pengguna lain yang dapat melihat catatan ini.
          </p>
        </div>
      </div>

      {/* Tulis jurnal baru */}
      <button className="w-full bg-white border border-stone-200 hover:border-hay-400 p-4 rounded-2xl text-left flex items-center justify-between shadow-soft group transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-hay-100 text-hay-700 group-hover:bg-hay-200 transition-colors">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-stone-800 block">Tulis Catatan Jurnal Hari Ini</span>
            <span className="text-xs text-stone-400">Tuangkan pikiran dan emosimu secara bebas...</span>
          </div>
        </div>
      </button>

      {/* Daftar entri jurnal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
            Riwayat Entri
          </h3>
          <span className="text-xs text-stone-400">Diurutkan berdasarkan tanggal</span>
        </div>

        {journals.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-soft space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-hay-600" />
                <span>{item.tanggal}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                {item.mood}
              </span>
            </div>

            <p className="text-sm text-stone-700 font-serif leading-relaxed italic">
              "{item.konten}"
            </p>

            <div className="flex items-center justify-end pt-1">
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sage-500" /> Tersimpan aman di Supabase
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
