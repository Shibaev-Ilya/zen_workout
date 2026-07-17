/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/sporttracker',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;