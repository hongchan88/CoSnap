# CoSnap interface language validation

English/Korean selection now covers authentication, profile/forms, travel flags,
offers, maps and shared interface feedback. Fixed interface copy is translated;
user-authored names, bios, travel titles and messages remain unchanged.

Auth actions validate submitted language against en/ko and return stable error
keys. The UI translates those keys using its current selection, including after
an error. Raw provider messages use known safe mappings or a translated fallback.
Signup confirmation, Google failure/loading and OAuth errors are localized.
Cookie headers are preserved. No database writes were needed for this change.

Language preference restores after the shared English hydration render and is
persisted without crashing when browser storage is blocked. Document language and
home/login/signup titles follow the selection. Missing fixed translation keys
were audited and corrected.

Validation (2026-11-01):

- 18 Node regression tests, TypeScript and production build passed.
- Browser checks passed for English/Korean login, signup, validation feedback,
  refresh preference persistence and an English demo profile.
- A profile edit click did not establish final modal behavior during local HMR;
  profile form rendering was checked independently. No broader behavior claim is
  made from that inconclusive click.
- Existing build sourcemap and unused DayButton import warnings remain.
- Build-generated tracked Vercel metadata was restored and excluded from commit.
