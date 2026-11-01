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
an approved staging configuration. The initial local patch did not change deployment
or DNS settings; the subsequent authorized production rollout is recorded below.

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

## Production rollout and target identification follow-up (2026-11-01)

PR #8 was merged and production deployment succeeded for main commit
`5ee04f806e8167aaf1f9383f707b49ba8cd7d096`. The production smoke test then
confirmed valid home dates, explore start/end filters, 22 results, map markers,
zoom controls and automatic bounds URL updates. This supersedes the earlier
local-browser QA limitation for those observed behaviors. Google OAuth and DB
privilege tests remain unverified.

A read-only local configuration inspection extracted only hostnames/project refs.
`DATABASE_URL`, `SUPABASE_URL` and `VITE_SUPABASE_URL` all identify project ref
`aimbymevuzcuumthafkx`, matching the seed script's hardcoded approved staging ref.
A subsequent read-only GET of the public production homepage
`https://co-snap.vercel.app/` extracted only the public Supabase hostname from
in-memory HTML: `aimbymevuzcuumthafkx.supabase.co`. No HTML or key values were
saved or printed. Production and local configuration therefore identify the same
Supabase project. The seed script's approved-staging guard currently points at
the production application's project; it is not an isolated staging safeguard.
**Do not run the seed against this target.** Identify or provision a genuinely
separate staging project and update its approved-ref guard before any data writes.
The security migration also remains unapplied pending role/target confirmation,
backup and staging validation.

Supabase CLI is not on PATH, and the local `.supabase` directory contains only
telemetry/traces metadata; no authenticated management session was established.
PostgreSQL client tools (18.3) are installed, but the `postgres` server binary is
absent. Docker engine inspection confirmed the daemon is not running. Consequently
no disposable database SQL execution was possible in this read-only investigation;
no installation or daemon startup was attempted. The migration remains unapplied,
and no remote database data or credentials were displayed or changed.

## Authorized demo DB application (2026-11-01)

The user subsequently explicitly approved writes to the production-backed demo
project `aimbymevuzcuumthafkx`. That approval supersedes the earlier hold for this
specific demo DB application; it does not make this project isolated staging.
The legacy filename/npm command retains “staging”, but its code now calls the
allowlist an approved demo database. Future writes still require `--write`.

Before mutation, auth/public were backed up as a custom-format archive with 341
verified archive entries; a separate ACL/column-ACL/RLS snapshot was saved. Backups
contain sensitive data and remain outside Git under a private `/tmp` directory.
Actual schema, existing signup trigger and role grants were reviewed. The SQL was
then applied transactionally, including revoking PUBLIC/anon/authenticated
TRUNCATE/REFERENCES/TRIGGER bypass privileges as well as subscription writes.

15 real database checks passed in one rolled-back test transaction: signup creates
a free/unverified profile; ordinary authenticated profile editing succeeds; cross
user editing and anonymous editing are blocked; each of role, score, tier,
credits, verification and Stripe ID changes is blocked for authenticated users;
subscription inserts and sensitive table privileges are blocked for anon/auth;
trusted service_role entitlement updates still succeed. Test users/data were
rolled back. The applied SQL file is source documentation: Git/Vercel deployments
do **not** automatically execute this migration.

Seed was committed in a single transaction. ID-scoped verification confirmed 60
users/profiles, 300 flags (248 active, 33 expired, 19 hidden), 120 posts, 9 offers,
5 conversations, 18 messages, 3 matches and 4 reviews. Existing non-seed ID rows
were retained. profiles/subscriptions RLS remained enabled; anon/auth TRUNCATE
privilege checks returned false. Parent production Chrome smoke confirmed new
synthetic demo titles/dates on the homepage and 100 explore results with new demo
flags and map markers.

A password-login probe found the legacy direct auth.users seed lacked email
identities/default instance IDs despite correct password hashes. The seed code
now creates matching email identities and resets only exact synthetic ID/email
pairs, and refuses ID/email collisions. Passwords/tokens are no longer printed by
the seed command. No welcome email or real payment was sent.

The scoped auth repair committed for exactly the 60 synthetic ID/email pairs.
Post-repair checks found 60 matching passwords, 60 confirmed emails, 60 email
identities and zero missing instance IDs. An actual Supabase password sign-in and
sign-out succeeded without sending mail; neither password nor session tokens
were printed or persisted. The seed's `demoAuthRecordsSeeded` output only reports
record creation, not a substitute for this separate API login test. Identity
conflicts also fail closed by checking the returned user ID.
