import Link from 'next/link';
import { allDocs } from '@/lib/content';

export default function NotFound() {
  const total = allDocs().filter((d) => d.layer !== 'guides').length;
  return (
    <div className="shell">
      <div className="pagehead">
        <p className="eyebrow">404 · no such entry</p>
        <h1 className="display pagehead__title">Not in this catalog.</h1>
        <p className="pagehead__lede">
          The library holds {total} files and no more. Try the{' '}
          <Link href="/browse/">full index</Link>, or start from the{' '}
          <Link href="/">front page</Link>.
        </p>
      </div>
    </div>
  );
}
