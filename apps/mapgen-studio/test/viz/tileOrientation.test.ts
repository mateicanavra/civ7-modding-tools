import type { Layer } from "@deck.gl/core";
import { describe, expect, it } from "vitest";
import { boundsForTileGrid, renderDeckLayers } from "../../src/features/viz/deckgl/render";
import type { VizLayerEntryV1, VizManifestV1 } from "../../src/features/viz/model";
import { TILE_BORDER_FILL_RATIO } from "../../src/features/viz/presentation";

type GridLayerEntry = Extract<VizLayerEntryV1, { kind: "grid" }>;
type HexLayerAccessors = {
  getPolygon(index: number): ReadonlyArray<readonly [number, number]>;
  getFillColor(index: number): readonly number[];
  getLineColor(index: number): readonly number[];
};

function isHexLayer(layer: Layer): layer is Layer<HexLayerAccessors> {
  const { props } = layer;
  return (
    "getPolygon" in props &&
    typeof props.getPolygon === "function" &&
    "getFillColor" in props &&
    typeof props.getFillColor === "function" &&
    "getLineColor" in props &&
    typeof props.getLineColor === "function"
  );
}

function requireHexLayer(layers: readonly Layer[]): Layer<HexLayerAccessors> {
  const layer = layers.find(
    (candidate): candidate is Layer<HexLayerAccessors> =>
      String(candidate.id).endsWith("::hex") && isHexLayer(candidate)
  );
  if (layer === undefined) throw new Error("missing rendered hex layer");
  return layer;
}

function polygonCenterY(layer: Layer<HexLayerAccessors>, index: number): number {
  const polygon = layer.props.getPolygon(index);
  const total = polygon.reduce((sum, [, y]) => sum + y, 0);
  return total / polygon.length;
}

