import { db } from "~/db/db";
import { profiles, flags, offers, matches, reviews } from "~/db/schema";
import { eq, desc, and, or, lte, gte, isNull } from "drizzle-orm";
import type {
  profiles as ProfileType,
  flags as FlagType,
  offers as OfferType,
  matches as MatchType,
  reviews as ReviewType,
} from "~/db/schema";

// Profile services
export async function getProfileByUserId(
  userId: string
): Promise<typeof profiles.$inferSelect | null> {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.profile_id, userId))
    .limit(1);
  return result[0] || null;
}

export async function getProfileByUsername(
  username: string
): Promise<typeof profiles.$inferSelect | null> {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  return result[0] || null;
}

export async function getAllProfiles(
  limit: number = 50
): Promise<(typeof profiles.$inferSelect)[]> {
  return await db
    .select()
    .from(profiles)
    .orderBy(desc(profiles.focusScore))
    .limit(limit);
}

// Flag services
export async function getActiveFlags(
  limit: number = 20
): Promise<(typeof flags.$inferSelect)[]> {
  const now = new Date();
  return await db
    .select()
    .from(flags)
    .where(
      and(
        eq(flags.visibilityStatus, "active"),
        or(isNull(flags.expiresAt), gte(flags.expiresAt, now))
      )
    )
    .orderBy(desc(flags.createdAt))
    .limit(limit);
}

export async function getFlagsByUserId(
  userId: string
): Promise<(typeof flags.$inferSelect)[]> {
  return await db
    .select()
    .from(flags)
    .where(eq(flags.user_id, userId))
    .orderBy(desc(flags.createdAt));
}

// Offer services
export async function getOffersForUser(userId: string): Promise<{
  sent: (typeof offers.$inferSelect)[];
  received: (typeof offers.$inferSelect)[];
}> {
  const sent = await db
    .select()
    .from(offers)
    .where(eq(offers.senderId, userId))
    .orderBy(desc(offers.sentAt));

  const received = await db
    .select()
    .from(offers)
    .where(eq(offers.receiverId, userId))
    .orderBy(desc(offers.sentAt));

  return { sent, received };
}

// Match services
export async function getMatchesForUser(userId: string): Promise<{
  active: (typeof matches.$inferSelect)[];
  past: (typeof matches.$inferSelect)[];
}> {
  const allMatches = await db
    .select()
    .from(matches)
    .where(or(eq(matches.userAId, userId), eq(matches.userBId, userId)))
    .orderBy(desc(matches.createdAt));

  const active = allMatches.filter((match) => match.status === "scheduled");

  const past = allMatches.filter(
    (match) =>
      match.status === "completed" ||
      match.status === "no_show" ||
      match.status === "cancelled"
  );

  return { active, past };
}

// Review services
export async function getReviewsForProfile(
  userId: string
): Promise<(typeof reviews.$inferSelect)[]> {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.targetId, userId))
    .orderBy(desc(reviews.createdAt));
}

export async function getStatsForProfile(userId: string) {
  const profile = await getProfileByUserId(userId);
  if (!profile) return null;

  const userMatches = await getMatchesForUser(userId);
  const userReviews = await getReviewsForProfile(userId);

  const completedMatches = userMatches.active.length + userMatches.past.length;
  const totalRating = userReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating =
    userReviews.length > 0 ? totalRating / userReviews.length : 0;

  return {
    totalMatches: completedMatches,
    completedMatches: userMatches.past.length,
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews: userReviews.length,
    focusScore: profile.focusScore,
    focusTier: profile.focusTier,
  };
}
