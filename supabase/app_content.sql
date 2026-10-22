-- ==============================================================================
-- Hay! — App Content (Admin Managed Text & Microcopy)
-- File: supabase/app_content.sql
-- Idempotent & safe to run repeatedly in Supabase SQL Editor
-- ==============================================================================

-- 1. TAMBAH KOLOM is_admin PADA TABEL USERS (Jika belum ada)
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Helper Function: Cek status is_admin pengguna
CREATE OR REPLACE FUNCTION public.is_app_admin(u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = u_id), false);
$$;

-- Trigger: Cegah user biasa mengubah kolom is_admin miliknya
CREATE OR REPLACE FUNCTION public.prevent_user_self_admin_elevation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND NOT public.is_app_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengubah hak akses is_admin.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_user_self_admin ON public.users;
CREATE TRIGGER trg_prevent_user_self_admin
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_self_admin_elevation();

-- ==============================================================================
-- 2. TABEL APP_CONTENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.app_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  grup TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pencarian grup & key
CREATE INDEX IF NOT EXISTS idx_app_content_grup ON public.app_content(grup);

-- Enable RLS
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika ada
DROP POLICY IF EXISTS "app_content_select_all" ON public.app_content;
DROP POLICY IF EXISTS "app_content_admin_insert" ON public.app_content;
DROP POLICY IF EXISTS "app_content_admin_update" ON public.app_content;
DROP POLICY IF EXISTS "app_content_admin_delete" ON public.app_content;

-- SELECT untuk semua orang (anonim & login) agar onboarding & login teks bisa dibaca
CREATE POLICY "app_content_select_all"
  ON public.app_content
  FOR SELECT
  USING (true);

-- INSERT / UPDATE / DELETE hanya untuk admin
CREATE POLICY "app_content_admin_insert"
  ON public.app_content
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_app_admin(auth.uid()));

CREATE POLICY "app_content_admin_update"
  ON public.app_content
  FOR UPDATE
  TO authenticated
  USING (public.is_app_admin(auth.uid()))
  WITH CHECK (public.is_app_admin(auth.uid()));

CREATE POLICY "app_content_admin_delete"
  ON public.app_content
  FOR DELETE
  TO authenticated
  USING (public.is_app_admin(auth.uid()));

