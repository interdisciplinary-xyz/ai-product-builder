import type { Doc, LayerId } from '@/domains/content';
import { TOPICS, TOPIC_OF, topicKey } from './constants';
import type { Topic, TopicId } from './types';

/**
 * Grouping that needs only the documents it is handed — no filesystem — so it
 * is part of the client-safe surface. The queries that start from the whole
 * corpus live in `./server`, because `allDocs()` reads the repo.
 */

/**
 * Docs in a topic, ordered by layer — manager first (the thing you run), then
 * the runbooks it produces, then the commands and the skills that watch. That
 * is the order you actually do the job in.
 */
export const LAYER_ORDER: LayerId[] = [
  'managers',
  'runbooks',
  'commands',
  'skills',
  'agents',
  'scripts',
  'config',
  'meta',
  'guides',
];

/**
 * Layer page grouping: a 74-row alphabetical list is a wall, not an index.
 * A null topic is the unfiled bucket — it has no page to link to, so callers
 * render it as a plain heading rather than inventing a route for it.
 */
export function groupByTopic(docs: Doc[]): { topic: Topic | null; docs: Doc[] }[] {
  const groups = new Map<TopicId, Doc[]>();
  const loose: Doc[] = [];
  for (const doc of docs) {
    const id = TOPIC_OF.get(topicKey(doc));
    if (!id) {
      loose.push(doc);
      continue;
    }
    const list = groups.get(id) ?? [];
    list.push(doc);
    groups.set(id, list);
  }
  const ordered: { topic: Topic | null; docs: Doc[] }[] = TOPICS.filter((t) =>
    groups.has(t.id),
  ).map((t) => ({ topic: t, docs: groups.get(t.id)! }));
  if (loose.length) ordered.push({ topic: null, docs: loose });
  return ordered;
}
