import { allDocs, LAYER_BY_ID, type Doc, type LayerId } from '@/lib/content';

/**
 * Layers are the library's own taxonomy: they say what a file *is* (a playbook
 * you run, a doc you fill) and where a deployed copy lands. They do not say
 * what a file is *for*, which is the only question a reader arrives with.
 *
 * So: a second axis. A topic is a job — "secure it", "launch it" — and it cuts
 * across every layer, because doing one of these jobs means running a manager,
 * filling two runbooks, invoking a command and letting a skill watch the diff.
 * Layer answers "how do I use this file"; topic answers "which file do I want".
 *
 * The assignment is deliberately hand-written. Deriving it from keywords put
 * EMAIL_DELIVERABILITY under security (SPF, DKIM) and PRIVACY_CONTRACT_TEST
 * under testing, which is where neither belongs. Each doc gets exactly ONE
 * topic — its primary job — so that navigation is deterministic and a document
 * appears once. Genuine second homes are already covered by the relations
 * panel, which is derived from the documents' own cross-references.
 */

export type TopicId =
  | 'setup'
  | 'agent'
  | 'ship'
  | 'secure'
  | 'legal'
  | 'money'
  | 'operate'
  | 'discover'
  | 'launch'
  | 'interface'
  | 'docs';

export type Topic = {
  id: TopicId;
  label: string;
  /** The reader's question, in their words. */
  question: string;
  /** What doing this job actually involves. */
  blurb: string;
  accent: string;
  accentDark: string;
};

export const TOPICS: Topic[] = [
  {
    id: 'setup',
    label: 'Set up a repo',
    question: 'I am starting, or someone new is joining.',
    blurb:
      'The first hour: what the agent is told about your product, where the tokens are defined, and how a new developer gets to a green build without asking anyone.',
    accent: '#1c5570',
    accentDark: '#6fb6d8',
  },
  {
    id: 'agent',
    label: 'Work with the agent',
    question: 'How much do I let it do on its own?',
    blurb:
      'The permission boundary and what sits behind it — what the agent may run unattended, what it must hand back, how a session ends without losing what it learned.',
    accent: '#553a8b',
    accentDark: '#b3a0e8',
  },
  {
    id: 'ship',
    label: 'Ship code safely',
    question: 'What has to be true before this merges?',
    blurb:
      'The pre-merge gate, the branch flow, and the tests. Including the one skill that knows your passing test may be asserting nothing at all.',
    accent: '#2c5a3d',
    accentDark: '#79bd93',
  },
  {
    id: 'secure',
    label: 'Secure it',
    question: 'Where is this going to leak?',
    blurb:
      'Auth tiers, secrets and their rotation, env access, webhook signatures. Four of the eight skills live here, because these are the mistakes you make without noticing.',
    accent: '#a32d1c',
    accentDark: '#f08a72',
  },
  {
    id: 'legal',
    label: 'Stay legal and private',
    question: 'Am I allowed to hold this data, or take this money?',
    blurb:
      'GDPR and Article 9, the payment-institution custody boundary, and two patterns that make a legal claim fail the build rather than fail in court.',
    accent: '#7d4360',
    accentDark: '#d792b3',
  },
  {
    id: 'money',
    label: 'Make the numbers work',
    question: 'Does this survive contact with a spreadsheet?',
    blurb:
      'Pricing, fees, vendor costs and the running bill — plus the calculator that tells you which assumption, off by half, kills the model.',
    accent: '#6f5316',
    accentDark: '#d4b45f',
  },
  {
    id: 'operate',
    label: 'Run it in production',
    question: 'It is live. Now what breaks, and how do I know?',
    blurb:
      'Observability, incident triage, backups you have actually restored from, and the ten-minute weekday check that catches the rest.',
    accent: '#8a4a1e',
    accentDark: '#e09a5c',
  },
  {
    id: 'discover',
    label: 'Find product-market fit',
    question: 'Is anyone actually going to want this?',
    blurb:
      'The north star and the metrics under it, the kill/iterate/expand bands committed before the first user, and the interview that discounts polite signal.',
    accent: '#2a5f63',
    accentDark: '#6cc0c6',
  },
  {
    id: 'launch',
    label: 'Launch and grow',
    question: 'How do the first hundred people hear about it?',
    blurb:
      'The narrative, the channel matrix, the scored target list, and the email that has to land in an inbox rather than a spam folder.',
    accent: '#9a5b12',
    accentDark: '#e0a35c',
  },
  {
    id: 'interface',
    label: 'Design the interface',
    question: 'Does it look and behave like one product?',
    blurb:
      'Design tokens and the drift audit that catches their erosion, the accessibility target, the copy rules, and every locale you promised to support.',
    accent: '#494a55',
    accentDark: '#a9abbb',
  },
  {
    id: 'docs',
    label: 'Keep the docs true',
    question: 'How do I stop this rotting?',
    blurb:
      'The decision log, the RFC card, and the probe mechanism that regenerates a numeric claim from the code instead of trusting the number you typed last quarter.',
    accent: '#4a4437',
    accentDark: '#c2b9a4',
  },
];

