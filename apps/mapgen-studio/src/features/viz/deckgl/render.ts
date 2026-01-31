import type { Layer } from "@deck.gl/core";
import { LineLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { buildCategoricalColorMap, colorForValue, writeColorForValue } from "../presentation";
import type { Bounds, TileLayout, VizAssetResolver, VizLayerEntryV0, VizManifestV0 } from "../model";

type ScalarStats = { min?: number; max?: number };

export type RenderDeckLayersArgs = {
  manifest: VizManifestV0 | null;
  layer: VizLayerEntryV0 | null;
  tileLayout: TileLayout;
  showMeshEdges: boolean;
  assetResolver?: VizAssetResolver | null;
  signal?: AbortSignal;
};

export type RenderDeckLayersResult = {
  layers: Layer[];
  stats: ScalarStats | null;
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

function niceStep(target: number): number {
  const t = Math.max(1e-9, target);
  const pow = Math.pow(10, Math.floor(Math.log10(t)));
  const scaled = t / pow;
  if (scaled <= 1) return 1 * pow;
  if (scaled <= 2) return 2 * pow;
  if (scaled <= 5) return 5 * pow;
  return 10 * pow;
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

function hexPolygonPointy(center: [number, number], size: number): Array<[number, number]> {
  const [cx, cy] = center;
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((30 + 60 * i) * Math.PI) / 180;
    out.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return out;
}

export function boundsForTileGrid(layout: TileLayout, dims: { width: number; height: number }, size: number): Bounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < dims.height; y++) {
    for (let x = 0; x < dims.width; x++) {
      const [cx, cy] = layout === "col-offset" ? oddQTileCenter(x, y, size) : oddRTileCenter(x, y, size);
      minX = Math.min(minX, cx - size);
      maxX = Math.max(maxX, cx + size);
      minY = Math.min(minY, cy - size);
      maxY = Math.max(maxY, cy + size);
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [0, 0, 1, 1];
  }

  return [minX, minY, maxX, maxY];
}

export function fitToBounds(bounds: Bounds, viewport: { width: number; height: number }): {
  target: [number, number, number];
  zoom: number;
} {
  const [minX, minY, maxX, maxY] = bounds;
  const width = Math.max(1e-6, maxX - minX);
  const height = Math.max(1e-6, maxY - minY);
  const padding = 0.92;
  const scaleX = (viewport.width * padding) / width;
  const scaleY = (viewport.height * padding) / height;
  const scale = Math.min(scaleX, scaleY);
  const zoom = Math.log2(scale);
  return {
    target: [(minX + maxX) / 2, (minY + maxY) / 2, 0],
    zoom,
  };
}

function decodeScalarArray(buffer: ArrayBuffer, format: string): ArrayBufferView {
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

export async function renderDeckLayers(options: RenderDeckLayersArgs): Promise<RenderDeckLayersResult> {
  const { manifest, layer, tileLayout, showMeshEdges, assetResolver, signal } = options;
  if (!manifest || !layer) return { layers: [], stats: null };
  if (signal?.aborted) throw createAbortError();
  const tick = createYieldTicker(signal);

  const layerId = layer.layerId;
  const isTileOddQLayer = layer.kind === "grid" || layer.meta?.space === "tile";
  const tileSize = 1;

  const meshEdges = manifest.layers.find(
    (l) => l.kind === "segments" && l.layerId === "foundation.mesh.edges"
  ) as Extract<VizLayerEntryV0, { kind: "segments" }> | undefined;

  const loadScalar = async (
    path: string | undefined,
    buffer: ArrayBuffer | undefined,
    format: string
  ): Promise<ArrayBufferView> => {
    if (signal?.aborted) throw createAbortError();
    if (buffer) return decodeScalarArray(buffer, format);
    if (!assetResolver || !path) throw new Error(`Missing scalar payload for ${layerId}`);
    const buf = await assetResolver.readArrayBuffer(path);
    if (signal?.aborted) throw createAbortError();
    return decodeScalarArray(buf, format);
  };

  const baseLayers: Layer[] = [];
  const shouldShowMeshEdges =
    Boolean(showMeshEdges) &&
    Boolean(meshEdges) &&
    (layer.kind === "points" || layer.kind === "segments");

  if (shouldShowMeshEdges && meshEdges) {
    let seg: Float32Array;
    if (meshEdges.segments) {
      seg = new Float32Array(meshEdges.segments);
    } else {
      if (!assetResolver || !meshEdges.segmentsPath) throw new Error("Missing mesh edge payload");
      const segBuf = await assetResolver.readArrayBuffer(meshEdges.segmentsPath);
      seg = new Float32Array(segBuf);
    }

    const count = (seg.length / 4) | 0;
    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      await tick(i);
      const x0 = seg[i * 4] ?? 0;
      const y0 = seg[i * 4 + 1] ?? 0;
      const x1 = seg[i * 4 + 2] ?? 0;
      const y1 = seg[i * 4 + 3] ?? 0;
      const base = i * 2;
      sourcePositions[base] = x0;
      sourcePositions[base + 1] = y0;
      targetPositions[base] = x1;
      targetPositions[base + 1] = y1;
    }

    baseLayers.push(
      new LineLayer({
        id: "foundation.mesh.edges::base",
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
    const values = await loadScalar(layer.path, layer.values, layer.format);
    const { width, height } = layer.dims;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    const categoricalColorMap =
      layer.meta?.palette === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({
            values,
            seedKey: `${manifest?.runId ?? "run"}:${layerId}`,
          })
        : undefined;

    const tiles: Array<{ polygon: Array<[number, number]>; v: number }> = [];
    const len = width * height;
    for (let i = 0; i < len; i++) {
      await tick(i);
      const x = i % width;
      const y = (i / width) | 0;
      const v = (values as any)[i] ?? 0;
      const vv = Number(v);
      if (Number.isFinite(vv)) {
        if (vv < min) min = vv;
        if (vv > max) max = vv;
      }

      const center = tileLayout === "col-offset" ? oddQTileCenter(x, y, tileSize) : oddRTileCenter(x, y, tileSize);
      tiles.push({ polygon: hexPolygonPointy(center, tileSize), v: vv });
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;

    return {
      layers: [
        ...baseLayers,
        new PolygonLayer({
          id: `${layerId}::hex`,
          data: tiles,
          getFillColor: (d) => colorForValue(layerId, d.v, categoricalColorMap, layer.meta),
          getPolygon: (d) => d.polygon,
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
    let positions: Float32Array;
    if (layer.positions) {
      positions = new Float32Array(layer.positions);
    } else {
      if (!assetResolver || !layer.positionsPath) throw new Error("Missing points payload");
      const posBuf = await assetResolver.readArrayBuffer(layer.positionsPath);
      if (signal?.aborted) throw createAbortError();
      positions = new Float32Array(posBuf);
    }

    const values =
      layer.values && layer.valueFormat
        ? decodeScalarArray(layer.values, layer.valueFormat)
        : layer.valuesPath && layer.valueFormat
          ? await loadScalar(layer.valuesPath, undefined, layer.valueFormat)
          : null;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    const categoricalColorMap =
      values && layer.meta?.palette === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
        : undefined;

    const count = (positions.length / 2) | 0;
    const positionsOut = isTileOddQLayer ? new Float32Array(count * 2) : positions;
    const colors = new Uint8ClampedArray(count * 4);
    for (let i = 0; i < count; i++) {
      await tick(i);
      const rawX = positions[i * 2] ?? 0;
      const rawY = positions[i * 2 + 1] ?? 0;
      const v = values ? Number((values as any)[i] ?? 0) : 0;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      let x = rawX;
      let y = rawY;
      if (isTileOddQLayer) {
        [x, y] =
          tileLayout === "col-offset"
            ? oddQPointFromTileXY(rawX, rawY, tileSize)
            : oddRPointFromTileXY(rawX, rawY, tileSize);
      }
      if (positionsOut !== positions) {
        const base = i * 2;
        positionsOut[base] = x;
        positionsOut[base + 1] = y;
      }
      writeColorForValue(colors, i * 4, layerId, v, categoricalColorMap, layer.meta);
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;

    return {
      layers: [
        ...baseLayers,
        new ScatterplotLayer({
          id: `${layerId}::points`,
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
    let seg: Float32Array;
    if (layer.segments) {
      seg = new Float32Array(layer.segments);
    } else {
      if (!assetResolver || !layer.segmentsPath) throw new Error("Missing segments payload");
      const segBuf = await assetResolver.readArrayBuffer(layer.segmentsPath);
      if (signal?.aborted) throw createAbortError();
      seg = new Float32Array(segBuf);
    }

    const values =
      layer.values && layer.valueFormat
        ? decodeScalarArray(layer.values, layer.valueFormat)
        : layer.valuesPath && layer.valueFormat
          ? await loadScalar(layer.valuesPath, undefined, layer.valueFormat)
          : null;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    const categoricalColorMap =
      values && layer.meta?.palette === "categorical" && !layer.meta?.categories?.length
        ? buildCategoricalColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
        : undefined;

    const count = (seg.length / 4) | 0;
    const sourcePositions = new Float32Array(count * 2);
    const targetPositions = new Float32Array(count * 2);
    const colors = new Uint8ClampedArray(count * 4);
    for (let i = 0; i < count; i++) {
      await tick(i);
      const rx0 = seg[i * 4] ?? 0;
      const ry0 = seg[i * 4 + 1] ?? 0;
      const rx1 = seg[i * 4 + 2] ?? 0;
      const ry1 = seg[i * 4 + 3] ?? 0;
      const v = values ? Number((values as any)[i] ?? 0) : 0;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      let x0 = rx0;
      let y0 = ry0;
      let x1 = rx1;
      let y1 = ry1;
      if (isTileOddQLayer) {
        [x0, y0] =
          tileLayout === "col-offset"
            ? oddQPointFromTileXY(rx0, ry0, tileSize)
            : oddRPointFromTileXY(rx0, ry0, tileSize);
        [x1, y1] =
          tileLayout === "col-offset"
            ? oddQPointFromTileXY(rx1, ry1, tileSize)
            : oddRPointFromTileXY(rx1, ry1, tileSize);
      }
      const base = i * 2;
      sourcePositions[base] = x0;
      sourcePositions[base + 1] = y0;
      targetPositions[base] = x1;
      targetPositions[base + 1] = y1;
      writeColorForValue(colors, i * 4, layerId, v, categoricalColorMap, layer.meta);
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;

    return {
      layers: [
        ...baseLayers,
        new LineLayer({
          id: `${layerId}::segments`,
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

  return { layers: baseLayers, stats: null };
}

export function buildBackgroundGridLayer(args: {
  enabled: boolean;
  layer: VizLayerEntryV0 | null;
  viewState: any;
  viewportSize: { width: number; height: number };
}): Layer | null {
  const { enabled, layer, viewState, viewportSize } = args;
  if (!enabled) return null;
  if (!layer) return null;
  if (!(layer.kind === "points" || layer.kind === "segments")) return null;
  if (layer.meta?.showGrid === false) return null;

  const zoom = typeof viewState?.zoom === "number" ? viewState.zoom : 0;
  const scale = Math.pow(2, zoom);
  const worldWidth = viewportSize.width / Math.max(1e-6, scale);
  const worldHeight = viewportSize.height / Math.max(1e-6, scale);

  const tx = Array.isArray(viewState?.target) ? Number(viewState.target[0]) : 0;
  const ty = Array.isArray(viewState?.target) ? Number(viewState.target[1]) : 0;
  const minX = tx - worldWidth / 2;
  const maxX = tx + worldWidth / 2;
  const minY = ty - worldHeight / 2;
  const maxY = ty + worldHeight / 2;

  const step = niceStep(worldWidth / 26);
  const x0 = Math.floor(minX / step) * step;
  const y0 = Math.floor(minY / step) * step;
  const x1 = Math.ceil(maxX / step) * step;
  const y1 = Math.ceil(maxY / step) * step;

  const points: Array<{ x: number; y: number }> = [];
  const maxPoints = 1800;
  for (let y = y0; y <= y1; y += step) {
    for (let x = x0; x <= x1; x += step) {
      points.push({ x, y });
      if (points.length >= maxPoints) break;
    }
    if (points.length >= maxPoints) break;
  }

  return new ScatterplotLayer({
    id: "bg.mesh.grid",
    data: points,
    getPosition: (d) => [d.x, d.y],
    getFillColor: [148, 163, 184, 55],
    radiusUnits: "pixels",
    getRadius: 1.2,
    pickable: false,
  });
}
