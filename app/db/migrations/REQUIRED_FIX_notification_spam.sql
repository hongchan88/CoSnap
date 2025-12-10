-- =====================================================
-- REQUIRED: Run this SQL in Supabase SQL Editor
-- This fixes the notification spam issue
-- =====================================================

-- Drop restrictive policies
DROP POLICY IF EXISTS "notifications_select_policy" ON "notifications";
DROP POLICY IF EXISTS "notifications_update_policy" ON "notifications";

-- Allow users to see notifications they received OR sent
-- (Necessary so sender can check if they already sent one)
CREATE POLICY "notifications_select_policy" ON "notifications"
AS PERMISSIVE FOR SELECT TO authenticated
USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- Allow users to update notifications they received OR sent
-- (Necessary so sender can bump the timestamp of an existing one)
CREATE POLICY "notifications_update_policy" ON "notifications"
AS PERMISSIVE FOR UPDATE TO authenticated
USING (auth.uid() = recipient_id OR auth.uid() = sender_id)
WITH CHECK (auth.uid() = recipient_id OR auth.uid() = sender_id);
