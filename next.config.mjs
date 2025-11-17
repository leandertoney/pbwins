/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'courtcrowd.com',
      },
      {
        protocol: 'https',
        hostname: 'pamedspas.com',
      },
      {
        protocol: 'https',
        hostname: 'uselaani.com',
      },
      {
        protocol: 'https',
        hostname: 'seasonalactivitiesguide.com',
      },
      {
        protocol: 'https',
        hostname: 'epicdronepilots.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'dupr.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dupr.s3.us-east-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
