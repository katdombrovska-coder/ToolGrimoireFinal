import { useState } from 'react';
import { Sparkles, DollarSign, ExternalLink, Flame, Tag } from 'lucide-react';

const LockIcon = () => (
  <svg className="tg-lock-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ToolCard = ({ tool, isLocked = false, currentUser = null, paymentUrl = '', onSignInClick }) => {
  const [logoError, setLogoError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  const getDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  };
  const domain = getDomain(tool.url);

  const getLogoUrl = () => {
    if (fallbackAttempt === 0) {
      return `https://logo.clearbit.com/${domain}`;
    }
    if (fallbackAttempt === 1) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
    return null;
  };

  const handleLogoError = () => {
    if (fallbackAttempt < 1) {
      setFallbackAttempt((prev) => prev + 1);
      setLogoError(false);
    } else {
      setLogoError(true);
    }
  };

  const logoUrl = getLogoUrl();

  const cardContent = (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="product-card group"
    >
      {tool.hot && (
        <div className="hot-badge">
          <Flame className="w-3 h-3" />
          <span>Trending Now</span>
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="tool-logo-container flex-shrink-0">
          {!logoError && domain && logoUrl ? (
            <img
              src={logoUrl}
              alt={`${tool.name} logo`}
              className="tool-logo"
              onError={handleLogoError}
              loading="lazy"
            />
          ) : (
            <div className="tool-logo-fallback">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-text)' }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="product-card-title group-hover:text-accent-text transition-colors">
              {tool.name}
            </h3>
            <ExternalLink className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </div>
      </div>
      <p className="product-card-description mb-4">{tool.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {tool.features.slice(0, 3).map((feature, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-accent-wash text-accent-text"
          >
            <Tag className="w-3 h-3" />
            {feature}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-light">
        <DollarSign className="w-4 h-4 text-secondary" />
        <span className="text-sm font-medium text-secondary">{tool.pricing}</span>
      </div>
    </a>
  );

  if (isLocked) {
    return (
      <>
        {cardContent}
        <div className="tg-lock-overlay">
          <LockIcon />
          <span className="tg-lock-text">Unlock full access to browse all tools</span>
          {currentUser ? (
            <a
              href={paymentUrl}
              className="tg-btn-get-access"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Access
            </a>
          ) : onSignInClick ? (
            <button
              type="button"
              className="tg-btn-unlock"
              onClick={(e) => {
                e.preventDefault();
                onSignInClick();
              }}
            >
              Unlock Full Access
            </button>
          ) : (
            <a href="/pricing.html" className="tg-btn-unlock">
              Unlock Full Access
            </a>
          )}
        </div>
      </>
    );
  }

  return cardContent;
};

export { ToolCard };
