/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'playwright'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.linio.com',
      },
      {
        protocol: 'https',
        hostname: 'images.falabella.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ripley.com.pe',
      },
      {
        protocol: 'https',
        hostname: 'images.walmart.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  env: {
    SCRAPING_TIMEOUT: process.env.SCRAPING_TIMEOUT || '30000',
    SCRAPING_MAX_CONCURRENT: process.env.SCRAPING_MAX_CONCURRENT || '5',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = nextConfig;
