'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/components/link';

/**
 * A workbench strip along the bottom: the two reference pages, plus the three
 * facts you actually check while styling this site — which route you are on,
 * how wide the viewport is against the breakpoints, and which colour scheme is
 * resolving.
 *
 * It renders only after mount. Every value in it (the stored collapsed state,
 * the viewport width, the scheme) is a client fact, and rendering them on the
 * server would either mismatch on hydration or ship a wrong first frame.
 *
 * To take it out of the public build, gate the mount effect on
 * `process.env.NODE_ENV === 'development'` — one line, and the bar becomes a
 * local tool rather than part of the site.
 */

const STORAGE_KEY = 'apb:devbar';

/** The stylesheet's own breakpoints, narrowest first. */
const BANDS = [
  { rem: 34, label: '<34' },
  { rem: 40, label: '34–40' },
  { rem: 52, label: '40–52' },
  { rem: 60, label: '52–60' },
  { rem: 62, label: '60–62' },
  { rem: 90, label: '62–90' },
];

function bandFor(rem: number): string {
  for (const band of BANDS) if (rem < band.rem) return band.label;
  return '≥90';
}

export function DevBar({ version, files }: { version: string; files: number }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(0);
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    setMounted(true);
    try {
      setOpen(window.localStorage.getItem(STORAGE_KEY) !== 'closed');
    } catch {
      // Private mode, or site data blocked. The bar simply stays open.
    }

    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const measure = () => {
      setWidth(window.innerWidth);
      setScheme(dark.matches ? 'dark' : 'light');
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    dark.addEventListener('change', measure);
    return () => {
      window.removeEventListener('resize', measure);
      dark.removeEventListener('change', measure);
    };
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'open' : 'closed');
    } catch {
      // Nothing to persist to; the toggle still works for this page view.
    }
  };

  if (!mounted) return null;

  // The root font size is 16px unless the reader has changed it, and the whole
  // stylesheet is in rem — so report both, in the reader's own units.
  const rem = width / parseFloat(getComputedStyle(document.documentElement).fontSize || '16');

  if (!open) {
    return (
      <button type="button" className="devbar__tab mono" onClick={toggle} aria-expanded="false">
        dev
      </button>
    );
  }

  return (
    <aside className="devbar mono" aria-label="Developer bar">
      <span className="devbar__brand">
        <span className="devbar__dot" aria-hidden="true" />
        v{version}
        <span className="devbar__sep" aria-hidden="true">
          ·
        </span>
        {files} files
      </span>

      <nav className="devbar__links" aria-label="Reference">
        <Link href="/design-system/" aria-current={pathname.startsWith('/design-system') ? 'page' : undefined}>
          Design system
        </Link>
        <Link href="/brand-voice/" aria-current={pathname.startsWith('/brand-voice') ? 'page' : undefined}>
          Brand voice
        </Link>
      </nav>

      <span className="devbar__facts">
        <span className="devbar__fact" title="Current route">
          <span>route</span>
          {pathname}
        </span>
        <span className="devbar__fact" title="Viewport width, and the band it falls in">
          <span>vw</span>
          {width}px / {rem.toFixed(1)}rem · {bandFor(rem)}
        </span>
        <span className="devbar__fact" title="Resolved colour scheme">
          <span>scheme</span>
          {scheme}
        </span>
      </span>

      <button type="button" className="devbar__close" onClick={toggle} aria-expanded="true">
        <span className="devbar__closelabel">hide</span>
        <span aria-hidden="true">✕</span>
      </button>
    </aside>
  );
}
