# InkKeeper — Change Log

All notable changes to this project are documented here.

Versioning is milestone-based and aligned with architectural phases.

---

## [v0.1-in-progress] — 2026-03-07

### Added
- **Archive Page**: Renamed from History and moved to `/archive` route. Fully implements inline expansion of reflections using a smooth toggle mechanism.
- **Immediate Session Ending**: Users can now end a reading session at any time. Minimum-time constraints and guardrails (5-minute rule) have been removed to honor the user's intent.

### Changed
- **Nomenclature**: "History" has been renamed to "Archive" throughout the entire UI (Dashboard, Navigation, Page Titles, and Documentation).
- **SessionCard**: Converted into an inline-expandable component. Clicking a card now reveals the full `main_reflection` text without navigating away.
- **Timer Logic**: Reset to a pure count-up model. "End Session" is active from start. Elapsed time is captured accurately and passed to reflection capture via `sessionStorage`.
- **Documentation**: `MASTERPLAN.md`, `SCHEMA.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS_LOG.md`, `README.md`, and `APP_FLOW_PAGES_AND_ROLES.md` updated to reflect the "Quiet Archive" identity and simplified ritual.

### Removed
- `/history` route (replaced by `/archive`).
- Duration selection and progression logic (Setup page removed in previous session, now fully decoupled from codebase).
- Minimum session duration guardrails and "nudge" notifications.

---

## [v0.1-in-progress] — 2026-03-06

### Added
- PWA web app manifest (`public/manifest.json`) with standalone display mode and brand colours.
- SPA catch-all redirect rule (`public/_redirects`) for static deployment environments.
- Playwright test harness (`@playwright/test`) with root config (`playwright.config.ts`) and auth bootstrap (`tests/auth.setup.ts`).
- GitHub Actions workflow for Playwright CI (`.github/workflows/playwright.yml`) with HTML report artifact upload.
- Back button with abandon confirmation modal on timer page — prevents accidental session loss during active reading.
- Timer state persistence via `sessionStorage` (`inkkeeper_timer_state`) — elapsed time survives navigation to/from reflection page.
- `handleAbandon` function on timer page — clears all session state and returns to dashboard cleanly.

### Changed
- "Start Session" button on dashboard renamed to "Start Reading".
- Session detail page (`/sessions/[id]`) restyled to match app-wide design language.
- Timer `handleEnd` pre-computes `durationMinutes` and persists elapsed ms to `sessionStorage`.
- Reflection page clears `inkkeeper_timer_state` on successful session save.
- App metadata updated in `app/layout.tsx`.

---

## [v0.1-in-progress] — 2026-03-06 (Initial Phase)

### Added
- `useAuthGuard` custom hook centralising session validation and redirect logic.
- Loading states across all protected pages.
- Product manifesto (`docs/PROJECT_MANIFESTO.md`).

### Changed
- Auth guard logic extracted from individual pages into reusable `lib/hooks/useAuthGuard.ts`.
- `supabaseClient.ts` simplified; client-side Supabase instance cleaned up.

---

## [v0.1-in-progress] — 2026-02-19

### Added
- Reusable `SessionCard` component rendering session date, duration, and ink level.
- Session detail page at `/sessions/[id]` fetching full record from Supabase.
- Password reset flow: `/forgot-password` and `/set-password`.

### Changed
- Setup page removed; duration selection now flows directly into the session.
- Log page replaced with reflection page (`/sessions/reflection`).
- Routes reorganised under `/sessions/` structure.

---

## [v0.1-in-progress] — 2026-02-13

### Added
- Supabase Magic Link authentication.
- Row-Level Security (RLS) policies enforcing per-user isolation.
- Sacred loop routing: Dashboard → Timer → Reflection → Archive.
- Timestamp-based ritual timer (start_time / end_time).
- Persistence to `sessions` table.
