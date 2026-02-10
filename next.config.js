/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['runware.ai', 'storage.googleapis.com']
  },
  env: {
    RUNWARE_API_KEY: process.env.RUNWARE_API_KEY
  }
};

module.exports = nextConfig;