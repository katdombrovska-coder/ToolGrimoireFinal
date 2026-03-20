-- ToolGrimoire — run in Supabase Dashboard → SQL Editor
-- Project: your Supabase project (e.g. vplpcitffpwsjdczsvnz)

-- ---------------------------------------------------------------------------
-- 1) Table (skip if paid_users already exists)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.paid_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2) Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3) Policies — drop old names if you re-run (ignore errors if they don't exist)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable read access for all users" ON public.paid_users;
DROP POLICY IF EXISTS "Users can read own paid status" ON public.paid_users;
DROP POLICY IF EXISTS "paid_users_select_authenticated" ON public.paid_users;

-- A) Strict: only authenticated users can read their own row (recommended)
CREATE POLICY "Users can read own paid status"
ON public.paid_users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- B) If you need anon to never read but something still fails, you can temporarily
--    use a broader policy for debugging only (remove in production):
-- CREATE POLICY "paid_users_select_all_authenticated"
-- ON public.paid_users FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 4) Optional: service role / admin inserts (webhook later)
--    Inserts from the app with anon key usually need a separate policy or Edge Function.
--    For now, add paid emails manually in Table Editor or use a script with service role.
-- ---------------------------------------------------------------------------
