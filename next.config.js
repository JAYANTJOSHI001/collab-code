/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Change from boolean to object if it's currently set as true
    serverActions: {
      // Add any server actions config here
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig