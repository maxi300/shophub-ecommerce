/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '1294-2800-b20-108b-736d-70c2-2686-5d8-1b22.ngrok-free.app',
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