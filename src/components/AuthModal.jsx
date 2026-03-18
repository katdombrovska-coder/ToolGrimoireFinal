import { useState } from 'react';
import { supabase } from '../lib/supabase';

const redirectOrigin =
  typeof window !== 'undefined' ? window.location.origin : '';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [resetMsg, setResetMsg] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: 'Sending...', isError: false });

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${redirectOrigin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMsg({ text: 'Check your email to confirm your account.', isError: false });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg({ text: 'Signed in successfully.', isError: false });
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 800);
      }
    } catch (err) {
      setMsg({ text: err.message || 'Something went wrong.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setResetMsg({ text: 'Enter your email above first.', isError: true });
      return;
    }
    setResetMsg({ text: 'Sending…', isError: false });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${redirectOrigin}/reset-password`,
      });
      if (error) throw error;
      setResetMsg({
        text: 'Check your email for a reset link (opens on this site, not localhost).',
        isError: false,
      });
    } catch (err) {
      setResetMsg({ text: err.message || 'Could not send reset email.', isError: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="tg-auth-modal-overlay"
      role="dialog"
      aria-label="Sign in or sign up"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="tg-auth-modal-box">
        <button
          type="button"
          className="tg-auth-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="tg-auth-modal-title">Welcome</h2>
        <p className="tg-auth-modal-sub">Sign in or create an account to unlock full access.</p>
        <div className="tg-auth-tabs">
          <button
            type="button"
            className={`tg-auth-tab ${mode === 'signin' ? 'tg-active' : ''}`}
            onClick={() => { setMode('signin'); setMsg({ text: '', isError: false }); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tg-auth-tab ${mode === 'signup' ? 'tg-active' : ''}`}
            onClick={() => { setMode('signup'); setMsg({ text: '', isError: false }); }}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            disabled={loading}
          />
          <button type="submit" className="tg-btn-primary" disabled={loading}>
            {loading ? 'Sending...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        {mode === 'signin' && (
          <button
            type="button"
            className="tg-btn-secondary w-full mt-2"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot password?
          </button>
        )}
        {resetMsg.text && (
          <div className={`tg-auth-msg ${resetMsg.isError ? 'tg-error' : 'tg-success'}`}>
            {resetMsg.text}
          </div>
        )}
        {msg.text && (
          <div className={`tg-auth-msg ${msg.isError ? 'tg-error' : 'tg-success'}`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
