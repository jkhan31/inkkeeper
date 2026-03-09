# InkKeeper Product Roadmap

## Overview

InkKeeper is a reading reflection app designed to help readers capture and revisit the ideas that stay with them after reading.

The product is built around a single ritual:

Finish reading → pause → capture the idea that stayed.

Every feature in InkKeeper must reinforce this moment.

InkKeeper avoids productivity metrics like pages read or reading streaks. Instead, it focuses on building a long-term archive of meaningful ideas discovered through reading.

---

# Product Philosophy

InkKeeper is designed to feel like a **quiet reading room**.

Core principles:

- Reflection over consumption
- One idea per session
- Minimal friction
- Calm interface
- Ideas before metadata
- Meaning emerges over time

InkKeeper should feel reflective, not productive.

---

# Cognitive Model

InkKeeper evolves through four stages of meaning:

Capture → Rediscover → Understand → Reflect

| Product Stage | Cognitive Process |
|---------------|------------------|
| Capture | Encoding ideas |
| Rediscover | Retrieval |
| Understand | Pattern recognition |
| Reflect | Narrative meaning |

This ensures the product grows alongside the user's archive.

---

# Phase 0 — v0.1 (Foundation)

## Goal

Establish the core reflection ritual.

Core loop:

Read → Reflect → Archive

## Features

Authentication
- Supabase magic link
- optional password login

Reading Session
- Start Reading Session
- count-up timer
- End Session

Reflection Capture
- reflection prompt
- book title
- optional notes

Archive
- chronological reflection list
- reflection detail view

Infrastructure
- Supabase database
- Row Level Security
- Netlify deployment
- PWA installable

---

# Database Schema

Current table:

sessions

Fields:

- id
- user_id
- start_time
- end_time
- duration_minutes
- book_title
- main_reflection
- additional_notes
- created_at
- last_rediscovered_at
- idea_type

Design principle:

Optimize for iteration speed rather than early architectural purity.

The schema will remain unified until a real need emerges.

---

# Phase 1 — v0.2 (Memory Layer)

## Goal

Turn the archive from storage into memory.

New loop:

Read → Reflect → Archive → Rediscover

---

## Feature: Rediscovery

Surface an older reflection on the dashboard.

Example:

From Your Archive

"Systems beat motivation."

Atomic Habits  
2 months ago

Rediscovery should appear **above recent reflections**.

Purpose:

- reinforce memory
- increase emotional attachment
- encourage reflection habit

---

## Rediscovery Algorithm

Priority order:

1. Never rediscovered reflections  
2. Reflections not rediscovered recently  
3. Random fallback  

Protection rule:

created_at < now() - 7 days

Uses database field:

last_rediscovered_at

---

## Feature: Quick Capture

Allow reflections without using the timer.

Use case:

Reading article → idea appears → capture immediately.

Flow:

Capture idea → reflection page → save.

Session fields may be null:

- start_time
- end_time
- duration_minutes

---

## Feature: Archive Grouped by Month

Archive becomes a chronological record.

Example:

March 2026

Reflection  
Reflection  
Reflection  

February 2026

Reflection

Benefits:

- easier browsing
- temporal context
- journal-like structure

---

## Feature: Archive Summary Header

Top of archive page:

Archive

42 reflections  
12 books reflected

Queries:

COUNT reflections  
COUNT DISTINCT book titles

Purpose:

reinforce archive growth without gamification.

---

# Reflection UX Improvements

These improvements reduce friction and increase completion rate.

---

## Never Show a Blank Reflection Box

Instead pre-seed the input:

"The idea that stayed with me was…"

This removes uncertainty around:

- length
- format
- expectations

Users simply complete the sentence.

---

## Constraint-Based Reflection

The interface should reinforce:

One idea per reflection.

Helper text example:

Capture the single idea you want to remember.

One idea is enough.

Benefits:

- reduces writing anxiety
- improves reflection quality
- reinforces product philosophy

