'use client';

import { Link } from '@/components/link';
import { usePathname } from 'next/navigation';
import { SearchButton } from '@/components/command-palette';

/**
 * Four destinations, not twelve. The masthead used to list all eight layers,
 * which meant the header answered "what kinds of file are there" — a question
 * nobody arrives with — and buried search at the end of the row. Layers are
 * still one click away from Browse, from every breadcrumb and from the rail on
 * a document page; the header now carries the two axes (topic, layer) plus the
 * two indexes, and search is a button rather than a link.
 */
const LINKS = [
  { href: '/topics/', label: 'Topics', match: '/topics' },
  { href: '/browse/', label: 'Browse', match: '/browse' },
  { href: '/tokens/', label: 'Placeholders', match: '/tokens' },
];

export function SiteNav() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="masthead__nav" aria-label="Sections">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname.startsWith(link.match) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
      <SearchButton />
    </nav>
  );
}
