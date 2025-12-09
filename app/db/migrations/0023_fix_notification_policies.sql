-- Drop old restrictive policies
DROP POLICY IF EXISTS "notifications_select_policy" ON "notifications";
DROP POLICY IF EXISTS "notifications_update_policy" ON "notifications";

-- Create new policies allowing sender access
CREATE POLICY "notifications_select_policy" ON "notifications"
AS PERMISSIVE FOR SELECT TO "authenticated"
USING ((select auth.uid()) = "notifications"."recipient_id" OR (select auth.uid()) = "notifications"."sender_id");

CREATE POLICY "notifications_update_policy" ON "notifications"
AS PERMISSIVE FOR UPDATE TO "authenticated"
USING ((select auth.uid()) = "notifications"."recipient_id" OR (select auth.uid()) = "notifications"."sender_id")
WITH CHECK ((select auth.uid()) = "notifications"."recipient_id" OR (select auth.uid()) = "notifications"."sender_id");
