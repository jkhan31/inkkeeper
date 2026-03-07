# InkKeeper

A disciplined reading ritual system built as a mobile-first PWA.

InkKeeper is not a productivity tool.  
It is not a habit tracker.  
It does not gamify reading.

It provides a structured, count-up container for deliberate reading sessions and long-term accumulation.

---

## Product Philosophy

Structure creates freedom.  
Ritual creates consistency.  
Accumulation creates meaning.

InkKeeper reduces friction at the moment of starting while protecting calm during the session itself.

There are:

- No streaks
- No progress bars
- No achievement systems
- No urgency cues
- No social features

The system reinforces practice, not performance.

---

## Core User Flow
Dashboard → Timer → Reflection → Return (Archive)

This loop is protected.  
No feature may interrupt or branch it.

---

## Functional Scope (v0.1)

### Authentication
- Supabase Magic Link (passwordless)
- Client-side session persistence
- Row-level security enforced per user

### Session Lifecycle
- Pure count-up timer starting from 00:00:00
- Timestamp-based duration calculation (start_time / end_time)
- Pause duration explicitly excluded
- Immediate session ending supported (no minimum duration)

### Practice Tracking
- Total Sessions
- Total Minutes
- Weekly Sessions (rolling 7 days)
- Weekly Minutes

### Archive
- Reverse chronological session ledger
- Inline expansion of reflections
- No editing
- No analytics views

---

## Tech Stack

### Frontend
- Next.js (App Router)
- Client Components for session hydration
- Mobile-first layout
- Installable PWA

### Backend
- Supabase
  - Postgres
  - Magic Link authentication
  - Row-level security policies

### Hosting
- Netlify (Next.js runtime)

### Data Model

**User**
- id
- email
- created_at

**Session**
- id (uuid)
- user_id (FK)
- book_title
- main_reflection
- start_time
- end_time
- duration_minutes
- created_at

---

## Timer Integrity

Duration is calculated from timestamps:
duration = end_time - start_time - paused_duration

The UI counter is not trusted.

Paused time is explicitly excluded from persistence.

---

## Design System Constraints

InkKeeper must feel:

- Disciplined
- Calm
- Grounded
- Cleanly resolved

It must never feel:

- Motivational
- Competitive
- Playful
- Gamified
- Urgent

Primary color is reserved exclusively for deliberate action (Begin / Save).

Motion is restrained (150–250ms, ease-out, no bounce).

---

## Non-Goals (v0.1)

The following are explicitly excluded:

- Streak tracking
- Notifications
- Reminders
- Editing past sessions
- Dark mode
- Charts
- Goal completion metrics
- Social features

---

## Definition of v0.1 Complete

- Authentication stable
- Session persistence reliable
- Timer mathematically accurate
- Archive renders accurately with inline expansion
- PWA installable
- Personally used for at least 3 sessions

No feature expansion before 4+ weeks of real usage.

---

## Development Philosophy

InkKeeper is built:

- Slowly
- Deliberately
- Without deadline pressure
- With structural integrity prioritized over polish

The documents in `/docs` define system constraints.  
If implementation conflicts with documentation, documentation wins.

---

InkKeeper is complete when the ritual feels stable — not when it has features.