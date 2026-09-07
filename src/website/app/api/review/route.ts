import { writeReviews } from '@/domains/review/server';

/**
 * PUT only, and only where a server exists.
 *
 * `output: 'export'` is set for production builds, which drops this route from
 * `out/` — so a built copy is a read-only record of the pass as committed. The
 * client checks the same condition and disables the pickers rather than letting
 * a verdict quietly go nowhere.
 *
 * There is no GET for the reason the favorites route records: under
 * `output: 'export'` a GET must declare `dynamic = "force-static"`, and a
 * review pass frozen at build time is not a GET worth having. Reads happen in
 * `app/review/layout.tsx`, which is a plain file read on the server.
 */
export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const reviews = (body as { reviews?: unknown })?.reviews;
  if (!reviews || typeof reviews !== 'object' || Array.isArray(reviews)) {
    return Response.json(
      { error: 'Expected { reviews: Record<string, { verdict, note?, at }> }.' },
      { status: 400 },
    );
  }

  try {
    return Response.json(writeReviews(reviews));
  } catch (error) {
    return Response.json(
      { error: `Could not write data/reviews.json: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
