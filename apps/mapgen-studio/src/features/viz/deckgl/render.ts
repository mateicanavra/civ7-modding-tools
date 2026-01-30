import type { Layer } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { buildPlateColorMap, colorForValue, isPlateIdLayer } from "../presentation";
import type { Bounds, TileLayout, VizAssetResolver, VizLayerEntryV0, VizManifestV0 } from "../model";

type ScalarStats = { min?: number; max?: number };

export type RenderDeckLayersArgs = {
  manifest: VizManifestV0 | null;
  layer: VizLayerEntryV0 | null;
  tileLayout: TileLayout;
  showMeshEdges: boolean;
  assetResolver?: VizAssetResolver | null;
};

export type RenderDeckLayersResult = {
  layers: Layer[];
  stats: ScalarStats | null;
};

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
  const { manifest, layer, tileLayout, showMeshEdges, assetResolver } = options;
  if (!manifest || !layer) return { layers: [], stats: null };

  const layerId = layer.layerId;
  const isTileOddQLayer = layer.kind === "grid" || layerId.startsWith("foundation.plateTopology.");
  const tileSize = 1;

  const meshEdges = manifest.layers.find(
    (l) => l.kind === "segments" && l.layerId === "foundation.mesh.edges"
  ) as Extract<VizLayerEntryV0, { kind: "segments" }> | undefined;

  const loadScalar = async (
    path: string | undefined,
    buffer: ArrayBuffer | undefined,
    format: string
  ): Promise<ArrayBufferView> => {
    if (buffer) return decodeScalarArray(buffer, format);
    if (!assetResolver || !path) throw new Error(`Missing scalar payload for ${layerId}`);
    const buf = await assetResolver.readArrayBuffer(path);
    return decodeScalarArray(buf, format);
  };

  const baseLayers: Layer[] = [];
  const shouldShowMeshEdges =
    Boolean(showMeshEdges) &&
    Boolean(meshEdges) &&
    (layer.kind === "points" || layer.kind === "segments") &&
    layer.layerId.startsWith("foundation.") &&
    !layer.layerId.startsWith("foundation.plateTopology.");

  if (shouldShowMeshEdges && meshEdges) {
    let seg: Float32Array;
    if (meshEdges.segments) {
      seg = new Float32Array(meshEdges.segments);
    } else {
      if (!assetResolver || !meshEdges.segmentsPath) throw new Error("Missing mesh edge payload");
      const segBuf = await assetResolver.readArrayBuffer(meshEdges.segmentsPath);
      seg = new Float32Array(segBuf);
    }

    const edges: Array<{ path: [[number, number], [number, number]] }> = [];
    const count = (seg.length / 4) | 0;
    for (let i = 0; i < count; i++) {
      const x0 = seg[i * 4] ?? 0;
      const y0 = seg[i * 4 + 1] ?? 0;
      const x1 = seg[i * 4 + 2] ?? 0;
      const y1 = seg[i * 4 + 3] ?? 0;
      edges.push({ path: [[x0, y0], [x1, y1]] });
    }

    baseLayers.push(
      new PathLayer({
        id: "foundation.mesh.edges::base",
        data: edges,
        getPath: (d) => d.path,
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

    const plateColorMap = isPlateIdLayer(layerId)
      ? buildPlateColorMap({
          values,
          seedKey: `${manifest?.runId ?? "run"}:${layerId}`,
        })
      : undefined;

    const tiles: Array<{ polygon: Array<[number, number]>; v: number }> = [];
    const len = width * height;
    for (let i = 0; i < len; i++) {
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
          getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap, layer.meta),
          getPolygon: (d) => d.polygon,
          stroked: true,
          getLineColor: [17, 24, 39, 220],
          getLineWidth: 1,
          lineWidthUnits: "pixels",
          pickable: true,
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

    const plateColorMap =
      values && isPlateIdLayer(layerId)
        ? buildPlateColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
        : undefined;

    const points: Array<{ x: number; y: number; v: number }> = [];
    const count = (positions.length / 2) | 0;
    for (let i = 0; i < count; i++) {
      const rawX = positions[i * 2] ?? 0;
      const rawY = positions[i * 2 + 1] ?? 0;
      const v = values ? Number((values as any)[i] ?? 0) : 0;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      const [x, y] = isTileOddQLayer
        ? tileLayout === "col-offset"
          ? oddQPointFromTileXY(rawX, rawY, tileSize)
          : oddRPointFromTileXY(rawX, rawY, tileSize)
        : [rawX, rawY];
      points.push({ x, y, v });
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;

    return {
      layers: [
        ...baseLayers,
        new ScatterplotLayer({
          id: `${layerId}::points`,
          data: points,
          getPosition: (d) => [d.x, d.y],
          getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap, layer.meta),
          radiusUnits: "common",
          getRadius: 0.95,
          pickable: true,
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

    const plateColorMap =
      values && isPlateIdLayer(layerId)
        ? buildPlateColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
        : undefined;

    const segments: Array<{ path: [[number, number], [number, number]]; v: number }> = [];
    const count = (seg.length / 4) | 0;
    for (let i = 0; i < count; i++) {
      const rx0 = seg[i * 4] ?? 0;
      const ry0 = seg[i * 4 + 1] ?? 0;
      const rx1 = seg[i * 4 + 2] ?? 0;
      const ry1 = seg[i * 4 + 3] ?? 0;
      const v = values ? Number((values as any)[i] ?? 0) : 0;
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      const [x0, y0] = isTileOddQLayer
        ? tileLayout === "col-offset"
          ? oddQPointFromTileXY(rx0, ry0, tileSize)
          : oddRPointFromTileXY(rx0, ry0, tileSize)
        : [rx0, ry0];
      const [x1, y1] = isTileOddQLayer
        ? tileLayout === "col-offset"
          ? oddQPointFromTileXY(rx1, ry1, tileSize)
          : oddRPointFromTileXY(rx1, ry1, tileSize)
        : [rx1, ry1];
      segments.push({ path: [[x0, y0], [x1, y1]], v });
    }

    const stats = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;

    return {
      layers: [
        ...baseLayers,
        new PathLayer({
          id: `${layerId}::segments`,
          data: segments,
          getPath: (d) => d.path,
          getColor: (d) => colorForValue(layerId, d.v, plateColorMap, layer.meta),
          getWidth: 1.5,
          widthUnits: "pixels",
          pickable: true,
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
  if (layer.layerId.startsWith("foundation.plateTopology.")) return null;

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
