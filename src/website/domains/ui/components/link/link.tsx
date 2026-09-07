import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Every route here is a prerendered static file, so Next's default prefetch
 * buys very little and costs a lot: a document page was pulling ~95KB of RSC
 * payloads for links the reader mostly never clicks — and a layer index or a
 * doc full of cross-references has sixty or more of them.
 *
 * Prefetch is opt-in from here: pass `prefetch` explicitly where it earns its
 * bytes.
 */
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
