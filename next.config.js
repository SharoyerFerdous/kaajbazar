/** @type {import('next').NextConfig} */
const nextConfig = {
  // Restrict image proxy to known CDN hostnames — never use '**' (allows SSRF to internal hosts)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.vercel.app' },
    ],
  },
  async headers() {
    // Flutter mobile is not a browser — CORS only applies to browser requests.
    // The web app is same-origin in production, so wildcard is safe here
    // (no credentials=true, so the forbidden combo is avoided).
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
