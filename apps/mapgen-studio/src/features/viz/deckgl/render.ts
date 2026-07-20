import type { Layer } from "@deck.gl/core";
import { LineLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import type {
  VizBinaryLayout,
  VizBinaryRef,
  VizScalarField,
  VizScalarFormat,
  VizScalarSource,
  VizScalarStats,
  VizSpaceId,
} from "@swooper/mapgen-viz";
import {
  admitVizScalarSource,
  assertVizBinaryByteLength,
  computeVizScalarStats,
} from "@swooper/mapgen-viz";
import type { Bounds, VizAssetResolver, VizLayerEntryV2, VizManifestV2 } from "../model";
import {
  resolveVizPalettePresentation,
  selectVizScalarField,
  tileBorderColorForPresentTile,
  type VizRenderedScalarPresentation,
  writeColorForScalarValue,
} from "../presentation";

type HexGridGeometry = {
  indices: Uint32Array;
  polygons: Array<Array<[number, number]>>;
};

// Grid geometry is stable for a given (spaceId, dims, tileSize). Cache it so rerolls
// don't rebuild polygons and reallocate per-tile objects.
const hexGridGeometryCache = new Map<string, HexGridGeometry>();
const MAX_HEX_GRID_GEOMETRY_CACHE_ENTRIES = 4;

/** Inputs for rendering one selected visualization layer and its optional overlay. */
export type RenderDeckLayersArgs = {
  manifest: VizManifestV2 | null;
  layer: VizLayerEntryV2 | null;
  overlayLayer?: VizLayerEntryV2 | null;
  overlayOpacity?: number;
  showEdgeOverlay: boolean;
  assetResolver?: VizAssetResolver | null;
  signal?: AbortSignal;
};

type RenderSingleLayerArgs = {
  manifest: VizManifestV2;
  layer: VizLayerEntryV2;
  showEdgeOverlay: boolean;
  assetResolver?: VizAssetResolver | null;
  signal?: AbortSignal;
  opacity?: number;
};

/** Deck layers plus the exact scalar presentation selected for the primary layer. */
export type RenderDeckLayersResult = {
  layers: Layer[];
  scalar: VizRenderedScalarPresentation | null;
  source: Readonly<{ manifest: VizManifestV2; layer: VizLayerEntryV2 }> | null;
};

type RenderSingleLayerResult = Omit<RenderDeckLayersResult, "source">;

const EMPTY_RENDER_RESULT: RenderDeckLayersResult = {
  layers: [],
  scalar: null,
  source: null,
};

/**
 * Admits rendered layers and scalar presentation only while the exact manifest and layer objects
 * that produced them remain selected, preventing asynchronous work from relabeling stale evidence.
 */
export function renderDeckLayersForSelection(
  result: RenderDeckLayersResult,
  manifest: VizManifestV2 | null,
  layer: VizLayerEntryV2 | null
): RenderDeckLayersResult {
  return result.source?.manifest === manifest && result.source.layer === layer
    ? result
    : EMPTY_RENDER_RESULT;
}

type DomExceptionCtor = new (message?: string, name?: string) => Error;

function createAbortError(): Error {
  const Ctor = (globalThis as any).DOMException as DomExceptionCtor | undefined;
  if (Ctor) return new Ctor("Aborted", "AbortError");
  const err = new Error("Aborted");
  (err as any).name = "AbortError";
  return err;
}

function createYieldTicker(signal?: AbortSignal): (i: number) => Promise<void> {
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  let lastYield = now();
  const YIELD_AFTER_MS = 12;
  const CHECK_EVERY = 1 << 14; // 16384

  return async (i: number) => {
    if (signal?.aborted) throw createAbortError();
    if ((i & (CHECK_EVERY - 1)) !== 0) return;
    const t = now();
    if (t - lastYield < YIELD_AFTER_MS) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    lastYield = now();
  };
}

function isTileSpace(spaceId: VizSpaceId): boolean {
  return spaceId === "tile.hexOddR" || spaceId === "tile.hexOddQ";
}

// BOTH tile spaces render the GAME's plot geometry: pointy-top hexes on a
// row-offset (odd-R) lattice — columns √3·size apart, rows 1.5·size apart,
// odd ROWS shifted east half a tile (pre-flip y-down coords; the shared
// north-up flip happens after). `tile.hexOddQ` is, by audit evidence, a
// mislabel of this same grid: Civ7's direction set (E/W/NE/NW/SE/SW) and
// Firaxis's own debug dumpers (odd-row indents) are odd-R, and the engine
// boundary writes (x,y) untransposed. The world frame (√3·width ×
// 1.5·height) matches the Delaunay/world.xy frame, so cross-space layers
// co-register. See docs/projects/mapgen-studio-redesign/research/
// 03-hex-convention-audit.md.
function oddRTileCenter(col: number, row: number, size: number): [number, number] {
  const x = size * Math.sqrt(3) * (col + (row & 1 ? 0.5 : 0));
  const y = size * 1.5 * row;
  return [x, y];
}

function oddRPointFromTileXY(x: number, y: number, size: number): [number, number] {
  const row = Math.floor(y);
  const px = size * Math.sqrt(3) * (x + (row & 1 ? 0.5 : 0));
  const py = size * 1.5 * y;
  return [px, py];
}

function orientTilePointNorthUp(point: [number, number]): [number, number] {
  const [x, y] = point;
  return [x, -y];
}

function tilePoint(_spaceId: VizSpaceId, x: number, y: number, size: number): [number, number] {
  return orientTilePointNorthUp(oddRPointFromTileXY(x, y, size));
}

function tileCenter(
  _spaceId: VizSpaceId,
  col: number,
  row: number,
  size: number
): [number, number] {
  return orientTilePointNorthUp(oddRTileCenter(col, row, size));
}

function transformPoint(
  spaceId: VizSpaceId,
  x: number,
  y: number,
  tileSize: number
): [number, number] {
  if (isTileSpace(spaceId)) return tilePoint(spaceId, x, y, tileSize);
  return [x, y];
}

function hexPolygonPointy(center: [number, number], size: number): Array<[number, number]> {
  const [cx, cy] = center;
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((30 + 60 * i) * Math.PI) / 180;
    out.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return out;
}

function hexGridGeometryKey(args: {
  spaceId: VizSpaceId;
  width: number;
  height: number;
  tileSize: number;
}): string {
  return `${args.spaceId}:${args.width}x${args.height}:s${args.tileSize}`;
}

async function getOrBuildHexGridGeometry(args: {
  spaceId: VizSpaceId;
  width: number;
  height: number;
  tileSize: number;
  tick: (i: number) => Promise<void>;
}): Promise<HexGridGeometry> {
  const key = hexGridGeometryKey(args);
  const cached = hexGridGeometryCache.get(key);
  if (cached) return cached;

  const { spaceId, width, height, tileSize, tick } = args;
  const len = (width * height) | 0;
  const indices = new Uint32Array(len);
  const polygons = new Array<Array<[number, number]>>(len);

  for (let i = 0; i < len; i++) {
    await tick(i);
    indices[i] = i;
    const x = i % width;
    const y = (i / width) | 0;
    const center = tileCenter(spaceId, x, y, tileSize);
    polygons[i] = hexPolygonPointy(center, tileSize);
  }

  const geom: HexGridGeometry = { indices, polygons };
  hexGridGeometryCache.set(key, geom);

  if (hexGridGeometryCache.size > MAX_HEX_GRID_GEOMETRY_CACHE_ENTRIES) {
    const firstKey = hexGridGeometryCache.keys().next().value as string | undefined;
    if (firstKey) hexGridGeometryCache.delete(firstKey);
  }

  return geom;
}

/** Computes north-up render bounds for a Civ7 odd-row tile grid. */
export function boundsForTileGrid(
  _spaceId: VizSpaceId,
  dims: { width: number; height: number },
  tileSize: number
): Bounds {
  const { width, height } = dims;
  if (width <= 0 || height <= 0) return [0, 0, 1, 1];

  const s3 = Math.sqrt(3) * tileSize;
  const s = tileSize;

  // One lattice for both tile spaces: the game's odd-R grid (see the
  // convention note above oddRTileCenter).
  const hasOddRow = height > 1;
  const maxCenterX = s3 * (width - 1 + (hasOddRow ? 0.5 : 0));
  const maxCenterY = 1.5 * tileSize * (height - 1);
  return [-s, -maxCenterY - s, maxCenterX + s, s];
}

/** Projects a portable layer's authored bounds into the coordinate space used by Deck.gl. */
export function boundsForLayerInRenderSpace(layer: VizLayerEntryV2, tileSize = 1): Bounds {
  if (layer.kind === "grid" || layer.kind === "gridFields") {
    if (isTileSpace(layer.spaceId)) return boundsForTileGrid(layer.spaceId, layer.dims, tileSize);
    return layer.bounds;
  }

  const [minX, minY, maxX, maxY] = layer.bounds;
  if (!isTileSpace(layer.spaceId)) return layer.bounds;

  const corners: Array<[number, number]> = [
    [minX, minY],
    [minX, maxY],
    [maxX, minY],
    [maxX, maxY],
  ];

  let outMinX = Number.POSITIVE_INFINITY;
  let outMinY = Number.POSITIVE_INFINITY;
  let outMaxX = Number.NEGATIVE_INFINITY;
  let outMaxY = Number.NEGATIVE_INFINITY;
  for (const [x, y] of corners) {
    const [tx, ty] = transformPoint(layer.spaceId, x, y, tileSize);
    outMinX = Math.min(outMinX, tx);
    outMinY = Math.min(outMinY, ty);
    outMaxX = Math.max(outMaxX, tx);
    outMaxY = Math.max(outMaxY, ty);
  }
  if (
    !Number.isFinite(outMinX) ||
    !Number.isFinite(outMinY) ||
    !Number.isFinite(outMaxX) ||
    !Number.isFinite(outMaxY)
  ) {
    return [0, 0, 1, 1];
  }
  return [outMinX, outMinY, outMaxX, outMaxY];
}

async function readBinaryRef(
  ref: VizBinaryRef,
  assetResolver: VizAssetResolver | null | undefined,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  if (signal?.aborted) throw createAbortError();
  if (ref.kind === "inline") return ref.buffer;
  if (!assetResolver) throw new Error(`Missing VizAssetResolver for path ref: ${ref.path}`);
  const buf = await assetResolver.readArrayBuffer(ref.path);
  if (signal?.aborted) throw createAbortError();
  return buf;
}

type VizScalarBinaryLayout = Extract<VizBinaryLayout, { format: VizScalarFormat }>;

function decodeScalarArray(
  buffer: ArrayBuffer,
  layout: VizScalarBinaryLayout,
  label: string
): VizScalarSource["values"] {
  assertVizBinaryByteLength(buffer.byteLength, layout, label);
  const { format } = layout;
  switch (format) {
    case "u8":
      return new Uint8Array(buffer);
    case "i8":
      return new Int8Array(buffer);
    case "u16":
      return new Uint16Array(buffer);
    case "i16":
      return new Int16Array(buffer);
    case "i32":
      return new Int32Array(buffer);
    case "f32":
      return new Float32Array(buffer);
  }
}

function decodeFloat32Geometry(
  buffer: ArrayBuffer,
  layout: Extract<VizBinaryLayout, { kind: "points-positions" | "segments-geometry" }>,
  label: string
): Float32Array {
  assertVizBinaryByteLength(buffer.byteLength, layout, label);
  return new Float32Array(buffer);
}

function scalarStats(
  values: VizScalarSource["values"],
  field: VizScalarField
): VizScalarStats | null {
  return (
    field.stats ??
    computeVizScalarStats(
      admitVizScalarSource({
        format: field.format,
        values,
        valueSpec: field.valueSpec,
      })
    )
  );
}

function defaultLineColor(): [number, number, number, number] {
  return [148, 163, 184, 180];
}

async function renderSingleLayer(options: RenderSingleLayerArgs): Promise<RenderSingleLayerResult> {
  const { manifest, layer, showEdgeOverlay, assetResolver, signal, opacity = 1 } = options;
  if (signal?.aborted) throw createAbortError();
  const tick = createYieldTicker(signal);

  const tileSize = 1;

  const edgeOverlaySegments = manifest.layers.find(
    (l) => l.kind === "segments" && l.meta?.role === "edgeOverlay" && l.spaceId === layer.spaceId
  );

  const baseLayers: Layer[] = [];
  const shouldShowEdgeOverlay =
    Boolean(showEdgeOverlay) &&
    Boolean(edgeOverlaySegments) &&
    (layer.kind === "points" || layer.kind === "segments");

  if (shouldShowEdgeOverlay && edgeOverlaySegments && edgeOverlaySegments.kind === "segments") {
    const segBuf = await readBinaryRef(edgeOverlaySegments.segments, assetResolver ?? null, signal);
    const count = edgeOverlaySegments.count;
    const seg = decodeFloat32Geometry(
      segBuf,
      { kind: "segments-geometry", count },
      `Edge-overlay layer "${edgeOverlaySegments.layerKey}" geometry`
    );
    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      await tick(i);
      const x0 = seg[i * 4] as number;
      const y0 = seg[i * 4 + 1] as number;
      const x1 = seg[i * 4 + 2] as number;
      const y1 = seg[i * 4 + 3] as number;
      const [tx0, ty0] = transformPoint(edgeOverlaySegments.spaceId, x0, y0, tileSize);
      const [tx1, ty1] = transformPoint(edgeOverlaySegments.spaceId, x1, y1, tileSize);
      const base = i * 2;
      sourcePositions[base] = tx0;
      sourcePositions[base + 1] = ty0;
      targetPositions[base] = tx1;
      targetPositions[base + 1] = ty1;
    }

    baseLayers.push(
      new LineLayer({
        id: `${edgeOverlaySegments.layerKey}::edgeOverlay`,
        data: {
          length: count,
          attributes: {
            getSourcePosition: { value: sourcePositions, size: 2 },
            getTargetPosition: { value: targetPositions, size: 2 },
          },
        },
        getColor: [148, 163, 184, 140],
        getWidth: 1,
        widthUnits: "pixels",
        opacity,
        pickable: false,
      })
    );
  }

  if (layer.kind === "grid") {
    const field = layer.field;
    const buf = await readBinaryRef(field.data, assetResolver ?? null, signal);
    const { width, height } = layer.dims;
    const values = decodeScalarArray(
      buf,
      { kind: "grid-values", format: field.format, width, height },
      `Grid layer "${layer.layerKey}" values`
    );
    const len = values.length;

    const palette = resolveVizPalettePresentation({ meta: layer.meta, field, values });
    const statsForMapping = scalarStats(values, field);

    const colors = new Uint8ClampedArray(len * 4);

    for (let i = 0; i < len; i++) {
      await tick(i);
      const v = Number(values[i]);
      writeColorForScalarValue(colors, i * 4, {
        rawValue: v,
        palette,
        field,
        stats: statsForMapping,
      });
    }

    if (!isTileSpace(layer.spaceId)) {
      throw new Error(`Grid layers currently require a tile spaceId (got ${layer.spaceId}).`);
    }
    const geometry = await getOrBuildHexGridGeometry({
      spaceId: layer.spaceId,
      width,
      height,
      tileSize,
      tick,
    });

    return {
      layers: [
        ...baseLayers,
        new PolygonLayer({
          id: `${layer.layerKey}::hex`,
          data: geometry.indices,
          getPolygon: (i) => geometry.polygons[Number(i)] ?? [],
          getFillColor: (i) => {
            const idx = Number(i);
            const base = idx * 4;
            return [
              colors[base] ?? 0,
              colors[base + 1] ?? 0,
              colors[base + 2] ?? 0,
              colors[base + 3] ?? 255,
            ];
          },
          stroked: true,
          // Mesh contract: unfilled tiles draw nothing — the border follows
          // the fill's alpha so transparent tiles leave no phantom mesh.
          // Every present tile uses the shared graphite border.
          getLineColor: (i) => {
            const base = Number(i) * 4;
            const alpha = colors[base + 3] ?? 0;
            return alpha === 0 ? [0, 0, 0, 0] : tileBorderColorForPresentTile();
          },
          getLineWidth: 1,
          lineWidthUnits: "pixels",
          opacity,
          pickable: false,
        }),
      ],
      scalar: { stats: statsForMapping, palette },
    };
  }

  if (layer.kind === "points") {
    const posBuf = await readBinaryRef(layer.positions, assetResolver ?? null, signal);
    const count = layer.count;
    const positions = decodeFloat32Geometry(
      posBuf,
      { kind: "points-positions", count },
      `Point layer "${layer.layerKey}" geometry`
    );

    const valueField = layer.values ?? null;
    const values = valueField
      ? decodeScalarArray(
          await readBinaryRef(valueField.data, assetResolver ?? null, signal),
          { kind: "points-values", format: valueField.format, count },
          `Point layer "${layer.layerKey}" values`
        )
      : null;

    const palette = values
      ? resolveVizPalettePresentation({ meta: layer.meta, field: valueField, values })
      : undefined;
    const statsForMapping = values && valueField ? scalarStats(values, valueField) : null;

    const positionsOut = new Float32Array(count * 2);
    const colors = new Uint8ClampedArray(count * 4);

    for (let i = 0; i < count; i++) {
      await tick(i);
      const rawX = positions[i * 2] as number;
      const rawY = positions[i * 2 + 1] as number;
      const [x, y] = transformPoint(layer.spaceId, rawX, rawY, tileSize);
      const base = i * 2;
      positionsOut[base] = x;
      positionsOut[base + 1] = y;

      const v = values ? Number(values[i]) : Number.NaN;
      if (values && valueField && palette) {
        writeColorForScalarValue(colors, i * 4, {
          rawValue: v,
          palette,
          field: valueField,
          stats: statsForMapping,
        });
      } else {
        const c = defaultLineColor();
        colors[i * 4] = c[0];
        colors[i * 4 + 1] = c[1];
        colors[i * 4 + 2] = c[2];
        colors[i * 4 + 3] = c[3];
      }
    }

    return {
      layers: [
        ...baseLayers,
        new ScatterplotLayer({
          id: `${layer.layerKey}::points`,
          data: {
            length: count,
            attributes: {
              getPosition: { value: positionsOut, size: 2 },
              getFillColor: { value: colors, size: 4 },
            },
          },
          radiusUnits: "common",
          getRadius: 0.95,
          opacity,
          pickable: false,
        }),
      ],
      scalar: values && valueField && palette ? { stats: statsForMapping, palette } : null,
    };
  }

  if (layer.kind === "segments") {
    const segBuf = await readBinaryRef(layer.segments, assetResolver ?? null, signal);
    const count = layer.count;
    const seg = decodeFloat32Geometry(
      segBuf,
      { kind: "segments-geometry", count },
      `Segment layer "${layer.layerKey}" geometry`
    );

    const valueField = layer.values ?? null;
    const values = valueField
      ? decodeScalarArray(
          await readBinaryRef(valueField.data, assetResolver ?? null, signal),
          { kind: "segments-values", format: valueField.format, count },
          `Segment layer "${layer.layerKey}" values`
        )
      : null;

    const palette = values
      ? resolveVizPalettePresentation({ meta: layer.meta, field: valueField, values })
      : undefined;
    const statsForMapping = values && valueField ? scalarStats(values, valueField) : null;

    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    const colors = new Uint8ClampedArray(count * 4);

    for (let i = 0; i < count; i++) {
      await tick(i);
      const rx0 = seg[i * 4] as number;
      const ry0 = seg[i * 4 + 1] as number;
      const rx1 = seg[i * 4 + 2] as number;
      const ry1 = seg[i * 4 + 3] as number;
      const [x0, y0] = transformPoint(layer.spaceId, rx0, ry0, tileSize);
      const [x1, y1] = transformPoint(layer.spaceId, rx1, ry1, tileSize);
      const base = i * 2;
      sourcePositions[base] = x0;
      sourcePositions[base + 1] = y0;
      targetPositions[base] = x1;
      targetPositions[base + 1] = y1;

      const v = values ? Number(values[i]) : Number.NaN;
      if (values && valueField && palette) {
        writeColorForScalarValue(colors, i * 4, {
          rawValue: v,
          palette,
          field: valueField,
          stats: statsForMapping,
        });
      } else {
        const c = defaultLineColor();
        colors[i * 4] = c[0];
        colors[i * 4 + 1] = c[1];
        colors[i * 4 + 2] = c[2];
        colors[i * 4 + 3] = c[3];
      }
    }

    return {
      layers: [
        ...baseLayers,
        new LineLayer({
          id: `${layer.layerKey}::segments`,
          data: {
            length: count,
            attributes: {
              getSourcePosition: { value: sourcePositions, size: 2 },
              getTargetPosition: { value: targetPositions, size: 2 },
              getColor: { value: colors, size: 4 },
            },
          },
          getWidth: 1.5,
          widthUnits: "pixels",
          opacity,
          pickable: false,
        }),
      ],
      scalar: values && valueField && palette ? { stats: statsForMapping, palette } : null,
    };
  }

  if (layer.kind === "gridFields") {
    if (!isTileSpace(layer.spaceId)) {
      throw new Error(`gridFields currently require a tile spaceId (got ${layer.spaceId}).`);
    }

    const { width, height } = layer.dims;
    const len = width * height;

    const vector = layer.vector;
    const uFieldKey = vector?.u ?? null;
    const vFieldKey = vector?.v ?? null;
    const magFieldKey = vector?.magnitude ?? null;

    const chosenScalarField = selectVizScalarField(layer);
    const chosenScalarValues = chosenScalarField
      ? decodeScalarArray(
          await readBinaryRef(chosenScalarField.data, assetResolver ?? null, signal),
          {
            kind: "grid-field-values",
            format: chosenScalarField.format,
            width,
            height,
          },
          `Grid-fields layer "${layer.layerKey}" scalar values`
        )
      : null;

    const palette = chosenScalarValues
      ? resolveVizPalettePresentation({
          meta: layer.meta,
          field: chosenScalarField,
          values: chosenScalarValues,
        })
      : undefined;
    const statsForMapping =
      chosenScalarValues && chosenScalarField
        ? scalarStats(chosenScalarValues, chosenScalarField)
        : null;

    const colors = new Uint8ClampedArray(len * 4);

    if (chosenScalarValues && chosenScalarField && palette) {
      for (let i = 0; i < len; i++) {
        await tick(i);
        const v = Number(chosenScalarValues[i]);
        writeColorForScalarValue(colors, i * 4, {
          rawValue: v,
          palette,
          field: chosenScalarField,
          stats: statsForMapping,
        });
      }
    } else {
      for (let i = 0; i < len; i++) {
        const c = defaultLineColor();
        colors[i * 4] = c[0];
        colors[i * 4 + 1] = c[1];
        colors[i * 4 + 2] = c[2];
        colors[i * 4 + 3] = c[3];
      }
    }

    const geometry = await getOrBuildHexGridGeometry({
      spaceId: layer.spaceId,
      width,
      height,
      tileSize,
      tick,
    });
    const layersOut: Layer[] = [
      ...baseLayers,
      new PolygonLayer({
        id: `${layer.layerKey}::gridFields.scalar`,
        data: geometry.indices,
        getPolygon: (i) => geometry.polygons[Number(i)] ?? [],
        getFillColor: (i) => {
          const idx = Number(i);
          const base = idx * 4;
          return [
            colors[base] ?? 0,
            colors[base + 1] ?? 0,
            colors[base + 2] ?? 0,
            colors[base + 3] ?? 255,
          ];
        },
        stroked: true,
        // Mesh contract: unfilled tiles draw nothing — the border follows
        // the fill's alpha so transparent tiles leave no phantom mesh.
        // Every present tile uses the shared graphite border.
        getLineColor: (i) => {
          const base = Number(i) * 4;
          const alpha = colors[base + 3] ?? 0;
          return alpha === 0 ? [0, 0, 0, 0] : tileBorderColorForPresentTile();
        },
        getLineWidth: 1,
        lineWidthUnits: "pixels",
        opacity,
        pickable: false,
      }),
    ];

    if (uFieldKey && vFieldKey) {
      const uField = layer.fields[uFieldKey] ?? null;
      const vField = layer.fields[vFieldKey] ?? null;
      const magField = magFieldKey ? (layer.fields[magFieldKey] ?? null) : null;
      if (uField && vField) {
        const uValues = decodeScalarArray(
          await readBinaryRef(uField.data, assetResolver ?? null, signal),
          { kind: "grid-field-values", format: uField.format, width, height },
          `Grid-fields layer "${layer.layerKey}" vector u values`
        );
        const vValues = decodeScalarArray(
          await readBinaryRef(vField.data, assetResolver ?? null, signal),
          { kind: "grid-field-values", format: vField.format, width, height },
          `Grid-fields layer "${layer.layerKey}" vector v values`
        );
        const magValues = magField
          ? decodeScalarArray(
              await readBinaryRef(magField.data, assetResolver ?? null, signal),
              { kind: "grid-field-values", format: magField.format, width, height },
              `Grid-fields layer "${layer.layerKey}" vector magnitude values`
            )
          : null;
        const magStats = magValues && magField ? scalarStats(magValues, magField) : null;

        // Subsample vectors aggressively to keep the arrow count reasonable.
        const approxMaxArrows = 4200;
        const stride = Math.max(
          1,
          Math.floor(Math.sqrt((width * height) / Math.max(1, approxMaxArrows)))
        );

        const arrowSegments: number[] = [];
        for (let y = 0; y < height; y += stride) {
          for (let x = 0; x < width; x += stride) {
            const i = (y * width + x) | 0;
            const ux = Number(uValues[i]);
            const vy = Number(vValues[i]);
            if (!Number.isFinite(ux) || !Number.isFinite(vy)) continue;
            const [cx, cy] = tileCenter(layer.spaceId, x, y, tileSize);

            // Interpret u/v as a direction vector; scale to tile space for legible arrows.
            const mag = magValues ? Number(magValues[i]) : Math.hypot(ux, vy);
            if (!Number.isFinite(mag) || mag < 1e-6) continue;
            const uxN = ux / mag;
            const vyN = vy / mag;
            const unit =
              magStats &&
              Number.isFinite(magStats.min) &&
              Number.isFinite(magStats.max) &&
              Math.abs(magStats.max - magStats.min) > 1e-6
                ? Math.max(0, Math.min(1, (mag - magStats.min) / (magStats.max - magStats.min)))
                : 0.6;
            const arrowLen = tileSize * (0.25 + 0.85 * unit);
            const tx = cx + uxN * arrowLen;
            const ty = cy + vyN * arrowLen;
            arrowSegments.push(cx, cy, tx, ty);
          }
        }

        const seg = new Float32Array(arrowSegments);
        const arrowCount = (seg.length / 4) | 0;
        const sourcePositions = new Float32Array(arrowCount * 2);
        const targetPositions = new Float32Array(arrowCount * 2);
        for (let i = 0; i < arrowCount; i++) {
          const base = i * 2;
          sourcePositions[base] = seg[i * 4] as number;
          sourcePositions[base + 1] = seg[i * 4 + 1] as number;
          targetPositions[base] = seg[i * 4 + 2] as number;
          targetPositions[base + 1] = seg[i * 4 + 3] as number;
        }

        layersOut.push(
          new LineLayer({
            id: `${layer.layerKey}::gridFields.vectors`,
            data: {
              length: arrowCount,
              attributes: {
                getSourcePosition: { value: sourcePositions, size: 2 },
                getTargetPosition: { value: targetPositions, size: 2 },
              },
            },
            getColor: [17, 24, 39, 220],
            getWidth: 1.25,
            widthUnits: "pixels",
            opacity,
            pickable: false,
          })
        );
      }
    }

    return {
      layers: layersOut,
      scalar:
        chosenScalarValues && chosenScalarField && palette
          ? { stats: statsForMapping, palette }
          : null,
    };
  }

  return { layers: baseLayers, scalar: null };
}

/** Materializes the selected portable visualization evidence into Deck.gl layers. */
export async function renderDeckLayers(
  options: RenderDeckLayersArgs
): Promise<RenderDeckLayersResult> {
  const { manifest, layer, overlayLayer, overlayOpacity, showEdgeOverlay, assetResolver, signal } =
    options;
  if (!manifest || !layer) return { layers: [], scalar: null, source: null };

  const base = await renderSingleLayer({
    manifest,
    layer,
    showEdgeOverlay,
    assetResolver,
    signal,
    opacity: 1,
  });
  const result = { ...base, source: { manifest, layer } };
  if (!overlayLayer) return result;

  const normalizedOpacity = Math.max(0, Math.min(1, overlayOpacity ?? 0.45));
  const overlay = await renderSingleLayer({
    manifest,
    layer: overlayLayer,
    showEdgeOverlay: false,
    assetResolver,
    signal,
    opacity: normalizedOpacity,
  });

  return {
    layers: [...base.layers, ...overlay.layers],
    scalar: base.scalar,
    source: result.source,
  };
}
