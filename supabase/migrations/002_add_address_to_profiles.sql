-- Migration: add address column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS address text;
