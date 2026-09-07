'use client';

import { useEffect, useState } from 'react';
import { OPEN_EVENT } from '../../constants';

/** The masthead affordance. Separate so the palette itself stays unmounted. */
export function SearchButton() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.userAgent)), []);

  return (
    <button
      type="button"
      className="searchbutton"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label="Search the library"
    >
      <span className="searchbutton__icon mono" aria-hidden="true">
        ⌕
      </span>
      <span className="searchbutton__label">Search</span>
      <kbd className="mono">{mac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  );
}
