'use client';

import { useEffect, useState } from 'react';

/**
 * A 3,000-word runbook is a long scroll. The list of sections alone doesn't say
 * where you are in it — this tracks the heading you're currently reading.
 */
export function DocToc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

    // Whichever heading last crossed the top band is the one being read.
    const observer = new IntersectionObserver(
      () => {
        const line = window.scrollY + 120;
        let current = targets[0];
        for (const el of targets) {
          if (el.getBoundingClientRect().top + window.scrollY <= line) current = el;
        }
        setActive(current.id);
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: [0, 1] },
    );
    targets.forEach((el) => observer.observe(el));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      const line = window.scrollY + 120;
      let current = targets[0];
      for (const el of targets) {
        if (el.getBoundingClientRect().top + window.scrollY <= line) current = el;
      }
      setActive(current.id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
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
