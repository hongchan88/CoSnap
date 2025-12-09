-- Rename the constraint (or drop if name is unknown, but Drizzle usually names it table_column_check)
-- We will attempt to drop the common default name.
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_type_check";
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_check" CHECK ("type" IN ('offer_received', 'offer_accepted', 'offer_declined', 'match_scheduled', 'system', 'message_received'));
