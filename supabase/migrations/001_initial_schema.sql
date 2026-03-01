-- ============================================================
-- MATRIMONY APP — Initial Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- PROFILES
-- One profile per authenticated user (auth.users).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  bio           TEXT,
  gender        TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  preference    TEXT NOT NULL CHECK (preference IN ('male', 'female', 'any')),
  birth_date    DATE NOT NULL,
  location      TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- INTERESTS (likes / passes)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action        TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- ----------------------------------------------------------------
-- MATCHES
-- Created automatically when two users mutually like each other.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure canonical ordering so we never have duplicate pairs
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

-- Function: check for mutual like and create a match
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  mutual_exists BOOLEAN;
  a UUID;
  b UUID;
BEGIN
  -- Only act on 'like' actions
  IF NEW.action <> 'like' THEN
    RETURN NEW;
  END IF;

  -- Check if the other party has already liked back
  SELECT EXISTS (
    SELECT 1 FROM public.interests
    WHERE from_user_id = NEW.to_user_id
      AND to_user_id   = NEW.from_user_id
      AND action       = 'like'
  ) INTO mutual_exists;

  IF mutual_exists THEN
    -- Canonical ordering (smaller UUID first)
    a := LEAST(NEW.from_user_id, NEW.to_user_id);
    b := GREATEST(NEW.from_user_id, NEW.to_user_id);

    INSERT INTO public.matches (user_a_id, user_b_id)
    VALUES (a, b)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER interests_create_match
  AFTER INSERT OR UPDATE ON public.interests
  FOR EACH ROW EXECUTE FUNCTION public.check_and_create_match();

-- ----------------------------------------------------------------
-- MESSAGES
-- Only matched users can message each other (enforced by RLS).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id     UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages  ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ---------------------------------------------------
-- Anyone authenticated can read profiles (for the browse feed).
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only insert/update their own profile.
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- INTERESTS --------------------------------------------------
CREATE POLICY "interests_select_own"
  ON public.interests FOR SELECT
  USING (auth.uid() = from_user_id);

CREATE POLICY "interests_insert_own"
  ON public.interests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "interests_update_own"
  ON public.interests FOR UPDATE
  USING (auth.uid() = from_user_id);

-- ---- MATCHES ----------------------------------------------------
CREATE POLICY "matches_select_participant"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ---- MESSAGES ---------------------------------------------------
-- A user can read messages only for matches they are part of.
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- A user can only send messages in their own matches.
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- ================================================================
-- STORAGE BUCKET for profile pictures
-- ================================================================
-- Run this separately if needed (Supabase CLI or Dashboard Storage UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;

-- Storage RLS: anyone can view, only the owner can upload/update
-- CREATE POLICY "avatar_select_public"
--   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "avatar_insert_own"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "avatar_update_own"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
