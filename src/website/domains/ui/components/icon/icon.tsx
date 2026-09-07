import type { ReactNode } from 'react';
import { ICON_SPEC, type DoorName } from './icon.constants';

/** Wraps any path set in the one icon spec, so nothing draws off-grid. */
export function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg {...ICON_SPEC} className={className ? `icon ${className}` : 'icon'}>
      {children}
    </svg>
  );
}

/** The three "start here" doors, same spec. */
export function DoorIcon({ name }: { name: DoorName }) {
  return (
    <Icon>
      {name === 'evaluate' ? (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 21 21" />
        </>
      ) : name === 'adopt' ? (
        <>
          <path d="M12 3c3 2.2 4.8 5.6 4.8 9.4L12 17l-4.8-4.6C7.2 8.6 9 5.2 12 3Z" />
          <circle cx="12" cy="10" r="1.8" />
          <path d="M9 18.5c-.8 1-1 2.5-1 2.5s1.5-.2 2.5-1M15 18.5c.8 1 1 2.5 1 2.5s-1.5-.2-2.5-1" />
        </>
      ) : (
        <>
          <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
          <path d="M3 9h18M9.5 4 7.5 9l4.5 11 4.5-11-2-5" />
        </>
      )}
    </Icon>
  );
}
