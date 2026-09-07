/**
 * A monoline set drawn to one spec: 24×24 box, 1.5 stroke, round caps, no fill,
 * currentColor throughout. The library's own README uses emoji per layer; emoji
 * render differently on every platform and drag full-colour cartoons into an
 * otherwise two-ink page, so the site draws its own.
 *
 * The spec lives here, in the base leaf. The glyphs that mean something to the
 * library — one per layer — are drawn in `content`, which owns that taxonomy.
 */
export const ICON_SPEC = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
  focusable: 'false' as const,
};

export type DoorName = 'evaluate' | 'adopt' | 'best';
