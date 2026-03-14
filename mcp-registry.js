/**
 * MCP Server Registry — v3.1 Production Suite
 * Comprehensive list of 40+ integrations including AI models, search, social, google, messaging, and productivity.
 */

export const MCP_REGISTRY = [

  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI MODELS & REASONING (EXPANDED)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ollama_mcp',
    category: 'AI Models',
    name: 'Ollama (Local AI)',
    description: 'Run local LLMs (Llama, Gemma, Mistral, Qwen, DeepSeek, Phi) — completely free, no API key',
    icon: '🦙',
    package: 'mcp-ollama',
    command: 'npx',
    args: ['-y', 'mcp-ollama'],
    free: true,
    envVars: ['OLLAMA_BASE_URL'],
    fields: [
      { key: 'OLLAMA_BASE_URL', label: 'Ollama Base URL', type: 'text', hint: 'Default: http://127.0.0.1:11434 — change if Ollama runs on another host' }
    ],
    docUrl: 'https://ollama.com',
    capabilities: ['local-inference', 'chat', 'code', 'reasoning', 'no-cost']
  },
  {
    id: 'openai_mcp',
    category: 'AI Models',
    name: 'OpenAI (GPT-4o)',
    description: 'Official OpenAI MCP server for GPT-4o, GPT-4, and GPT-3.5 — cloud-hosted reliability.',
    icon: '🧠',
    package: '@modelcontextprotocol/server-openai',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-openai'],
    free: false,
    envVars: ['OPENAI_API_KEY'],
    fields: [
      { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', type: 'password', hint: 'Get at https://platform.openai.com/api-keys' }
    ],
    docUrl: 'https://platform.openai.com/',
    capabilities: ['gpt-4o', 'reasoning', 'vision', 'cloud-inference']
  },
  {
    id: 'openrouter',
    category: 'AI Models',
    name: 'OpenRouter (Multi-Model)',
    description: 'Free tier access to Claude, Llama, Mistral, Gemini and 100+ models via a single API key',
    icon: '🌐',
    package: 'mcp-openrouter',
    command: 'npx',
    args: ['-y', 'mcp-openrouter'],
    free: true,
    envVars: ['OPENROUTER_API_KEY'],
    fields: [
      { key: 'OPENROUTER_API_KEY', label: 'OpenRouter API Key', type: 'password', hint: 'Free tier at https://openrouter.ai — includes Claude, Llama, Mistral, Gemini' }
    ],
    docUrl: 'https://openrouter.ai/',
    capabilities: ['claude', 'llama', 'mistral', 'gemini', 'multi-model', 'free-tier']
  },
  {
    id: 'groq',
    category: 'AI Models',
    name: 'Groq (Ultra-Fast Inference)',
    description: 'Llama 3.1, Mixtral and Gemma at 500+ tokens/sec — very generous free tier',
    icon: '⚡',
    package: 'mcp-groq',
    command: 'npx',
    args: ['-y', 'mcp-groq'],
    free: true,
    envVars: ['GROQ_API_KEY'],
    fields: [
      { key: 'GROQ_API_KEY', label: 'Groq API Key', type: 'password', hint: 'Free at https://console.groq.com — fast Llama 3 inference' }
    ],
    docUrl: 'https://console.groq.com/',
    capabilities: ['llama3.1', 'mixtral', 'gemma', 'ultra-fast', 'free-tier']
  },
  {
    id: 'huggingface',
    category: 'AI Models',
    name: 'HuggingFace',
    description: 'Access millions of open-source models via the Inference API.',
    icon: '🤗',
    package: 'mcp-huggingface',
    command: 'npx',
    args: ['-y', 'mcp-huggingface'],
    free: true,
    envVars: ['HUGGINGFACE_API_KEY'],
    fields: [
      { key: 'HUGGINGFACE_API_KEY', label: 'HuggingFace Token', type: 'password', hint: 'Get at https://huggingface.co/settings/tokens' }
    ],
    docUrl: 'https://huggingface.co/',
    capabilities: ['text-generation', 'embeddings', 'open-source']
  },
  {
    id: 'perplexity',
    category: 'AI Models',
    name: 'Perplexity AI',
    description: 'Llama-3 models with real-time web search capabilities built-in.',
    icon: '🔍',
    package: 'mcp-perplexity',
    command: 'npx',
    args: ['-y', 'mcp-perplexity'],
    free: false,
    envVars: ['PERPLEXITY_API_KEY'],
    fields: [
      { key: 'PERPLEXITY_API_KEY', label: 'Perplexity API Key', type: 'password', hint: 'Get at https://www.perplexity.ai/settings/api' }
    ],
    docUrl: 'https://perplexity.ai/',
    capabilities: ['search-augmented-llm', 'llama3', 'real-time']
  },
  {
    id: 'sequential_thinking',
    category: 'Reasoning',
    name: 'Sequential Thinking',
    description: 'Free thinking tool that lets the AI break down complex problems step-by-step.',
    icon: '🧩',
    package: '@modelcontextprotocol/server-sequential-thinking',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['planning', 'logic', 'step-by-step', 'free']
  },
  {
    id: 'memory_server',
    category: 'Reasoning',
    name: 'Long-term Memory',
    description: 'Persistent memory server for storing facts, entities, and relationships between sessions.',
    icon: '🧠',
    package: '@modelcontextprotocol/server-memory',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['persistent-memory', 'entities', 'graph', 'free']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🕷️ SEARCH & SCRAPING (EXPANDED)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'firecrawl',
    category: 'Search & Scrape',
    name: 'Firecrawl (LLM Scraper)',
    description: 'Turn any website into LLM-ready clean markdown. Perfect for market research.',
    icon: '🕷️',
    package: '@mendable/firecrawl-mcp',
    command: 'npx',
    args: ['-y', '@mendable/firecrawl-mcp'],
    free: true,
    envVars: ['FIRECRAWL_API_KEY'],
    fields: [
      { key: 'FIRECRAWL_API_KEY', label: 'Firecrawl API Key', type: 'password', hint: 'Free tier at https://firecrawl.dev' }
    ],
    docUrl: 'https://firecrawl.dev',
    capabilities: ['scrape', 'crawl', 'markdown', 'market-research']
  },
  {
    id: 'brave_search',
    category: 'Search & Scrape',
    name: 'Brave Search',
    description: 'Privacy-focused web search with a generous free API tier for AI agents.',
    icon: '🦁',
    package: '@modelcontextprotocol/server-brave-search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    free: true,
    envVars: ['BRAVE_API_KEY'],
    fields: [
      { key: 'BRAVE_API_KEY', label: 'Brave API Key', type: 'password', hint: 'Free at https://api.search.brave.com/' }
    ],
    docUrl: 'https://brave.com/search/api/',
    capabilities: ['search', 'web', 'free-tier']
  },
  {
    id: 'tavily',
    category: 'Search & Scrape',
    name: 'Tavily Search',
    description: 'The search engine optimized for LLMs. Returns clean, fact-based search results.',
    icon: '🦅',
    package: 'tavily-mcp',
    command: 'npx',
    args: ['-y', 'tavily-mcp'],
    free: true,
    envVars: ['TAVILY_API_KEY'],
    fields: [
      { key: 'TAVILY_API_KEY', label: 'Tavily API Key', type: 'password', hint: 'Free tier at https://tavily.com/' }
    ],
    docUrl: 'https://tavily.com/',
    capabilities: ['ai-search', 'fact-check', 'news']
  },
  {
    id: 'exa_search',
    category: 'Search & Scrape',
    name: 'Exa (AI Search Engine)',
    description: 'The search engine built for AI. Returns high-quality links and content snapshots.',
    icon: '🕵️',
    package: 'exa-mcp',
    command: 'npx',
    args: ['-y', 'exa-mcp'],
    free: true,
    envVars: ['EXA_API_KEY'],
    fields: [
      { key: 'EXA_API_KEY', label: 'Exa API Key', type: 'password', hint: 'Get free key at https://exa.ai' }
    ],
    docUrl: 'https://exa.ai',
    capabilities: ['semantic-search', 'neural-search', 'clean-content']
  },
  {
    id: 'jina_reader',
    category: 'Search & Scrape',
    name: 'Jina Reader',
    description: 'Fetch any URL as clean Markdown/XML for LLM processing. Completely free tier.',
    icon: '📖',
    package: 'mcp-jina-reader',
    command: 'npx',
    args: ['-y', 'mcp-jina-reader'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://jina.ai/reader',
    capabilities: ['url-to-markdown', 'clean-reading', 'free']
  },

  // ═══════════════════════════════════════════════════════════════
  // 📣 SOCIAL MEDIA (EXPANDED)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ayrshare',
    category: 'Social Media',
    name: 'Ayrshare (All Platforms)',
    description: 'Post to Facebook, Instagram, TikTok, LinkedIn, Twitter, YouTube in one API.',
    icon: '📣',
    package: '@ayrshare/social-mcp',
    command: 'npx',
    args: ['-y', '@ayrshare/social-mcp'],
    free: false,
    envVars: ['AYRSHARE_API_KEY', 'AYRSHARE_PROFILE_KEY'],
    fields: [
      { key: 'AYRSHARE_API_KEY', label: 'Ayrshare API Key', type: 'password', hint: 'Get at https://app.ayrshare.com' },
      { key: 'AYRSHARE_PROFILE_KEY', label: 'Profile Key (Optional)', type: 'text', hint: 'For managing multiple client profiles' }
    ],
    docUrl: 'https://www.ayrshare.com/',
    capabilities: ['facebook', 'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube', 'scheduler']
  },
  {
    id: 'linkedin',
    category: 'Social Media',
    name: 'LinkedIn Direct',
    description: 'Manage LinkedIn posts, comments — personal profile & company pages.',
    icon: '💼',
    package: 'mcp-linkedin',
    command: 'npx',
    args: ['-y', 'mcp-linkedin'],
    free: false,
    authType: 'oauth',
    authUri: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUri: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'r_liteprofile'],
    envVars: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_URN'],
    fields: [
      { key: 'LINKEDIN_CLIENT_ID', label: 'Client ID', type: 'text', hint: 'Create App at https://www.linkedin.com/developers/' },
      { key: 'LINKEDIN_CLIENT_SECRET', label: 'Client Secret', type: 'password', hint: '' },
      { key: 'LINKEDIN_PERSON_URN', label: 'Personal URN (Optional)', type: 'text', hint: 'Auto-fetched if left blank' }
    ],
    docUrl: 'https://www.linkedin.com/developers/',
    capabilities: ['post', 'comment', 'company-pages']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🗺️ GOOGLE & PRODUCTIVITY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'google_docs',
    category: 'Google',
    name: 'Google Docs',
    description: 'Generate reports, write proposals, and manage documents automatically.',
    icon: '📄',
    package: '@modelcontextprotocol/server-google-docs',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-docs'],
    free: true,
    authType: 'oauth',
    authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/documents'],
    envVars: ['GOOGLE_DOCS_CREDENTIALS_PATH'],
    fields: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', type: 'text', hint: 'From Google Cloud Console' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', type: 'password', hint: '' }
    ],
    docUrl: 'https://developers.google.com/docs',
    capabilities: ['create-docs', 'read-docs', 'append-content', 'free']
  },
  {
    id: 'google_forms',
    category: 'Google',
    name: 'Google Forms',
    description: 'Create surveys, collect customer feedback, and manage responses.',
    icon: '📝',
    package: 'google-forms-mcp',
    command: 'npx',
    args: ['-y', 'google-forms-mcp'],
    free: true,
    envVars: ['GOOGLE_FORMS_CREDENTIALS_PATH'],
    fields: [
      { key: 'GOOGLE_FORMS_CREDENTIALS_PATH', label: 'Credentials JSON Path', type: 'text', hint: 'Download from Google Cloud Console' }
    ],
    docUrl: 'https://developers.google.com/forms',
    capabilities: ['create-forms', 'list-responses', 'free']
  },
  {
    id: 'google_sheets',
    category: 'Google',
    name: 'Google Sheets',
    description: 'CRM, financials, leads tracker — read/write spreadsheets. Free tier.',
    icon: '📊',
    package: '@modelcontextprotocol/server-google-sheets',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-sheets'],
    free: true,
    authType: 'oauth',
    authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    envVars: ['GOOGLE_SHEETS_CREDENTIALS_PATH'],
    fields: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', type: 'text', hint: 'From Google Cloud Console' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', type: 'password', hint: '' }
    ],
    docUrl: 'https://developers.google.com/sheets',
    capabilities: ['read', 'write', 'append', 'crm', 'free']
  },
  {
    id: 'gmail',
    category: 'Email',
    name: 'Gmail',
    description: 'Read, send, search Gmail. The autopilot\'s primary inbox.',
    icon: '📧',
    package: '@modelcontextprotocol/server-gmail',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-gmail'],
    free: true,
    authType: 'oauth',
    authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    envVars: ['GMAIL_CREDENTIALS_PATH'],
    fields: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', type: 'text', hint: 'From Google Cloud Console' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', type: 'password', hint: '' }
    ],
    docUrl: 'https://developers.google.com/gmail',
    capabilities: ['send', 'read', 'search', 'labels', 'free']
  },
  {
    id: 'google_calendar',
    category: 'Google',
    name: 'Google Calendar',
    description: 'Manage meetings and schedule automatically.',
    icon: '📅',
    package: 'mcp-google-calendar',
    command: 'npx',
    args: ['-y', 'mcp-google-calendar'],
    free: true,
    authType: 'oauth',
    authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/calendar'],
    envVars: ['GOOGLE_CALENDAR_CREDENTIALS_PATH'],
    fields: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', type: 'text', hint: 'From Google Cloud Console' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', type: 'password', hint: '' }
    ],
    docUrl: 'https://developers.google.com/calendar',
    capabilities: ['events', 'scheduling', 'free']
  },
  {
    id: 'notion',
    category: 'Productivity',
    name: 'Notion',
    description: 'The ultimate AI operating system. Read/write pages and databases.',
    icon: '📓',
    package: '@modelcontextprotocol/server-notion',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-notion'],
    free: true,
    envVars: ['NOTION_API_KEY'],
    fields: [
      { key: 'NOTION_API_KEY', label: 'Notion API Key', type: 'password', hint: 'Get at https://www.notion.so/my-integrations' }
    ],
    docUrl: 'https://developers.notion.com/',
    capabilities: ['databases', 'pages', 'search', 'free']
  },
  {
    id: 'obsidian',
    category: 'Productivity',
    name: 'Obsidian',
    description: 'Manage your local Obsidian vault context for the AI.',
    icon: '💎',
    package: 'mcp-obsidian',
    command: 'npx',
    args: ['-y', 'mcp-obsidian'],
    free: true,
    envVars: ['OBSIDIAN_VAULT_PATH'],
    fields: [
      { key: 'OBSIDIAN_VAULT_PATH', label: 'Vault Absolute Path', type: 'text', hint: 'Absolute path to your .obsidian folder' }
    ],
    docUrl: 'https://obsidian.md/',
    capabilities: ['knowledge-base', 'notes', 'local']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🏢 CRM & SALES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hubspot',
    category: 'CRM & Sales',
    name: 'HubSpot',
    description: 'Manage contacts, deals, and marketing automation. Industry standard CRM.',
    icon: '🧡',
    package: 'mcp-hubspot',
    command: 'npx',
    args: ['-y', 'mcp-hubspot'],
    free: true,
    envVars: ['HUBSPOT_ACCESS_TOKEN'],
    fields: [
      { key: 'HUBSPOT_ACCESS_TOKEN', label: 'HubSpot Access Token', type: 'password', hint: 'From HubSpot Portal → Settings → Integrations' }
    ],
    docUrl: 'https://developers.hubspot.com/',
    capabilities: ['contacts', 'deals', 'marketing', 'crm', 'free-tier']
  },
  {
    id: 'salesforce',
    category: 'CRM & Sales',
    name: 'Salesforce',
    description: 'The world\'s #1 CRM. Manage complex sales pipelines autonomously.',
    icon: '☁️',
    package: 'mcp-salesforce',
    command: 'npx',
    args: ['-y', 'mcp-salesforce'],
    free: false,
    envVars: ['SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_USERNAME', 'SF_PASSWORD'],
    fields: [
      { key: 'SF_CLIENT_ID', label: 'Client ID', type: 'text', hint: 'Connected App Client ID' },
      { key: 'SF_CLIENT_SECRET', label: 'Client Secret', type: 'password', hint: '' },
      { key: 'SF_USERNAME', label: 'Username', type: 'text', hint: '' },
      { key: 'SF_PASSWORD', label: 'Password + Security Token', type: 'password', hint: '' }
    ],
    docUrl: 'https://developer.salesforce.com/',
    capabilities: ['leads', 'accounts', 'opportunities', 'custom-objects']
  },

  // ═══════════════════════════════════════════════════════════════
  // 📧 MESSAGING
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'whatsapp',
    category: 'Messaging',
    name: 'WhatsApp Business',
    description: 'Send/receive messages via Meta WhatsApp Cloud API.',
    icon: '💬',
    package: 'whatsapp-mcp',
    command: 'npx',
    args: ['-y', 'whatsapp-mcp'],
    free: true,
    envVars: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
    fields: [
      { key: 'WHATSAPP_ACCESS_TOKEN', label: 'Access Token', type: 'password', hint: 'Permanent token from Meta Dev Console' },
      { key: 'WHATSAPP_PHONE_NUMBER_ID', label: 'Phone Number ID', type: 'text', hint: '' }
    ],
    docUrl: 'https://developers.facebook.com/docs/whatsapp',
    capabilities: ['send', 'templates', 'media', 'free-tier']
  },
  {
    id: 'slack',
    category: 'Messaging',
    name: 'Slack',
    description: 'Coordinate with your team. Post, manage channels, files.',
    icon: '🏢',
    package: '@modelcontextprotocol/server-slack',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    free: true,
    envVars: ['SLACK_BOT_TOKEN'],
    fields: [
      { key: 'SLACK_BOT_TOKEN', label: 'Bot OAuth Token', type: 'password', hint: 'Starts with xoxb- from api.slack.com' }
    ],
    docUrl: 'https://api.slack.com/',
    capabilities: ['messages', 'channels', 'bot-interactions', 'free']
  },
  {
    id: 'telegram',
    category: 'Messaging',
    name: 'Telegram Bot',
    description: 'Communicate with users via Telegram. Send alerts and receive commands.',
    icon: '✈️',
    package: 'mcp-server-telegram',
    command: 'npx',
    args: ['-y', 'mcp-server-telegram'],
    free: true,
    envVars: ['TELEGRAM_BOT_TOKEN'],
    fields: [
      { key: 'TELEGRAM_BOT_TOKEN', label: 'Bot Token', type: 'password', hint: 'Get from @BotFather on Telegram' }
    ],
    docUrl: 'https://core.telegram.org/bots',
    capabilities: ['notifications', 'commands', 'free']
  },
  {
    id: 'discord',
    category: 'Messaging',
    name: 'Discord Bot',
    description: 'Manage Discord servers, post to channels, and interact with members.',
    icon: '👾',
    package: 'mcp-discord',
    command: 'npx',
    args: ['-y', 'mcp-discord'],
    free: true,
    envVars: ['DISCORD_BOT_TOKEN'],
    fields: [
      { key: 'DISCORD_BOT_TOKEN', label: 'Bot Token', type: 'password', hint: 'Get from Discord Developer Portal' }
    ],
    docUrl: 'https://discord.com/developers/docs/intro',
    capabilities: ['messages', 'automation', 'free']
  },
  {
    id: 'email_generic',
    category: 'Email',
    name: 'Generic SMTP/IMAP',
    description: 'Send and receive emails via standard SMTP/IMAP protocols.',
    icon: '📧',
    package: 'mcp-server-email',
    command: 'npx',
    args: ['-y', 'mcp-server-email'],
    free: true,
    envVars: ['EMAIL_USER', 'EMAIL_PASS', 'SMTP_HOST', 'IMAP_HOST'],
    fields: [
      { key: 'EMAIL_USER', label: 'Email Username', type: 'text' },
      { key: 'EMAIL_PASS', label: 'Password', type: 'password' },
      { key: 'SMTP_HOST', label: 'SMTP Host', type: 'text' },
      { key: 'IMAP_HOST', label: 'IMAP Host', type: 'text' }
    ],
    capabilities: ['smtp', 'imap', 'free']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ DEVELOPER TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'github',
    category: 'Development',
    name: 'GitHub',
    description: 'Manage repos, issues, PRs, and code. Official server.',
    icon: '🐙',
    package: '@modelcontextprotocol/server-github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    free: true,
    envVars: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
    fields: [
      { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'Personal Access Token', type: 'password', hint: 'Repo, issues, and PR scopes' }
    ],
    docUrl: 'https://docs.github.com/en/rest',
    capabilities: ['code', 'repos', 'pull-requests', 'issues', 'free']
  },
  {
    id: 'puppeteer',
    category: 'Development',
    name: 'Puppeteer',
    description: 'Headless browser automation. Scrape anything visual.',
    icon: '🕷️',
    package: '@modelcontextprotocol/server-puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['screenshot', 'navigate', 'click', 'scrape', 'free']
  },
  {
    id: 'filesystem',
    category: 'Development',
    name: 'File System',
    description: 'Real-world file access for the CEO. Read/write local workspace.',
    icon: '📂',
    package: '@modelcontextprotocol/server-filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    free: true,
    envVars: ['MCP_FILESYSTEM_ROOT'],
    fields: [
      { key: 'MCP_FILESYSTEM_ROOT', label: 'Root Path', type: 'text', hint: 'Agents can only access this path' }
    ],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['read', 'write', 'list', 'free']
  },
  {
    id: 'linear',
    category: 'Development',
    name: 'Linear',
    description: 'Autonomous project management. Create issues, track sprints, and update teams.',
    icon: '📈',
    package: '@modelcontextprotocol/server-linear',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-linear'],
    free: true,
    envVars: ['LINEAR_API_KEY'],
    fields: [
      { key: 'LINEAR_API_KEY', label: 'Linear API Key', type: 'password', hint: 'Get at Settings -> API' }
    ],
    docUrl: 'https://linear.app/docs/api',
    capabilities: ['issues', 'projects', 'teams', 'free']
  },
  {
    id: 'sentry',
    category: 'Development',
    name: 'Sentry',
    description: 'Monitor errors and performance. AI can diagnose production issues.',
    icon: '🚩',
    package: '@modelcontextprotocol/server-sentry',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sentry'],
    free: true,
    envVars: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG'],
    fields: [
      { key: 'SENTRY_AUTH_TOKEN', label: 'Auth Token', type: 'password' },
      { key: 'SENTRY_ORG', label: 'Organization Slug', type: 'text' }
    ],
    docUrl: 'https://docs.sentry.io/api/',
    capabilities: ['errors', 'diagnostics', 'performance']
  },
  {
    id: 'postgres',
    category: 'Development',
    name: 'PostgreSQL',
    description: 'Direct DB access. AI can run queries, analyze data, and manage schemas.',
    icon: '🐘',
    package: '@modelcontextprotocol/server-postgres',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    free: true,
    envVars: ['PG_CONNECTION_STRING'],
    fields: [
      { key: 'PG_CONNECTION_STRING', label: 'Connection String', type: 'text', hint: 'postgresql://user:pass@host:port/db' }
    ],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['sql', 'data-analysis', 'schema-management']
  },
  {
    id: 'docker',
    category: 'Development',
    name: 'Docker',
    description: 'Manage containers, images, and volumes via the Docker API.',
    icon: '🐳',
    package: '@modelcontextprotocol/server-docker',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-docker'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://docs.docker.com/engine/api/',
    capabilities: ['containers', 'images', 'volumes', 'free']
  },
  {
    id: 'reddit',
    category: 'Social Media',
    name: 'Reddit',
    description: 'Monitor subreddits, post content, and engage with communities.',
    icon: '🤖',
    package: 'mcp-server-reddit',
    command: 'npx',
    args: ['-y', 'mcp-server-reddit'],
    free: true,
    envVars: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'],
    fields: [
      { key: 'REDDIT_CLIENT_ID', label: 'Client ID', type: 'text' },
      { key: 'REDDIT_CLIENT_SECRET', label: 'Client Secret', type: 'password' },
      { key: 'REDDIT_USERNAME', label: 'Username', type: 'text' },
      { key: 'REDDIT_PASSWORD', label: 'Password', type: 'password' }
    ],
    docUrl: 'https://www.reddit.com/dev/api/',
    capabilities: ['marketing', 'engagement', 'research']
  },
  {
    id: 'spotify',
    category: 'Productivity',
    name: 'Spotify',
    description: 'Control music and manage playlists. Perfect for mood-based office automation.',
    icon: '🎵',
    package: '@modelcontextprotocol/server-spotify',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-spotify'],
    free: true,
    envVars: ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'],
    fields: [
      { key: 'SPOTIFY_CLIENT_ID', label: 'Client ID', type: 'text' },
      { key: 'SPOTIFY_CLIENT_SECRET', label: 'Client Secret', type: 'password' }
    ],
    docUrl: 'https://developer.spotify.com/documentation/web-api',
    capabilities: ['playback', 'playlists', 'free-tier']
  },
  {
    id: 'zoom',
    category: 'Messaging',
    name: 'Zoom',
    description: 'Schedule meetings, manage recordings, and coordinate video calls.',
    icon: '📹',
    package: 'mcp-zoom',
    command: 'npx',
    args: ['-y', 'mcp-zoom'],
    free: true,
    envVars: ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
    fields: [
      { key: 'ZOOM_ACCOUNT_ID', label: 'Account ID', type: 'text' },
      { key: 'ZOOM_CLIENT_ID', label: 'Client ID', type: 'text' },
      { key: 'ZOOM_CLIENT_SECRET', label: 'Client Secret', type: 'password' }
    ],
    docUrl: 'https://developers.zoom.us/',
    capabilities: ['meetings', 'webinars', 'recordings']
  },
  {
    id: 'weather',
    category: 'Utility',
    name: 'Global Weather',
    description: 'Access real-time weather data and forecasts for any location.',
    icon: '🌦️',
    package: '@modelcontextprotocol/server-everything',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-everything'],
    free: true,
    envVars: [],
    fields: [],
    docUrl: 'https://github.com/modelcontextprotocol/servers',
    capabilities: ['weather', 'forecast', 'free']
  }
];

export function getServerById(id) {
  return MCP_REGISTRY.find(s => s.id === id);
}

export function getCategories() {
  return [...new Set(MCP_REGISTRY.map(s => s.category))];
}
