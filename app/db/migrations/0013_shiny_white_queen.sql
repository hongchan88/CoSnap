CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid,
	"type" varchar NOT NULL,
	"reference_id" uuid,
	"reference_type" varchar,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_profiles_profile_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "notifications_select_policy" ON "notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "notifications"."recipient_id");--> statement-breakpoint
CREATE POLICY "notifications_update_policy" ON "notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "notifications"."recipient_id") WITH CHECK ((select auth.uid()) = "notifications"."recipient_id");