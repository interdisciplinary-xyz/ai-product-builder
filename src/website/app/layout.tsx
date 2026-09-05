import type { Metadata } from 'next';
import { Instrument_Serif, Newsreader, JetBrains_Mono } from 'next/font/google';
import { Link } from '@/components/link';
import { LAYERS, libraryVersion, allDocs } from '@/lib/content';
import { SiteNav } from '@/components/site-nav';
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
            <SiteNav
              layers={LAYERS.filter((l) => l.id !== 'guides').map((l) => ({
                id: l.id,
                label: l.label,
              }))}
            />
          </div>
        </header>

        <main id="main">{children}</main>

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
                <Link href="/guides/readme/">Readme</Link> ·{' '}
                <Link href="/guides/catalog/">Catalog</Link> ·{' '}
                <Link href="/guides/contributing/">Contributing</Link>
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
