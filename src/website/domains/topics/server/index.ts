/**
 * `topics/server` — topic queries over the whole corpus. Node-only, because
 * `allDocs()` reads the repository. Not re-exported from the domain barrel.
 */
export { docsForTopic, docsForTopicByLayer, unfiledDocs, topicCounts } from './queries';
