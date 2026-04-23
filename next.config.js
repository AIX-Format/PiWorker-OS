/** @type {import('next').NextConfig} */
const nextConfig = {
  // Config for Next.js 15
  experimental: {
    // any experimental features can be added here
  },
  images: {
    unoptimized: true, // For local-first / static export if needed
  },
};

export default nextConfig;
