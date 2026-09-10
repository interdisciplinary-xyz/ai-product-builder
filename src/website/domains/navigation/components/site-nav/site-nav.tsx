'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/domains/ui';
import { SearchButton } from '@/domains/search';
import { FavoriteCount } from '@/domains/favorites';
import { SITE_LINKS } from './site-nav.constants';

/**
 * `markable` is counted on the server and passed down: the count of everything
 * a star can be put on. This is a client component — it needs the pathname —
 * so it cannot read the corpus itself.
 */
export function SiteNav({ markable }: { markable: number }) {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="masthead__nav" aria-label="Sections">
      {SITE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname.startsWith(link.match) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
      <FavoriteCount current={pathname.startsWith('/favorites')} total={markable} />
      <SearchButton />
    </nav>
  );
}
