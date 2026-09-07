import { Link } from '@/domains/ui';
import { LAYER_BY_ID } from '../../constants';
import { layerStyle } from '../../taxonomy';
import type { LayerId } from '../../types';

export function LayerChip({ id, label }: { id: LayerId; label?: string }) {
  const layer = LAYER_BY_ID.get(id);
  if (!layer) return null;
  return (
    <Link href={`/${id}/`} className="chip" data-layer={id} style={layerStyle(layer)}>
      {label ?? layer.label}
    </Link>
  );
}
