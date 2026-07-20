import type {
  VizLayerEntryV2,
  VizLayerMeta,
  VizManifestV2,
  VizScalarField,
} from "@swooper/mapgen-viz";
import { describe, expect, it } from "vitest";
import {
  renderDeckLayers,
  renderDeckLayersForSelection,
} from "../../src/features/viz/deckgl/render";
import {
  legendForLayer,
  resolveVizPalettePresentation,
  type VizPalettePresentation,
  writeColorForScalarValue,
} from "../../src/features/viz/presentation";

function renderColor(
  rawValue: number,
  palette: VizPalettePresentation,
  stats: Readonly<{ min: number; max: number }> = { min: 0, max: 1 },
  field?: VizScalarField
): number[] {
  const color = new Uint8ClampedArray(4);
  writeColorForScalarValue(color, 0, {
    rawValue,
    palette,
    field,
    stats,
  });
  return Array.from(color);
}

describe("resolved visualization palette presentation", () => {
  it("interpolates resolved continuous endpoints and intermediate stops", () => {
    const palette = resolveVizPalettePresentation({
      meta: {
        palette: {
          kind: "continuous",
          stops: [
            [10, 20, 30, 40],
            [110, 120, 130, 140],
          ],
        },
      },
      values: new Float32Array([0, 5, 10]),
    });

    expect(renderColor(0, palette, { min: 0, max: 10 })).toEqual([10, 20, 30, 40]);
    expect(renderColor(5, palette, { min: 0, max: 10 })).toEqual([60, 70, 80, 90]);
    expect(renderColor(10, palette, { min: 0, max: 10 })).toEqual([110, 120, 130, 140]);
  });

  it("assigns a resolved categorical pool to sorted observed ids deterministically", () => {
    const meta: VizLayerMeta = {
      palette: {
        kind: "categorical",
        colors: [
          [1, 2, 3, 255],
          [10, 20, 30, 255],
        ],
      },
    };
    const first = resolveVizPalettePresentation({
      meta,
      values: new Int16Array([5, 1, 3]),
    });
    const second = resolveVizPalettePresentation({
      meta,
      values: new Int16Array([3, 5, 1]),
    });

    expect(renderColor(1, first)).toEqual([1, 2, 3, 255]);
    expect(renderColor(3, first)).toEqual([10, 20, 30, 255]);
    expect(renderColor(5, first)).toEqual([1, 2, 3, 255]);
    expect(renderColor(1, second)).toEqual([1, 2, 3, 255]);
    expect(renderColor(3, second)).toEqual([10, 20, 30, 255]);
    expect(renderColor(5, second)).toEqual([1, 2, 3, 255]);
  });

  it("reserves transparency for explicit absence and keeps ordinary zero values visible", () => {
    const categorical = resolveVizPalettePresentation({
      meta: {
        palette: { kind: "categorical" },
        categories: [
          { value: 0, label: "Absent", color: [0, 0, 0, 0] },
          { value: 1, label: "Present", color: [34, 197, 94, 255] },
        ],
      },
      values: new Uint8Array([0, 1, 2]),
    });
    const continuous = resolveVizPalettePresentation({
      meta: {
        palette: {
          kind: "continuous",
          stops: [
            [9, 19, 29, 255],
            [109, 119, 129, 255],
          ],
        },
      },
      values: new Float32Array([0, 1]),
    });

    expect(renderColor(0, categorical)).toEqual([0, 0, 0, 0]);
    expect(renderColor(2, categorical)).toEqual([107, 114, 128, 230]);
    expect(renderColor(0, continuous)).toEqual([9, 19, 29, 255]);
    expect(renderColor(Number.NaN, continuous)).toEqual([0, 0, 0, 0]);

    const noData = new Uint8ClampedArray(4);
    writeColorForScalarValue(noData, 0, {
      rawValue: -1,
      palette: continuous,
      field: {
        format: "i8",
        data: { kind: "inline", buffer: new Int8Array([-1]).buffer },
        valueSpec: {
          scale: "linear",
          domain: { kind: "explicit", min: 0, max: 1 },
          noData: { kind: "sentinel", value: -1 },
        },
      },
    });
    expect(Array.from(noData)).toEqual([0, 0, 0, 0]);

    const categoricalLayer: VizLayerEntryV2 = {
      kind: "grid",
      layerKey: "explicit-categories",
      dataTypeKey: "category.explicit",
      stepId: "category-step",
      stageId: "ecology",
      stepIndex: 0,
      spaceId: "tile.hexOddR",
      bounds: [0, 0, 3, 1],
      dims: { width: 3, height: 1 },
      field: {
        format: "u8",
        data: { kind: "inline", buffer: new Uint8Array([0, 1, 2]).buffer },
      },
      meta: {
        palette: { kind: "categorical" },
        categories: [
          { value: 0, label: "Absent", color: [0, 0, 0, 0] },
          { value: 1, label: "Present", color: [34, 197, 94, 255] },
        ],
      },
    };
    expect(legendForLayer(categoricalLayer, { stats: null, palette: categorical })?.items).toEqual([
      { label: "Absent", color: [0, 0, 0, 0] },
      { label: "Present", color: [34, 197, 94, 255] },
      { label: "Unknown / undeclared", color: [107, 114, 128, 230] },
    ]);
  });

  it("excludes no-data from resolved pools and preserves exact numeric category identities", () => {
    const field: VizScalarField = {
      format: "f32",
      data: { kind: "inline", buffer: new Float32Array([-1, 1, 1.5]).buffer },
      valueSpec: {
        scale: "categorical",
        domain: { kind: "explicit", min: 1, max: 1.5 },
        noData: { kind: "sentinel", value: -1 },
      },
    };
    const palette = resolveVizPalettePresentation({
      meta: {
        palette: {
          kind: "categorical",
          colors: [
            [1, 2, 3, 255],
            [10, 20, 30, 255],
          ],
        },
      },
      field,
      values: new Float32Array([Number.NaN, -1, 1.5, 1]),
    });

    expect(renderColor(-1, palette, undefined, field)).toEqual([0, 0, 0, 0]);
    expect(renderColor(1, palette, undefined, field)).toEqual([1, 2, 3, 255]);
    expect(renderColor(1.5, palette, undefined, field)).toEqual([10, 20, 30, 255]);
    expect(renderColor(1.25, palette, undefined, field)).toEqual([107, 114, 128, 230]);
  });

  it("centers signed palettes on the declared zero", () => {
    const signed = resolveVizPalettePresentation({
      meta: {
        palette: {
          kind: "continuous",
          stops: [
            [1, 2, 3, 255],
            [100, 101, 102, 255],
            [200, 201, 202, 255],
          ],
        },
      },
      values: new Float32Array([-0.1, 1]),
    });
    const signedField: VizScalarField = {
      format: "f32",
      data: { kind: "inline", buffer: new Float32Array([-0.1, 0, 1]).buffer },
      valueSpec: {
        scale: "linear",
        domain: { kind: "explicit", min: -1, max: 1 },
      },
    };

    expect(renderColor(0, signed, { min: -0.1, max: 1 }, signedField)).toEqual([
      100, 101, 102, 255,
    ]);
  });

  it("uses the deterministic neutral scalar fallback when metadata omits a palette", () => {
    const palette = resolveVizPalettePresentation({
      values: new Float32Array([0, 1]),
    });

    expect(renderColor(0, palette)).toEqual([35, 35, 41, 72]);
    expect(renderColor(0.5, palette)).toEqual([35, 35, 41, 150]);
    expect(renderColor(1, palette)).toEqual([35, 35, 41, 230]);
  });

  it("labels declared palette domains", () => {
    const values = new Float32Array([-0.1, 1]);
    const layer: VizLayerEntryV2 = {
      kind: "grid",
      layerKey: "signed-field",
      dataTypeKey: "field.signed",
      stepId: "signed-step",
      stageId: "hydrology",
      stepIndex: 0,
      spaceId: "world.xy",
      bounds: [0, 0, 1, 1],
      dims: { width: 2, height: 1 },
      field: {
        format: "f32",
        data: { kind: "inline", buffer: values.buffer },
        stats: { min: -0.1, max: 1 },
        valueSpec: {
          scale: "linear",
          domain: { kind: "explicit", min: -1, max: 1 },
        },
      },
      meta: {
        palette: {
          kind: "continuous",
          stops: [
            [1, 2, 3, 255],
            [100, 101, 102, 255],
            [200, 201, 202, 255],
          ],
        },
      },
    };
    const signedLegendPalette = resolveVizPalettePresentation({
      meta: layer.meta,
      field: layer.field,
      values,
    });
    expect(
      legendForLayer(layer, {
        stats: layer.field.stats ?? null,
        palette: signedLegendPalette,
      })?.items.map((item) => item.label)
    ).toEqual(["min = -1.000", "max = 1.000"]);
  });

  it("uses the renderer-selected grid field domain for legend endpoints", async () => {
    const u = new Float32Array([-5, 5]);
    const v = new Float32Array([0, 0]);
    const magnitude = new Float32Array([0.2, 0.8]);
    const layer: VizLayerEntryV2 = {
      kind: "gridFields",
      layerKey: "wind-fields",
      dataTypeKey: "climate.wind",
      stepId: "climate-step",
      stageId: "hydrology-climate-baseline",
      stepIndex: 0,
      spaceId: "tile.hexOddR",
      bounds: [0, 0, 2, 1],
      dims: { width: 2, height: 1 },
      fields: {
        u: {
          format: "f32",
          data: { kind: "inline", buffer: u.buffer },
          stats: { min: -5, max: 5 },
          valueSpec: {
            scale: "linear",
            domain: { kind: "explicit", min: -10, max: 10 },
            units: "u/s",
          },
        },
        v: {
          format: "f32",
          data: { kind: "inline", buffer: v.buffer },
          stats: { min: 0, max: 0 },
        },
        magnitude: {
          format: "f32",
          data: { kind: "inline", buffer: magnitude.buffer },
          stats: { min: 0.2, max: 0.8 },
          valueSpec: {
            scale: "linear",
            domain: { kind: "explicit", min: 0, max: 1 },
            units: "m/s",
          },
        },
      },
      vector: { u: "u", v: "v", magnitude: "magnitude" },
    };
    const manifest: VizManifestV2 = {
      version: 2,
      runId: "grid-field-legend",
      planFingerprint: "grid-field-legend-plan",
      steps: [{ stepId: layer.stepId, stageId: layer.stageId, stepIndex: 0 }],
      layers: [layer],
    };
    const rendered = await renderDeckLayers({
      manifest,
      layer,
      showEdgeOverlay: false,
    });

    expect(rendered.scalar?.stats).toEqual({ min: 0.2, max: 0.8 });
    expect(legendForLayer(layer, rendered.scalar)?.items.map((item) => item.label)).toEqual([
      "min = 0.000 m/s",
      "max = 1.000 m/s",
    ]);
  });

  it("labels the exact observed ids bound to a resolved categorical palette", async () => {
    const values = new Uint8Array([5, 1, 3]);
    const first = [1, 2, 3, 255] as const;
    const second = [10, 20, 30, 255] as const;
    const layer: VizLayerEntryV2 = {
      kind: "grid",
      layerKey: "resolved-categories",
      dataTypeKey: "ecology.category",
      stepId: "ecology-step",
      stageId: "ecology-biomes",
      stepIndex: 0,
      spaceId: "tile.hexOddR",
      bounds: [0, 0, 3, 1],
      dims: { width: 3, height: 1 },
      field: {
        format: "u8",
        data: { kind: "inline", buffer: values.buffer },
        valueSpec: { scale: "categorical", domain: { kind: "fromStats" } },
      },
      meta: { palette: { kind: "categorical", colors: [first, second] } },
    };
    const manifest: VizManifestV2 = {
      version: 2,
      runId: "resolved-categories",
      planFingerprint: "resolved-categories-plan",
      steps: [{ stepId: layer.stepId, stageId: layer.stageId, stepIndex: 0 }],
      layers: [layer],
    };
    const rendered = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });

    expect(legendForLayer(layer, rendered.scalar)?.items).toEqual([
      { label: "1", color: first },
      { label: "3", color: second },
      { label: "5", color: first },
    ]);
  });

  it("excludes no-data sentinels from renderer statistics and fromStats legends", async () => {
    const values = new Int16Array([-999, 2, 8]);
    const layer: VizLayerEntryV2 = {
      kind: "grid",
      layerKey: "sentinel-stats",
      dataTypeKey: "climate.measurement",
      stepId: "climate-step",
      stageId: "hydrology-climate-baseline",
      stepIndex: 0,
      spaceId: "tile.hexOddR",
      bounds: [0, 0, 3, 1],
      dims: { width: 3, height: 1 },
      field: {
        format: "i16",
        data: { kind: "inline", buffer: values.buffer },
        valueSpec: {
          scale: "linear",
          domain: { kind: "fromStats" },
          noData: { kind: "sentinel", value: -999 },
        },
      },
    };
    const manifest: VizManifestV2 = {
      version: 2,
      runId: "sentinel-stats",
      planFingerprint: "sentinel-stats-plan",
      steps: [{ stepId: layer.stepId, stageId: layer.stageId, stepIndex: 0 }],
      layers: [layer],
    };
    const rendered = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });

    expect(rendered.scalar?.stats).toEqual({ min: 2, max: 8 });
    expect(legendForLayer(layer, rendered.scalar)?.items.map((item) => item.label)).toEqual([
      "min = 2.000",
      "max = 8.000",
    ]);
  });

  it("rejects scalar presentation after the selected manifest or layer object changes", async () => {
    const values = new Uint8Array([1]);
    const layer: VizLayerEntryV2 = {
      kind: "grid",
      layerKey: "selection-bound",
      dataTypeKey: "selection.bound",
      stepId: "selection-step",
      stageId: "placement",
      stepIndex: 0,
      spaceId: "tile.hexOddR",
      bounds: [0, 0, 1, 1],
      dims: { width: 1, height: 1 },
      field: { format: "u8", data: { kind: "inline", buffer: values.buffer } },
    };
    const manifest: VizManifestV2 = {
      version: 2,
      runId: "selection-run",
      planFingerprint: "selection-plan",
      steps: [{ stepId: layer.stepId, stageId: layer.stageId, stepIndex: 0 }],
      layers: [layer],
    };
    const rendered = await renderDeckLayers({ manifest, layer, showEdgeOverlay: false });

    expect(renderDeckLayersForSelection(rendered, manifest, layer)).toBe(rendered);
    expect(renderDeckLayersForSelection(rendered, { ...manifest }, layer)).toMatchObject({
      layers: [],
      scalar: null,
      source: null,
    });
    expect(renderDeckLayersForSelection(rendered, manifest, { ...layer })).toMatchObject({
      layers: [],
      scalar: null,
      source: null,
    });
  });
});
