import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell">
      <div className="pagehead">
        <p className="eyebrow">404 · no such entry</p>
        <h1 className="display pagehead__title">Not in this catalog.</h1>
        <p className="pagehead__lede">
          The library holds 116 files and no more. Try the{' '}
          <Link href="/browse/">full index</Link>, or start from the{' '}
          <Link href="/">front page</Link>.
        </p>
      </div>
    </div>
  );
}
