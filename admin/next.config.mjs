const API_URL = process.env.API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  // Same-origin proxy so the httpOnly session cookie works without CORS.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
};
