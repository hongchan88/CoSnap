import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  smallint,
  pgPolicy,
  real,
} from "drizzle-orm/pg-core";
import { authUsers, authUid, authenticatedRole } from "drizzle-orm/supabase";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/*
 * MIGRATION NOTE: Foreign Key Constraint Fix
 *
 * Some existing users may not have profile records, causing FK constraint violations
 * when creating offers (offers.sender_id references profiles.profile_id).
 *
 * To fix existing users:
 * 1. Run: npm run db:generate
 * 2. Run: npm run db:migrate
 *
 * This will create a migration to backfill missing profiles for users who exist
 * in auth.users but not in the profiles table.
 */

// Profiles table (extended user profile data - separate from Supabase auth users)
export const profiles = pgTable(
  "profiles",
  {
    profile_id: uuid()
      .primaryKey()
      .references(() => authUsers.id, {
        onDelete: "cascade",
      }),
    username: varchar("username", { length: 100 }).unique().notNull(),
    role: varchar("role", { enum: ["free", "premium", "admin"] })
      .default("free")
      .notNull(),
    focusScore: integer("focus_score").default(0).notNull(),
    focusTier: varchar("focus_tier", {
      enum: ["Blurry", "Focusing", "Clear", "Crystal"],
    })
      .default("Blurry")
      .notNull(),
    cocreditBalance: integer("cocredit_balance").default(0).notNull(),
    cameraGear: varchar("camera_gear", { length: 500 }),
    styles: text("styles").array(),
    languages: text("languages").array(),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("profile_insert_policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.profile_id}`,
    }),
    pgPolicy("profile_select_policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`true`,
    }),
    pgPolicy("profile_update_policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.profile_id}`,
      withCheck: sql`${authUid} = ${table.profile_id}`,
    }),
  ]
);

// Flags table
export const flags = pgTable(
  "flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    styles: text("styles").array(),
    languages: text("languages").array(),

    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    note: text("note"),
    visibilityStatus: varchar("visibility_status", {
      enum: ["active", "hidden", "expired"],
    })
      .default("active")
      .notNull(),
    sourcePlanType: varchar("source_policy_type", { enum: ["free", "premium"] })
      .default("free")
      .notNull(),
    exposurePolicy: varchar("exposure_policy", {
      enum: ["default", "premium_pinned"],
    })
      .default("default")
      .notNull(),
    cutoffAt: timestamp("cutoff_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("flags_insert_policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("flags_select_policy", {
      for: "select",
      to: "public",
      as: "permissive",
      using: sql`true`,
    }),
    pgPolicy("flags_select_offer_participant_policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`exists (
        select 1
        from offers
        where offers.flag_id = ${table.id}
          and (${authUid} = offers.sender_id or ${authUid} = offers.receiver_id)
      )`,
    }),
    pgPolicy("flags_update_policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("flags_delete_policy", {
      for: "delete",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
  ]
);

// Offers table
export const offers = pgTable(
  "offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id")
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    receiverId: uuid("receiver_id")
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    flagId: uuid("flag_id")
      .references(() => flags.id, { onDelete: "cascade" })
      .notNull(),
    message: text("message").notNull(),
    status: varchar("status", {
      enum: ["pending", "accepted", "declined", "expired", "cancelled"],
    })
      .default("pending")
      .notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
    respondBy: timestamp("respond_by", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("offers_insert_policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.senderId}`,
    }),
    pgPolicy("offers_select_policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.senderId} OR ${authUid} = ${table.receiverId}`,
    }),
    pgPolicy("offers_update_sender_policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.senderId}`,
      withCheck: sql`${authUid} = ${table.senderId}`,
    }),
    pgPolicy("offers_update_receiver_policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.receiverId}`,
      withCheck: sql`${authUid} = ${table.receiverId}`,
    }),
    pgPolicy("offers_delete_policy", {
      for: "delete",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.senderId}`,
    }),
  ]
);

// Matches table
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  offerId: uuid("offer_id")
    .references(() => offers.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  userAId: uuid("user_a_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  userBId: uuid("user_b_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  flagId: uuid("flag_id")
    .references(() => flags.id, { onDelete: "cascade" })
    .notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  locationHint: varchar("location_hint", { length: 500 }),
  verifyStatus: varchar("verify_status", {
    enum: ["unverified", "geo_verified", "photo_verified", "both"],
  })
    .default("unverified")
    .notNull(),
  status: varchar("status", {
    enum: ["scheduled", "completed", "no_show", "cancelled"],
  })
    .default("scheduled")
    .notNull(),
  focusRewardApplied: boolean("focus_reward_applied").default(false).notNull(),
  creditRewardApplied: boolean("credit_reward_applied")
    .default(false)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id")
    .references(() => matches.id, { onDelete: "cascade" })
    .notNull(),
  authorId: uuid("author_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  targetId: uuid("target_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  rating: smallint("rating").notNull(),
  comment: text("comment"),
  photoSampleUrl: varchar("photo_sample_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export const insertFlagSchema = createInsertSchema(flags);
export const selectFlagSchema = createSelectSchema(flags);

export const insertOfferSchema = createInsertSchema(offers);
export const selectOfferSchema = createSelectSchema(offers);

export const insertMatchSchema = createInsertSchema(matches);
export const selectMatchSchema = createSelectSchema(matches);

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" }),
  type: varchar("type", {
    enum: [
      "offer_received",
      "offer_accepted",
      "offer_declined",
      "match_scheduled",
      "system",
    ],
  }).notNull(),
  referenceId: uuid("reference_id"), // ID of the related entity (offer_id, match_id)
  referenceType: varchar("reference_type", { enum: ["offer", "match"] }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  pgPolicy("notifications_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`true`, // Any authenticated user can create notifications
  }),
  pgPolicy("notifications_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${authUid} = ${table.recipientId}`,
  }),
  pgPolicy("notifications_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${authUid} = ${table.recipientId}`,
    withCheck: sql`${authUid} = ${table.recipientId}`,
  }),
]);

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