export const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

/**
 * `layer/slug` → topic. Written out in full rather than inferred: the point of
 * this file is the editorial judgement, and a rule that gets 85% right leaves
 * the reader to discover the other 15% by being sent to the wrong place.
 */
const ASSIGNED: Record<TopicId, string[]> = {
  setup: [
    'managers/init',
    'managers/contributing',
    'managers/dev-onboarding',
    'managers/architecture',
    'managers/engineering-standards',
    'managers/product-context',
    'runbooks/claude-md',
    'runbooks/onboarding-pack',
    'runbooks/team-playbook',
    'runbooks/dev-portless',
    'runbooks/env-example-template',
    'runbooks/data-model-guide',
    'runbooks/features',
    'commands/ai-init',
    'meta/placeholders',
  ],
  agent: [
    'managers/ai-workflow',
    'runbooks/permissions-and-autonomy',
    'runbooks/session-migration',
    'runbooks/ai-prompt-registry',
    'commands/board',
    'config/settings-template',
    'agents/ceo',
    'agents/cfo',
    'agents/cpo',
    'agents/cto',
    'agents/template',
    'skills/template',
  ],
  ship: [
    'managers/testing-strategy',
    'managers/project',
    'runbooks/quality-assurance',
    'runbooks/release-manager',
    'runbooks/github-actions',
    'runbooks/pull-request-template',
    'runbooks/e2e',
    'runbooks/smoke-test',
    'runbooks/audit',
    'runbooks/pre-launch-checklist',
    'runbooks/project-plan',
    'commands/test',
    'commands/review',
    'commands/deploy-check',
    'commands/audit-structure',
    'skills/tests-that-cannot-fail',
    'skills/rationale-comments',
  ],
  secure: [
    'managers/security',
    'runbooks/security-model',
    'runbooks/secrets-rotation',
    'runbooks/env-tiered-access',
    'runbooks/webhook-idempotency-ledger',
    'commands/audit-api-routes',
    'skills/framework-defaults-are-permissive',
    'skills/ephemeral-credentials-on-stdin',
    'skills/claim-before-side-effect',
    'skills/never-throws-contract',
  ],
  legal: [
    'managers/payments-compliance',
    'runbooks/payments-compliance',
    'runbooks/gdpr-pre-launch-checklist',
    'runbooks/legal-risk',
    'runbooks/privacy-contract-test',
    'runbooks/schema-first-gdpr-avoidance',
    'runbooks/compile-time-legal-guards',
  ],
  money: [
    'runbooks/business-plan',
    'runbooks/pricing-strategy',
    'runbooks/payments-lifecycle',
    'runbooks/third-party',
    'runbooks/maintenance',
    'scripts/sensitivity-table',
    'scripts/readme',
  ],
  operate: [
    'managers/incident-response',
    'managers/performance',
    'managers/founder-ops',
    'runbooks/observability',
    'runbooks/incidents',
    'runbooks/triage-tree-runbook',
    'runbooks/backup-recovery',
    'runbooks/scaling',
    'runbooks/daily-ritual',
    'runbooks/weekly-retro',
    'runbooks/founder-dashboard',
    'runbooks/web-vitals-audit',
    'runbooks/cms-probe-scheduled',
    'commands/audit-performance',
  ],
  discover: [
    'managers/discovery',
    'managers/experiment',
    'runbooks/icp',
    'runbooks/north-star',
    'runbooks/metrics',
    'runbooks/activation-event',
    'runbooks/decision-thresholds',
    'runbooks/experiment-design',
    'runbooks/user-observation',
    'runbooks/roadmap',
    'runbooks/product-positioning',
    'runbooks/power-moves',
    'scripts/score-sean-ellis',
    'scripts/examples-pmf-responses-example',
  ],
  launch: [
    'managers/launch-gtm',
    'managers/seo',
    'managers/content-publishing',
    'runbooks/launch-narrative',
    'runbooks/launch-social',
    'runbooks/launch-target-list',
    'runbooks/outreach-templates',
    'runbooks/referral-mechanics',
    'runbooks/community-model',
    'runbooks/seo-audit',
    'runbooks/brand-voice-guideline',
    'runbooks/product-marketing-context',
    'runbooks/landing-site-template',
    'runbooks/emails-workflow',
    'runbooks/email-deliverability',
    'runbooks/email-qa-matrix',
    'commands/content-editor',
  ],
  interface: [
    'managers/design-system',
    'managers/design-review',
    'managers/a11y-audit',
    'managers/i18n',
    'runbooks/ux-principles',
    'runbooks/a11y-audit',
    'runbooks/translation-workflow',
    'runbooks/feature-spec',
    'commands/audit-design-system',
    'commands/web-interface-guidelines',
    'skills/layout-not-page-singletons',
  ],
  docs: [
    'managers/doc-freshness',
    'managers/decision-log',
    'runbooks/doc-freshness-probes',
    'runbooks/decision-log',
    'runbooks/rfc-template',
  ],
};

