CREATE POLICY "messages_update_policy" ON "messages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = "messages"."conversation_id"
      AND (c.user_a_id = (select auth.uid()) OR c.user_b_id = (select auth.uid()))
    ));