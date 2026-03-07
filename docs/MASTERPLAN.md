# InkKeeper — Master Plan

## 30-Second Elevator Pitch

InkKeeper is a mobile-first PWA that turns reading into a quiet, structured ritual.  
It helps people start — or restart — a reading practice through deliberate, time-bound sessions that accumulate meaning over time.

No streaks.  
No gamification.  
No urgency.

Structure creates freedom. Ritual creates consistency. Accumulation creates meaning.

---

## Problem & Mission

### The Problem

Modern reading and habit tools:

- Emphasize streaks and goals  
- Create subtle performance pressure  
- Over-optimize for productivity  
- Interrupt focus with features  

They measure achievement.  
They rarely protect calm.

For many people trying to rebuild a reading habit, the friction isn’t discipline.

It’s starting.

---

### The Mission

Create a disciplined, friction-light container that:

- Makes beginning feel manageable  
- Protects focus once started  
- Reinforces long-term accumulation  
- Removes performance psychology  

InkKeeper does not motivate.  
It structures.

---

## Target Audience

### Primary User — Rebuilding Readers

People who:

- Want to start reading again  
- Are rebuilding a reading habit  
- Feel resistance before starting  
- Prefer structure over streak pressure  

The first win is not a streak.  
It is completing a 10-minute session.

That is enough.

---

### Secondary User — Ritual-Oriented Readers

People who:

- Already read consistently  
- Value structure and containment  
- Prefer calm, minimal tools  

---

## Core Features (v0.1)

### Dashboard

### Dashboard

- Total Sessions  
- Total Minutes  
- Weekly Sessions  
- Weekly Minutes  
- Begin Session (primary CTA)  
- Archive  

---

### Session Ritual

Dashboard → Setup → Active → Log → Return

No feature may interrupt this loop.

---

---

## Session Logic

- Immediate session ending supported.
- Duration calculated from timestamps (excluding pauses).
- All sessions are eligible for reflection.

---

### Archive Ledger

Reverse chronological:

- Date  
- Duration  
- Book title  
- Reflection preview  
- Expand inline  

No editing. No analytics.

---

## Tech Stack

Frontend: Next.js (App Router)  
Backend: Supabase (Magic Link + Postgres)  
Hosting: Netlify  
Deployment: Installable PWA  

---

## Data Model

### User
- id
- email
- created_at

### Session
- id
- user_id
- book_title
- note
- start_time
- end_time
- duration_minutes
- created_at

---

## Definition of v0.1 Complete

- Auth works
- Timer accurate
- Pause excluded correctly
- 5-min guardrail enforced
- Totals correct
- Weekly stats correct
- Archive renders
- PWA installs
- Used personally for 3 sessions