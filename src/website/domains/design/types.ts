export type Token = {
  name: string;
  light: string;
  /** The dark-scheme override, when the token has one. */
  dark: string | null;
  /** The comment standing above it in the stylesheet, if any. */
  note: string | null;
};

export type TokenGroup = {
  id: string;
  label: string;
  blurb: string;
  tokens: Token[];
};
