/**
 * AI tools data - minimal stub for build.
 * Full data (400+ tools) can be extracted from bundle.js or imported from Supabase later.
 */
export const aiToolsData = {
  'Text & Language AI': [
    {
      name: 'ChatGPT',
      url: 'https://openai.com/chatgpt',
      description: 'Conversational AI by OpenAI with o3/o4 models',
      pricing: 'Freemium',
      features: ['Chat', 'Writing', 'Code'],
      hot: true,
    },
    {
      name: 'Claude',
      url: 'https://anthropic.com/claude',
      description: 'AI assistant by Anthropic (Claude 3.7)',
      pricing: 'Freemium',
      features: ['Analysis', 'Writing', 'Coding'],
      hot: true,
    },
    {
      name: 'Perplexity',
      url: 'https://perplexity.ai',
      description: 'AI-powered search engine',
      pricing: 'Freemium',
      features: ['Search', 'Research', 'Citations'],
    },
  ],
  'Image Generation': [
    {
      name: 'Midjourney',
      url: 'https://midjourney.com',
      description: 'AI art generation',
      pricing: 'Paid',
      features: ['Art', 'Design', 'Creative'],
    },
    {
      name: 'DALL-E',
      url: 'https://openai.com/dall-e',
      description: 'OpenAI image generator (DALL-E 4)',
      pricing: 'Paid',
      features: ['Images', 'Editing', 'Variations'],
      hot: true,
    },
    {
      name: 'Stable Diffusion',
      url: 'https://stability.ai',
      description: 'Open source image AI (SD3/SDXL)',
      pricing: 'Free',
      features: ['Open source', 'Customizable', 'Local'],
      hot: true,
    },
  ],
  'Video Generation': [
    {
      name: 'Sora',
      url: 'https://openai.com/sora',
      description: "OpenAI's video AI",
      pricing: 'Limited',
      features: ['Realistic', 'Long', 'High quality'],
      hot: true,
    },
    {
      name: 'Runway',
      url: 'https://runwayml.com',
      description: 'AI video generation (Gen-3)',
      pricing: 'Freemium',
      features: ['Gen-3', 'Editing', 'Effects'],
      hot: true,
    },
  ],
};

export const getCategories = () => Object.keys(aiToolsData);

export const getToolsByCategory = (category) => aiToolsData[category] || [];

export const getAllTools = () => {
  return Object.entries(aiToolsData).flatMap(([category, tools]) =>
    tools.map((tool) => ({ ...tool, category }))
  );
};

export const getHotTools = () => {
  return getAllTools().filter((tool) => tool.hot === true);
};

export const searchTools = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
};

export const getTotalToolsCount = () => getAllTools().length;
