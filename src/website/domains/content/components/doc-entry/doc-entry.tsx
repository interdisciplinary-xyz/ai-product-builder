import { Entry } from '@/domains/ui';
import { LayerIcon } from '../layer-icon';
import { LAYER_BY_ID } from '../../constants';
import { docHref } from '../../taxonomy';
import type { Doc } from '../../types';

/**
 * A library document as a card-catalog row: `ui`'s Entry, plus the three things
 * only this domain knows — which glyph the layer draws, which accent it paints,
 * and where a filled copy of the document ends up.
 */
export function DocEntry({ doc, index }: { doc: Doc; index?: number }) {
  return (
    <Entry
      href={docHref(doc)}
      name={doc.name}
      description={doc.description ?? doc.heading}
      meta={[
        doc.deployedAs ? `→ ${doc.deployedAs}` : null,
        doc.words > 400 ? `${Math.round(doc.words / 220)} min read` : null,
      ]}
      tone={doc.layer}
      accent={LAYER_BY_ID.get(doc.layer)}
      icon={<LayerIcon layer={doc.layer} />}
      index={index}
    />
  );
}
