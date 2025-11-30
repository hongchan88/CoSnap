-- Fix RLS policies for flags table to allow users to see all active flags
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
