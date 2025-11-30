ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "flags_update_policy" ON "flags" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "flags"."user_id") WITH CHECK ((select auth.uid()) = "flags"."user_id");--> statement-breakpoint
CREATE POLICY "flags_delete_policy" ON "flags" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "flags"."user_id");--> statement-breakpoint
CREATE POLICY "offers_insert_policy" ON "offers" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "offers"."sender_id");--> statement-breakpoint
CREATE POLICY "offers_select_policy" ON "offers" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "offers"."sender_id" OR (select auth.uid()) = "offers"."receiver_id");--> statement-breakpoint
CREATE POLICY "offers_update_sender_policy" ON "offers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "offers"."sender_id") WITH CHECK ((select auth.uid()) = "offers"."sender_id");--> statement-breakpoint
CREATE POLICY "offers_update_receiver_policy" ON "offers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "offers"."receiver_id") WITH CHECK ((select auth.uid()) = "offers"."receiver_id");--> statement-breakpoint
CREATE POLICY "offers_delete_policy" ON "offers" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "offers"."sender_id");--> statement-breakpoint
CREATE POLICY "profile_update_policy" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "profiles"."profile_id") WITH CHECK ((select auth.uid()) = "profiles"."profile_id");--> statement-breakpoint
ALTER POLICY "flags_select_policy" ON "flags" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "profile_select_policy" ON "profiles" TO authenticated USING (true);