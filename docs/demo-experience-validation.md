# Demo experience follow-up

The login page identifies the public account as a shared portfolio demo and offers
a button that fills existing form fields without logging in or submitting. No new
credentials are created. No database, email or payment writes are part of this UI
change.

Home examples are explicitly fictional; fabricated star ratings/review counts and
random profile review-count fallbacks were removed. Profile cards display stored
Focus scores. User-authored content is preserved.

Profile editing normalizes existing language names (for example Korean/English)
to the checkbox codes (ko/en), so existing selections are checked. Unsupported
language values remain in the form and empty selections are not auto-filled.

Mobile map/list switching ignores hidden zero-size map bounds and retains the
last visible search area. Visible resize updates map dimensions and reports only
valid non-collapsed bounds. Initial mobile lists show fetched results without
waiting for a hidden map.

Validation: 24 Node tests, TypeScript, diff checks and production build passed.
Existing sourcemap/unused DayButton warnings remain. Local browser access was
declined, so final interactive regression QA is reserved for the public deployment;
no alternate local UI observation was used to bypass the refusal.
