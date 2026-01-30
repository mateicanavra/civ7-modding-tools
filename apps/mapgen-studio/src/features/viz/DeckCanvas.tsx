import { OrthographicView } from '@deck.gl/core';
import type { Layer } from '@deck.gl/core';
import { DeckGL } from '@deck.gl/react';
import { useCallback, useMemo } from 'react';

export type DeckCanvasProps = {
  deck: {
    layers: Layer[];
    viewState: any;
    onViewStateChange(next: any): void;
  };
};

export function DeckCanvas(props: DeckCanvasProps) {
  const { deck } = props;
  const views = useMemo(() => new OrthographicView({ id: 'ortho' }), []);
  const onViewStateChange = useCallback(
    ({ viewState }: { viewState: any }) => deck.onViewStateChange(viewState),
    [deck]
  );
  return (
    <DeckGL
      views={views}
      controller={true}
      viewState={deck.viewState}
      onViewStateChange={onViewStateChange}
      layers={deck.layers}
    />
  );
}
