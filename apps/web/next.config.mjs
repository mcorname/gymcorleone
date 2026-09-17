/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@gym/types',
    '@gym/calculations',
    '@gym/ai',
    '@gym/offline-sync',
    '@gym/i18n'
  ]
};

export default nextConfig;
