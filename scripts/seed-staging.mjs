import postgres from "postgres";
import { createSeedData } from "./seed-staging-data.mjs";

const STAGING_PROJECT_REF = "aimbymevuzcuumthafkx";
const DEMO_PASSWORD = "CoSnapDemo2026!";

function assertStagingTarget() {
  if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL) {
    throw new Error("DATABASE_URL and SUPABASE_URL must be set.");
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  const expectedHost = `${STAGING_PROJECT_REF}.supabase.co`;

  if (supabaseUrl.hostname !== expectedHost || !databaseUrl.username.endsWith(`.${STAGING_PROJECT_REF}`)) {
    throw new Error("Seed refused: configured project is not approved staging project.");
  }
}

async function seed() {
  assertStagingTarget();
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  const data = createSeedData();

  try {
    await sql.begin(async (tx) => {
      for (const user of data.users) {
        await tx`
          insert into auth.users (
            id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
          ) values (
            ${user.id}, 'authenticated', 'authenticated', ${user.email},
            crypt(${DEMO_PASSWORD}, gen_salt('bf')), now(),
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            jsonb_build_object('username', ${user.username}::text), now(), now()
          )
          on conflict (id) do update set
            email = excluded.email,
            updated_at = now()
        `;
      }

      for (const profile of data.profiles) {
        await tx`
          insert into public.profiles (
            profile_id, username, role, focus_score, focus_tier, cocredit_balance,
            camera_gear, styles, languages, bio, avatar_url, is_verified, updated_at
          ) values (
            ${profile.id}, ${profile.username}, 'premium', ${profile.focusScore}, ${profile.focusTier}, 120,
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
            'active', 'premium', 'premium_pinned', now()
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
      demoLogin: "mina.kim.demo@cosnap.staging / CoSnapDemo2026!",
    }, null, 2));
  } finally {
    await sql.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
