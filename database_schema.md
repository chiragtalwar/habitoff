Here’s a structured document format for your database that you can feed into Cursor:

---

# Database Schema and Policies

## Tables

### 1. **habits**
| Column         | Type                          | Constraints                                                                                      |
|----------------|-------------------------------|--------------------------------------------------------------------------------------------------|
| id             | `uuid`                       | Primary key                                                                                     |
| user_id        | `uuid`                       | Not null                                                                                        |
| title          | `text`                       | Not null                                                                                        |
| description    | `text`                       | Nullable                                                                                        |
| frequency      | `text`                       | Not null, must be one of `'daily'`, `'weekly'`, `'monthly'`                                     |
| plant_type     | `text`                       | Not null, must be one of `'flower'`, `'tree'`, `'succulent'`, `'herb'`                          |
| streak         | `integer`                    | Not null, default `0`                                                                           |
| last_completed | `timestamp with time zone`   | Nullable                                                                                        |
| created_at     | `timestamp with time zone`   | Not null, default `now()`                                                                       |
| updated_at     | `timestamp with time zone`   | Not null, default `now()`                                                                       |

**Constraints:**
- Primary key on `id`
- Check constraint on `frequency`
- Check constraint on `plant_type`

**SQL Query:**
```sql
CREATE TABLE public.habits (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NULL,
  frequency text NOT NULL,
  plant_type text NOT NULL,
  streak integer NOT NULL DEFAULT 0,
  last_completed timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_frequency_check CHECK ((frequency = ANY (ARRAY['daily', 'weekly', 'monthly']))),
  CONSTRAINT habits_plant_type_check CHECK ((plant_type = ANY (ARRAY['flower', 'tree', 'succulent', 'herb'])))
);
```

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Policy for inserting habits
CREATE POLICY "Users can create their own habits"
ON public.habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for viewing habits
CREATE POLICY "Users can view their own habits"
ON public.habits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating habits
CREATE POLICY "Users can update their own habits"
ON public.habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting habits
CREATE POLICY "Users can delete their own habits"
ON public.habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### 2. **habit_completions**
| Column          | Type                        | Constraints                                                                             |
|-----------------|-----------------------------|-----------------------------------------------------------------------------------------|
| id              | `uuid`                      | Primary key, default `extensions.uuid_generate_v4()`                                   |
| habit_id        | `uuid`                      | Nullable, foreign key reference to `habits(id)`                                        |
| completed_date  | `timestamp with time zone`  | Not null                                                                               |
| created_at      | `timestamp with time zone`  | Nullable, default `now()`                                                              |

**Constraints:**
- Primary key on `id`
- Unique constraint on `(habit_id, completed_date)`
- Foreign key reference to `habits(id)` with cascading delete

**SQL Query:**
```sql
CREATE TABLE public.habit_completions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  habit_id uuid NULL,
  completed_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT habit_completions_pkey PRIMARY KEY (id),
  CONSTRAINT habit_completions_habit_id_completed_date_key UNIQUE (habit_id, completed_date),
  CONSTRAINT habit_completions_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);
```

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Policy for inserting completions
CREATE POLICY "Users can insert completions for their habits"
ON public.habit_completions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.habits
    WHERE id = habit_completions.habit_id
    AND user_id = auth.uid()
  )
);

-- Policy for viewing completions
CREATE POLICY "Users can view completions for their habits"
ON public.habit_completions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.habits
    WHERE id = habit_completions.habit_id
    AND user_id = auth.uid()
  )
);

-- Policy for deleting completions
CREATE POLICY "Users can delete completions for their habits"
ON public.habit_completions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.habits
    WHERE id = habit_completions.habit_id
    AND user_id = auth.uid()
  )
);
```

---

### 3. **profiles**
| Column        | Type                        | Constraints                                                                  |
|---------------|-----------------------------|------------------------------------------------------------------------------|
| id            | `uuid`                      | Primary key                                                                 |
| email         | `text`                      | Not null, unique                                                            |
| full_name     | `text`                      | Nullable                                                                    |
| avatar_url    | `text`                      | Nullable                                                                    |
| created_at    | `timestamp with time zone`  | Not null, default `now()`                                                   |
| updated_at    | `timestamp with time zone`  | Not null, default `now()`                                                   |

**Constraints:**
- Primary key on `id`
- Unique constraint on `email`
- Foreign key reference to `auth.users(id)` with cascading delete

**SQL Query:**
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_user_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## Policies

### **habit_completions**
INSERT: Users can create their own habit completions.
Applied to: public role.

DELETE: Users can delete their own habit completions.
Applied to: public role.

UPDATE: Users can update their own habit completions.
Applied to: public role.

SELECT: Users can view their own habit completions.
Applied to: public role.

**habits**
INSERT: Users can create their own habits.
Applied to: public role.

DELETE: Users can delete their own habits.
Applied to: public role.

UPDATE: Users can update their own habits.
Applied to: public role.

SELECT: Users can view their own habits.
Applied to: public role.

**profiles**
INSERT: Enable insert for authenticated users only.
Applied to: public role.

SELECT: Enable read access for all users.
Applied to: public role.

UPDATE: Enable update for users based on id.
Applied to: public role.