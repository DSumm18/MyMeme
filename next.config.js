/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'im.runware.ai' },
      { protocol: 'https', hostname: '*.runware.ai' },
    ],
  },
  env: {
    RUNWARE_API_KEY: process.env.RUNWARE_API_KEY
  }
};

module.exports = nextConfig;