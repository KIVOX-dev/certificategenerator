const API_URL = process.env.API_URL || 'http://localhost:4000';
// The admin panel is served under /admin when it shares one domain with the participant site (Vercel services).
// Set BASE_PATH="" to serve it from the root of its own domain instead.
const basePath = process.env.BASE_PATH ?? '/admin';

/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /api is NOT under the base path: on the shared domain it is routed to the API by the participant site.
  // This rewrite only matters when the admin app runs on its own (e.g. localhost:3001).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*`, basePath: false }];
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
