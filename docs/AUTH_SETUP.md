# Auth: confirmation, reset password, full access

## Supabase Dashboard (required)

**Authentication → URL Configuration**

1. **Site URL**  
   Your live site, e.g. `https://yourdomain.com`  
   (Not `http://localhost:5173` for production.)

2. **Redirect URLs** — add both:

   - `https://yourdomain.com/auth/callback`  
     (email confirmation after sign-up)
   - `https://yourdomain.com/reset-password`  
     (forgot-password emails)

   For local dev, also add:

   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/reset-password`

## What the app does

| Flow | What happens |
|------|----------------|
| **Sign up** | Confirmation email links to `/auth/callback` (or your Site URL). User is signed in and redirected home. |
| **Homepage with `#access_token=...`** | If Supabase still sends users to `/` with a hash, the app reads tokens and signs them in. |
| **Forgot password** | User gets email → opens `/reset-password` → sets new password → can sign in. |
| **Full access** | Same email must exist in `paid_users` (manual row or future webhook). |

## Test checklist

1. Add test email to `paid_users`.
2. Sign up with that email → confirm from inbox → should land signed in; tools unlocked if in `paid_users`.
3. Sign out → **Forgot password?** → reset link → set password → sign in.
