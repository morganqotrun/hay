import React from 'react'
import { Users, Plus, Shield, CheckCircle2 } from 'lucide-react'

export default function CirclesPage() {
  const circles = [
    {
      id: '1',
      nama: 'Sahabat Dekat',
      warna: '#5A8A6F',
      members: 4,
      desc: 'Orang-orang terpercaya untuk berbagi cerita terdalam.'
    },
    {
      id: '2',
      nama: 'Kolega Dekat',
      warna: '#C79E59',
      members: 7,
      desc: 'Diskusi seputar karir, proyek, dan produktivitas harian.'
    },
    {
      id: '3',
      nama: 'Keluarga Inti',
      warna: '#D96B43',
      members: 5,
      desc: 'Momen hangat dan update kabar keluarga tercinta.'
    }
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Lingkaran Privat</h2>
          <p className="text-xs text-stone-500">Atur siapa saja yang dapat membaca postinganmu</p>
        </div>
        <button className="bg-hay-600 hover:bg-hay-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Buat Circle</span>
        </button>
      </div>

      <div className="space-y-3">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                  style={{ backgroundColor: circle.warna }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">{circle.nama}</h3>
                  <span className="text-xs text-stone-400">{circle.members} anggota aktif</span>
                </div>
              </div>

              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                Owner
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {circle.desc}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                <Shield className="w-3 h-3 text-hay-600" /> Terisolasi via Post Circles RLS
              </span>
              <button className="text-hay-700 hover:text-hay-800 font-semibold">
                Kelola Anggota →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
