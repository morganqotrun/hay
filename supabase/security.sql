-- ==============================================================================
-- Hay! — Security & Row Level Security (RLS) Policies
-- File: supabase/security.sql
-- Idempotent & safe to run repeatedly in Supabase SQL Editor
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY DI SEMUA TABEL
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. HELPER FUNCTIONS (SECURITY DEFINER untuk MENCEGAH INFINITE RECURSION)
-- ==============================================================================

-- Cek apakah user adalah anggota dari circle tertentu
CREATE OR REPLACE FUNCTION public.is_circle_member(c_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = c_id AND user_id = u_id
  );
$$;

-- Cek apakah user adalah owner dari circle tertentu
CREATE OR REPLACE FUNCTION public.is_circle_owner(c_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circles
    WHERE id = c_id AND owner_id = u_id
  );
$$;

-- Cek apakah user berhak mengakses/melihat post tertentu
-- Berhak jika: pemilik post, ATAU anggota salah satu circle tujuan post
CREATE OR REPLACE FUNCTION public.can_access_post(p_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = p_id AND user_id = u_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.post_circles pc
      JOIN public.circle_members cm ON cm.circle_id = pc.circle_id
      WHERE pc.post_id = p_id AND cm.user_id = u_id
    )
  );
$$;

-- ==============================================================================
-- 3. POLICIES: USERS
-- SELECT: semua user login
-- UPDATE: hanya baris milik sendiri
-- INSERT: baris milik sendiri
-- ==============================================================================
DROP POLICY IF EXISTS "Users: Dapat dibaca oleh user terautentikasi" ON public.users;
DROP POLICY IF EXISTS "Users: User hanya bisa update profilnya sendiri" ON public.users;
DROP POLICY IF EXISTS "Users: User bisa insert profilnya sendiri" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

CREATE POLICY "users_select_authenticated"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 4. POLICIES: FRIENDSHIPS
-- SELECT: hanya jika requester atau receiver
-- INSERT: hanya jika requester_id = auth.uid()
-- UPDATE: hanya oleh receiver (misal menerima pertemanan)
-- DELETE: oleh requester atau receiver
-- ==============================================================================
DROP POLICY IF EXISTS "Friendships: Hanya requester atau receiver yang bisa melihat" ON public.friendships;
DROP POLICY IF EXISTS "Friendships: User bisa mengirim permintaan pertemanan" ON public.friendships;
DROP POLICY IF EXISTS "Friendships: Receiver bisa menerima/update status pertemanan" ON public.friendships;
DROP POLICY IF EXISTS "Friendships: User terlibat bisa membatalkan/menghapus pertemanan" ON public.friendships;
DROP POLICY IF EXISTS "friendships_select" ON public.friendships;
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
DROP POLICY IF EXISTS "friendships_update" ON public.friendships;
DROP POLICY IF EXISTS "friendships_delete" ON public.friendships;

CREATE POLICY "friendships_select"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "friendships_insert"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "friendships_update"
  ON public.friendships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "friendships_delete"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ==============================================================================
-- 5. POLICIES: CIRCLES
-- SELECT: untuk owner dan anggota
-- INSERT/UPDATE/DELETE: hanya owner
-- ==============================================================================
DROP POLICY IF EXISTS "Circles: Pemilik atau anggota circle bisa melihat circle" ON public.circles;
DROP POLICY IF EXISTS "Circles: Hanya pemilik yang bisa membuat circle" ON public.circles;
DROP POLICY IF EXISTS "Circles: Hanya pemilik yang bisa update circle" ON public.circles;
DROP POLICY IF EXISTS "Circles: Hanya pemilik yang bisa menghapus circle" ON public.circles;
DROP POLICY IF EXISTS "circles_select" ON public.circles;
DROP POLICY IF EXISTS "circles_insert" ON public.circles;
DROP POLICY IF EXISTS "circles_update" ON public.circles;
DROP POLICY IF EXISTS "circles_delete" ON public.circles;

CREATE POLICY "circles_select"
  ON public.circles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_circle_member(id, auth.uid()));

CREATE POLICY "circles_insert"
  ON public.circles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "circles_update"
  ON public.circles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "circles_delete"
  ON public.circles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ==============================================================================
-- 6. POLICIES: CIRCLE_MEMBERS
-- SELECT: sesama anggota atau owner circle
-- INSERT: hanya owner circle
-- DELETE: owner circle ATAU anggota itu sendiri (bisa keluar sendiri)
-- ==============================================================================
DROP POLICY IF EXISTS "Circle Members: Anggota atau owner bisa melihat list anggota" ON public.circle_members;
DROP POLICY IF EXISTS "Circle Members: Hanya owner circle yang bisa menambah anggota" ON public.circle_members;
DROP POLICY IF EXISTS "Circle Members: Owner atau anggota itu sendiri yang bisa hapus keanggotaan" ON public.circle_members;
DROP POLICY IF EXISTS "circle_members_select" ON public.circle_members;
DROP POLICY IF EXISTS "circle_members_insert" ON public.circle_members;
DROP POLICY IF EXISTS "circle_members_delete" ON public.circle_members;

CREATE POLICY "circle_members_select"
  ON public.circle_members
  FOR SELECT
  TO authenticated
  USING (
    public.is_circle_member(circle_id, auth.uid()) OR
    public.is_circle_owner(circle_id, auth.uid())
  );

CREATE POLICY "circle_members_insert"
  ON public.circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_circle_owner(circle_id, auth.uid()));

