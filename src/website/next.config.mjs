/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static: `npm run build` emits ./out, deployable to any static host.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // This repo carries its own agent conventions; don't scatter generated ones.
  agentRules: false,
  // The library lives two levels up; Next needs to know files outside the app dir are read.
  outputFileTracingRoot: process.cwd(),
  // Portless serves dev over https://ai-product-builder.local — a cross-origin
  // dev host, which Next blocks unless it is named here. See RUNBOOK_DEV_PORTLESS.
  allowedDevOrigins: [
    'ai-product-builder.local',
    'ai-product-builder.localhost',
    '*.ai-product-builder.local',
    '*.ai-product-builder.localhost',
  ],
};

export default nextConfig;
