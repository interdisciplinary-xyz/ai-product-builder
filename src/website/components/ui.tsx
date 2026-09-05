import Link from 'next/link';
import type { CSSProperties } from 'react';
import { LAYER_BY_ID, type Doc, type Layer, type LayerId } from '@/lib/content';

/** Each layer paints its own accent; the light/dark pair resolves in CSS. */
export function layerStyle(layer: Layer | undefined): CSSProperties {
  return {
    ['--layer-light' as string]: layer?.accent ?? 'var(--accent)',
    ['--layer-dark' as string]: layer?.accentDark ?? 'var(--accent)',
  };
}

export function LayerChip({ id, label }: { id: LayerId; label?: string }) {
  const layer = LAYER_BY_ID.get(id);
  if (!layer) return null;
  return (
    <Link href={`/${id}/`} className="chip" data-layer={id} style={layerStyle(layer)}>
      {label ?? layer.label}
    </Link>
  );
}

/** One card-catalog row. The whole site is built out of these. */
export function Entry({
  href,
  icon,
  name,
  description,
  meta,
  layerId,
  index,
}: {
  href: string;
  icon: string;
  name: string;
  description?: string | null;
  meta?: (string | null | undefined)[];
  layerId?: LayerId;
  index?: number;
}) {
  const layer = layerId ? LAYER_BY_ID.get(layerId) : undefined;
  const shown = (meta ?? []).filter(Boolean) as string[];
  return (
    <Link
      href={href}
      className="entry rise"
      data-layer={layerId}
      style={{
        ...layerStyle(layer),
        animationDelay: index === undefined ? undefined : `${Math.min(index, 14) * 22}ms`,
      }}
    >
      <span className="entry__icon" aria-hidden="true">
        {icon}
      </span>
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
  );
}

export function DocEntry({ doc, index }: { doc: Doc; index?: number }) {
  const layer = LAYER_BY_ID.get(doc.layer);
  return (
    <Entry
      href={`/${doc.layer}/${doc.slug}/`}
      icon={layer?.icon ?? '·'}
      name={doc.name}
      description={doc.description ?? doc.heading}
      meta={[
        doc.deployedAs ? `→ ${doc.deployedAs}` : null,
        doc.words > 400 ? `${Math.round(doc.words / 220)} min read` : null,
      ]}
      layerId={doc.layer}
      index={index}
    />
  );
}

export function PageHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="pagehead rise">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display pagehead__title">{title}</h1>
      {lede ? <p className="pagehead__lede">{lede}</p> : null}
      {children}
    </div>
  );
}