function gridLayer(spaceId: "tile.hexOddR" | "tile.hexOddQ"): GridLayerEntry {
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
  it.each([
    "tile.hexOddR",
    "tile.hexOddQ",
  ] as const)("draws Civ row 0 north/up for %s", async (spaceId) => {
    const layer = gridLayer(spaceId);
    const manifest: VizManifestV1 = {
      version: 1,
      runId: "test-run",
      planFingerprint: "test-plan",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };

    const result = await renderDeckLayers({
      manifest,
      layer,
      showEdgeOverlay: false,
    });
    const hexLayer = requireHexLayer(result.layers);

    const row0CenterY = polygonCenterY(hexLayer, 0);
    const row1CenterY = polygonCenterY(hexLayer, 2);
    expect(row0CenterY).toBeGreaterThan(row1CenterY);

    const [, minY, , maxY] = boundsForTileGrid(spaceId, layer.dims, 1);
    expect(minY).toBeLessThan(0);
    expect(maxY).toBeGreaterThan(0);
  });

  // Orientation contract (Pass-5, retuned by the hex-convention audit —
  // docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md):
  // BOTH tile spaces render the GAME's plot geometry — regular pointy-top
  // hexes (a vertex straight above the center, none straight east) on a
  // row-offset odd-R lattice. `tile.hexOddQ` is a mislabel of that grid.
  it.each([
    "tile.hexOddR",
    "tile.hexOddQ",
  ] as const)("renders %s as regular pointy-top hexes (game geometry)", async (spaceId) => {
    const layer = gridLayer(spaceId);
    const manifest: VizManifestV1 = {
      version: 1,
      runId: "test-run",
      planFingerprint: "test-plan",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = requireHexLayer(result.layers);

    const polygon = hexLayer.props.getPolygon(0);
    const [cx, cy] = polygon
      .reduce(([sx, sy], [x, y]) => [sx + x, sy + y], [0, 0])
      .map((v) => v / polygon.length);
    // Regular pointy-top: a vertex exactly `size` above the center, and
    // every vertex exactly `size` away (no squash on any axis).
    const hasVertexAbove = polygon.some(
      ([x, y]) => Math.abs(x - cx) < 1e-6 && Math.abs(y - cy - 1) < 1e-6
    );
    const allUnitRadius = polygon.every(
      ([x, y]) => Math.abs(Math.hypot(x - cx, y - cy) - 1) < 1e-6
    );
    expect(hasVertexAbove).toBe(true);
    expect(allUnitRadius).toBe(true);
  });

  it.each([
    "tile.hexOddR",
    "tile.hexOddQ",
  ] as const)("places %s tiles on the game's row-offset lattice", async (spaceId) => {
    const layer = gridLayer(spaceId);
    const manifest: VizManifestV1 = {
      version: 1,
      runId: "test-run",
      planFingerprint: "test-plan",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = requireHexLayer(result.layers);

    const centerOf = (index: number): [number, number] => {
      const polygon = hexLayer.props.getPolygon(index);
      const [sx, sy] = polygon.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0]);
      return [sx / polygon.length, sy / polygon.length];
    };

    // Tiles 0 and 1 are columns 0 and 1 of row 0; tile 2 is row 1 col 0.
    const [c0x, c0y] = centerOf(0);
    const [c1x, c1y] = centerOf(1);
    const [c2x, c2y] = centerOf(2);
    expect(c1x - c0x).toBeCloseTo(Math.sqrt(3), 6); // column pitch
    expect(c1y - c0y).toBeCloseTo(0, 6); // same row, same y
    expect(c0y - c2y).toBeCloseTo(1.5, 6); // row pitch
    expect(c2x - c0x).toBeCloseTo(Math.sqrt(3) / 2, 6); // odd row shifts east
  });

  it("renders noData tiles fully transparent — no fill, no border (mesh contract)", async () => {
    const layer: GridLayerEntry = {
      ...gridLayer("tile.hexOddR"),
      field: {
        format: "u8",
        data: { kind: "inline", buffer: new Uint8Array([1, 255, 3, 4]).buffer },
        valueSpec: {
          scale: "linear",
          domain: { kind: "explicit", min: 0, max: 255 },
          noData: { kind: "sentinel", value: 255 },
        },
      },
    };
    const manifest: VizManifestV1 = {
      version: 1,
      runId: "test-run",
      planFingerprint: "test-plan",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = requireHexLayer(result.layers);

    const fill = hexLayer.props.getFillColor(1);
    const line = hexLayer.props.getLineColor(1);
    expect(fill[3]).toBe(0);
    expect(line[3]).toBe(0);

    // A filled neighbor keeps its border (the shared tile ink).
    const filledLine = hexLayer.props.getLineColor(0);
    expect(filledLine[3]).toBeGreaterThan(0);
  });

  it("grouts each filled tile with its OWN fill darkened (the one border rule)", async () => {
    const layer = gridLayer("tile.hexOddR");
    const manifest: VizManifestV1 = {
      version: 1,
      runId: "test-run",
      planFingerprint: "test-plan",
      steps: [{ stepId: "test.step", stepIndex: 0 }],
      layers: [layer],
    };
    const result = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });
    const hexLayer = requireHexLayer(result.layers);

    // The previous CONSTANT graphite ink matched the page substrate, so at
    // fit zoom the lattice dissolved into dots ("the grid disappeared" for
    // every tile layer). The border must now derive from the tile's fill —
    // strictly darker than it, fully opaque, and different per tile.
    for (const index of [0, 1]) {
      const fill = hexLayer.props.getFillColor(index);
      const line = hexLayer.props.getLineColor(index);
      expect(line[3]).toBe(255);
      for (const channel of [0, 1, 2]) {
        expect(line[channel]).toBe(Math.round((fill[channel] ?? 0) * TILE_BORDER_FILL_RATIO));
      }
    }
    const line0 = hexLayer.props.getLineColor(0);
    const line1 = hexLayer.props.getLineColor(1);
    expect(line0).not.toEqual(line1);
  });
});
