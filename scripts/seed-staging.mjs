import postgres from "postgres";
import { createSeedData } from "./seed-staging-data.mjs";

const APPROVED_DEMO_PROJECT_REF = "aimbymevuzcuumthafkx";
const DEMO_PASSWORD = "CoSnapDemo2026!";

function assertApprovedDemoTarget() {
  if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL) {
    throw new Error("DATABASE_URL and SUPABASE_URL must be set.");
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  const expectedHost = `${APPROVED_DEMO_PROJECT_REF}.supabase.co`;

  if (supabaseUrl.hostname !== expectedHost || !databaseUrl.username.endsWith(`.${APPROVED_DEMO_PROJECT_REF}`)) {
    throw new Error("Seed refused: configured project is not the approved demo database.");
  }
}

async function seed() {
  const data = createSeedData();
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({ dryRun: true,
      counts: Object.fromEntries(Object.entries(data).map(([table, rows]) => [table, rows.length])),
      flagStates: Object.fromEntries(["active", "hidden", "expired"].map(state => [state, data.flags.filter(flag => flag.visibilityStatus === state).length])),
      roles: Object.fromEntries(["free", "premium"].map(role => [role, data.profiles.filter(profile => profile.role === role).length])),
    }, null, 2));
    return;
  }
  if (!process.argv.includes("--write")) {
    throw new Error("No data changed. Inspect with --dry-run; --write explicitly enables approved demo database writes.");
  }
  assertApprovedDemoTarget();
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    await sql.begin(async (tx) => {
      for (const user of data.users) {
        await tx`
          insert into auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            confirmation_token, recovery_token, email_change_token_new, email_change,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
          ) values (
            ${user.id}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${user.email},
            crypt(${DEMO_PASSWORD}, gen_salt('bf')), now(), '', '', '', '',
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            jsonb_build_object('username', ${user.username}::text), now(), now()
          )
          on conflict (id) do update set
            instance_id = excluded.instance_id,
            encrypted_password = excluded.encrypted_password,
            email_confirmed_at = excluded.email_confirmed_at,
            confirmation_token = '', recovery_token = '', email_change_token_new = '', email_change = '',
            updated_at = now()
          where auth.users.email = excluded.email
          returning id
        `;
        // Supabase Auth requires an email identity and the default instance ID.
        // Only touch the known synthetic ID/email pair, never a conflicting user.
        const [demoUser] = await tx`select id from auth.users where id = ${user.id} and email = ${user.email}`;
        if (!demoUser) throw new Error("Seed refused: synthetic user ID/email collision.");
        const [identity] = await tx`
          insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
          values (${user.id}, ${user.id}, jsonb_build_object('sub', ${user.id}::text, 'email', ${user.email}::text, 'email_verified', true), 'email', now(), now())
          on conflict (provider_id, provider) do update set identity_data = excluded.identity_data, updated_at = now()
          where auth.identities.user_id = excluded.user_id
          returning user_id
        `;
        if (identity?.user_id !== user.id) throw new Error("Seed refused: synthetic identity collision.");
      }

      for (const profile of data.profiles) {
        await tx`
          insert into public.profiles (
            profile_id, username, role, focus_score, focus_tier, cocredit_balance,
            camera_gear, styles, languages, bio, avatar_url, is_verified, updated_at
          ) values (
            ${profile.id}, ${profile.username}, ${profile.role}, ${profile.focusScore}, ${profile.focusTier}, 120,
            ${profile.cameraGear}, ${profile.styles}, ${profile.languages}, ${profile.bio}, ${profile.avatarUrl}, ${profile.isVerified}, now()
          )
          on conflict (profile_id) do update set
            username = excluded.username,
            role = excluded.role,
            focus_score = excluded.focus_score,
            focus_tier = excluded.focus_tier,
            cocredit_balance = excluded.cocredit_balance,
            camera_gear = excluded.camera_gear,
            styles = excluded.styles,
            languages = excluded.languages,
            bio = excluded.bio,
            avatar_url = excluded.avatar_url,
            is_verified = excluded.is_verified,
            updated_at = now()
        `;
      }

      for (const flag of data.flags) {
        await tx`
          insert into public.flags (
            id, user_id, city, country, latitude, longitude, styles, languages,
            type, title, meetup_category, start_date, end_date, note,
            visibility_status, source_policy_type, exposure_policy, updated_at
          ) values (
            ${flag.id}, ${flag.userId}, ${flag.city}, ${flag.country}, ${flag.latitude}, ${flag.longitude}, ${flag.styles}, ${flag.languages},
            ${flag.type}, ${flag.title}, ${flag.meetupCategory}, ${flag.startDate}, ${flag.endDate}, ${flag.note},
            ${flag.visibilityStatus}, ${flag.sourcePolicyType}, ${flag.exposurePolicy}, now()
          )
          on conflict (id) do update set
            user_id = excluded.user_id, city = excluded.city, country = excluded.country,
            latitude = excluded.latitude, longitude = excluded.longitude, styles = excluded.styles,
            languages = excluded.languages, type = excluded.type, title = excluded.title,
            meetup_category = excluded.meetup_category, start_date = excluded.start_date,
            end_date = excluded.end_date, note = excluded.note, visibility_status = excluded.visibility_status,
            source_policy_type = excluded.source_policy_type, exposure_policy = excluded.exposure_policy, updated_at = now()
        `;
      }

      for (const post of data.posts) {
        await tx`
          insert into public.posts (
            id, user_id, type, title, description, price, currency, latitude, longitude, expires_at, updated_at
          ) values (
            ${post.id}, ${post.userId}, ${post.type}, ${post.title}, ${post.description}, ${post.price}, ${post.currency},
            ${post.latitude}, ${post.longitude}, ${post.expiresAt}, now()
          )
          on conflict (id) do update set
            user_id = excluded.user_id, type = excluded.type, title = excluded.title,
            description = excluded.description, price = excluded.price, currency = excluded.currency,
            latitude = excluded.latitude, longitude = excluded.longitude, expires_at = excluded.expires_at, updated_at = now()
        `;
      }

      for (const offer of data.offers) {
        await tx`
          insert into public.offers (
            id, sender_id, receiver_id, flag_id, message, status, sent_at, updated_at
          ) values (
            ${offer.id}, ${offer.senderId}, ${offer.receiverId}, ${offer.flagId}, ${offer.message}, ${offer.status}, ${offer.sentAt}, now()
          )
          on conflict (id) do update set
            sender_id = excluded.sender_id, receiver_id = excluded.receiver_id, flag_id = excluded.flag_id,
            message = excluded.message, status = excluded.status, sent_at = excluded.sent_at, updated_at = now()
        `;
      }

      for (const conversation of data.conversations) {
        await tx`
          insert into public.conversations (id, user_a_id, user_b_id, offer_id, updated_at)
          values (${conversation.id}, ${conversation.userAId}, ${conversation.userBId}, ${conversation.offerId}, now())
          on conflict (id) do update set
            user_a_id = excluded.user_a_id, user_b_id = excluded.user_b_id,
            offer_id = excluded.offer_id, updated_at = now()
        `;
      }

      for (const message of data.messages) {
        await tx`
          insert into public.messages (id, conversation_id, sender_id, content, is_read, created_at)
          values (${message.id}, ${message.conversationId}, ${message.senderId}, ${message.content}, ${message.isRead}, ${message.createdAt})
          on conflict (id) do update set
            conversation_id = excluded.conversation_id, sender_id = excluded.sender_id,
            content = excluded.content, is_read = excluded.is_read, created_at = excluded.created_at
        `;
      }

      for (const match of data.matches) {
        await tx`
          insert into public.matches (
            id, offer_id, user_a_id, user_b_id, flag_id, scheduled_at, location_hint, verify_status, status, updated_at
          ) values (
            ${match.id}, ${match.offerId}, ${match.userAId}, ${match.userBId}, ${match.flagId},
            ${match.scheduledAt}, ${match.locationHint}, 'unverified', ${match.status}, now()
          )
          on conflict (id) do update set
            offer_id = excluded.offer_id, user_a_id = excluded.user_a_id, user_b_id = excluded.user_b_id,
            flag_id = excluded.flag_id, scheduled_at = excluded.scheduled_at, location_hint = excluded.location_hint,
            verify_status = excluded.verify_status, status = excluded.status, updated_at = now()
        `;
      }

      for (const review of data.reviews) {
        await tx`
          insert into public.reviews (id, match_id, author_id, target_id, rating, comment, photo_sample_url)
          values (${review.id}, ${review.matchId}, ${review.authorId}, ${review.targetId}, ${review.rating}, ${review.comment}, ${review.photoSampleUrl})
          on conflict (id) do update set
            match_id = excluded.match_id, author_id = excluded.author_id, target_id = excluded.target_id,
            rating = excluded.rating, comment = excluded.comment, photo_sample_url = excluded.photo_sample_url
        `;
      }
    });

    console.log(JSON.stringify({
      seeded: Object.fromEntries(Object.entries(data).map(([table, rows]) => [table, rows.length])),
      demoAuthRecordsSeeded: true,
    }, null, 2));
  } finally {
    await sql.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
