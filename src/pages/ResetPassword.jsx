import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../freemium.css';

/**
 * User lands here from Supabase "reset password" email.
 * redirectTo must be: https://YOUR_DOMAIN/reset-password
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sub;
    async function init() {
      const search = new URLSearchParams(window.location.search);
      const code = search.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg({ text: error.message, isError: true });
          return;
        }
      }
      const hash = window.location.hash?.replace(/^#/, '') || '';
      const hp = new URLSearchParams(hash);
      const at = hp.get('access_token');
      const rt = hp.get('refresh_token');
      if (at && rt) {
        const { error } = await supabase.auth.setSession({
          access_token: at,
          refresh_token: rt,
        });
        if (error) {
          setMsg({ text: error.message, isError: true });
          return;
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      const { data: { session: s2 } } = await supabase.auth.getSession();
      if (s2) setReady(true);
      else {
        sub = supabase.auth.onAuthStateChange((event, sess) => {
          if (sess) {
            setReady(true);
            sub?.subscription?.unsubscribe();
          }
        });
      }
    }
    init();
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });
    if (password.length < 8) {
      setMsg({ text: 'Password must be at least 8 characters.', isError: true });
      return;
    }
    if (password !== confirm) {
      setMsg({ text: 'Passwords do not match.', isError: true });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg({ text: 'Password updated. Redirecting…', isError: false });
      setTimeout(() => navigate('/', { replace: true }), 1200);
    } catch (err) {
      setMsg({ text: err.message || 'Could not update password.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-4 py-12">
      <div className="tg-auth-modal-box" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="tg-auth-modal-title">Set a new password</h2>
        <p className="tg-auth-modal-sub">
          Choose a password for your ToolGrimoire account.
        </p>
        {!ready && !msg.isError && (
          <p className="text-sm text-secondary mb-4">Verifying reset link…</p>
        )}
        {ready && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
            <button type="submit" className="tg-btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
        {msg.text && (
          <div className={`tg-auth-msg ${msg.isError ? 'tg-error' : 'tg-success'} mt-3`}>
            {msg.text}
          </div>
        )}
        <p className="text-sm text-secondary mt-6 text-center">
          <Link to="/" className="text-accent-text hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
