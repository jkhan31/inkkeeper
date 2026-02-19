# InkKeeper — Implementation Plan

## Current Status (2026-02-13)

Completed:
- Phase 0 — Setup
- Phase 1 — Core Loop Skeleton
- Phase 2 — Timer Integrity
- Phase 3 — Persistence (Insert)
- Phase 4 — History (Basic List)

Pending to honor original v0.1 definition:
- Dashboard totals (Total + Weekly)
- Duration progression system
- Duration memory (UserPreferences)
- 4-minute subtle nudge
- Inline history expansion
- Visual system enforcement
- PWA install verification

## Build Philosophy

- Protect the sacred loop first.
- Structural integrity before polish.
- No feature creep.

---

## Phase 0 — Setup

- Initialize Next.js (App Router)
- Configure Supabase (Magic Link + RLS)
- Connect Netlify
- Set environment variables

---

## Phase 1 — Core Loop Skeleton

Routes:

- /login
- /dashboard
- /session/setup
- /session/timer
- /session/reflection
- /history

Build static UI first.

---

## Phase 2 — Timer Integrity

- Record start_time
- Record end_time
- Track paused duration
- duration = end - start - paused

Never trust UI counter.

Implement:

- 5-minute guardrail
- 4-minute subtle nudge

---

## Phase 3 — Persistence

- Insert session on save
- Calculate totals server-side
- Weekly stats = rolling 7 days
- Sync last_selected_duration

---

## Phase 4 — History

- Reverse chronological list
- Expand inline
- No edit

---

## Phase 5 — Polish

- Apply full visual system
- Enforce motion rules (150–250ms)
- Test PWA install
- Test timer with backgrounding

---

## Solo Builder Rhythm

Weekly:

- Build Mon–Thu
- 30-min usability test Fri
- Fix only structural friction

---

## AI Usage Rules

Use AI for:
- Layout scaffolding
- Refactoring
- Edge-case reasoning

Do not allow:
- Feature expansion
- Gamification logic
- Productivity framing

---

## Stop Rule

v0.1 ships when loop is stable.

Nothing more.