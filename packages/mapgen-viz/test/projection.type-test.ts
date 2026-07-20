import type {
  VizGridProjection,
  VizInlineRef,
  VizLayerMeta,
  VizManifestV1,
  VizScalarSource,
} from "../src/index.js";

const validSource: VizScalarSource = {
  format: "u8",
  values: new Uint8Array([1]),
};

const validProjection: VizGridProjection = {
  kind: "grid",
  dataTypeKey: "test.scalar",
  spaceId: "tile.hexOddQ",
  dims: { width: 1, height: 1 },
  field: validSource,
};

// @ts-expect-error A declared u8 source cannot carry signed storage.
const mismatchedSource: VizScalarSource = { format: "u8", values: new Int8Array([1]) };

const materializedRef = { kind: "path", path: "data/test.bin" } as const;
const invalidProjection: VizGridProjection = {
  ...validProjection,
  // @ts-expect-error Projections carry typed sources, never materialized binary references.
  field: { format: "u8", data: materializedRef },
};

const invalidInlineManifest: VizManifestV1<VizInlineRef> = {
  version: 1,
  runId: "run",
  planFingerprint: "plan",
  steps: [{ stepId: "step", stepIndex: 0 }],
  layers: [
    {
      kind: "grid",
      layerKey: "layer",
      dataTypeKey: "data",
      stepId: "step",
      stepIndex: 0,
      spaceId: "tile.hexOddQ",
      bounds: [0, 0, 1, 1],
      dims: { width: 1, height: 1 },
      field: {
        format: "u8",
        // @ts-expect-error An inline manifest cannot contain a path-backed binary field.
        data: { kind: "path", path: "data.bin" },
      },
    },
  ],
};

// @ts-expect-error A resolved categorical palette cannot carry a second category authority.
const pooledPaletteWithCategories: VizLayerMeta = {
  palette: { kind: "categorical", colors: [[1, 2, 3, 255]] },
  categories: [{ value: 1, label: "one", color: [1, 2, 3, 255] }],
};

// @ts-expect-error A resolved categorical palette requires at least one visible color.
const emptyResolvedCategoryPool: VizLayerMeta = { palette: { kind: "categorical", colors: [] } };

// @ts-expect-error An explicit-category marker requires a nonempty category table.
const categoryMarkerWithoutCategories: VizLayerMeta = { palette: { kind: "categorical" } };

void validProjection;
void mismatchedSource;
void invalidProjection;
void invalidInlineManifest;
void pooledPaletteWithCategories;
void emptyResolvedCategoryPool;
void categoryMarkerWithoutCategories;
