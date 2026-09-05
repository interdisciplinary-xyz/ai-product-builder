import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LAYERS, LAYER_BY_ID, docsForLayer, type LayerId } from '@/lib/content';
import { DocEntry, Ledger, PageHead, layerStyle } from '@/components/ui';
import { LayerIcon } from '@/components/icons';

export function generateStaticParams() {
  return LAYERS.map((layer) => ({ layer: layer.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layer: string }>;
}): Promise<Metadata> {
  const layer = LAYER_BY_ID.get((await params).layer as LayerId);
  if (!layer) return {};
  return { title: layer.label, description: layer.blurb };
}

export default async function LayerPage({ params }: { params: Promise<{ layer: string }> }) {
  const id = (await params).layer as LayerId;
  const layer = LAYER_BY_ID.get(id);
  if (!layer) notFound();

  const docs = docsForLayer(id);

  return (
    <div className="shell" data-layer={id} style={layerStyle(layer)}>
      <PageHead
        eyebrow={`${docs.length} files · deployed to ${layer.target}`}
        title={
          <>
            <LayerIcon layer={id} className="pagehead__icon" /> {layer.label}
          </>
        }
        lede={layer.blurb}
      />
      <Ledger>
        {docs.map((doc, i) => (
          <DocEntry key={doc.slug} doc={doc} index={i} />
        ))}
      </Ledger>
    </div>
  );
}

export const dynamicParams = false;
