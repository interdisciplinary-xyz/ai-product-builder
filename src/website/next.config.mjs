import path from 'node:path';
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // This repo carries its own agent conventions; don't scatter generated ones.
  agentRules: false,
  // The library lives two levels up and the site reads it at build time, so
  // tracing has to root there — process.cwd() is the website package, which
  // would omit exactly the files this app depends on if a non-export build
  // ever relied on tracing.
  outputFileTracingRoot: path.join(process.cwd(), '..', '..'),
  // Portless serves dev over https://ai-product-builder.local — a cross-origin
  // dev host, which Next blocks unless it is named here. See RUNBOOK_DEV_PORTLESS.
  allowedDevOrigins: [
    'ai-product-builder.local',
    'ai-product-builder.localhost',
    '*.ai-product-builder.local',
    '*.ai-product-builder.localhost',
  ],
};

/**
 * Static export is decided by the BUILD PHASE, not by NODE_ENV.
 *
 * `output: 'export'` removes route handlers everywhere — including from
 * `next dev`, where a POST then falls through to the [layer]/[slug] catch-all
 * and 500s. The favorites endpoint has to write `data/favorites.json`, so dev
 * needs a real Node server and only the production build exports.
 *
 * Keying that off `process.env.NODE_ENV` looked right and silently stopped
 * working: NODE_ENV is unset when the config is first evaluated, so the build
 * quietly produced a server bundle and an empty `out/`. The phase argument is
 * the value Next actually passes, so it cannot be wrong.
 */
export default function config(phase) {
  return phase === PHASE_PRODUCTION_BUILD
    ? { ...nextConfig, output: 'export' }
    : nextConfig;
}
