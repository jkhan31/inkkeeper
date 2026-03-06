# InkKeeper — Change Log

All notable changes to this project are documented here.

Versioning is milestone-based and aligned with architectural phases.

---

## [v0.1-in-progress] — 2026-03-06

### Added
- `useAuthGuard` custom hook centralising session validation and redirect logic
- Loading states across all protected pages (dashboard, history, timer, reflection)
- Product manifesto (`docs/PROJECT_MANIFESTO.md`) capturing core principles and design philosophy

### Changed
- Auth guard logic extracted from individual pages into reusable `lib/hooks/useAuthGuard.ts`
- `supabaseClient.ts` simplified; client-side Supabase instance cleaned up
- Corrected session route paths in documentation

---

## [v0.1-in-progress] — 2026-02-19

### Added
- Reusable `SessionCard` component rendering session date, duration, and ink level
- Session detail page at `/sessions/[id]` fetching full session record from Supabase
- Password reset flow: `/forgot-password` sends Supabase reset email
- Set password page: `/set-password` handles token-based password update
- Home page simplified to v0.1 scope

### Changed
- Setup page removed; duration selection now flows directly into the session
- Log page replaced with reflection page (`/sessions/reflection`) aligned to v0.1 schema
- Routes reorganised under `/sessions/` structure (`/sessions/timer`, `/sessions/reflection`, `/sessions/[id]`)
- `SessionCard` integrated into Dashboard, History, and Home pages
- Header styling adjusted for improved layout on dashboard

### Fixed
- Corrected session route paths referenced in documentation

---

## [v0.1-in-progress] — 2026-02-13

### Added
- Supabase Magic Link authentication
- Row-Level Security (RLS) policies enforcing per-user isolation
- Sacred loop routing:
  - /login
  - /dashboard
  - /sessions/timer
  - /sessions/reflection
  - /sessions/[id]
  - /history
- Timestamp-based ritual timer (start_time / end_time)
- Pause duration exclusion from persisted duration
- 5-minute logging guardrail
- Session persistence to `sessions` table
- Reverse chronological history ledger
- Scroll-based duration selector with snap behaviour
- First-3-session duration restriction (10, 15, 20 min)
- Expanded duration range unlocked after 3 sessions
- Duration passed to timer via sessionStorage
- Weekly metrics (Monday–Sunday) displayed on dashboard
- Lifetime summary block on history page
- Dashboard layout and history session display improved

### Changed
- Removed development auth bypass to ensure production-parity authentication behavior
- Duration restriction derived from live session count; auth confirmed before Supabase query

### Security
- Insert policy enforced: `auth.uid() = user_id`
- Select policy enforced: `auth.uid() = user_id`
- Update and delete operations intentionally not permitted

### Notes
- Duration memory (UserPreferences) not yet implemented
- Inline history expansion not yet implemented
- 4-minute guardrail confirmation not yet implemented
