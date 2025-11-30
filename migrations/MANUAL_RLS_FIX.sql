-- COMPREHENSIVE RLS FIX FOR COSNAP
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. FIX FLAGS TABLE RLS
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all active flags" ON public.flags;
DROP POLICY IF EXISTS "Users can insert their own flags" ON public.flags;
DROP POLICY IF EXISTS "Users can update their own flags" ON public.flags;
DROP POLICY IF EXISTS "Users can delete their own flags" ON public.flags;

-- Enable RLS on flags table
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all flags (public exploration)
CREATE POLICY "Users can view all active flags" ON public.flags
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can only insert their own flags
CREATE POLICY "Users can insert their own flags" ON public.flags
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own flags
CREATE POLICY "Users can update their own flags" ON public.flags
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own flags
CREATE POLICY "Users can delete their own flags" ON public.flags
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- 2. VERIFY PROFILES TABLE RLS
-- ============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = profile_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- ============================================
-- 3. VERIFY OFFERS TABLE RLS (Already created)
-- ============================================
-- These should already exist from the previous migration
-- Just verifying they're in place

-- Check if offers policies exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'offers' 
        AND policyname = 'Users can view offers they sent or received'
    ) THEN
        RAISE NOTICE 'Offers RLS policies missing - please run migration 20240601000000_enhanced_offers.sql first';
    ELSE
        RAISE NOTICE 'Offers RLS policies are in place';
    END IF;
END $$;
