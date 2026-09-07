import { Icon } from '@/domains/ui';
import { LAYER_PATHS } from './layer-icon.constants';
import type { LayerId } from '../../types';

export function LayerIcon({ layer, className }: { layer: LayerId; className?: string }) {
  return <Icon className={className}>{LAYER_PATHS[layer]}</Icon>;
}
