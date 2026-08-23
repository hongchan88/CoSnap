import assert from "node:assert/strict";
import test from "node:test";
import { createSeedData } from "./seed-staging-data.mjs";

test("createSeedData provides linked, future-facing demo records", () => {
  const now = new Date("2026-01-15T00:00:00.000Z");
  const data = createSeedData(now);

  assert.equal(data.users.length, 12);
  assert.equal(data.profiles.length, 12);
  assert.equal(data.flags.length, 24);
  assert.equal(data.posts.length, 12);
  assert.equal(data.offers.length, 9);
  assert.equal(data.conversations.length, 5);
  assert.equal(data.messages.length, 18);
  assert.equal(data.matches.length, 3);
  assert.equal(data.reviews.length, 4);

  assert.deepEqual(new Set(data.flags.map((flag) => flag.type)), new Set(["help", "emergency", "free", "meet", "photo", "offer"]));
  assert.deepEqual(new Set(data.offers.map((offer) => offer.status)), new Set(["pending", "accepted", "declined"]));

  assert.ok(data.profiles.every((profile) => profile.avatarUrl.includes("images.unsplash.com")));
  assert.ok(data.flags.every((flag) => flag.startDate > now && flag.endDate > flag.startDate));
  assert.ok(data.posts.every((post) => post.expiresAt > now));

  const profileIds = new Set(data.profiles.map((profile) => profile.id));
  const flagIds = new Set(data.flags.map((flag) => flag.id));
  const offerIds = new Set(data.offers.map((offer) => offer.id));
  const postIds = new Set(data.posts.map((post) => post.id));

  assert.ok(data.flags.every((flag) => profileIds.has(flag.userId)));
  assert.ok(data.posts.every((post) => profileIds.has(post.userId)));
  assert.ok(data.offers.every((offer) => profileIds.has(offer.senderId) && profileIds.has(offer.receiverId) && flagIds.has(offer.flagId)));
  assert.ok(data.conversations.every((conversation) => profileIds.has(conversation.userAId) && profileIds.has(conversation.userBId) && offerIds.has(conversation.offerId)));
  assert.ok(data.messages.every((message) => profileIds.has(message.senderId)));
  assert.ok(data.matches.every((match) => offerIds.has(match.offerId) && flagIds.has(match.flagId)));
  assert.ok(data.reviews.every((review) => profileIds.has(review.authorId) && profileIds.has(review.targetId)));
  assert.doesNotMatch(JSON.stringify(data), /[가-힣]/);
});
