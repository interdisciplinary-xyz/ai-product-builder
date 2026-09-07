/**
 * The topic axis, as data.
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
