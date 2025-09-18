/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ fora de experimental, remove o warning
  typedRoutes: false,

  images: {
    remotePatterns: [],
  },

  eslint: {
    // impede que o Vercel falhe por erros de lint
    ignoreDuringBuilds: true,
  },

  // Se o TypeScript travar no CI, descomente:
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
