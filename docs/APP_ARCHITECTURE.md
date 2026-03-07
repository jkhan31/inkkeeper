# InkKeeper — App Architecture & Wireframes

## Product Core
InkKeeper revolves around a single ritual:
**Finish reading ↓ Pause ↓ Capture the idea that stayed**

Everything in the app should support this moment. InkKeeper is not a productivity tracker; it is a **quiet archive of ideas** encountered through reading.

---

## Core Data Objects
* **Primary object:** `Reflection`
* **Supporting objects:** `User`, `Session`

### Relationship Model
User 
├── Sessions (Activity Context)
│   └── Reflection (The Artifact)
└── Quick Capture 
    └── Reflection (The Artifact)

---

## Route Map (Next.js App Router)
* `/login` — Authentication
* `/dashboard` — Home base / Current state
* `/archive` — The full library of thoughts
* `/session/active` — Focused reading timer
* `/session/reflection` — The "One Sentence" capture screen
* `/sessions/[id]` — Individual reflection view
* `/sessions/[id]/edit` — Editing existing reflections
* `/account` — Settings and profile

---

## App Folder Structure
```text
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── page.tsx
│   └── archive/page.tsx
├── (session)/
│   ├── active/page.tsx
│   └── reflection/page.tsx
├── sessions/
│   └── [id]/
│       ├── page.tsx
│       └── edit/page.tsx
├── account/
│   └── page.tsx
└── layout.tsx (Global Rice Paper Theme & Navbar)

components/
├── ReflectionCard.tsx (Unified "Idea-First" UI)
├── SessionCard.tsx (Expandable Activity UI)
├── RediscoveryCard.tsx (Dashboard Resurfacing)
├── Navbar.tsx (Quiet Bottom Navigation)
└── ReflectionInput.tsx (Spacious Text Area)
```

## Database Structure (Supabase)
**Table**: sessions

* `id`: uuid (PK)
* `user_id`: uuid (FK)
* `start_time`: timestamptz
* `end_time`: timestamptz
* `duration_minutes`: int
* `book_title`: text
* `main_reflection`: text (The Hero)
* `additional_notes`: text
* `created_at`: timestamptz

## Screen Architecture

### 1. Dashboard (`/dashboard`)
**Purpose:** Answers "What should I do now?" and "What have I thought lately?"

* **Primary Action:** `[Start Reading Session]` — Initiates the count-up timer.
* **Secondary Action:** `[Capture Idea]` — Quick capture for spontaneous reflections.
* **Rediscovery:** Surfaces one random reflection from 7–30 days ago to strengthen memory.
* **Recent:** Displays the 3 most recent Reflection Cards from the archive.

### 2. Active Session (`/session/active`)
**Purpose:** A distraction-free count-up timer.

* **UI:** Large serif timer, optional book title input.
* **Rule:** `[End Session]` is active immediately; no minimum time required.
* **Feel:** Designed to feel like a "quiet room"—minimalist, zero distractions, high focus.

### 3. Reflection Capture (`/session/reflection`)
**Purpose:** Capture the "One Thought" before it fades.

* **UI:** Massive text area with an inviting "One sentence is enough" placeholder.
* **Target:** Designed for rapid entry; completion target is under 30 seconds.

### 4. Archive (`/archive`)
**Purpose:** Browse the map of your thinking.

* **Hierarchy:** Unified "Idea-First" design across all cards.
* **Interaction:** Inline expansion. Clicking a card reveals the full thought gracefully without a full page transition.
* **Sorting:** chronological (Newest first).

---

## Card UI Design (Universal)
Every card in InkKeeper (whether from a session or a quick capture) follows a unified hierarchy to prioritize the insight over the activity.

### Hierarchy Rules:
1.  **Reflection Text:** The Hero (Serif font, `text-xl`).
2.  **Visual Break:** A subtle hairline divider.
3.  **Metadata Row:** `Book Title • Date • Duration` (Small Sans-serif, tracking-wide).

### Design Tokens:
* **Background:** Rice Paper (`#FAF5F0`)
* **Text:** Sumi Ink (`#1A1A1A`)
* **Corners:** `rounded-[2rem]` (32px radius)
* **Buttons:** `rounded-full` (Pill shape)

---

## Product Flows

### Session Flow
`Dashboard` → `Active Session` → `Reflection Capture` → `Save` → `Dashboard`

### Quick Capture Flow
`Dashboard` → `Reflection Capture` → `Save` → `Dashboard`