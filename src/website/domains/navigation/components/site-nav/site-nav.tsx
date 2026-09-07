'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/domains/ui';
import { SearchButton } from '@/domains/search';
import { FavoriteCount } from '@/domains/favorites';
import { SITE_LINKS } from './site-nav.constants';

export function SiteNav() {
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
      <FavoriteCount current={pathname.startsWith('/favorites')} />
      <SearchButton />
    </nav>
  );
}
