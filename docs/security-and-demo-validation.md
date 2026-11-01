# CoSnap local changes and remaining deployment checks

## Payment and profile security

The legacy mock callback now returns 410 and checkout returns 503. They never
write subscriptions or grant premium access. Payments remain unavailable until a
verified provider integration is built. The downgrade endpoint must be revisited
alongside that integration.

`migrations/20261101000000_protect_profile_entitlements.sql` is a **manual,
unapplied** migration. The application patch alone does not fix direct Supabase
writes to privileged profile fields. The SQL keeps normal profile editing while
protecting role, score, tier, credit balance, verification and Stripe customer ID
from anon/authenticated requests, and removes mock subscription insert access.
It does not rewrite existing entitlements or audit past changes.

Before applying it to production:

1. Review actual grants, inherited PUBLIC/column grants, all permissive RLS policies,
   and existing profile triggers in a disposable/staging database. Confirm trusted
   automation uses service-role credentials, never user JWTs for entitlements.
2. Back up the database. Apply the SQL in staging only after review.
3. As an authenticated normal user, verify updating username/bio/avatar/languages
   succeeds; role, credits, verification, scores and Stripe ID changes fail.
4. Verify a client-created profile always starts free/unverified with zero credits;
   signup/auth-user profile creation still works. Verify user A cannot edit user B.
5. Verify direct authenticated subscription inserts and legacy mock checkout fail.
   Verify trusted service-role operations still work and RLS remains enabled.
6. Audit current premium/admin/verified/credit values before any production rollout.

These checks require actual Supabase roles and were not executed locally.

## Seed data

The default fixture contains 60 synthetic travelers, 300 travel flags and 120
community posts, plus offers, chats, matches and reviews. IDs are deterministic,
profiles are labeled `[Demo]`, and emergency requests explicitly say they are
synthetic. Completed matches and their reviews reference past sessions.

Safe, database-free inspection (does not load `.env`):

```sh
node scripts/seed-staging.mjs --dry-run
node --test scripts/seed-staging-data.test.mjs
```

The existing npm seed command loads `.env`. It now refuses all writes unless
`--write` is supplied, and checks the hardcoded approved staging project ref.
Do not run writes until the target is independently confirmed to be isolated
staging. The guard's presence is not proof that the target is non-production.
Seed upserts overwrite demo rows sharing their deterministic IDs. Existing rows
outside the generated ID set are not deleted. Re-running refreshes relative dates
and resets demo profiles/flags and conversations to fixture values. Never run this
against real users' data. This change did not execute the database seed.

## UI verification still needed

TypeScript/unit tests and a production build check local code. Real Google OAuth,
Supabase cookie persistence, map tile/network behavior, mobile map/list switching,
date overlap queries under RLS and error/retry behavior need browser testing with
an approved staging configuration. No deployment or DNS settings changed.

## Local validation results (2026-11-01)

- 13 Node tests passed: disabled payment routes, safe date formatting, inclusive
  date search/validation, date-line/world-wrap bounds, deterministic seed data and
  relationships, generation limits, and existing language defaults.
- TypeScript `tsc --noEmit --incremental false` passed.
- Final production build passed after stopping the dev server. Existing sourcemap
  and unused-import warnings remain. The tracked Vercel build-result artifact was
  restored to its original contents, and the local dev server was stopped.
- Parent browser smoke confirmed home cards now show valid database dates.
- Explore maps now use a ClientOnly boundary because the previous lazy import
  still imported Leaflet during SSR (`window is not defined`). Final browser
  verification of map behavior was not completed after origin observation access
  was declined. No alternate browser/HTTP UI observation was used to bypass that.
- Follow-up content audit: the home page's hardcoded testimonials claim actual
  user experiences. Confirm provenance or label/remove that claim before presenting
  synthetic demo data as a public product demonstration.
- No database seed, SQL migration, payment, email, deployment or DNS writes ran.
