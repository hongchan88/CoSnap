CREATE POLICY "flags_select_offer_participant_policy" ON "flags" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
        select 1
        from offers
        where offers.flag_id = "flags"."id"
          and ((select auth.uid()) = offers.sender_id or (select auth.uid()) = offers.receiver_id)
      ));