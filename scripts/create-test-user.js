/**
 * Create test user in Supabase Auth + paid_users.
 * Run: cd scripts && npm install && node create-test-user.js
 */

const SUPABASE_URL = 'https://vplpcitffpwsjdczsvnz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHBjaXRmZnB3c2pkY3pzdm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI5Njc5OCwiZXhwIjoyMDg4ODcyNzk4fQ.9NivDZCGz6U5aW37ARG-JVcwzxc8g-nRaYYFG24HwsQ';
const TEST_EMAIL = 'test@toolgrimoire.xyz';
const TEST_PASSWORD = 'test1234';

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log('Creating test user in Supabase Auth...');
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message && authError.message.includes('already been registered')) {
      console.log('User already exists in Auth, ensuring paid_users row...');
    } else {
      console.error('Auth error:', authError.message);
      process.exit(1);
    }
  } else {
    console.log('Test user created:', user?.user?.email);
  }

  console.log('Inserting email into paid_users table...');
  const { error: insertError } = await supabase.from('paid_users').upsert({ email: TEST_EMAIL }, { onConflict: 'email' });

  if (insertError) {
    console.error('paid_users error:', insertError.message);
    process.exit(1);
  }
  console.log('Done. Test user:', TEST_EMAIL, '| Password:', TEST_PASSWORD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
