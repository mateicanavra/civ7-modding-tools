import type { VizLayerEntryV2, VizManifestV2 } from "@swooper/mapgen-viz";
import { describe, expect, it } from "vitest";
import { renderDeckLayers } from "../../src/features/viz/deckgl/render";

const BASE: Pick<
  VizLayerEntryV2,
  "dataTypeKey" | "stepId" | "stageId" | "stepIndex" | "spaceId" | "bounds"
> = {
  dataTypeKey: "test.binary",
  stepId: "test.step",
  stageId: "test-stage",
  stepIndex: 0,
  spaceId: "tile.hexOddQ",
  bounds: [0, 0, 2, 1],
};

function manifestFor(layer: VizLayerEntryV2): VizManifestV2 {
  return {
    version: 2,
    runId: "test-run",
    planFingerprint: "test-plan",
    steps: [{ stepId: BASE.stepId, stageId: BASE.stageId, stepIndex: BASE.stepIndex }],
    layers: [layer],
  };
}

describe("serialized visualization binary loading", () => {
  it("refuses a truncated replay grid before constructing a typed view", async () => {
    const layer: VizLayerEntryV2 = {
      ...BASE,
      kind: "grid",
      layerKey: "test-grid",
      dims: { width: 2, height: 1 },
      field: { format: "u16", data: { kind: "path", path: "test-grid.bin" } },
    };

    await expect(
      renderDeckLayers({
        manifest: manifestFor(layer),
        layer,
        showEdgeOverlay: false,
        assetResolver: {
          readArrayBuffer: async () => new Uint16Array([1]).buffer,
        },
      })
    ).rejects.toThrow("requires exactly 4 bytes");
  });

  it.each([
    {
      label: "grid-fields values",
      expectedBytes: 2,
      layer: {
        ...BASE,
        kind: "gridFields",
        layerKey: "test-grid-fields",
        dims: { width: 2, height: 1 },
        fields: {
          density: {
            format: "u8",
            data: { kind: "inline", buffer: new Uint8Array([1]).buffer },
          },
        },
      },
    },
    {
      label: "point geometry",
      expectedBytes: 16,
      layer: {
        ...BASE,
        kind: "points",
        layerKey: "test-points-geometry",
        count: 2,
        positions: { kind: "inline", buffer: new Float32Array([0, 0, 1]).buffer },
      },
    },
    {
      label: "point values",
      expectedBytes: 2,
      layer: {
        ...BASE,
        kind: "points",
        layerKey: "test-points-values",
        count: 2,
        positions: { kind: "inline", buffer: new Float32Array([0, 0, 1, 1]).buffer },
        values: {
          format: "u8",
          data: { kind: "inline", buffer: new Uint8Array([1]).buffer },
        },
      },
    },
    {
      label: "segment geometry",
      expectedBytes: 16,
      layer: {
        ...BASE,
        kind: "segments",
        layerKey: "test-segments-geometry",
        count: 1,
        segments: { kind: "inline", buffer: new Float32Array([0, 0, 1]).buffer },
      },
    },
    {
      label: "segment values",
      expectedBytes: 4,
      layer: {
        ...BASE,
        kind: "segments",
        layerKey: "test-segments-values",
        count: 1,
        segments: { kind: "inline", buffer: new Float32Array([0, 0, 1, 1]).buffer },
        values: {
          format: "f32",
          data: { kind: "inline", buffer: new Float32Array(0).buffer },
        },
      },
    },
  ] as const)("refuses malformed $label", async ({ layer, expectedBytes }) => {
    const typedLayer = layer as VizLayerEntryV2;
    await expect(
      renderDeckLayers({
        manifest: manifestFor(typedLayer),
        layer: typedLayer,
        showEdgeOverlay: false,
      })
    ).rejects.toThrow(`requires exactly ${expectedBytes} bytes`);
  });
});
