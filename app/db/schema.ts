import { pgTable, uuid, varchar, text, integer, boolean, timestamp, smallint } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  role: varchar('role', { enum: ['free', 'premium', 'admin'] }).default('free').notNull(),
  focusScore: integer('focus_score').default(0).notNull(),
  focusTier: varchar('focus_tier', { enum: ['Blurry', 'Focusing', 'Clear', 'Crystal'] }).default('Blurry').notNull(),
  cocreditBalance: integer('cocredit_balance').default(0).notNull(),
  cameraGear: varchar('camera_gear', { length: 500 }),
  styles: text('styles').array(),
  languages: text('languages').array(),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Flags table
export const flags = pgTable('flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  note: text('note'),
  visibilityStatus: varchar('visibility_status', { enum: ['active', 'hidden', 'expired'] }).default('active').notNull(),
  sourcePlanType: varchar('source_plan_type', { enum: ['free', 'premium'] }).default('free').notNull(),
  exposurePolicy: varchar('exposure_policy', { enum: ['default', 'premium_pinned'] }).default('default').notNull(),
  cutoffAt: timestamp('cutoff_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Offers table
export const offers = pgTable('offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  flagId: uuid('flag_id').references(() => flags.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'] }).default('pending').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  respondBy: timestamp('respond_by', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  offerId: uuid('offer_id').references(() => offers.id, { onDelete: 'cascade' }).unique().notNull(),
  userAId: uuid('user_a_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userBId: uuid('user_b_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  flagId: uuid('flag_id').references(() => flags.id, { onDelete: 'cascade' }).notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  locationHint: varchar('location_hint', { length: 500 }),
  verifyStatus: varchar('verify_status', { enum: ['unverified', 'geo_verified', 'photo_verified', 'both'] }).default('unverified').notNull(),
  status: varchar('status', { enum: ['scheduled', 'completed', 'no_show', 'cancelled'] }).default('scheduled').notNull(),
  focusRewardApplied: boolean('focus_reward_applied').default(false).notNull(),
  creditRewardApplied: boolean('credit_reward_applied').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: smallint('rating').notNull(),
  comment: text('comment'),
  photoSampleUrl: varchar('photo_sample_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertFlagSchema = createInsertSchema(flags);
export const selectFlagSchema = createSelectSchema(flags);

export const insertOfferSchema = createInsertSchema(offers);
export const selectOfferSchema = createSelectSchema(offers);

export const insertMatchSchema = createInsertSchema(matches);
export const selectMatchSchema = createSelectSchema(matches);

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);