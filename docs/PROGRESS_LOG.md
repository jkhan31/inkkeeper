# InkKeeper — Progress Log

---

## 2026-03-06 — Auth Guard + Loading States + Manifesto

### Completed

- `useAuthGuard` hook extracted into `lib/hooks/useAuthGuard.ts` — centralises session check and redirect across all protected pages
- Loading states added to dashboard, history, timer, and reflection pages
- `supabaseClient.ts` cleaned up and simplified
- Product manifesto written and committed (`docs/PROJECT_MANIFESTO.md`)

### Decisions

- Centralising auth logic into a hook removes duplication and ensures consistent redirect behaviour
- Manifesto written to lock in design philosophy before v0.1 feature completion

### Notes

- Duration memory (UserPreferences) still not implemented
- Inline history expansion still not implemented
- 4-minute guardrail confirmation still not implemented

---

## 2026-02-19 — Session Flow Refactor + SessionCard + Auth Improvements

### Completed

- Setup page removed; session flow simplified — duration selection now flows directly into timer
- Log page replaced with reflection page (`/sessions/reflection`) aligned to v0.1 schema
- Routes reorganised under `/sessions/` namespace
- `SessionCard` component built and integrated across Dashboard, History, and Home pages
- Session detail page at `/sessions/[id]` fetching full record from Supabase
- Password reset flow implemented: `/forgot-password` and `/set-password`
- Home page simplified to v0.1 scope

### Decisions

- Removed setup page to reduce friction in the sacred loop
- Reflection page replaces log page to better reflect the post-session intent
- Route reorganisation improves path clarity (`/session/` → `/sessions/`)
- `SessionCard` makes session rendering composable and consistent across pages

### Notes

- Auth improvements (useAuthGuard) deferred to next session
- Duration memory still pending
- Inline history expansion still pending

---

## 2026-02-13 — Ritual Core + Persistence + History Stable

### Completed

- Supabase Magic Link authentication stable
- Row-Level Security verified and functioning
- Sacred loop implemented:
  Dashboard → Timer → Reflection → Return
- Timestamp-based timer implemented
- Pause duration explicitly excluded from persistence
- 5-minute guardrail enforced
- Supabase session insert implemented
- Reverse chronological history list implemented
- RLS isolation confirmed via real authenticated user
- Dev bypass removed to preserve production parity
- Duration restriction system: first 3 sessions restricted to 10/15/20 min
- Expanded duration range (10–120 min) unlocked after 3 sessions
- Scroll wheel with snap-based selection for duration picker
- Duration passed to timer via sessionStorage
- Weekly metrics (Monday–Sunday) added to dashboard
- Lifetime summary block added to history page
- Dashboard layout and history session display refined

### Decisions

- Prioritised ritual engine integrity before aggregation features
- Verified auth in real environment instead of faking session state
- Chose minimal history rendering (no analytics, no editing)
- Preserved strict no-gamification policy
- Duration restriction derived from live session count to ensure accuracy

### Notes

- Auth debugging required strict origin consistency (127.0.0.1 vs localhost)
- Insert behaviour confirmed via direct table inspection
- History currently displays sessions but does not support inline expansion
- Duration memory (UserPreferences) not yet implemented
- 4-minute subtle nudge not implemented

### Alignment Check

Sacred loop is stable. Duration system, dashboard aggregation, and history summary are complete.

Remaining v0.1 items (see Master Plan):

- Duration memory (UserPreferences)
- Inline expandable history
- 4-minute guardrail confirmation
