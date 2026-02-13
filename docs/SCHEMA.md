# InkKeeper — Supabase Schema

Last Updated: 2026-02-13

Database: Supabase (Postgres)  
Schema: `public`

---

# Tables

---

## Table: `sessions`

Stores individual reading sessions per authenticated user.

---

### Columns

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | Yes | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | Yes | — | References `auth.users(id)` |
| `start_time` | `timestamptz` | Yes | — | Session start timestamp |
| `end_time` | `timestamptz` | Yes | — | Session end timestamp |
| `duration_minutes` | `integer` | Yes | — | Must be `>= 0` |
| `book_title` | `text` | No | — | Optional book title |
| `note` | `text` | No | — | Optional reflection text |
| `created_at` | `timestamptz` | Yes | `now()` | Record creation time |

---

### Constraints

#### Primary Key
- `sessions_pkey` → (`id`)

#### Foreign Keys
- `sessions_user_id_fkey`
  - `user_id` → `auth.users(id)`
  - `ON DELETE CASCADE`

#### Checks
- `duration_minutes >= 0`

---

### Row-Level Security (RLS)

Enabled: Yes

#### Insert Policy
auth.uid() = user_id


#### Select Policy
auth.uid() = user_id


#### Update/Delete
Not permitted (v0.1)

---

### Raw SQL (Reference Only)

```sql
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes >= 0),
  book_title text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);
```

### Planned Tables (Not Yet Implemented)
Table: user_preferences (Planned)
Purpose: Store ritual configuration per user.

#### Planned Columns
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `user_id` | `uuid` | Yes | FK to `auth.users(id)` |
| `last_selected_duration` | `integer` | Yes | Last ritual duration in minutes |
Status: Not implemented
