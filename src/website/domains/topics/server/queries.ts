import { allDocs } from '@/domains/content/server';
import { LAYER_BY_ID, type Doc, type LayerId } from '@/domains/content';
import { TOPICS, TOPIC_OF, topicKey } from '../constants';
import { LAYER_ORDER } from '../grouping';
import type { TopicId } from '../types';

/**
 * The queries that start from the whole corpus. They call `allDocs()`, which
 * reads the repository off disk, so they are Node-only and live behind the
 * `/server` sub-entrypoint rather than the client-safe barrel.
 */

export function docsForTopic(id: TopicId): Doc[] {
  return allDocs()
    .filter((d) => TOPIC_OF.get(topicKey(d)) === id)
    .sort(
      (a, b) =>
        LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer) || a.name.localeCompare(b.name),
    );
}

/** Docs in a topic, split by layer, for a page that groups them under headings. */
export function docsForTopicByLayer(id: TopicId) {
  const groups = new Map<LayerId, Doc[]>();
  for (const doc of docsForTopic(id)) {
    const list = groups.get(doc.layer) ?? [];
    list.push(doc);
    groups.set(doc.layer, list);
  }
  return [...groups.entries()].map(([layerId, docs]) => ({
    layer: LAYER_BY_ID.get(layerId)!,
    docs,
  }));
}

/**
 * Anything the map has not been told about. The site is a *view* of the
 * library — adding a document upstream must never break the build — so an
 * unassigned doc shows up here and on /topics rather than throwing.
 */
export function unfiledDocs(): Doc[] {
  return allDocs().filter((d) => d.layer !== 'guides' && !TOPIC_OF.has(topicKey(d)));
}

export function topicCounts(): Record<TopicId, number> {
  const counts = Object.fromEntries(TOPICS.map((t) => [t.id, 0])) as Record<TopicId, number>;
  for (const doc of allDocs()) {
    const id = TOPIC_OF.get(topicKey(doc));
    if (id) counts[id] += 1;
  }
  return counts;
}
