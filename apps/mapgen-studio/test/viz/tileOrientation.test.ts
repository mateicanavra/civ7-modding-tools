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

  // Orientation contract (Pass-5 tile-orientation spec): row-offset (odd-R)
  // lattices are pointy-top — a vertex sits straight above the center; the
  // column-offset (odd-Q) lattice is flat-top — a vertex sits straight to
  // the center's right (at 2/√3·size: the canonical-lattice tiling hex), and
  // never straight above.
  it.each([
    ["tile.hexOddR", "pointy"],
    ["tile.hexOddQ", "flat"],
  ] as const)("renders %s as %s-top hexes", async (spaceId, orientation) => {
    const layer = gridLayer(spaceId);
    const manifest: VizManifestV1 = {
      runId: "test-run",
      outputRoot: "browser://viz",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = result.layers.find((candidate) => String(candidate.id).endsWith("::hex"));
    if (!hexLayer) throw new Error("missing rendered hex layer");

    const polygon = (hexLayer as any).props.getPolygon(0) as Array<[number, number]>;
    const [cx, cy] = polygon
      .reduce(([sx, sy], [x, y]) => [sx + x, sy + y], [0, 0])
      .map((v) => v / polygon.length);
    const hasVertexAbove = polygon.some(([x, y]) => Math.abs(x - cx) < 1e-6 && Math.abs(y - cy - 1) < 1e-6);
    const hasVertexRight = polygon.some(
      ([x, y]) => Math.abs(y - cy) < 1e-6 && Math.abs(x - cx - 2 / Math.sqrt(3)) < 1e-6
    );
    if (orientation === "pointy") {
      expect(hasVertexAbove).toBe(true);
      expect(hasVertexRight).toBe(false);
    } else {
      expect(hasVertexRight).toBe(true);
      expect(hasVertexAbove).toBe(false);
    }
  });

  // The odd-Q lattice must match mapgen-core's canonical hex space
  // (`projectOddqToHexSpace`): columns √3·size apart in x, odd columns
  // dropped 0.75·size — the frame the Delaunay mesh (world.xy) lives in, so
  // tile layers co-register with mesh layers.
  it("places odd-Q tiles on the canonical hex-space lattice", async () => {
    const layer = gridLayer("tile.hexOddQ");
    const manifest: VizManifestV1 = {
      runId: "test-run",
      outputRoot: "browser://viz",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = result.layers.find((candidate) => String(candidate.id).endsWith("::hex"));
    if (!hexLayer) throw new Error("missing rendered hex layer");

    const centerOf = (index: number): [number, number] => {
      const polygon = (hexLayer as any).props.getPolygon(index) as Array<[number, number]>;
      const [sx, sy] = polygon.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0]);
      return [sx / polygon.length, sy / polygon.length];
    };

    // Tiles 0 and 1 are columns 0 and 1 of row 0; tile 2 is row 1 column 0.
    const [c0x, c0y] = centerOf(0);
    const [c1x, c1y] = centerOf(1);
    const [, c2y] = centerOf(2);
    expect(c1x - c0x).toBeCloseTo(Math.sqrt(3), 6);
    expect(c0y - c1y).toBeCloseTo(0.75, 6); // odd column drops (north-up flipped)
    expect(c0y - c2y).toBeCloseTo(1.5, 6); // row pitch
  });

  it("renders noData tiles fully transparent — no fill, no border (mesh contract)", async () => {
    const layer: VizLayerEntryV1 = {
      ...gridLayer("tile.hexOddR"),
      field: {
        format: "u8",
        data: { kind: "inline", buffer: new Uint8Array([1, 255, 3, 4]).buffer },
        valueSpec: { noData: { kind: "value", value: 255 } },
      },
    };
    const manifest: VizManifestV1 = {
      runId: "test-run",
      outputRoot: "browser://viz",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = result.layers.find((candidate) => String(candidate.id).endsWith("::hex"));
    if (!hexLayer) throw new Error("missing rendered hex layer");

    const fill = (hexLayer as any).props.getFillColor(1) as number[];
    const line = (hexLayer as any).props.getLineColor(1) as number[];
    expect(fill[3]).toBe(0);
    expect(line[3]).toBe(0);

    // A filled neighbor keeps its border (the shared tile ink).
    const filledLine = (hexLayer as any).props.getLineColor(0) as number[];
    expect(filledLine[3]).toBeGreaterThan(0);
  });
});
