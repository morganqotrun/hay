-- ==============================================================================
-- Hay! — Private Social Journal App
-- Database Schema & Row Level Security (RLS) Policies
-- Ready to run directly in Supabase SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP TABLES (for clean re-runs if needed, ordered by foreign keys)
-- DROP TABLE IF EXISTS public.reactions CASCADE;
-- DROP TABLE IF EXISTS public.post_circles CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;
-- DROP TABLE IF EXISTS public.circle_members CASCADE;
-- DROP TABLE IF EXISTS public.circles CASCADE;
-- DROP TABLE IF EXISTS public.friendships CASCADE;
-- DROP TABLE IF EXISTS public.journal_entries CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- USERS
-- Profil pengguna publik/aplikasi yang terhubung dengan auth.users Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  foto_url TEXT,
  bio TEXT,
  tema_preferensi TEXT DEFAULT 'cerah',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- FRIENDSHIPS
-- Pertemanan antar user dengan status pending/accepted
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_friendship UNIQUE (requester_id, receiver_id),
  CONSTRAINT different_users CHECK (requester_id <> receiver_id)
);

-- CIRCLES
-- Grup pertemanan / lingkaran privat (misal: "Sahabat Dekat", "Keluarga", "Teman Kantor")
CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  warna_hex TEXT DEFAULT '#C79E59',
  ikon TEXT DEFAULT 'users',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CIRCLE_MEMBERS
-- Anggota dari suatu lingkaran/circle
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_circle_member UNIQUE (circle_id, user_id)
);

-- POSTS
-- Postingan social privat dari user
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  konten_teks TEXT,
  foto_url TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- POST_CIRCLES
-- Relasi many-to-many: Post dibagikan ke lingkaran mana saja
CREATE TABLE IF NOT EXISTS public.post_circles (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, circle_id)
);

-- REACTIONS
-- Reaksi love / emoji terhadap post
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_post_reaction UNIQUE (post_id, user_id)
);

-- JOURNAL_ENTRIES
-- Jurnal privat pribadi (100% rahasia, hanya pemilik yang bisa akses)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  konten TEXT NOT NULL,
  mood TEXT,
  tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_circles_owner ON public.circles(owner_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_circles_post ON public.post_circles(post_id);
CREATE INDEX IF NOT EXISTS idx_post_circles_circle ON public.post_circles(circle_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_tanggal ON public.journal_entries(tanggal DESC);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE TRIGGER (ON SIGNUP)
-- Membuat baris otomatis di public.users saat user registrasi di Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Generate fallback username dari email atau metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Pastikan username unik dengan menambahkan potongan ID jika perlu
  final_username := base_username;
  IF EXISTS (SELECT 1 FROM public.users WHERE username = final_username) THEN
    final_username := base_username || '_' || SUBSTRING(NEW.id::text, 1, 5);
  END IF;

  INSERT INTO public.users (id, nama, username, email, foto_url, tema_preferensi)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'full_name', final_username),
    final_username,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'tema_preferensi', 'cerah')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. ENABLE RLS PADA SEMUA TABEL
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- B. POLICIES: USERS
-- User bisa membaca semua profil terdaftar, tetapi HANYA BISA UPDATE PROFIL SENDIRI
-- ------------------------------------------------------------------------------
CREATE POLICY "Users: Dapat dibaca oleh user terautentikasi"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users: User hanya bisa update profilnya sendiri"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users: User bisa insert profilnya sendiri"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- C. POLICIES: JOURNAL_ENTRIES
-- Jurnal bersifat privat, HANYA BISA DIAKSES & DIKELOLA OLEH PEMILIKNYA
-- ------------------------------------------------------------------------------
CREATE POLICY "Journal: Hanya pemilik yang bisa membaca jurnalnya"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Journal: Hanya pemilik yang bisa membuat jurnal"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Journal: Hanya pemilik yang bisa mengedit jurnalnya"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Journal: Hanya pemilik yang bisa menghapus jurnalnya"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- D. POLICIES: CIRCLES & CIRCLE_MEMBERS
-- Lingkaran pertemanan privat
-- ------------------------------------------------------------------------------
CREATE POLICY "Circles: Pemilik atau anggota circle bisa melihat circle"
  ON public.circles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circles.id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Circles: Hanya pemilik yang bisa membuat circle"
  ON public.circles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Circles: Hanya pemilik yang bisa update circle"
  ON public.circles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Circles: Hanya pemilik yang bisa menghapus circle"
  ON public.circles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Circle Members
CREATE POLICY "Circle Members: Anggota atau owner bisa melihat list anggota"
  ON public.circle_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.circles c
      WHERE c.id = circle_members.circle_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Circle Members: Hanya owner circle yang bisa menambah anggota"
  ON public.circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circles c
      WHERE c.id = circle_members.circle_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Circle Members: Owner atau anggota itu sendiri yang bisa hapus keanggotaan"
  ON public.circle_members
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.circles c
      WHERE c.id = circle_members.circle_id AND c.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- E. POLICIES: POSTS & POST_CIRCLES
-- User HANYA BISA BACA POST jika:
-- 1. Dia adalah penulis post tersebut, ATAU
-- 2. Post tersebut dibagikan ke circle di mana user terdaftar sebagai anggota
-- ------------------------------------------------------------------------------
CREATE POLICY "Posts: User hanya bisa baca post miliknya atau dari circle yang diikutinya"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.post_circles pc
      JOIN public.circle_members cm ON cm.circle_id = pc.circle_id
      WHERE pc.post_id = posts.id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Posts: User hanya bisa membuat post miliknya sendiri"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Posts: User hanya bisa update post miliknya sendiri"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Posts: User hanya bisa delete post miliknya sendiri"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post Circles
CREATE POLICY "Post Circles: Bisa dilihat jika punya hak akses ke post"
  ON public.post_circles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_circles.post_id AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.circle_members cm
          WHERE cm.circle_id = post_circles.circle_id AND cm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Post Circles: Penulis post bisa menentukan circle postingan"
  ON public.post_circles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_circles.post_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Post Circles: Penulis post bisa menghapus relasi circle"
  ON public.post_circles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_circles.post_id AND p.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- F. POLICIES: REACTIONS
-- Reaksi bisa dilihat oleh siapapun yang bisa melihat post, dan hanya bisa dibuat oleh diri sendiri
-- ------------------------------------------------------------------------------
CREATE POLICY "Reactions: Bisa dilihat oleh mereka yang punya akses ke post"
  ON public.reactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = reactions.post_id
    )
  );

CREATE POLICY "Reactions: User hanya bisa memberi reaksi atas namanya sendiri"
  ON public.reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reactions: User bisa menghapus reaksinya sendiri"
  ON public.reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- G. POLICIES: FRIENDSHIPS
-- Hubungan pertemanan hanya bisa dilihat dan dikelola oleh dua user terkait
-- ------------------------------------------------------------------------------
CREATE POLICY "Friendships: Hanya requester atau receiver yang bisa melihat"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Friendships: User bisa mengirim permintaan pertemanan"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Friendships: Receiver bisa menerima/update status pertemanan"
  ON public.friendships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = requester_id);

CREATE POLICY "Friendships: User terlibat bisa membatalkan/menghapus pertemanan"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ==============================================================================
-- SELESAI
-- Skema tabel, indeks, trigger pendaftaran, dan RLS policies telah aktif.
-- ==============================================================================
