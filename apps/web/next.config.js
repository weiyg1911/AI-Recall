/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@memorize/api-client', '@memorize/shared-types', '@memorize/utils'],
};

module.exports = nextConfig;
