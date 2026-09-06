import type { Metadata } from 'next';
import { Instrument_Serif, Newsreader, JetBrains_Mono } from 'next/font/google';
import { Link } from '@/components/link';
import { LAYERS, libraryVersion, allDocs, findDoc } from '@/lib/content';
import { SiteNav } from '@/components/site-nav';
import { CommandPalette, type Jump } from '@/components/command-palette';
import { DevBar } from '@/components/dev-bar';
import { TOPICS } from '@/lib/topics';
import './globals.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const body = Newsreader({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

export const metadata: Metadata = {
  title: {
    default: 'ai-product-builder — a library of playbooks',
    template: '%s · ai-product-builder',
  },
  description:
    'Playbooks, runbook templates and agent skills for solo founders shipping products with Claude Code. Eight layers, browsable in full.',
  applicationName: 'ai-product-builder',
  openGraph: {
    title: 'ai-product-builder — a library of playbooks',
    description:
      'Every repo re-litigates the same forty decisions. This is those decisions, written once, as documents an agent can execute.',
    type: 'website',
  },
  icons: {
    // Drawn to the same monoline spec as the layer icons.
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

/**
 * What the palette offers before you have typed anything: the two indexes, and
 * the three documents the README sends people to. An empty search box that
 * suggests nothing is a dead end.
 */
function defaultJumps(): Jump[] {
  const jumps: Jump[] = [
    { href: '/topics/', title: 'Browse by topic', detail: `${TOPICS.length} jobs, across every layer` },
    { href: '/browse/', title: 'Browse every file', detail: 'The whole library, filterable' },
    { href: '/tokens/', title: 'Placeholders', detail: 'Every «token» and the docs that want it' },
  ];
  for (const [layer, slug, detail] of [
    ['runbooks', 'release-manager', 'The most opinionated document here'],
    ['runbooks', 'quality-assurance', 'The pre-merge gate'],
    ['skills', 'tests-that-cannot-fail', 'Fires without being asked'],
  ] as const) {
    const doc = findDoc(layer, slug);
    if (doc) jumps.push({ href: `/${layer}/${slug}/`, title: doc.name, detail, layer: doc.layer });
  }
  return jumps;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const version = libraryVersion();
  const total = allDocs().filter((d) => d.layer !== 'guides').length;

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>

        <header className="masthead">
          <div className="shell masthead__inner">
            <Link href="/" className="wordmark">
              ai<span>·</span>product<span>·</span>builder
            </Link>
            <SiteNav />
          </div>
        </header>

        <main id="main">{children}</main>

        <CommandPalette jumps={defaultJumps()} />
        <DevBar version={version} files={total} />

        <footer className="colophon">
          <div className="shell colophon__grid">
            <div>
              <div>ai-product-builder v{version} — {total} files across eight layers.</div>
              <div>
                Not licensed. All rights reserved, Michał Dopieralski / interdisciplinary-xyz.
              </div>
            </div>
            <div>
              <div>
                <Link href="/topics/">Topics</Link> · <Link href="/browse/">Browse</Link> ·{' '}
                <Link href="/tokens/">Placeholders</Link>
              </div>
              {/* The masthead carries the two indexes and the topic axis; the
                  layer indexes live here, so every layer stays one click away
                  from every page without crowding the header. */}
              <div className="colophon__layers">
                {LAYERS.filter((l) => l.id !== 'guides').map((layer, i) => (
                  <span key={layer.id}>
                    {i > 0 ? ' · ' : ''}
                    <Link href={`/${layer.id}/`}>{layer.label}</Link>
                  </span>
                ))}
              </div>
              <div>
                <Link href="/guides/readme/">Readme</Link> ·{' '}
                <Link href="/guides/catalog/">Catalog</Link> ·{' '}
                <Link href="/guides/contributing/">Contributing</Link> ·{' '}
                <Link href="/design-system/">Design system</Link> ·{' '}
                <Link href="/brand-voice/">Brand voice</Link>
              </div>
              <div>
                <a href="https://github.com/interdisciplinary-xyz/ai-product-builder">
                  github.com/interdisciplinary-xyz/ai-product-builder
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
