import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../freemium.css';

/**
 * Email confirmation: set Supabase redirect URL to https://YOUR_DOMAIN/auth/callback
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirming');

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    (async function finishAuth() {
      try {
        const search = new URLSearchParams(window.location.search);
        const code = search.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const hash = window.location.hash?.replace(/^#/, '') || '';
        const hp = new URLSearchParams(hash);
        const accessToken = hp.get('access_token');
        const refreshToken = hp.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (!cancelled) {
            setStatus('ok');
            try { sessionStorage.setItem('tg-auth-just-confirmed', '1'); } catch (_) {}
            await new Promise((r) => setTimeout(r, 200));
            window.history.replaceState(null, '', '/');
            navigate('/', { replace: true, state: { justConfirmed: true } });
          }
          return;
        }

        let { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          setStatus('ok');
          try { sessionStorage.setItem('tg-auth-just-confirmed', '1'); } catch (_) {}
          await new Promise((r) => setTimeout(r, 200));
          window.history.replaceState(null, '', '/');
          navigate('/', { replace: true, state: { justConfirmed: true } });
          return;
        }

        await new Promise((r) => setTimeout(r, 500));
        ({ data: { session } } = await supabase.auth.getSession());
        if (session && !cancelled) {
          setStatus('ok');
          try { sessionStorage.setItem('tg-auth-just-confirmed', '1'); } catch (_) {}
          await new Promise((r) => setTimeout(r, 200));
          window.history.replaceState(null, '', '/');
          navigate('/', { replace: true, state: { justConfirmed: true } });
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
          if (sess && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            if (!cancelled) {
              setStatus('ok');
              try { sessionStorage.setItem('tg-auth-just-confirmed', '1'); } catch (_) {}
              (async () => {
                await new Promise((r) => setTimeout(r, 200));
                window.history.replaceState(null, '', '/');
                navigate('/', { replace: true, state: { justConfirmed: true } });
              })();
            }
          }
        });
        const t = setTimeout(() => {
          sub.subscription.unsubscribe();
          if (!cancelled) {
            setStatus('timeout');
            window.history.replaceState(null, '', '/');
            navigate('/', { replace: true });
          }
        }, 8000);
        dispose = () => {
          clearTimeout(t);
          sub.subscription.unsubscribe();
        };
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setTimeout(() => navigate('/', { replace: true }), 2500);
        }
      }
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-4">
      <div className="tg-auth-modal-box text-center" style={{ maxWidth: 420 }}>
        <h2 className="tg-auth-modal-title">Almost there</h2>
        <p className="tg-auth-modal-sub">
          {status === 'confirming' && 'Confirming your account…'}
          {status === 'ok' && 'Redirecting…'}
          {status === 'timeout' && 'Could not complete sign-in from this link. Try signing in with your email and password.'}
          {status === 'error' && 'Something went wrong. You can try signing in on the home page.'}
        </p>
      </div>
    </div>
  );
}
