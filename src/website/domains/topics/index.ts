/**
 * `topics` — the second navigation axis. Layer says what a file *is*; topic
 * says what job it is *for*. Client-safe: the assignment map and the grouping
 * helpers need no filesystem.
 *
 * The domain has no components of its own — it is data and the functions over
 * it. Corpus-wide queries are in `./server`, which this barrel does not carry.
 */
export { TOPICS, TOPIC_BY_ID, ASSIGNED, topicOf, topicKey } from './constants';
export { groupByTopic, LAYER_ORDER } from './grouping';
export type { Topic, TopicId } from './types';
