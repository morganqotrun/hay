# 🌾 Hay! — Private Social Journal App

Aplikasi jurnal pribadi dan jejaring sosial privat berbasis **mobile-first**, dirancang untuk berbagi cerita autentik hanya dengan lingkaran terdekat (*circles*), serta pencatatan jurnal yang 100% aman dan rahasia.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express (siap untuk Vercel Serverless `/api/*`)
- **Database, Auth & Storage**: Supabase (PostgreSQL dengan Row Level Security)
- **Deploy Target**: Vercel

---

## 📁 Struktur Folder

```text
hay/
├── api/                   # Entrypoint Serverless Vercel (Express)
│   └── index.js
├── server/                # Express backend lokal
│   └── index.js
├── supabase/
│   └── schema.sql         # Skema tabel lengkap + RLS + Trigger Auth
├── src/
│   ├── components/        # Header, BottomNav, MobileContainer
│   ├── hooks/             # Custom React Hooks (useAuth)
│   ├── lib/               # Supabase Client SDK (supabase.js)
│   ├── pages/             # FeedPage, JournalPage, CirclesPage, ProfilePage
│   ├── App.jsx            # Main app shell & router tab
│   ├── main.jsx           # Entrypoint React
│   └── index.css          # Tailwind base & custom mobile styles
├── .env.example           # Contoh environment variables
├── vercel.json            # Konfigurasi routing Vercel
├── tailwind.config.js     # Desain sistem warna Hay!
└── package.json
```

---

## 🚀 Cara Install & Menjalankan

### 1. Clone atau Buka Direktori Proyek
```bash
cd "f:/2026/LAIN LAIN/ANTIGRAVITY/HAY!"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel berikut dengan kredensial project Anda dari **Supabase Dashboard** (*Project Settings* -> *API*):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
PORT=5000
```

### 4. Eksekusi Skema Database di Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor**.
3. Buka file [`supabase/schema.sql`](file:///f:/2026/LAIN%20LAIN/ANTIGRAVITY/HAY!/supabase/schema.sql), salin seluruh isinya dan tempel ke SQL Editor.
4. Klik **Run**.
   - Skema ini otomatis membuat 8 tabel: `users`, `friendships`, `circles`, `circle_members`, `posts`, `post_circles`, `reactions`, `journal_entries`.
   - Mengaktifkan **Row Level Security (RLS)** untuk semua tabel.
   - Mengaktifkan trigger otomatis profil user saat registrasi via Supabase Auth.

### 5. Menjalankan Aplikasi

#### Menjalankan Frontend (Vite):
```bash
npm run dev
```
Akses di browser: `http://localhost:5173`

#### Menjalankan Backend Express (Opsional / API Lokal):
```bash
npm run server
```
Akses di browser / Postman: `http://localhost:5000/api/health`

---

## 🔒 Kebijakan Row Level Security (RLS)

1. **Jurnal (`journal_entries`)**:
   - `auth.uid() = user_id` untuk operasi `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
   - Data bersifat 100% rahasia, tidak dapat dibaca oleh pengguna lain.
2. **Postingan (`posts`)**:
   - Pengguna **hanya bisa membaca** post miliknya sendiri atau post yang dibagikan ke *circle* di mana pengguna terdaftar sebagai anggota (`circle_members`).
   - Pengguna hanya bisa membuat, mengedit, atau menghapus postingannya sendiri.
3. **Profil (`users`)**:
   - Semua user terautentikasi dapat membaca profil dasar pengguna.
   - Pengguna **hanya dapat memperbarui profil miliknya sendiri** (`auth.uid() = id`).
4. **Circles (`circles` & `circle_members`)**:
   - Hanya pemilik dan anggota terdaftar yang dapat melihat konten circle.
   - Hanya pemilik circle yang berhak mengelola anggota.

---

## 🌐 Deployment ke Vercel

Proyek ini telah dilengkapi dengan `vercel.json` dan folder `api/`:
1. Push kode ke repository GitHub / GitLab.
2. Hubungkan repository di [Vercel](https://vercel.com).
3. Tambahkan environment variable di Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy! Vercel akan otomatis mem-build frontend dan mengekspos backend Express melalui serverless function di `/api/*`.