-- ==============================================================================
-- 3. SEED INITIAL APP_CONTENT (MICROCOPY TERBARU)
-- Sintaks **kata** digunakan untuk kata yang disorot dengan garis bawah bergelombang
-- ==============================================================================
INSERT INTO public.app_content (key, value, label, grup)
VALUES
  -- Onboarding
  ('onboarding_slide1_title', 'Satu ruang untuk **lingkaranmu** yang terdekat.', 'Judul Slide 1', 'Onboarding'),
  ('onboarding_slide1_desc', 'Bagikan momen hanya ke circle yang kamu percaya tanpa kebisingan publik.', 'Deskripsi Slide 1', 'Onboarding'),
  ('onboarding_slide2_title', 'Cerita hari ini, **apa adanya**.', 'Judul Slide 2', 'Onboarding'),
  ('onboarding_slide2_desc', 'Bagikan foto, cerita, dan suasana hati tanpa tekanan like palsu & algoritma.', 'Deskripsi Slide 2', 'Onboarding'),
  ('onboarding_slide3_title', 'Koneksi yang **berarti** di setiap lingkaran.', 'Judul Slide 3', 'Onboarding'),
  ('onboarding_slide3_desc', 'Hanya teman yang kamu undang yang dapat melihat dan memberi reaksi.', 'Deskripsi Slide 3', 'Onboarding'),
  ('onboarding_slide4_title', 'Ruang privat untuk **refleksimu**.', 'Judul Slide 4', 'Onboarding'),
  ('onboarding_slide4_desc', 'Tiga kalimat saja cukup. Jurnal harian yang 100% rahasia untuk dirimu sendiri.', 'Deskripsi Slide 4', 'Onboarding'),
  ('onboarding_btn_next', 'Lanjut', 'Tombol Lanjut', 'Onboarding'),
  ('onboarding_btn_skip', 'Lewati', 'Tombol Lewati', 'Onboarding'),
  ('onboarding_btn_start', 'Mulai', 'Tombol Mulai', 'Onboarding'),

  -- Login & Daftar
  ('login_title', 'Selamat datang di **Hay!**', 'Judul Halaman Masuk', 'Autentikasi'),
  ('login_desc', 'Masuk untuk membaca kabar lingkaran terdekatmu.', 'Subjudul Masuk', 'Autentikasi'),
  ('login_btn_submit', 'Masuk', 'Tombol Masuk', 'Autentikasi'),
  ('register_title', 'Buat akun **Hay!**', 'Judul Halaman Daftar', 'Autentikasi'),
  ('register_desc', 'Mulai berbagi cerita dengan lingkaran terdekatmu.', 'Subjudul Daftar', 'Autentikasi'),
  ('register_btn_submit', 'Daftar', 'Tombol Daftar', 'Autentikasi'),

  -- Beranda & Feed
  ('feed_greeting_morning', 'Selamat pagi, {nama}.', 'Sapaan Pagi', 'Beranda'),
  ('feed_greeting_afternoon', 'Siang, {nama}.', 'Sapaan Siang', 'Beranda'),
  ('feed_greeting_evening', 'Sore, {nama}.', 'Sapaan Sore', 'Beranda'),
  ('feed_greeting_night', 'Malam, {nama}.', 'Sapaan Malam', 'Beranda'),
  ('feed_empty_title', 'Masih sepi.', 'Judul Feed Kosong', 'Beranda'),
  ('feed_empty_desc', 'Ajak satu teman masuk ke circle-mu, atau bagikan cerita pertamamu hari ini.', 'Deskripsi Feed Kosong', 'Beranda'),
  ('feed_btn_search', 'Cari Teman', 'Tombol Cari Teman', 'Beranda'),
  ('feed_btn_post', 'Bagikan', 'Tombol Bagikan', 'Beranda'),

  -- Buat Post
  ('post_placeholder', 'Hari ini ada cerita apa?', 'Placeholder Input Post', 'Buat Post'),
  ('post_btn_share', 'Bagikan', 'Tombol Kirim Cerita', 'Buat Post'),
  ('post_btn_cancel', 'Batal', 'Tombol Batal', 'Buat Post'),

  -- Jurnal
  ('journal_title', 'Tiga kalimat saja cukup.', 'Motto / Judul Form Jurnal', 'Jurnal'),
  ('journal_streak_format', '{n} hari beruntun', 'Format Teks Streak', 'Jurnal'),
  ('journal_placeholder', 'Hari ini apa yang paling kamu syukuri atau pelajari?', 'Placeholder Input Jurnal', 'Jurnal'),
  ('journal_btn_save', 'Simpan Catatan', 'Tombol Simpan Jurnal', 'Jurnal'),
  ('journal_empty_desc', 'Tiga kalimat saja cukup. Mulai tulis refleksi singkat hari ini.', 'Deskripsi Jurnal Kosong', 'Jurnal'),

  -- Circle & Pertemanan
  ('circle_header_title', 'Circle Teman', 'Judul Halaman Circle', 'Circle'),
  ('circle_header_desc', 'Lingkaran cerita yang terisolasi dan privat', 'Deskripsi Circle', 'Circle'),
  ('circle_btn_create', 'Buat Circle', 'Tombol Buat Circle', 'Circle'),
  ('circle_empty_desc', 'Buat circle pertamamu seperti ''Keluarga'' atau ''Sahabat Dekat'' untuk berbagi cerita.', 'Deskripsi Circle Kosong', 'Circle'),

  -- Profil
  ('profile_btn_edit', 'Edit Profil', 'Tombol Edit Profil', 'Profil'),
  ('profile_btn_logout', 'Keluar dari Akun', 'Tombol Keluar Akun', 'Profil'),
  ('profile_admin_menu', 'Kelola Teks', 'Menu Kelola Teks Admin', 'Profil'),

  -- Umum / Notifikasi
  ('common_error_retry', 'Yah, gagal. Coba lagi sebentar.', 'Pesan Error Standar', 'Umum'),
  ('notification_empty_desc', 'Semua permintaan pertemanan telah kamu tanggapi.', 'Deskripsi Notifikasi Kosong', 'Umum')

ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  grup = EXCLUDED.grup;

-- ==============================================================================
-- 4. CONTOH QUERY UNTUK MENJADIKAN USER SEBAGAI ADMIN:
-- Jalankan manual di Supabase SQL Editor dengan mengganti email:
-- ==============================================================================
-- update users set is_admin = true where email = 'EMAIL_SAYA';