CREATE POLICY "circle_members_delete"
  ON public.circle_members
  FOR DELETE
  TO authenticated
  USING (
    public.is_circle_owner(circle_id, auth.uid()) OR
    auth.uid() = user_id
  );

-- ==============================================================================
-- 7. POLICIES: POSTS
-- SELECT: user anggota salah satu circle tujuan (via can_access_post) atau pemilik
-- INSERT: user_id = auth.uid()
-- UPDATE/DELETE: hanya pemilik post
-- ==============================================================================
DROP POLICY IF EXISTS "Posts: User hanya bisa baca post miliknya atau dari circle yang diikutinya" ON public.posts;
DROP POLICY IF EXISTS "Posts: User hanya bisa membuat post miliknya sendiri" ON public.posts;
DROP POLICY IF EXISTS "Posts: User hanya bisa update post miliknya sendiri" ON public.posts;
DROP POLICY IF EXISTS "Posts: User hanya bisa delete post miliknya sendiri" ON public.posts;
DROP POLICY IF EXISTS "posts_select" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_update" ON public.posts;
DROP POLICY IF EXISTS "posts_delete" ON public.posts;

CREATE POLICY "posts_select"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    public.can_access_post(id, auth.uid())
  );

CREATE POLICY "posts_insert"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. POLICIES: POST_CIRCLES
-- SELECT: mengikuti aturan posts (can_access_post)
-- INSERT: hanya oleh pemilik post ke circle yang dia anggotai
-- DELETE: hanya oleh pemilik post
-- ==============================================================================
DROP POLICY IF EXISTS "Post Circles: Bisa dilihat jika punya hak akses ke post" ON public.post_circles;
DROP POLICY IF EXISTS "Post Circles: Penulis post bisa menentukan circle postingan" ON public.post_circles;
DROP POLICY IF EXISTS "Post Circles: Penulis post bisa menghapus relasi circle" ON public.post_circles;
DROP POLICY IF EXISTS "post_circles_select" ON public.post_circles;
DROP POLICY IF EXISTS "post_circles_insert" ON public.post_circles;
DROP POLICY IF EXISTS "post_circles_delete" ON public.post_circles;

CREATE POLICY "post_circles_select"
  ON public.post_circles
  FOR SELECT
  TO authenticated
  USING (public.can_access_post(post_id, auth.uid()));

CREATE POLICY "post_circles_insert"
  ON public.post_circles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_circles.post_id AND p.user_id = auth.uid()
    )
    AND
    public.is_circle_member(circle_id, auth.uid())
  );

CREATE POLICY "post_circles_delete"
  ON public.post_circles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_circles.post_id AND p.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 9. POLICIES: REACTIONS
-- SELECT: hanya untuk post yang boleh dilihat user
-- INSERT: user_id = auth.uid() dan user boleh akses post
-- DELETE: hanya milik sendiri
-- ==============================================================================
DROP POLICY IF EXISTS "Reactions: Bisa dilihat oleh mereka yang punya akses ke post" ON public.reactions;
DROP POLICY IF EXISTS "Reactions: User hanya bisa memberi reaksi atas namanya sendiri" ON public.reactions;
DROP POLICY IF EXISTS "Reactions: User bisa menghapus reaksinya sendiri" ON public.reactions;
DROP POLICY IF EXISTS "reactions_select" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete" ON public.reactions;

CREATE POLICY "reactions_select"
  ON public.reactions
  FOR SELECT
  TO authenticated
  USING (public.can_access_post(post_id, auth.uid()));

CREATE POLICY "reactions_insert"
  ON public.reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    public.can_access_post(post_id, auth.uid())
  );

CREATE POLICY "reactions_delete"
  ON public.reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 10. POLICIES: JOURNAL_ENTRIES
-- Semua operasi hanya jika user_id = auth.uid()
-- ==============================================================================
DROP POLICY IF EXISTS "Journal: Hanya pemilik yang bisa membaca jurnalnya" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal: Hanya pemilik yang bisa membuat jurnal" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal: Hanya pemilik yang bisa mengedit jurnalnya" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal: Hanya pemilik yang bisa menghapus jurnalnya" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_select" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_insert" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_update" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_delete" ON public.journal_entries;

CREATE POLICY "journal_select"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "journal_insert"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_update"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_delete"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 11. STORAGE BUCKETS & POLICIES ('avatars' & 'posts')
-- ==============================================================================

-- Pastikan bucket 'avatars' publik, dan 'posts' PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing storage policies on storage.objects
DROP POLICY IF EXISTS "Avatars: Publik dapat melihat foto profil" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: User terautentikasi dapat mengunggah avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: User dapat memperbarui avatarnya" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: User dapat menghapus avatarnya" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_delete" ON storage.objects;

DROP POLICY IF EXISTS "Posts: Publik / terautentikasi dapat melihat foto post" ON storage.objects;
DROP POLICY IF EXISTS "Posts: User terautentikasi dapat mengunggah foto post" ON storage.objects;
DROP POLICY IF EXISTS "Posts: User dapat memperbarui foto post" ON storage.objects;
DROP POLICY IF EXISTS "Posts: User dapat menghapus foto post miliknya" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_delete" ON storage.objects;

-- Storage 'avatars': baca publik boleh; upload/ubah/hapus hanya di folder auth.uid()
CREATE POLICY "storage_avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "storage_avatars_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_avatars_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_avatars_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage 'posts': bucket PRIVATE. Upload hanya user login ke folder auth.uid(). Baca hanya user login.
CREATE POLICY "storage_posts_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'posts');

CREATE POLICY "storage_posts_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_posts_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'posts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'posts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_posts_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'posts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
