import React, { useState } from 'react'
import {
  Sun,
  Moon,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Compass,
  Smile,
  Shield,
  Search,
  Check,
  RotateCw,
  Eye,
  Sliders,
  Send,
  Zap,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Chip from '../components/ui/Chip'
import Input from '../components/ui/Input'
import BottomNav from '../components/ui/BottomNav'
import LikeButton from '../components/ui/LikeButton'

export default function DesignSystemShowcase({ onBackToApp }) {
  const { theme, toggleTheme, setTheme, isMalam } = useTheme()
  const [activeTab, setActiveTab] = useState('beranda')
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const [listKey, setListKey] = useState(0)

  const accentColors = [
    { name: 'Coral', hex: '#FF5A36', class: 'bg-coral' },
    { name: 'Magenta', hex: '#E8467C', class: 'bg-magenta' },
    { name: 'Mustard', hex: '#FFB627', class: 'bg-mustard', darkText: true },
    { name: 'Lime', hex: '#8CC63F', class: 'bg-lime', darkText: true },
    { name: 'Biru', hex: '#3B8FE8', class: 'bg-biru' },
    { name: 'Ungu', hex: '#9B6DE8', class: 'bg-ungu' },
  ]

  const triggerListAnimation = () => {
    setListKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-app text-main pb-28 pt-2 px-4 transition-colors duration-200">
      <div className="max-w-md mx-auto space-y-6">

        {/* Top Header Bar & Theme Switcher */}
        <header className="sticky top-2 z-30 bg-surface/90 backdrop-blur-xl border border-border p-3.5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-coral to-mustard text-white flex items-center justify-center font-bold text-base shadow-soft-sm">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-subheading font-bold text-main">Hay! Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-coral/15 text-coral">
                  DS v1.0
                </span>
              </div>
              <p className="text-metadata text-muted">Design System & Theme Engine</p>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border">
            <button
              onClick={() => setTheme('cerah')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                !isMalam
                  ? 'bg-surface text-main shadow-soft-sm'
                  : 'text-muted hover:text-main'
              }`}
              title="Tema Cerah (#FDF8F3)"
            >
              <Sun className="w-3.5 h-3.5 text-mustard" />
              <span className="text-[11px] pr-1">Cerah</span>
            </button>
            <button
              onClick={() => setTheme('malam')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isMalam
                  ? 'bg-surface-elevated text-main shadow-soft-sm'
                  : 'text-muted hover:text-main'
              }`}
              title="Tema Malam (#17162A)"
            >
              <Moon className="w-3.5 h-3.5 text-ungu" />
              <span className="text-[11px] pr-1">Malam</span>
            </button>
          </div>
        </header>

        {/* Quick Nav to App View */}
        {onBackToApp && (
          <div className="bg-surface-subtle border border-border/80 p-2.5 rounded-xl flex items-center justify-between text-body">
            <span className="text-metadata text-muted">Melihat demo komponen studio</span>
            <Button size="sm" variant="outline" onClick={onBackToApp}>
              Lihat Tampilan App →
            </Button>
          </div>
        )}

        {/* 1. THEME ENGINE & ACCENT PALETTE */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral" />
              1. Palette Aksen Menyala
            </h2>
            <span className="text-metadata text-muted">
              {isMalam ? 'Mode Malam (#17162A)' : 'Mode Cerah (#FDF8F3)'}
            </span>
          </div>

          <Card variant="default" className="p-4 space-y-3">
            <p className="text-body text-muted leading-relaxed">
              Warna aksen di bawah dikalibrasi agar tetap menyala (*high-contrast vibrance*) baik pada latar belakang Cerah maupun Malam.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {accentColors.map((color) => (
                <div
                  key={color.name}
                  className="p-2.5 rounded-xl border border-border/60 bg-surface-subtle flex flex-col items-center text-center gap-1 shadow-soft-sm"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${color.class} shadow-sm flex items-center justify-center font-bold text-[10px] ${
                      color.darkText ? 'text-stone-900' : 'text-white'
                    }`}
                  >
                    ✓
                  </div>
                  <span className="text-metadata font-bold text-main">{color.name}</span>
                  <span className="text-[10px] text-muted font-mono">{color.hex}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 2. TYPOGRAPHY HIERARCHY */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Sliders className="w-4 h-4 text-mustard" />
              2. Tipografi Hierarkis
            </h2>
            <span className="text-metadata text-muted">Strict Font Scale</span>
          </div>

          <Card variant="default" className="p-4 space-y-3.5 divide-y divide-border/60">
            <div className="pt-1">
              <span className="text-metadata text-coral uppercase tracking-wider font-semibold block mb-0.5">
                Heading • 26px Bold
              </span>
              <p className="text-heading text-main font-serif">
                Ruang Tenang Berbagi Cerita
              </p>
            </div>

            <div className="pt-3">
              <span className="text-metadata text-magenta uppercase tracking-wider font-semibold block mb-0.5">
                Subheading • 18px Semibold
              </span>
              <p className="text-subheading text-main">
                Catatan Refleksi & Lingkaran Privat
              </p>
            </div>

            <div className="pt-3">
              <span className="text-metadata text-biru uppercase tracking-wider font-semibold block mb-0.5">
                Nama User • 15px Medium
              </span>
              <p className="text-username text-main">
                Alya Rahmania S.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-metadata text-lime uppercase tracking-wider font-semibold block mb-0.5">
                Body Text • 14px Regular
              </span>
              <p className="text-body text-muted leading-relaxed">
                Hari ini belajar mengikhlaskan hal-hal yang berada di luar kendali kita, dan berfokus pada ketenangan batin bersama teman terdekat.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-metadata text-ungu uppercase tracking-wider font-semibold block mb-0.5">
                Metadata • 11px Muted
              </span>
              <p className="text-metadata text-muted flex items-center gap-2">
                <span>17 September 2026</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-lime" /> Terenkripsi RLS
                </span>
              </p>
            </div>
          </Card>
        </section>

        {/* 3. BUTTONS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Zap className="w-4 h-4 text-coral" />
              3. Button Components
            </h2>
            <span className="text-metadata text-muted">Tactile & Glowing</span>
          </div>

          <Card variant="default" className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2.5 items-center">
              <Button variant="primary" size="md">
                Primary Coral
              </Button>
              <Button variant="outline" size="md">
                Outline
              </Button>
              <Button variant="ghost" size="md">
                Ghost Button
              </Button>
            </div>

            <div className="pt-2 border-t border-border/60">
              <p className="text-metadata text-muted mb-2 font-medium">Varian Aksen & Ukuran:</p>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="accent" accent="magenta" size="sm">
                  Magenta SM
                </Button>
                <Button variant="accent" accent="mustard" size="sm">
                  Mustard SM
                </Button>
                <Button variant="accent" accent="lime" size="sm">
                  Lime SM
                </Button>
                <Button variant="accent" accent="biru" size="sm">
                  Biru SM
                </Button>
                <Button variant="accent" accent="ungu" size="sm">
                  Ungu SM
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center gap-2.5">
              <Button variant="primary" size="sm" isLoading>
                Loading
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Heart className="w-4 h-4 text-magenta" />}>
                Dengan Ikon
              </Button>
              <Button variant="accent" accent="coral" size="icon" aria-label="Kirim">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </section>

        {/* 4. AVATARS WITH CIRCLE RINGS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Smile className="w-4 h-4 text-magenta" />
              4. Avatar (Circle Ring)
            </h2>
            <span className="text-metadata text-muted">6 Ring Accents</span>
          </div>

          <Card variant="default" className="p-4 space-y-3.5">
            <p className="text-body text-muted">
              Ring warna menandakan keanggotaan circle atau identitas lingkaran pemilik post:
            </p>
            <div className="flex items-center justify-between px-2">
              <Avatar
                size="md"
                circleRing="coral"
                moodBadge="✨"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              />
              <Avatar
                size="md"
                circleRing="magenta"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80"
              />
              <Avatar
                size="md"
                circleRing="mustard"
                name="Budi Santoso"
              />
              <Avatar
                size="md"
                circleRing="lime"
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
              />
              <Avatar
                size="md"
                circleRing="biru"
                name="Citra Kirana"
              />
              <Avatar
                size="md"
                circleRing="ungu"
                moodBadge="🍵"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              />
            </div>
          </Card>
        </section>

        {/* 5. CARDS (ORGANIC & NOT FLAT BORING BOXES) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Compass className="w-4 h-4 text-lime" />
              5. Cards (Studio Depth)
            </h2>
            <span className="text-metadata text-muted">Anti-Flat Grid</span>
          </div>

          {/* Interactive Card with accent strip */}
          <Card
            variant="interactive"
            accentStrip="coral"
            className="p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  size="sm"
                  circleRing="coral"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                />
                <div>
                  <h3 className="text-username text-main font-bold leading-tight">
                    Nadia Larasati
                  </h3>
                  <span className="text-metadata text-muted">Sahabat Dekat • 10m</span>
                </div>
              </div>
              <Chip color="coral" size="sm" dot>
                Lingkaran Intim
              </Chip>
            </div>

            <p className="text-body text-main leading-relaxed">
              Ini adalah kartu dengan <strong>Accent Strip Coral</strong> dan efek interaktif (hover lift & depth highlight rim). Sangat kontras dan hidup di kedua tema!
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <LikeButton initialCount={8} initialLiked={true} />
              <button className="flex items-center gap-1 text-metadata text-muted hover:text-main">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>3 balasan</span>
              </button>
            </div>
          </Card>

          {/* Asymmetric Elevated Card */}
          <Card
            variant="elevated"
            asymmetric
            className="p-4 space-y-2 bg-gradient-to-br from-surface to-surface-subtle"
          >
            <div className="flex items-center justify-between">
              <span className="text-metadata font-bold text-ungu uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Asymmetric Card
              </span>
              <Chip color="ungu" size="sm">
                Privat 100%
              </Chip>
            </div>
            <p className="text-body text-muted">
              Mendukung sudut asimetris (organik) untuk menghindari kesan card template AI yang datar dan seragam.
            </p>
          </Card>
        </section>

        {/* 6. CHIPS (PILL ACCENTS) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-biru" />
              6. Chip Components
            </h2>
            <span className="text-metadata text-muted">Pill Icons & Accents</span>
          </div>

          <Card variant="default" className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Chip color="coral" dot>Sahabat Dekat</Chip>
              <Chip color="magenta" icon={<Heart className="w-3 h-3" />}>Momen Hangat</Chip>
              <Chip color="mustard" icon={<Sparkles className="w-3 h-3" />}>Inspirasi</Chip>
              <Chip color="lime" dot>Keluarga</Chip>
              <Chip color="biru" icon={<Shield className="w-3 h-3" />}>RLS Protected</Chip>
              <Chip color="ungu" dot>Kolega Kreatif</Chip>
            </div>
          </Card>
        </section>

        {/* 7. INPUT COMPONENT */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Search className="w-4 h-4 text-ungu" />
              7. Input Component
            </h2>
            <span className="text-metadata text-muted">Tactile Focus Ring</span>
          </div>

          <Card variant="default" className="p-4 space-y-3.5">
            <Input
              label="Cari Cerita di Lingkaranmu"
              placeholder="Ketik kata kunci atau mood..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              helperText="Pencarian terisolasi sesuai izin membership circle Anda."
            />

            <Input
              label="Contoh Validasi Error"
              placeholder="Masukkan username unik..."
              defaultValue="admin"
              error="Username ini telah digunakan oleh pengguna lain."
            />
          </Card>
        </section>

        {/* 8. MICRO-ANIMATIONS (LIKE BOUNCE & FADE-SLIDE-UP) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main flex items-center gap-2">
              <Heart className="w-4 h-4 text-magenta" />
              8. Micro-Animations
            </h2>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCw className="w-3 h-3" />}
              onClick={triggerListAnimation}
            >
              Replay Animasi
            </Button>
          </div>

          <Card variant="default" className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border">
              <div>
                <span className="text-username text-main font-bold block">Scale Bounce Like Button</span>
                <span className="text-metadata text-muted">Klik ikon hati untuk melihat efek bounce</span>
              </div>
              <LikeButton initialCount={12} />
            </div>

            {/* Staggered Fade Slide Up List */}
            <div key={listKey} className="space-y-2">
              <span className="text-metadata uppercase text-muted font-bold tracking-wider block">
                Fade-Slide-Up Staggered List:
              </span>
              {[
                { title: 'Item 1: Feed termutakhir tersinkron', color: 'border-l-coral' },
                { title: 'Item 2: Catatan jurnal otomatis terenkripsi', color: 'border-l-mustard' },
                { title: 'Item 3: Notifikasi lingkaran terdekat', color: 'border-l-lime' },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`p-3 rounded-xl bg-surface border border-border shadow-soft-sm text-body text-main border-l-4 ${item.color} animate-fade-slide-up stagger-${idx + 1}`}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 9. BOTTOM NAV PREVIEW */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-subheading font-semibold text-main">
              9. BottomNav (Elevated Floating + Button)
            </h2>
            <span className="text-metadata text-coral font-bold">5 Items</span>
          </div>
          <Card variant="subtle" className="p-3 text-center">
            <p className="text-metadata text-muted">
              Lihat di bagian bawah layar: Tombol <strong>+</strong> floating berada persis di tengah dan menonjol naik ke luar navigation bar dengan aksen glow coral.
            </p>
          </Card>
        </section>

      </div>

      {/* Floating BottomNav with 5 items */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFabClick={() => alert('✨ Tombol FAB Floating "+" Ditekan!')}
      />
    </div>
  )
}
