# Supabase setup for ToolGrimoire (copy this into your project)

**We cannot change your Supabase project from GitHub or from this repo.**  
Complete each section in the [Supabase Dashboard](https://supabase.com/dashboard) for project **toolgrimoire** (or your project ref).

---

## 1. Authentication → URL Configuration

**Dashboard:** `Authentication` → `URL Configuration`

| Setting | Value |
|--------|--------|
| **Site URL** | `https://toolgrimoire.xyz` |

**Redirect URLs** — click **Add URL** for each:

```
https://toolgrimoire.xyz/auth/callback
https://toolgrimoire.xyz/reset-password
```

For local development (optional):

```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
```

Click **Save** after changes.

---

## 2. `paid_users` table

**Dashboard:** `Table Editor` → create table if missing:

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `email` | text | **Unique**, not null |
| `created_at` | timestamptz | Default `now()` |

Or run the SQL in `sql/supabase-paid-users-and-rls.sql` (section “Table”).

---

## 3. Row Level Security (RLS) on `paid_users`

Without a **SELECT** policy, the app always sees an empty result → users never get “full access”.

**Option A — simple (good for small projects)**  
In **SQL Editor**, run the policy section from `sql/supabase-paid-users-and-rls.sql`.

**Option B — stricter**  
Allow each signed-in user to read only their own row:

```sql
CREATE POLICY "Users can read own paid status"
ON public.paid_users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));
```

---

## 4. Email templates (optional)

**Dashboard:** `Authentication` → `Email Templates`

- **Confirm signup** — link should use your **Site URL** and allowed **Redirect URLs** (your app sends `emailRedirectTo` to `/auth/callback` when using the React app).
- **Reset password** — user must land on `https://toolgrimoire.xyz/reset-password` (set via `redirectTo` in the app).

---

## 5. After setup — quick test

1. Add your test email in **Table Editor** → `paid_users`.
2. Sign up on the live site with that email → confirm email.
3. You should be signed in; if the email matches `paid_users`, tools unlock.

---

## Files in this repo

| File | Purpose |
|------|--------|
| `sql/supabase-paid-users-and-rls.sql` | Run in **SQL Editor** for table + policies |
| `docs/SUPABASE_COMPLETE_SETUP.md` | This checklist (dashboard steps) |
