import { OrthographicView } from "@deck.gl/core";
import { DeckGL } from "@deck.gl/react";
import type { Layer } from "@deck.gl/core";

export type DeckCanvasProps = {
  deck: {
    layers: Layer[];
    viewState: any;
    onViewStateChange(next: any): void;
  };
};

export function DeckCanvas(props: DeckCanvasProps) {
  const { deck } = props;
  return (
    <DeckGL
      views={new OrthographicView({ id: "ortho" })}
      controller={true}
      viewState={deck.viewState}
      onViewStateChange={({ viewState }) => deck.onViewStateChange(viewState)}
      layers={deck.layers}
    />
  );
}
