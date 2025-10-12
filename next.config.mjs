/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude markdown and readme files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|mdx|readme)$/i,
      use: 'ignore-loader',
    });
    return config;
  },
}

export default nextConfig
