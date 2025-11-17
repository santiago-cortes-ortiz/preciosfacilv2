export const config = {
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '30000'),
    maxConcurrent: parseInt(process.env.SCRAPING_MAX_CONCURRENT || '5'),
    userAgent: process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    retryAttempts: 3,
    retryDelay: 1000,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: 5,
    maxSize: '10m',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300000'),
    maxItems: 30,
  },

  app: {
    name: 'PreciosFacil v2',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },

  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  },

  search: {
    maxResults: 50,
    defaultLimit: 20,
    minQueryLength: 2,
    maxQueryLength: 100,
  },
} as const;

export type Config = typeof config;
