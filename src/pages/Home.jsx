import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import AuthModal from '../components/AuthModal';
import {
  getCategories,
  getTotalToolsCount,
  getAllTools,
  searchTools,
} from '../data/aiTools';
import { supabase } from '../lib/supabase';
import {
  isFreeTool,
  featuredOrderIndex,
  CREEM_PAYMENT_URL,
} from '../lib/freemium';
import '../freemium.css';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentUser, setCurrentUser] = useState(null);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmBanner, setConfirmBanner] = useState(false);
  const hashHandled = useRef(false);

  const categories = useMemo(() => getCategories(), []);
  const totalCount = useMemo(() => getTotalToolsCount(), []);

  const hasFullAccess = currentUser && isPaidUser;

  const filteredTools = useMemo(() => {
    let tools = getAllTools();
    if (searchQuery.trim()) {
      tools = searchTools(searchQuery);
    }
    if (activeCategory !== 'All') {
      tools = tools.filter((tool) => tool.category === activeCategory);
    }
    return tools;
  }, [searchQuery, activeCategory]);

  const featuredTools = useMemo(() => {
    return filteredTools
      .filter((t) => isFreeTool(t.name))
      .sort((a, b) => featuredOrderIndex(a.name) - featuredOrderIndex(b.name));
  }, [filteredTools]);

  const restTools = useMemo(() => {
    return filteredTools.filter((t) => !isFreeTool(t.name));
  }, [filteredTools]);

  const groupedRestTools = useMemo(() => {
    const grouped = {};
    restTools.forEach((tool) => {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push(tool);
    });
    return grouped;
  }, [restTools]);

  const refreshAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    setCurrentUser(user);
    if (user?.email) {
      const { data } = await supabase
        .from('paid_users')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      setIsPaidUser(!!data);
    } else {
      setIsPaidUser(false);
    }
  }, []);

  useEffect(() => {
    const fromConfirm = location.state?.justConfirmed || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tg-auth-just-confirmed'));
    if (fromConfirm) {
      try { sessionStorage.removeItem('tg-auth-just-confirmed'); } catch (_) {}
      setConfirmBanner(true);
      refreshAuth();
      if (location.state?.justConfirmed) navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, refreshAuth]);

  // Delayed refresh so we catch session right after redirect from confirmation (or hash on /)
  useEffect(() => {
    const t = setTimeout(() => refreshAuth(), 800);
    return () => clearTimeout(t);
  }, [refreshAuth]);

  useEffect(() => {
    const checkPaidUser = async (email) => {
      if (!email) return false;
      const { data } = await supabase
        .from('paid_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      return !!data;
    };

    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      const paid = await checkPaidUser(user?.email);
      setIsPaidUser(paid);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      const paid = await checkPaidUser(user?.email);
      setIsPaidUser(paid);
    });
  }, []);

  // Email confirmation: land on / with #access_token=... or ?code=... (Site URL = homepage)
  useEffect(() => {
    const raw = window.location.hash?.replace(/^#/, '') || '';
    const hasHashTokens = raw.includes('access_token');
    const search = new URLSearchParams(window.location.search);
    const code = search.get('code');

    if (code && !hashHandled.current) {
      hashHandled.current = true;
      (async () => {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, '', window.location.pathname);
        if (!error) {
          setConfirmBanner(true);
          await refreshAuth();
        }
      })();
      return;
    }

    if (!hasHashTokens || hashHandled.current) return;
    const hp = new URLSearchParams(raw);
    const at = hp.get('access_token');
    const rt = hp.get('refresh_token');
    if (!at || !rt) return;
    hashHandled.current = true;
    (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: at,
        refresh_token: rt,
      });
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (!error) {
        setConfirmBanner(true);
        await refreshAuth();
      }
    })();
  }, [refreshAuth]);

  const handleSignOut = (e) => {
    e.preventDefault();
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-page">
      <nav className="nav-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4">
            <Sparkles className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <span className="font-bold text-lg text-primary">ToolGrimoire</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <a href="#tools" className="nav-link">Browse Tools</a>
          <a href="#categories" className="nav-link">Categories</a>
          <a href="/pricing.html" className="nav-link">Pricing</a>
        </div>
        <div className="tg-nav-auth-wrap">
          {!currentUser ? (
            <button
              type="button"
              className="tg-nav-signin"
              onClick={() => setAuthModalOpen(true)}
            >
              Sign In
            </button>
          ) : (
            <>
              {isPaidUser && (
                <span className="tg-badge-full-access">Full Access</span>
              )}
              <button
                type="button"
                className="tg-signout-link"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-wash mb-6">
            <TrendingUp className="w-4 h-4 text-accent-text" />
            <span className="text-sm font-medium text-accent-text">{totalCount}+ AI Tools</span>
          </div>
          <h1 className="hero-title mb-4">
            Find the right AI tool
            <br />
            <span style={{ color: 'var(--accent-text)' }}>in seconds</span>
          </h1>
          <p className="hero-subtitle mb-8 max-w-2xl">
            Your curated map of the best AI tools — updated, organized, simple.
          </p>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search across ${totalCount}+ AI tools…`}
          />
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-section">
              <Zap className="w-4 h-4 text-accent-text" />
              <span className="text-sm text-secondary">Free & Paid Options</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-section">
              <Sparkles className="w-4 h-4 text-accent-text" />
              <span className="text-sm text-secondary">Trending Now</span>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="sticky top-0 z-40 bg-page border-b border-light shadow-sm">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </section>

      {confirmBanner && (
        <div
          className="container py-3"
          role="status"
        >
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#86efac',
              border: '1px solid rgba(34, 197, 94, 0.35)',
            }}
          >
            You&apos;re signed in.
            {!hasFullAccess && currentUser && (
              <span className="block mt-1 opacity-90 font-normal">
                Full tool access unlocks after your email is added to paid members (e.g. after purchase). If you already paid, contact support.
              </span>
            )}
            <button
              type="button"
              onClick={() => setConfirmBanner(false)}
              className="ml-2 underline text-accent-text"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <section id="tools" className="container py-12">
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-secondary">
              No tools found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="btn-primary mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {currentUser && hasFullAccess && (
              <p className="tg-welcome-msg mb-4">
                Your toolkit is ready, {(currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || currentUser.email) + '.'}
              </p>
            )}

            {featuredTools.length > 0 && (
              <div className="tg-featured-section mb-16">
                <h2 className="tg-featured-title">Most Popular Right Now</h2>
                <div className="tg-featured-grid">
                  {featuredTools.map((tool, idx) => (
                    <ToolCard key={tool.name + idx} tool={tool} isLocked={false} />
                  ))}
                </div>
              </div>
            )}

            {!hasFullAccess && restTools.length > 0 && (
              <div className="tg-unlock-banner" style={{ display: currentUser ? 'none' : 'block' }}>
                <a href="/pricing.html" className="tg-btn-access">
                  Access All Tools
                </a>
              </div>
            )}

            {Object.entries(groupedRestTools).map(([category, tools]) => (
              <div key={category} className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="heading-2">{category}</h2>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-accent-wash text-accent-text">
                    {tools.length}
                  </span>
                </div>
                <div className="ai-grid">
                  {tools.map((tool, idx) => (
                    <div key={tool.name + idx} className={hasFullAccess ? '' : 'tg-lock-wrapper'}>
                      <ToolCard
                        tool={tool}
                        isLocked={!hasFullAccess}
                        currentUser={currentUser}
                        paymentUrl={CREEM_PAYMENT_URL}
                        onSignInClick={() => setAuthModalOpen(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={refreshAuth}
      />
    </div>
  );
};

export default Home;
