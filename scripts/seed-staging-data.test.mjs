import assert from "node:assert/strict";
import test from "node:test";
import { createSeedData } from "./seed-staging-data.mjs";

test("createSeedData provides linked, future-facing demo records", () => {
  const now = new Date("2026-01-15T00:00:00.000Z");
  const data = createSeedData(now, { userCount: 12, flagCount: 27, postCount: 12 });

  assert.equal(data.users.length, 12);
  assert.equal(data.profiles.length, 12);
  assert.equal(data.flags.length, 27);
  assert.equal(data.posts.length, 12);
  assert.equal(data.offers.length, 9);
  assert.equal(data.conversations.length, 5);
  assert.equal(data.messages.length, 18);
  assert.equal(data.matches.length, 3);
  assert.equal(data.reviews.length, 4);

  assert.deepEqual(new Set(data.flags.map((flag) => flag.type)), new Set(["help", "emergency", "free", "meet", "photo", "offer"]));
  assert.deepEqual(new Set(data.offers.map((offer) => offer.status)), new Set(["pending", "accepted", "declined"]));
  assert.deepEqual(new Set(["Seoul", "Tokyo", "Paris", "London", "New York", "Bangkok", "Singapore", "Sydney"].filter((city) => data.flags.some((flag) => flag.city === city))), new Set(["Seoul", "Tokyo", "Paris", "London", "New York", "Bangkok", "Singapore", "Sydney"]));

  assert.ok(data.profiles.every((profile) => profile.avatarUrl.includes("images.unsplash.com")));
  assert.ok(data.flags.every((flag) => flag.endDate > flag.startDate));
  assert.ok(data.flags.filter(flag => flag.visibilityStatus === "active").every(flag => flag.startDate > now));
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


test("expanded demo is deterministic, clearly labeled, and has consistent relationships and dates", () => {
  const now = new Date("2026-11-01T00:00:00.000Z");
  const data = createSeedData(now);
  assert.deepEqual(data, createSeedData(now));
  assert.equal(data.users.length, 60);
  assert.equal(data.flags.length, 300);
  assert.equal(data.posts.length, 120);
  assert.deepEqual(new Set(data.flags.map(flag => flag.visibilityStatus)), new Set(["active", "expired", "hidden"]));
  assert.deepEqual(new Set(data.profiles.map(profile => profile.role)), new Set(["free", "premium"]));
  assert.ok(data.users.every(user => user.username.startsWith("[Demo]") && user.email.endsWith("@cosnap.staging")));
  assert.ok(data.flags.every(flag => flag.title.startsWith("[Demo]") && flag.note.includes("not a live request")));
  assert.ok(data.flags.every(flag => flag.startDate < flag.endDate));
  assert.ok(data.flags.filter(flag => flag.visibilityStatus === "expired").every(flag => flag.endDate < now));
  for (const rows of Object.values(data)) assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  const profiles = new Set(data.profiles.map(profile => profile.id));
  assert.ok(data.flags.every(flag => profiles.has(flag.userId)));
  assert.ok(data.posts.every(post => profiles.has(post.userId)));
  for (const offer of data.offers) {
    assert.equal(data.flags.find(flag => flag.id === offer.flagId).userId, offer.receiverId);
  }
  for (const message of data.messages) {
    const conversation = data.conversations.find(item => item.id === message.conversationId);
    assert.ok([conversation.userAId, conversation.userBId].includes(message.senderId));
    assert.ok(message.createdAt <= now);
  }
  for (const match of data.matches) {
    const flag = data.flags.find(item => item.id === match.flagId);
    assert.ok(match.scheduledAt >= flag.startDate && match.scheduledAt <= flag.endDate);
    if (match.status === "completed") assert.ok(match.scheduledAt < now);
    const offer = data.offers.find(item => item.id === match.offerId);
    assert.ok(offer.sentAt <= match.scheduledAt);
  }
  for (const review of data.reviews) {
    const match = data.matches.find(item => item.id === review.matchId);
    assert.equal(match.status, "completed");
    assert.ok([match.userAId, match.userBId].includes(review.authorId));
    assert.ok([match.userAId, match.userBId].includes(review.targetId));
    assert.notEqual(review.authorId, review.targetId);
  }
});

test("seed rejects accidental unbounded or invalid data generation", () => {
  assert.throws(() => createSeedData(new Date(NaN)), RangeError);
  assert.throws(() => createSeedData(new Date(), { userCount: 10000 }), RangeError);
});
