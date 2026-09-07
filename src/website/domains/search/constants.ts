/**
 * The palette is mounted in the layout and the button lives in the masthead —
 * two different trees, so they meet on a custom event rather than through a
 * provider that would have to wrap the whole site to serve one keystroke.
 */
export const OPEN_EVENT = 'apb:open-palette';