---

## Ideal Reflection Screen

What stayed with you?

The idea that stayed with me was…

[text input]

One idea is enough.

Book Title

Add Notes

Save Reflection

---

## Save Confirmation

After saving:

Saved to your archive.

Return immediately to the dashboard.

Reflection should feel quick and complete.

---

# Phase 2 — v0.3 (Archive Insight Layer)

## Goal

Help users explore their archive meaningfully.

No AI required yet.

---

## Feature: Influential Books

Identify books generating the most reflections.

Example:

Books influencing your thinking

Atomic Habits — 6 reflections  
Designing Your Life — 4 reflections  
Feel Good Productivity — 3 reflections  

Query:

GROUP BY book_title  
ORDER BY reflection_count DESC

---

## Feature: Monthly Reflection Summary

Example:

Your reflections this month

Ideas captured: 14  
Books reflected on: 6

Trigger:

monthly

Purpose:

- reinforce habit
- highlight intellectual progress

---

## Feature: Reflection Milestones

Milestones:

- 10 reflections
- 25 reflections
- 50 reflections
- 100 reflections

Example message:

Your archive now contains 50 ideas.

Tone should remain calm and understated.

---

## Improved Rediscovery

Add spaced resurfacing intervals:

- 1 week
- 1 month
- 3 months
- 1 year

Strengthens long-term memory.

---

# Phase 3 — v0.4 (Pattern Insight Layer)

## Goal

Reveal patterns across reflections.

Principle:

AI surfaces patterns.  
Users interpret meaning.

---

## Feature: Theme Detection

AI identifies recurring themes.

Example:

Themes appearing in your reflections

- systems thinking
- behavior design
- environment design

Requires roughly:

80–150 reflections.

---

## Feature: Archive Pattern Report

Example:

Patterns in your reflections

You frequently reflect on:

- systems and incentives
- behavioral psychology
- environment design

Tone should remain observational.

---

## Feature: Monthly Insight Report

Example:

Your reflections this month

Ideas captured: 18  
Books reflected on: 7  

Themes emerging:

- systems thinking
- habit formation
- personal development

Triggers:

- monthly
- manual
- milestone

---

# Phase 4 — Annual Reflection Report

Signature feature.

Example:

Your Reading Reflections — 2026

Ideas captured: 84  
Books reflected on: 23  

Themes appearing most:

- systems shape behavior
- environment design
- constraints create creativity

Books influencing you most:

Atomic Habits  
Designing Your Life

Triggers:

- yearly
- manual
- milestone

---

# Notifications (Future)

Rediscovery notifications may be delivered via:

- email
- push notification
- PWA notification

Example:

You once wrote:

"Constraints create creativity."

The Creative Habit  
4 months ago

Notifications should only be added **after reflection habits are established**.

---

# Monetization Strategy

Free tier:

- reflection capture
- timer sessions
- quick capture
- archive
- rediscovery
- yearly reflection report

Paid tier:

- archive search
- archive filters
- deeper archive insights
- advanced rediscovery
- AI theme detection
- monthly reports

AI should not be the only paid feature.

---

# Trial Strategy

Offer AI preview after meaningful archive milestones.

Milestones:

- 20 reflections
- 75 reflections
- 200 reflections

Trial duration:

3–7 days.

---

# Key Product Metric

The most important metric is:

Session → Reflection completion rate.

If users regularly:

finish reading → capture one idea

then the archive grows and the product becomes valuable.

---

# Immediate Next Development Priorities

Focus on v0.2.

Implementation order:

1. Rediscovery
2. Quick Capture
3. Reflection UX improvements
4. Archive grouped by month
5. Archive summary header

These features will dramatically improve retention.

---

# Long-Term Vision

InkKeeper becomes:

a personal archive of ideas discovered through reading.

Over time the archive reveals:

- ideas that shaped the user
- books that influenced them
- patterns in their thinking

This emotional value is what creates long-term retention.