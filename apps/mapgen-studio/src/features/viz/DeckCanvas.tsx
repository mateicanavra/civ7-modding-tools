import { useMemo } from "react";
import { OrthographicView } from "@deck.gl/core";
import { DeckGL } from "@deck.gl/react";
import type { Layer } from "@deck.gl/core";

export type DeckCanvasProps = {
  deck: {
    layers: Layer[];
    viewState: any;
    onViewStateChange(next: any): void;
  };
  viewportSize: { width: number; height: number };
};

export function DeckCanvas(props: DeckCanvasProps) {
  const { deck, viewportSize } = props;
  const views = useMemo(() => new OrthographicView({ id: "ortho" }), []);

  if (!Number.isFinite(viewportSize.width) || !Number.isFinite(viewportSize.height)) {
    return null;
  }

  if (viewportSize.width <= 1 || viewportSize.height <= 1) {
    return null;
  }

  return (
    <DeckGL
      views={views}
      controller={true}
      viewState={deck.viewState}
      width={viewportSize.width}
      height={viewportSize.height}
      onViewStateChange={({ viewState }) => deck.onViewStateChange(viewState)}
      layers={deck.layers}
    />
  );
}
