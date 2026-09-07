import { writeFavorites } from '@/domains/favorites/server';

/**
 * The endpoint exists only when a server does. `output: 'export'` is set for
 * production builds, which drops this route from `out/` — so in a built,
 * statically hosted copy of the site the favorites are read-only, seeded from
 * the file that was committed at build time. The client checks NODE_ENV and
 * says so rather than letting a click quietly do nothing.
 *
 * PUT only, deliberately. A `GET` here fails the production build outright —
 * `output: 'export'` demands `dynamic = "force-static"` on any route it has to
 * collect page data for, and a favorites list that is frozen at build time is
 * not a GET worth having. Reads come from `readFavorites()` in the layout,
 * which is a plain file read on the server and needs no route at all.
 */
export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const keys = (body as { favorites?: unknown })?.favorites;
  if (!Array.isArray(keys)) {
    return Response.json({ error: 'Expected { favorites: string[] }.' }, { status: 400 });
  }

  try {
    return Response.json(writeFavorites(keys));
  } catch (error) {
    // A read-only checkout, or a permissions problem. Say which, because the
    // alternative is a star that looks saved and is not.
    return Response.json(
      { error: `Could not write data/favorites.json: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
