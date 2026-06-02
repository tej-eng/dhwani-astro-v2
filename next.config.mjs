/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['json.astrologyapi.com'],
       remotePatterns: [
      {
        protocol: "https",
        hostname: "www.dhwaniastro.com",
      },
    ],
  },
  reactStrictMode: false,
  turbopack: {}, // ✅ updated key
};

export default nextConfig;
 


