import type { Layer } from "@deck.gl/core";
import { LineLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import {
  buildCategoricalColorMap,
  writeColorForScalarValue,
} from "../presentation";
import type { Bounds, VizAssetResolver, VizLayerEntryV1, VizManifestV1 } from "../model";
import type { VizBinaryRef, VizScalarFormat, VizScalarStats, VizSpaceId } from "@swooper/mapgen-viz";

type HexGridGeometry = {
  indices: Uint32Array;
  polygons: Array<Array<[number, number]>>;
};

// Grid geometry is stable for a given (spaceId, dims, tileSize). Cache it so rerolls
// don't rebuild polygons and reallocate per-tile objects.
const hexGridGeometryCache = new Map<string, HexGridGeometry>();
const MAX_HEX_GRID_GEOMETRY_CACHE_ENTRIES = 4;

export type RenderDeckLayersArgs = {
  manifest: VizManifestV1 | null;
  layer: VizLayerEntryV1 | null;
  showEdgeOverlay: boolean;
  assetResolver?: VizAssetResolver | null;
  signal?: AbortSignal;
};

export type RenderDeckLayersResult = {
  layers: Layer[];
  stats: VizScalarStats | null;
};

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

function axialToPixelPointy(q: number, r: number, size: number): [number, number] {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * 1.5 * r;
  return [x, y];
}

function oddQToAxialR(row: number, colParityBase: number): number {
  const q = colParityBase | 0;
  return row - (q - (q & 1)) / 2;
}

function oddQTileCenter(col: number, row: number, size: number): [number, number] {
  const r = oddQToAxialR(row, col);
  return axialToPixelPointy(col, r, size);
}

function oddQPointFromTileXY(x: number, y: number, size: number): [number, number] {
  const qParityBase = Math.round(x);
  const r = oddQToAxialR(y, qParityBase);
  return axialToPixelPointy(x, r, size);
}

function oddRTileCenter(col: number, row: number, size: number): [number, number] {
  const x = size * Math.sqrt(3) * (col + ((row & 1) ? 0.5 : 0));
  const y = size * 1.5 * row;
  return [x, y];
}

function oddRPointFromTileXY(x: number, y: number, size: number): [number, number] {
  const row = Math.floor(y);
  const px = size * Math.sqrt(3) * (x + ((row & 1) ? 0.5 : 0));
  const py = size * 1.5 * y;
  return [px, py];
}

function tilePoint(spaceId: VizSpaceId, x: number, y: number, size: number): [number, number] {
  return spaceId === "tile.hexOddQ" ? oddQPointFromTileXY(x, y, size) : oddRPointFromTileXY(x, y, size);
}

function tileCenter(spaceId: VizSpaceId, col: number, row: number, size: number): [number, number] {
  return spaceId === "tile.hexOddQ" ? oddQTileCenter(col, row, size) : oddRTileCenter(col, row, size);
}

function transformPoint(spaceId: VizSpaceId, x: number, y: number, tileSize: number): [number, number] {
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

function hexGridGeometryKey(args: { spaceId: VizSpaceId; width: number; height: number; tileSize: number }): string {
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

export function boundsForTileGrid(spaceId: VizSpaceId, dims: { width: number; height: number }, tileSize: number): Bounds {
  const { width, height } = dims;
  if (width <= 0 || height <= 0) return [0, 0, 1, 1];

  const s3 = Math.sqrt(3) * tileSize;
  const s = tileSize;

  if (spaceId === "tile.hexOddR") {
    const hasOddRow = height > 1;
    const maxCenterX = s3 * ((width - 1) + (hasOddRow ? 0.5 : 0));
    const maxCenterY = 1.5 * tileSize * (height - 1);
    return [-s, -s, maxCenterX + s, maxCenterY + s];
  }

  // tile.hexOddQ
  const hasOddCol = width > 1;
  const maxCenterX = s3 * (width - 1);
  const maxCenterY = 1.5 * tileSize * ((height - 1) + (hasOddCol ? 0.5 : 0));
  return [-s, -s, maxCenterX + s, maxCenterY + s];
}

export function boundsForLayerInRenderSpace(layer: VizLayerEntryV1, tileSize = 1): Bounds {
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
  if (!Number.isFinite(outMinX) || !Number.isFinite(outMinY) || !Number.isFinite(outMaxX) || !Number.isFinite(outMaxY)) {
    return [0, 0, 1, 1];
  }
  return [outMinX, outMinY, outMaxX, outMaxY];
}

async function readBinaryRef(ref: VizBinaryRef, assetResolver: VizAssetResolver | null | undefined, signal?: AbortSignal): Promise<ArrayBuffer> {
  if (signal?.aborted) throw createAbortError();
  if (ref.kind === "inline") return ref.buffer;
  if (!assetResolver) throw new Error(`Missing VizAssetResolver for path ref: ${ref.path}`);
  const buf = await assetResolver.readArrayBuffer(ref.path);
  if (signal?.aborted) throw createAbortError();
  return buf;
}

function decodeScalarArray(buffer: ArrayBuffer, format: VizScalarFormat): ArrayBufferView {
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
    default:
      return new Uint8Array(buffer);
  }
}

function computeMinMax(values: ArrayBufferView): VizScalarStats | null {
  const view = values as unknown as ArrayLike<number>;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < view.length; i++) {
    const v = Number(view[i] ?? 0);
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}

function defaultLineColor(): [number, number, number, number] {
  return [148, 163, 184, 180];
}

export async function renderDeckLayers(options: RenderDeckLayersArgs): Promise<RenderDeckLayersResult> {
  const { manifest, layer, showEdgeOverlay, assetResolver, signal } = options;
  if (!manifest || !layer) return { layers: [], stats: null };
  if (signal?.aborted) throw createAbortError();
  const tick = createYieldTicker(signal);

  const tileSize = 1;
  const seedKey = `${manifest.runId}:${layer.layerKey}`;

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
    const seg = new Float32Array(segBuf);
    const count = (edgeOverlaySegments.count ?? (seg.length / 4)) | 0;
    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      await tick(i);
      const x0 = seg[i * 4] ?? 0;
      const y0 = seg[i * 4 + 1] ?? 0;
      const x1 = seg[i * 4 + 2] ?? 0;
      const y1 = seg[i * 4 + 3] ?? 0;
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
        pickable: false,
      })
    );
  }

  if (layer.kind === "grid") {
    const field = layer.field;
    const buf = await readBinaryRef(field.data, assetResolver ?? null, signal);
    const values = decodeScalarArray(buf, field.format);
    const { width, height } = layer.dims;
    const len = Math.min((width * height) | 0, (values as any).length ?? 0);

    const paletteMode = layer.meta?.palette ?? "auto";
    const categoricalColorMap =
      paletteMode === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values, seedKey })
        : undefined;
    const statsForMapping = field.stats ?? computeMinMax(values);

    const colors = new Uint8ClampedArray(len * 4);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < len; i++) {
      await tick(i);
      const v = Number((values as any)[i] ?? 0);
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
      writeColorForScalarValue(colors, i * 4, {
        seedKey,
        rawValue: v,
        categoricalColorMap,
        meta: layer.meta,
        field,
        stats: statsForMapping,
      });
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : statsForMapping;
    if (!isTileSpace(layer.spaceId)) {
      throw new Error(`Grid layers currently require a tile spaceId (got ${layer.spaceId}).`);
    }
    const geometry = await getOrBuildHexGridGeometry({ spaceId: layer.spaceId, width, height, tileSize, tick });

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
            return [colors[base] ?? 0, colors[base + 1] ?? 0, colors[base + 2] ?? 0, colors[base + 3] ?? 255];
          },
          stroked: true,
          getLineColor: [17, 24, 39, 220],
          getLineWidth: 1,
          lineWidthUnits: "pixels",
          pickable: false,
        }),
      ],
      stats,
    };
  }

  if (layer.kind === "points") {
    const posBuf = await readBinaryRef(layer.positions, assetResolver ?? null, signal);
    const positions = new Float32Array(posBuf);
    const count = layer.count ?? ((positions.length / 2) | 0);

    const valueField = layer.values ?? null;
    const values =
      valueField ? decodeScalarArray(await readBinaryRef(valueField.data, assetResolver ?? null, signal), valueField.format) : null;

    const paletteMode = layer.meta?.palette ?? "auto";
    const categoricalColorMap =
      values && paletteMode === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values, seedKey })
        : undefined;
    const statsForMapping = values && valueField ? (valueField.stats ?? computeMinMax(values)) : null;

    const positionsOut = new Float32Array(count * 2);
    const colors = new Uint8ClampedArray(count * 4);

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < count; i++) {
      await tick(i);
      const rawX = positions[i * 2] ?? 0;
      const rawY = positions[i * 2 + 1] ?? 0;
      const [x, y] = transformPoint(layer.spaceId, rawX, rawY, tileSize);
      const base = i * 2;
      positionsOut[base] = x;
      positionsOut[base + 1] = y;

      const v = values ? Number((values as any)[i] ?? 0) : Number.NaN;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      if (values && valueField) {
        writeColorForScalarValue(colors, i * 4, {
          seedKey,
          rawValue: v,
          categoricalColorMap,
          meta: layer.meta,
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

    const stats = values && Number.isFinite(min) && Number.isFinite(max) ? { min, max } : statsForMapping;

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
          pickable: false,
        }),
      ],
      stats,
    };
  }

  if (layer.kind === "segments") {
    const segBuf = await readBinaryRef(layer.segments, assetResolver ?? null, signal);
    const seg = new Float32Array(segBuf);
    const count = layer.count ?? ((seg.length / 4) | 0);

    const valueField = layer.values ?? null;
    const values =
      valueField ? decodeScalarArray(await readBinaryRef(valueField.data, assetResolver ?? null, signal), valueField.format) : null;

    const paletteMode = layer.meta?.palette ?? "auto";
    const categoricalColorMap =
      values && paletteMode === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values, seedKey })
        : undefined;
    const statsForMapping = values && valueField ? (valueField.stats ?? computeMinMax(values)) : null;

    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    const colors = new Uint8ClampedArray(count * 4);

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < count; i++) {
      await tick(i);
      const rx0 = seg[i * 4] ?? 0;
      const ry0 = seg[i * 4 + 1] ?? 0;
      const rx1 = seg[i * 4 + 2] ?? 0;
      const ry1 = seg[i * 4 + 3] ?? 0;
      const [x0, y0] = transformPoint(layer.spaceId, rx0, ry0, tileSize);
      const [x1, y1] = transformPoint(layer.spaceId, rx1, ry1, tileSize);
      const base = i * 2;
      sourcePositions[base] = x0;
      sourcePositions[base + 1] = y0;
      targetPositions[base] = x1;
      targetPositions[base + 1] = y1;

      const v = values ? Number((values as any)[i] ?? 0) : Number.NaN;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      if (values && valueField) {
        writeColorForScalarValue(colors, i * 4, {
          seedKey,
          rawValue: v,
          categoricalColorMap,
          meta: layer.meta,
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

    const stats = values && Number.isFinite(min) && Number.isFinite(max) ? { min, max } : statsForMapping;

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
          pickable: false,
        }),
      ],
      stats,
    };
  }

  if (layer.kind === "gridFields") {
    if (!isTileSpace(layer.spaceId)) {
      throw new Error(`gridFields currently require a tile spaceId (got ${layer.spaceId}).`);
    }

    const { width, height } = layer.dims;
    const len = (width * height) | 0;

    const vector = layer.vector;
    const uFieldKey = vector?.u ?? null;
    const vFieldKey = vector?.v ?? null;
    const magFieldKey = vector?.magnitude ?? null;

    const chosenScalarKey = magFieldKey ?? uFieldKey ?? Object.keys(layer.fields)[0] ?? null;
    const chosenScalarField = chosenScalarKey ? layer.fields[chosenScalarKey] ?? null : null;
    const chosenScalarValues = chosenScalarField
      ? decodeScalarArray(await readBinaryRef(chosenScalarField.data, assetResolver ?? null, signal), chosenScalarField.format)
      : null;

    const paletteMode = layer.meta?.palette ?? "auto";
    const categoricalColorMap =
      chosenScalarValues && paletteMode === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values: chosenScalarValues, seedKey })
        : undefined;
    const statsForMapping = chosenScalarValues && chosenScalarField ? (chosenScalarField.stats ?? computeMinMax(chosenScalarValues)) : null;

    const colors = new Uint8ClampedArray(len * 4);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    if (chosenScalarValues && chosenScalarField) {
      for (let i = 0; i < len; i++) {
        await tick(i);
        const v = Number((chosenScalarValues as any)[i] ?? 0);
        if (Number.isFinite(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
        writeColorForScalarValue(colors, i * 4, {
          seedKey,
          rawValue: v,
          categoricalColorMap,
          meta: layer.meta,
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

    const stats = chosenScalarValues && Number.isFinite(min) && Number.isFinite(max) ? { min, max } : statsForMapping;

    const geometry = await getOrBuildHexGridGeometry({ spaceId: layer.spaceId, width, height, tileSize, tick });
    const layersOut: Layer[] = [
      ...baseLayers,
      new PolygonLayer({
        id: `${layer.layerKey}::gridFields.scalar`,
        data: geometry.indices,
        getPolygon: (i) => geometry.polygons[Number(i)] ?? [],
        getFillColor: (i) => {
          const idx = Number(i);
          const base = idx * 4;
          return [colors[base] ?? 0, colors[base + 1] ?? 0, colors[base + 2] ?? 0, colors[base + 3] ?? 255];
        },
        stroked: true,
        getLineColor: [17, 24, 39, 220],
        getLineWidth: 1,
        lineWidthUnits: "pixels",
        pickable: false,
      }),
    ];

    if (uFieldKey && vFieldKey) {
      const uField = layer.fields[uFieldKey] ?? null;
      const vField = layer.fields[vFieldKey] ?? null;
      const magField = magFieldKey ? (layer.fields[magFieldKey] ?? null) : null;
      if (uField && vField) {
        const uValues = decodeScalarArray(await readBinaryRef(uField.data, assetResolver ?? null, signal), uField.format);
        const vValues = decodeScalarArray(await readBinaryRef(vField.data, assetResolver ?? null, signal), vField.format);
        const magValues = magField ? decodeScalarArray(await readBinaryRef(magField.data, assetResolver ?? null, signal), magField.format) : null;
        const magStats = magValues ? (magField?.stats ?? computeMinMax(magValues) ?? null) : null;

        // Subsample vectors aggressively to keep the arrow count reasonable.
        const approxMaxArrows = 4200;
        const stride = Math.max(1, Math.floor(Math.sqrt((width * height) / Math.max(1, approxMaxArrows))));

        const arrowSegments: number[] = [];
        for (let y = 0; y < height; y += stride) {
          for (let x = 0; x < width; x += stride) {
            const i = (y * width + x) | 0;
            const ux = Number((uValues as any)[i] ?? 0);
            const vy = Number((vValues as any)[i] ?? 0);
            if (!Number.isFinite(ux) || !Number.isFinite(vy)) continue;
            const [cx, cy] = tileCenter(layer.spaceId, x, y, tileSize);

            // Interpret u/v as a direction vector; scale to tile space for legible arrows.
            const mag = magValues ? Number((magValues as any)[i] ?? 0) : Math.hypot(ux, vy);
            if (!Number.isFinite(mag) || mag < 1e-6) continue;
            const uxN = ux / mag;
            const vyN = vy / mag;
            const unit =
              magStats && Number.isFinite(magStats.min) && Number.isFinite(magStats.max) && Math.abs(magStats.max - magStats.min) > 1e-6
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
          sourcePositions[base] = seg[i * 4] ?? 0;
          sourcePositions[base + 1] = seg[i * 4 + 1] ?? 0;
          targetPositions[base] = seg[i * 4 + 2] ?? 0;
          targetPositions[base + 1] = seg[i * 4 + 3] ?? 0;
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
            pickable: false,
          })
        );
      }
    }

    return { layers: layersOut, stats };
  }

  return { layers: baseLayers, stats: null };
}
