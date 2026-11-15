/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@job-portal/sdk'],
  images: {
    domains: ['images.unsplash.com', 'api.jobs.camzytech.com', 'jobs.camzytech.com'],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || (process.env.NODE_ENV === 'production' && typeof window === 'undefined' ? 'http://backend:4000' : 'http://localhost:4000');
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
