# InkKeeper — Change Log

All notable changes to this project are documented here.

Versioning is milestone-based and aligned with architectural phases.

---

## [v0.1-in-progress] — 2026-02-13

### Added
- Supabase Magic Link authentication
- Row-Level Security (RLS) policies enforcing per-user isolation
- Sacred loop routing:
  - /login
  - /dashboard
  - /sessions/setup
  - /sessions/timer
  - /sessions/reflection
  - /history
- Timestamp-based ritual timer (start_time / end_time)
- Pause duration exclusion from persisted duration
- 5-minute logging guardrail
- Session persistence to `sessions` table
- Reverse chronological history ledger
- Scroll-based duration selector
- First-3-session duration restriction (10, 15, 20)
- Expanded duration range unlocked at 3 sessions
- Duration passed to active session via sessionStorage

### Changed
- Removed development auth bypass to ensure production-parity authentication behavior

### Security
- Insert policy enforced: `auth.uid() = user_id`
- Select policy enforced: `auth.uid() = user_id`
- Update and delete operations intentionally not permitted

### Notes
- Dashboard aggregation metrics not yet implemented
- Duration progression system not yet implemented
- Duration memory not yet implemented
- Inline history expansion not yet implemented
- 4-minute guardrail confirmation not yet implemented
