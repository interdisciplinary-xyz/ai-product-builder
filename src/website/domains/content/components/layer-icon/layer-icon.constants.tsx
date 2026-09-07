import type { ReactNode } from 'react';
import type { LayerId } from '../../types';

/**
 * One glyph per layer, drawn to the base spec in `@/domains/ui` (24×24, 1.5
 * stroke, round caps, currentColor). They live here rather than in `ui`
 * because the set is keyed by the library's own taxonomy: add a layer and this
 * map must gain a row, which is a `content` decision, not a `ui` one.
 */
export const LAYER_PATHS: Record<LayerId, ReactNode> = {
  // A console of sliders — a playbook you operate.
  managers: (
    <>
      <path d="M4 7h6M14 7h6M4 17h10M18 17h2" />
      <circle cx="12" cy="7" r="2" />
      <circle cx="16" cy="17" r="2" />
    </>
  ),
  // A bound book, open — the document you fill and live with.
  runbooks: (
    <>
      <path d="M12 6.5v13" />
      <path d="M12 6.5C10.5 5.2 8.6 4.7 5 4.7v12.6c3.6 0 5.5.5 7 1.8 1.5-1.3 3.4-1.8 7-1.8V4.7c-3.6 0-5.5.5-7 1.8Z" />
    </>
  ),
  // A prompt awaiting a slash-command.
  commands: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M7.5 10l2.5 2-2.5 2M13 14h3.5" />
    </>
  ),
  // A bolt: the layer that arrives without being called.
  skills: <path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.5h-5L13.5 3Z" />,
  // Two lenses, overlapping — four views of one question.
  agents: (
    <>
      <circle cx="9.5" cy="12" r="5.5" />
      <circle cx="14.5" cy="12" r="5.5" />
    </>
  ),
  // A keypad — the playbook that ends in a number.
  scripts: (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M8 7.5h8" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  // A shackle and body: the permission boundary.
  config: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  // A luggage tag — the «token» glossary.
  meta: (
    <>
      <path d="M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4Z" />
      <path d="M8 8h.01" />
    </>
  ),
  // A plain sheet — the repo's own front matter.
  guides: (
    <>
      <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z" />
      <path d="M13.5 3v5.5H19M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
};