const TOPIC_OF = new Map<string, TopicId>();
for (const [topic, keys] of Object.entries(ASSIGNED) as [TopicId, string[]][]) {
  for (const key of keys) TOPIC_OF.set(key, topic);
}

const key = (doc: Doc) => `${doc.layer}/${doc.slug}`;

export function topicOf(doc: Doc): Topic | undefined {
  const id = TOPIC_OF.get(key(doc));
  return id ? TOPIC_BY_ID.get(id) : undefined;
}

/**
 * Docs in a topic, ordered by layer — manager first (the thing you run), then
 * the runbooks it produces, then the commands and the skills that watch. That
 * is the order you actually do the job in.
 */
const LAYER_ORDER: LayerId[] = [
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

export function docsForTopic(id: TopicId): Doc[] {
  return allDocs()
    .filter((d) => TOPIC_OF.get(key(d)) === id)
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
  return allDocs().filter((d) => d.layer !== 'guides' && !TOPIC_OF.has(key(d)));
}

export function topicCounts(): Record<TopicId, number> {
  const counts = Object.fromEntries(TOPICS.map((t) => [t.id, 0])) as Record<TopicId, number>;
  for (const doc of allDocs()) {
    const id = TOPIC_OF.get(key(doc));
    if (id) counts[id] += 1;
  }
  return counts;
}

/**
 * Layer page grouping: a 74-row alphabetical list is a wall, not an index.
 * A null topic is the unfiled bucket — it has no page to link to, so callers
 * render it as a plain heading rather than inventing a route for it.
 */
export function groupByTopic(docs: Doc[]): { topic: Topic | null; docs: Doc[] }[] {
  const groups = new Map<TopicId, Doc[]>();
  const loose: Doc[] = [];
  for (const doc of docs) {
    const id = TOPIC_OF.get(key(doc));
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
