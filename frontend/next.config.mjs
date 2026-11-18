/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// Strict Content-Security-Policy: only our own origin may load scripts, styles, images and
// make network calls (the API is reached via the same-origin /api proxy). 'unsafe-inline' for
// scripts is needed for Next.js' inline bootstrap + the theme script; 'unsafe-eval' only in dev (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone', // small, self-contained Docker image
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    const api = process.env.API_URL || 'http://localhost:5000';
    return [{ source: '/api/:path*', destination: `${api}/api/:path*` }];
  },
};

export default nextConfig;
