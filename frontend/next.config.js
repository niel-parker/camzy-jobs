/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@job-portal/sdk'],
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
