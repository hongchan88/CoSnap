# Data Seed / Main Alignment Plan

- [x] Confirm seed scope: Supabase staging.
- [x] Confirm image strategy: external Unsplash URLs; no Storage uploads.
- [x] Compare current `main` with remote tracking branch; no divergence (`main...origin/main` = `0 / 0`).
- [x] Define minimal realistic travel demo dataset: six profiles with Unsplash avatars; eight active flags in Seoul, Tokyo, Bangkok, Lisbon, and New York; four posts; three offers; two conversations with messages; one scheduled match and review.
- [x] Add idempotent staging-only seed script and npm command; preserve foreign-key constraints and avoid auth/RLS bypass in app code.
- [x] Run typecheck and staging seed verification; record result.

## Review

### Changes
- Added `npm run db:seed:staging`, guarded to Supabase project `aimbymevuzcuumthafkx` only.
- Added six password-authenticated demo users, profile avatars from Unsplash, eight active flags, four posts, three offers, two conversations, six messages, one match, and one review.
- Fixed UUID-based upserts make repeated seed runs idempotent.
- Added dataset relation/future-date test: `npm run test:seed`.

### Verification
- `npm run db:seed:staging`: completed twice without duplicate records.
- Exact-ID staging verification: users 6, profiles 6, flags 8, posts 4, offers 3, conversations 2, messages 6, matches 1, reviews 1; flag/message relations valid.
- `npm run test:seed`: 1 passing.
- `npm run typecheck`: passed after restoring missing lockfile dependencies with `npm ci`.

## Seed Expansion Plan

- [x] Confirm preferred expansion: both city/flag density and social activity.
- [x] Add fixed-ID data and extend data-shape tests.
- [x] Re-run staging seed and verify exact record counts plus relations.

### Review

- Expanded staging dataset to 12 profiles, 24 flags, 12 posts, 9 offers, 5 conversations, 18 messages, 3 matches, and 4 reviews.
- Added map activity in Busan, Kyoto, Paris and more Seoul, Tokyo, Bangkok, Lisbon, and New York locations.
- Covered all flag types and accepted/pending/declined offer states.
- Re-ran seed twice; exact-ID counts and flag/message/match relations verified.
- `npm run test:seed`: 1 passing. `npm run typecheck`: passed.
