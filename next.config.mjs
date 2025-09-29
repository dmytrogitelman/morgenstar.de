/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { 
    serverActions: { allowedOrigins: ["*"] },
    optimizePackageImports: ['@prisma/client']
  },
  images: { 
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};
export default nextConfig;

