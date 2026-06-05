import { describe, expect, it } from "vitest";
import type { Layer } from "@deck.gl/core";
import type { VizLayerEntryV1, VizManifestV1 } from "../../src/features/viz/model";
import { boundsForTileGrid, renderDeckLayers } from "../../src/features/viz/deckgl/render";

function polygonCenterY(layer: Layer, index: number): number {
  const polygon = (layer as any).props.getPolygon(index) as Array<[number, number]>;
  const total = polygon.reduce((sum, [, y]) => sum + y, 0);
  return total / polygon.length;
}

function gridLayer(spaceId: "tile.hexOddR" | "tile.hexOddQ"): VizLayerEntryV1 {
  return {
    kind: "grid",
    layerKey: `test::terrain::${spaceId}::grid`,
    dataTypeKey: "terrain",
    stepId: "test.step",
    stepIndex: 0,
    spaceId,
    bounds: [0, 0, 2, 2],
    dims: { width: 2, height: 2 },
    field: {
      format: "u8",
      data: { kind: "inline", buffer: new Uint8Array([1, 2, 3, 4]).buffer },
    },
  };
}

describe("tile-space rendering orientation", () => {
  it.each(["tile.hexOddR", "tile.hexOddQ"] as const)("draws Civ row 0 north/up for %s", async (spaceId) => {
    const layer = gridLayer(spaceId);
    const manifest: VizManifestV1 = {
      runId: "test-run",
      outputRoot: "browser://viz",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };

    const result = await renderDeckLayers({
      manifest,
      layer,
      showEdgeOverlay: false,
    });
    const hexLayer = result.layers.find((candidate) => String(candidate.id).endsWith("::hex"));
    if (!hexLayer) throw new Error("missing rendered hex layer");

    const row0CenterY = polygonCenterY(hexLayer, 0);
    const row1CenterY = polygonCenterY(hexLayer, 2);
    expect(row0CenterY).toBeGreaterThan(row1CenterY);

    const [, minY, , maxY] = boundsForTileGrid(spaceId, layer.dims, 1);
    expect(minY).toBeLessThan(0);
    expect(maxY).toBeGreaterThan(0);
  });
});
