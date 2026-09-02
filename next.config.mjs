/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'fbac-138-97-141-210.ngrok-free.app/',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;