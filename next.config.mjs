/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false
  },
  images: {
    remotePatterns: []
  },
  eslint: {
    // evita que o Vercel falhe o build por lint
    ignoreDuringBuilds: true,
  },
  // se o TypeScript travar o deploy, descomente:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
