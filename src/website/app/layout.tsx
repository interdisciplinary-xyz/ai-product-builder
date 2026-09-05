import type { Metadata } from 'next';
import { Instrument_Serif, Newsreader, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { LAYERS, libraryVersion, allDocs } from '@/lib/content';
import './globals.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const body = Newsreader({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ai-product-builder — a library of playbooks',
    template: '%s · ai-product-builder',
  },
  description:
    'Playbooks, runbook templates and agent skills for solo founders shipping products with Claude Code. Eight layers, browsable in full.',
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
            <nav aria-label="Layers">
              {LAYERS.filter((l) => l.id !== 'guides').map((layer) => (
                <Link key={layer.id} href={`/${layer.id}/`}>
                  {layer.label}
                </Link>
              ))}
              <Link href="/browse/">Search</Link>
            </nav>
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
