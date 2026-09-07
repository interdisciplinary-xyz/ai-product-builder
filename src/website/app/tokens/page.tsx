import type { Metadata } from 'next';
import { Link, PageHead } from '@/domains/ui';
import { TokenTable, type TokenRow } from '@/domains/tokens';
import { tokenIndex, tokenStats } from '@/domains/tokens/server';

export const metadata: Metadata = {
  title: 'Placeholders',
  description:
    'Every «token» the library asks you to fill, what it means, and which documents want it.',
};

export default function TokensPage() {
  const stats = tokenStats();
  // Only the repo-wide kind is indexable. «lowercase» tokens are filled inline,
  // differently at each occurrence — listing them would be a list of prose
  // slots, not a vocabulary. The glossary draws the same line.
  const rows: TokenRow[] = tokenIndex()
    .filter((t) => t.kind === 'repo')
    .map(({ name, meaning, example, registered, docs }) => ({
      name,
      meaning,
      example,
      registered,
      docs,
    }));

  const unregistered = stats.repoUnregistered;
  // The lede's example is the most-shared token, read from the corpus rather
  // than typed — the number behind it moves every time a document is added.
  const busiest = rows[0];

  return (
    <div className="shell">
      <PageHead
        eyebrow={`${rows.length} repo-wide tokens · across ${stats.docs} documents`}
        title="What you have to fill in"
        lede={
          <>
            Every template here ships <span className="token">«placeholders»</span> instead of
            invented facts, so an unfilled document looks unfilled. This is the other direction:
            one token, and every document that wants it. Answer{' '}
            <code>«{busiest.name}»</code> once and you have answered it for {busiest.docs.length}{' '}
            files.
          </>
        }
      />

      <div className="tokenstats">
        <p>
          <strong className="mono">{rows.length}</strong>
          <span>
            <code>«SCREAMING_SNAKE»</code> tokens — one value per repo, safe to find-replace, and
            what <code>/ai-init</code> can prompt for.
          </span>
        </p>
        <p>
          <strong className="mono">{stats.inline}</strong>
          <span>
            <code>«lowercase»</code> tokens — filled inline, differently at each occurrence. Not
            listed below, because they are prose slots rather than a vocabulary.
          </span>
        </p>
        <p>
          <strong className="mono">{unregistered}</strong>
          <span>
            have no row in{' '}
            <Link href="/meta/placeholders/">
              <code>PLACEHOLDERS.md</code>
            </Link>
            . A doc still explains them where they are used, but <code>/ai-init</code> cannot
            prompt for what the glossary does not know.
          </span>
        </p>
      </div>

      <TokenTable rows={rows} />
    </div>
  );
}
