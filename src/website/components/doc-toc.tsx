'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A 3,000-word runbook is a long scroll; the section list alone doesn't say
 * where you are in it.
 *
 * Offsets are measured once (and on resize) so the scroll handler is pure
 * arithmetic — reading getBoundingClientRect per heading per scroll tick forces
 * a layout each time, which is exactly the thrash that shows up as jank on a
 * 14,000px page.
 */
export function DocToc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const [progress, setProgress] = useState(0);
  const offsets = useRef<{ id: string; top: number }[]>([]);
  const frame = useRef(0);

  useEffect(() => {
    const measure = () => {
      offsets.current = headings
        .map((h) => {
          const el = document.getElementById(h.id);
          return el ? { id: h.id, top: el.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter((v): v is { id: string; top: number } => v !== null);
      update();
    };

    const update = () => {
      const line = window.scrollY + 120;
      let current = offsets.current[0]?.id ?? null;
      for (const entry of offsets.current) {
        if (entry.top <= line) current = entry.id;
        else break;
      }
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        update();
      });
    };

    measure();
    // Fonts land after first paint and move every heading.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [headings]);

  return (
    <aside className="toc" aria-label="On this page">
      <p className="eyebrow">
        On this page
        <span className="toc__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </p>
      <ol>
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} aria-current={active === h.id ? 'true' : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
