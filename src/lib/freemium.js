export const CREEM_PAYMENT_URL = 'https://www.creem.io/payment/prod_IVglTPxXITzVKRK68rfl8';

export const FEATURED_ORDER = [
  'Replit', 'Emergent AI', 'Midjourney', 'Cursor', 'Apify', 'Perplexity',
  'ElevenLabs', 'Higgsfield', 'n8n', 'Instantly AI', 'Lovable', 'Bolt', 'V0',
];

export const FREE_TOOLS = new Set([
  'Replit', 'Emergent AI', 'Emergent', 'Midjourney', 'Cursor', 'Apify',
  'Perplexity', 'ElevenLabs', 'Higgsfield', 'n8n', 'Instantly AI', 'Instantly.ai',
  'Lovable', 'Bolt', 'Bolt.new', 'V0', 'v0 (Vercel)',
]);

export const isFreeTool = (name) => !!name && FREE_TOOLS.has(name);

export const featuredOrderIndex = (name) => {
  const n = (name || '').trim();
  for (let i = 0; i < FEATURED_ORDER.length; i++) {
    if (
      n === FEATURED_ORDER[i] ||
      (n === 'Emergent' && FEATURED_ORDER[i] === 'Emergent AI') ||
      (n === 'Instantly.ai' && FEATURED_ORDER[i] === 'Instantly AI') ||
      (n === 'Bolt.new' && FEATURED_ORDER[i] === 'Bolt') ||
      (n === 'v0 (Vercel)' && FEATURED_ORDER[i] === 'V0')
    )
      return i;
  }
  return 999;
};
