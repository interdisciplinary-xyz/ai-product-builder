import type { ReactNode } from 'react';
import { Link } from '../link';
import { accentStyle, RISE_MAX_STEPS, RISE_STEP_MS } from '../../constants';
import type { Accent } from '../../types';

/**
 * One card-catalog row. The whole site is built out of these.
 *
 * It takes an accent, a glyph and a `tone` string rather than a LayerId: the
 * card is a shape, and `ui` is the base leaf — the moment it looks a layer up
 * in a table it can no longer be the thing every other domain depends on.
 * `content` supplies the taxonomy in DocEntry.
 */
export function Entry({
  href,
  name,
  description,
  meta,
  tone,
  accent,
  icon,
  index,
}: {
  href: string;
  name: string;
  description?: string | null;
  meta?: (string | null | undefined)[];
  /** Written out as `data-layer`, which is what the stylesheet keys on. */
  tone?: string;
  accent?: Accent;
  icon?: ReactNode;
  index?: number;
}) {
  const shown = (meta ?? []).filter(Boolean) as string[];
  return (
    <li>
      <Link
        href={href}
        className="entry rise"
        data-layer={tone}
        style={{
          ...accentStyle(accent),
          animationDelay:
            index === undefined ? undefined : `${Math.min(index, RISE_MAX_STEPS) * RISE_STEP_MS}ms`,
        }}
      >
        <span className="entry__icon">{icon}</span>
        <span className="entry__main">
          <span className="entry__name">{name}</span>
          {description ? <span className="entry__desc">{description}</span> : null}
        </span>
        {shown.length ? (
          <span className="entry__meta">
            {shown.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
