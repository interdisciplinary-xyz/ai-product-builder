'use client';

import { Link } from '@/components/link';
import { usePathname } from 'next/navigation';

/**
 * The masthead needs to know where you are — a static <Link> list can't say so.
 * A layer is current for its own index and for every document inside it.
 */
export function SiteNav({
  layers,
}: {
  layers: { id: string; label: string }[];
}) {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="masthead__nav" aria-label="Layers">
      {layers.map((layer) => {
        const current = pathname === `/${layer.id}/` || pathname.startsWith(`/${layer.id}/`);
        return (
          <Link
            key={layer.id}
            href={`/${layer.id}/`}
           
            aria-current={current ? 'page' : undefined}
          >
            {layer.label}
          </Link>
        );
      })}
      <Link
        href="/browse/"
       
        aria-current={pathname.startsWith('/browse') ? 'page' : undefined}
      >
        Search
      </Link>
    </nav>
  );
}
