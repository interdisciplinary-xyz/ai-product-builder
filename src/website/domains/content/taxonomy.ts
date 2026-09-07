import type { CSSProperties } from 'react';
import { accentStyle } from '@/domains/ui';
import { LAYER_BY_ID } from './constants';
import type { Doc, Layer, LayerId } from './types';

/**
 * Pure functions over the taxonomy — no filesystem, so they are part of the
 * client-safe surface.
 */

export function slugify(value: string): string {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[/_.\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Where a deployed copy lands. Gluing layer.target to deployedAs blindly
 * produced ".claude/settings.json.claude/settings.json" and
 * ".claude/commands//board" — the catalog's "Deployed as" cell is a full path
 * for config and an invocation for commands, not always a bare filename.
 */
export function deployedPath(doc: Doc, layer: Layer): string {
  const name = doc.deployedAs;
  if (!name) return layer.target;
  if (name.startsWith('/')) return name; // a slash-command, not a path
  if (!layer.target.endsWith('/')) return name; // target is itself the file
  return `${layer.target}${name}`;
}

/** Each layer paints its own accent; the light/dark pair resolves in CSS. */
export function layerStyle(layer: Layer | undefined): CSSProperties {
  return accentStyle(layer);
}

/** The route a document lives at on this site. */
export function docHref(doc: Pick<Doc, 'layer' | 'slug'>): string {
  return `/${doc.layer}/${doc.slug}/`;
}

/** The accent pair for a layer, for components that paint one. */
export function layerAccent(id: LayerId | undefined) {
  return id ? LAYER_BY_ID.get(id) : undefined;
}
