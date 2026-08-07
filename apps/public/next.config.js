const isGithubPages = process.env.GITHUB_PAGES === 'true';
// e.g. "/dusman-tan-ablukay-dag-t" when built for
// https://sermedol.github.io/dusman-tan-ablukay-dag-t/
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  ...(isGithubPages
    ? {
        output: 'export',
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

module.exports = nextConfig;
