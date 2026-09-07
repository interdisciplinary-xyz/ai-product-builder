export const STORAGE_KEY = 'apb:devbar';

/** The stylesheet's own breakpoints, narrowest first. */
export const BANDS = [
  { rem: 34, label: '<34' },
  { rem: 40, label: '34–40' },
  { rem: 52, label: '40–52' },
  { rem: 60, label: '52–60' },
  { rem: 62, label: '60–62' },
  { rem: 90, label: '62–90' },
];

export function bandFor(rem: number): string {
  for (const band of BANDS) if (rem < band.rem) return band.label;
  return '≥90';
}
