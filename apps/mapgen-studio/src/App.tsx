import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";

type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

type VizLayerEntryV0 =
  | {
      kind: "grid";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      format: VizScalarFormat;
      dims: { width: number; height: number };
      path: string;
      bounds: Bounds;
    }
  | {
      kind: "points";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      positionsPath: string;
      valuesPath?: string;
      valueFormat?: VizScalarFormat;
      bounds: Bounds;
    }
  | {
      kind: "segments";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      segmentsPath: string;
      valuesPath?: string;
      valueFormat?: VizScalarFormat;
      bounds: Bounds;
    };

type VizManifestV0 = {
  version: 0;
  runId: string;
  planFingerprint: string;
  steps: Array<{ stepId: string; phase?: string; stepIndex: number }>;
  layers: VizLayerEntryV0[];
};

type FileMap = Map<string, File>;

type EraLayerInfo = { eraIndex: number; baseLayerId: string };

function stripRootDirPrefix(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return path;
  return parts.slice(1).join("/");
}

function formatLabel(stepId: string): string {
  return stepId.split(".").slice(-1)[0] ?? stepId;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

type TileLayout = "row-offset" | "col-offset";

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
  // Pointy-top, rows offset horizontally.
  // Equivalent to: axial(q = col - (row - (row&1))/2, r = row) → pointy pixel.
  const x = size * Math.sqrt(3) * (col + ((row & 1) ? 0.5 : 0));
  const y = size * 1.5 * row;
  return [x, y];
}

function oddRPointFromTileXY(x: number, y: number, size: number): [number, number] {
  // Use the integer row parity for horizontal shift; y may be fractional for centroids.
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

function boundsForTileGrid(layout: TileLayout, dims: { width: number; height: number }, size: number): Bounds {
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

function fitToBounds(bounds: Bounds, viewport: { width: number; height: number }): { target: [number, number, number]; zoom: number } {
  const [minX, minY, maxX, maxY] = bounds;
  const bw = Math.max(1e-6, maxX - minX);
  const bh = Math.max(1e-6, maxY - minY);
  const padding = 0.92;
  const scale = Math.min((viewport.width * padding) / bw, (viewport.height * padding) / bh);
  const zoom = Math.log2(Math.max(1e-6, scale));
  return { target: [(minX + maxX) / 2, (minY + maxY) / 2, 0], zoom };
}

function colorForValue(layerId: string, value: number): [number, number, number, number] {
  if (!Number.isFinite(value)) return [120, 120, 120, 220];

  if (layerId.includes("crust") && layerId.toLowerCase().includes("type")) {
    return value === 1 ? [34, 197, 94, 230] : [37, 99, 235, 230];
  }

  if (layerId.includes("boundaryType")) {
    if (value === 1) return [239, 68, 68, 240];
    if (value === 2) return [59, 130, 246, 240];
    if (value === 3) return [245, 158, 11, 240];
    return [107, 114, 128, 180];
  }

  if (layerId.includes("plate")) {
    // stable hash color for categorical IDs
    const v = (value | 0) >>> 0;
    const r = (v * 97) % 255;
    const g = (v * 57) % 255;
    const b = (v * 23) % 255;
    return [r, g, b, 230];
  }

  // generic 0..1 mapping
  const t = clamp(value, 0, 1);
  const r = Math.round(255 * t);
  const b = Math.round(255 * (1 - t));
  return [r, 80, b, 230];
}

type LegendItem = { label: string; color: [number, number, number, number] };

function legendForLayer(layer: VizLayerEntryV0 | null, stats: { min?: number; max?: number } | null): { title: string; items: LegendItem[]; note?: string } | null {
  if (!layer) return null;
  const id = layer.layerId;

  if (id.endsWith("tileBoundaryType") || id.endsWith("boundaryType") || id.includes("boundaryType")) {
    return {
      title: "Boundary Type",
      items: [
        { label: "0 = none/unknown", color: [107, 114, 128, 180] },
        { label: "1 = convergent", color: [239, 68, 68, 240] },
        { label: "2 = divergent", color: [59, 130, 246, 240] },
        { label: "3 = transform", color: [245, 158, 11, 240] },
      ],
    };
  }

  if (id.includes("crusttiles") || id.includes("crust") && id.toLowerCase().includes("type")) {
    return {
      title: "Crust Type",
      items: [
        { label: "0 = oceanic", color: [37, 99, 235, 230] },
        { label: "1 = continental", color: [34, 197, 94, 230] },
      ],
    };
  }

  if (id.includes("plate") && (id.toLowerCase().includes("id") || id.toLowerCase().includes("plate"))) {
    return {
      title: "Plate IDs",
      items: [
        { label: "categorical (stable hashed color by ID)", color: [148, 163, 184, 220] },
      ],
    };
  }

  if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) {
    const min = stats.min ?? 0;
    const max = stats.max ?? 1;
    return {
      title: "Scalar",
      items: [
        { label: `min = ${min.toFixed(3)}`, color: colorForValue(id, 0) },
        { label: `max = ${max.toFixed(3)}`, color: colorForValue(id, 1) },
      ],
      note: "Values are mapped with a simple palette in V0.",
    };
  }

  return {
    title: "Legend",
    items: [{ label: "no legend available for this layer yet", color: [148, 163, 184, 220] }],
  };
}

function parseTectonicHistoryEraLayerId(layerId: string): EraLayerInfo | null {
  // e.g. foundation.tectonicHistory.era3.upliftPotential
  const m = /^foundation\.tectonicHistory\.era(\d+)\.(.+)$/.exec(layerId);
  if (!m) return null;
  const eraIndex = Number.parseInt(m[1] ?? "", 10);
  const baseLayerId = String(m[2] ?? "");
  if (!Number.isFinite(eraIndex) || eraIndex < 0 || !baseLayerId) return null;
  return { eraIndex, baseLayerId };
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
  }
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

async function loadManifestFromFileMap(fileMap: FileMap): Promise<VizManifestV0> {
  const manifestFile = fileMap.get("manifest.json");
  if (!manifestFile) {
    throw new Error("manifest.json not found. Select the run folder that contains manifest.json.");
  }
  const text = await readFileAsText(manifestFile);
  return JSON.parse(text) as VizManifestV0;
}

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const isNarrow = viewportSize.width < 760;

  const [fileMap, setFileMap] = useState<FileMap | null>(null);
  const [manifest, setManifest] = useState<VizManifestV0 | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);

  const [viewState, setViewState] = useState<any>({ target: [0, 0, 0], zoom: 0 });
  const [layerStats, setLayerStats] = useState<{ min?: number; max?: number } | null>(null);
  const [tileLayout, setTileLayout] = useState<TileLayout>("row-offset");
  const [showMeshEdges, setShowMeshEdges] = useState(true);
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(true);
  const [eraIndex, setEraIndex] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  const layersForStep = useMemo(() => {
    if (!manifest || !selectedStepId) return [];
    return manifest.layers
      .filter((l) => l.stepId === selectedStepId)
      .map((l) => ({ key: `${l.stepId}::${l.layerId}::${l.kind}`, layer: l }));
  }, [manifest, selectedStepId]);

  const selectedLayer = useMemo(() => {
    if (!layersForStep.length || !selectedLayerKey) return null;
    return layersForStep.find((l) => l.key === selectedLayerKey)?.layer ?? null;
  }, [layersForStep, selectedLayerKey]);

  const eraInfo = useMemo(() => {
    if (!selectedLayer) return null;
    return parseTectonicHistoryEraLayerId(selectedLayer.layerId);
  }, [selectedLayer]);

  const eraMax = useMemo(() => {
    if (!manifest || !selectedStepId || !eraInfo) return null;
    let max = -1;
    const prefix = `foundation.tectonicHistory.era`;
    const suffix = `.${eraInfo.baseLayerId}`;
    for (const layer of manifest.layers) {
      if (layer.stepId !== selectedStepId) continue;
      if (!layer.layerId.startsWith(prefix)) continue;
      if (!layer.layerId.endsWith(suffix)) continue;
      const info = parseTectonicHistoryEraLayerId(layer.layerId);
      if (!info) continue;
      if (info.baseLayerId !== eraInfo.baseLayerId) continue;
      if (info.eraIndex > max) max = info.eraIndex;
    }
    return max >= 0 ? max : null;
  }, [manifest, selectedStepId, eraInfo]);

  const effectiveLayer = useMemo(() => {
    if (!manifest || !selectedStepId || !selectedLayer) return selectedLayer;
    if (!eraInfo) return selectedLayer;
    const idx = eraMax != null ? clamp(eraIndex, 0, eraMax) : eraIndex;
    const desiredId = `foundation.tectonicHistory.era${idx}.${eraInfo.baseLayerId}`;
    return (
      manifest.layers.find((l) => l.stepId === selectedStepId && l.layerId === desiredId) ?? selectedLayer
    );
  }, [manifest, selectedStepId, selectedLayer, eraInfo, eraIndex, eraMax]);

  const setFittedView = useCallback(
    (bounds: Bounds) => {
      const fit = fitToBounds(bounds, viewportSize);
      setViewState((prev: any) => ({ ...prev, ...fit }));
    },
    [viewportSize]
  );

  const openDumpFolder = useCallback(async () => {
    setError(null);
    try {
      const anyWindow = window as any;
      if (typeof anyWindow.showDirectoryPicker === "function") {
        const dirHandle: any = await anyWindow.showDirectoryPicker();
        const files: FileMap = new Map();

        const walk = async (handle: any, prefix: string) => {
          for await (const [name, entry] of handle.entries()) {
            const path = prefix ? `${prefix}/${name}` : name;
            if (entry.kind === "directory") {
              await walk(entry, path);
            } else if (entry.kind === "file") {
              const file = await entry.getFile();
              files.set(path, file);
            }
          }
        };

        await walk(dirHandle, "");
        // If the selected folder is the run folder, manifest.json should be at root.
        // If it was selected with an extra parent dir, allow stripping one leading component.
        const normalized: FileMap = new Map();
        for (const [path, file] of files.entries()) {
          normalized.set(path, file);
          normalized.set(stripRootDirPrefix(path), file);
        }
        setFileMap(normalized);
        const m = await loadManifestFromFileMap(normalized);
        setManifest(m);
        const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
        setSelectedStepId(firstStep);
        setSelectedLayerKey(null);
        setFittedView([0, 0, 1, 1]);
        return;
      }

      // Fallback: directory upload (Chromium via webkitdirectory).
      setError("Your browser does not support folder picking. Use a Chromium-based browser, or enable directory picking.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [setFittedView]);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const onDirectoryFiles = useCallback(async () => {
    setError(null);
    try {
      const input = directoryInputRef.current;
      if (!input?.files) return;
      const files: FileMap = new Map();
      for (const file of Array.from(input.files)) {
        const rel = (file as any).webkitRelativePath ? String((file as any).webkitRelativePath) : file.name;
        files.set(stripRootDirPrefix(rel), file);
      }
      setFileMap(files);
      const m = await loadManifestFromFileMap(files);
      setManifest(m);
      const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
      setSelectedStepId(firstStep);
      setSelectedLayerKey(null);
      setFittedView([0, 0, 1, 1]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [setFittedView]);

  useEffect(() => {
    if (!manifest || !selectedStepId) return;
    const first = manifest.layers
      .filter((l) => l.stepId === selectedStepId)
      .sort((a, b) => a.stepIndex - b.stepIndex)[0];
    if (!first) return;
    const key = `${first.stepId}::${first.layerId}::${first.kind}`;
    setSelectedLayerKey(key);
    if (first.kind === "grid") {
      setFittedView(boundsForTileGrid(tileLayout, first.dims, 1));
    } else {
      setFittedView(first.bounds);
    }
  }, [manifest, selectedStepId, setFittedView, tileLayout]);

  useEffect(() => {
    if (!eraInfo) return;
    setEraIndex(eraInfo.eraIndex);
  }, [eraInfo]);

  const deckLayers = useMemo(() => {
    if (!manifest || !fileMap || !effectiveLayer) return [];

    const layerId = effectiveLayer.layerId;
    const isTileOddQLayer = effectiveLayer.kind === "grid" || layerId.startsWith("foundation.plateTopology.");
    const tileSize = 1;

    const meshEdges = manifest.layers.find(
      (l) => l.kind === "segments" && l.layerId === "foundation.mesh.edges"
    ) as Extract<VizLayerEntryV0, { kind: "segments" }> | undefined;

    const loadScalar = async (path: string, format: VizScalarFormat): Promise<ArrayBufferView> => {
      const file = fileMap.get(path);
      if (!file) throw new Error(`Missing file: ${path}`);
      const buf = await readFileAsArrayBuffer(file);
      return decodeScalarArray(buf, format);
    };

    // We keep data in component state via a simple async cache.
    // For V0 (MAPSIZE_HUGE), sizes are small enough to materialize on selection.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    return (async () => {
      setLayerStats(null);

      const baseLayers: any[] = [];
      const shouldShowMeshEdges =
        Boolean(showMeshEdges) &&
        Boolean(meshEdges) &&
        (effectiveLayer.kind === "points" || effectiveLayer.kind === "segments") &&
        effectiveLayer.layerId.startsWith("foundation.") &&
        !effectiveLayer.layerId.startsWith("foundation.plateTopology.");

      if (shouldShowMeshEdges && meshEdges) {
        const segFile = fileMap.get(meshEdges.segmentsPath);
        if (!segFile) throw new Error(`Missing file: ${meshEdges.segmentsPath}`);
        const segBuf = await readFileAsArrayBuffer(segFile);
        const seg = new Float32Array(segBuf);

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

      if (effectiveLayer.kind === "grid") {
        const values = await loadScalar(effectiveLayer.path, effectiveLayer.format);
        const { width, height } = effectiveLayer.dims;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PolygonLayer({
            id: `${layerId}::hex`,
            data: tiles,
            getFillColor: (d) => colorForValue(layerId, d.v),
            getPolygon: (d) => d.polygon,
            stroked: true,
            getLineColor: [17, 24, 39, 220],
            getLineWidth: 1,
            lineWidthUnits: "pixels",
            pickable: true,
          }),
        ];
      }

      if (effectiveLayer.kind === "points") {
        const posFile = fileMap.get(effectiveLayer.positionsPath);
        if (!posFile) throw new Error(`Missing file: ${effectiveLayer.positionsPath}`);
        const posBuf = await readFileAsArrayBuffer(posFile);
        const positions = new Float32Array(posBuf);

        const values =
          effectiveLayer.valuesPath && effectiveLayer.valueFormat
            ? await loadScalar(effectiveLayer.valuesPath, effectiveLayer.valueFormat)
            : null;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new ScatterplotLayer({
            id: `${layerId}::points`,
            data: points,
            getPosition: (d) => [d.x, d.y],
            getFillColor: (d) => colorForValue(layerId, d.v),
            radiusUnits: "common",
            getRadius: 0.95,
            pickable: true,
          }),
        ];
      }

      if (effectiveLayer.kind === "segments") {
        const segFile = fileMap.get(effectiveLayer.segmentsPath);
        if (!segFile) throw new Error(`Missing file: ${effectiveLayer.segmentsPath}`);
        const segBuf = await readFileAsArrayBuffer(segFile);
        const seg = new Float32Array(segBuf);

        const values =
          effectiveLayer.valuesPath && effectiveLayer.valueFormat
            ? await loadScalar(effectiveLayer.valuesPath, effectiveLayer.valueFormat)
            : null;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PathLayer({
            id: `${layerId}::segments`,
            data: segments,
            getPath: (d) => d.path,
            getColor: (d) => colorForValue(layerId, d.v),
            getWidth: 1.5,
            widthUnits: "pixels",
            pickable: true,
          }),
        ];
      }

      return [];
    })() as any;
  }, [manifest, fileMap, effectiveLayer, tileLayout, showMeshEdges]);

  // Resolve async layers into a stable state
  const [resolvedLayers, setResolvedLayers] = useState<any[]>([]);
  useEffect(() => {
    const v = deckLayers as any;
    if (typeof v?.then === "function") {
      v.then(setResolvedLayers).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    } else {
      setResolvedLayers(v);
    }
  }, [deckLayers]);

  useEffect(() => {
    if (!effectiveLayer) return;
    if (effectiveLayer.kind === "grid") {
      setFittedView(boundsForTileGrid(tileLayout, effectiveLayer.dims, 1));
      return;
    }
    setFittedView(effectiveLayer.bounds);
  }, [effectiveLayer, setFittedView, tileLayout]);

  const legend = useMemo(() => legendForLayer(effectiveLayer, layerStats), [effectiveLayer, layerStats]);

  const triggerDirectoryPicker = useCallback(() => {
    directoryInputRef.current?.click();
  }, []);

  const controlBaseStyle: React.CSSProperties = useMemo(
    () => ({
      background: "#111827",
      color: "#e5e7eb",
      border: "1px solid #374151",
      borderRadius: 8,
      padding: isNarrow ? "10px 10px" : "6px 8px",
      minWidth: 0,
      fontSize: isNarrow ? 14 : 13,
    }),
    [isNarrow]
  );

  const buttonStyle: React.CSSProperties = useMemo(
    () => ({
      ...controlBaseStyle,
      padding: isNarrow ? "10px 12px" : "6px 10px",
      cursor: "pointer",
      fontWeight: 600,
      width: isNarrow ? "100%" : undefined,
      textAlign: "center",
    }),
    [controlBaseStyle, isNarrow]
  );

  const backgroundGridLayer = useMemo(() => {
    if (!showBackgroundGrid) return null;
    if (!effectiveLayer) return null;
    if (!(effectiveLayer.kind === "points" || effectiveLayer.kind === "segments")) return null;
    if (effectiveLayer.layerId.startsWith("foundation.plateTopology.")) return null;

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
  }, [showBackgroundGrid, effectiveLayer, viewState, viewportSize]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b1020", color: "#e5e7eb" }}>
      <div
        style={{
          padding: isNarrow ? "10px 12px" : "12px 14px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          gap: isNarrow ? 10 : 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: isNarrow ? "flex-start" : "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: isNarrow ? 16 : 14 }}>MapGen Studio</div>
          <div style={{ color: "#9ca3af", fontSize: isNarrow ? 13 : 12 }}>Foundation Viz (V0)</div>
          <div style={{ flex: 1 }} />
          {!isNarrow ? (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Open a run folder under <span style={{ color: "#e5e7eb" }}>mods/mod-swooper-maps/dist/visualization</span>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={openDumpFolder} style={buttonStyle}>
            Open dump folder
          </button>

          <input
            ref={directoryInputRef}
            type="file"
            multiple
            onChange={onDirectoryFiles}
            style={{ display: "none" }}
            {...({ webkitdirectory: "", directory: "" } as any)}
          />
          <button onClick={triggerDirectoryPicker} style={buttonStyle}>
            Upload dump folder
          </button>

          <button
            onClick={() => selectedLayer && setFittedView(selectedLayer.bounds)}
            style={{ ...buttonStyle, opacity: selectedLayer ? 1 : 0.55 }}
            disabled={!selectedLayer}
          >
            Fit
          </button>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flex: isNarrow ? "1 1 100%" : "0 0 auto",
              width: isNarrow ? "100%" : undefined,
              justifyContent: isNarrow ? "space-between" : "flex-start",
              padding: isNarrow ? "2px 2px" : 0,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Show mesh edges</span>
            <input type="checkbox" checked={showMeshEdges} onChange={(e) => setShowMeshEdges(e.target.checked)} />
          </label>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flex: isNarrow ? "1 1 100%" : "0 0 auto",
              width: isNarrow ? "100%" : undefined,
              justifyContent: isNarrow ? "space-between" : "flex-start",
              padding: isNarrow ? "2px 2px" : 0,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Background grid</span>
            <input
              type="checkbox"
              checked={showBackgroundGrid}
              onChange={(e) => setShowBackgroundGrid(e.target.checked)}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "0 0 auto", width: isNarrow ? "100%" : undefined }}>
            <span style={{ fontSize: 12, color: "#9ca3af", minWidth: isNarrow ? 56 : undefined }}>Step</span>
            <select
              value={selectedStepId ?? ""}
              onChange={(e) => setSelectedStepId(e.target.value || null)}
              style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
              disabled={!steps.length}
            >
              {steps.map((s) => (
                <option key={s.stepId} value={s.stepId}>
                  {s.stepIndex} · {formatLabel(s.stepId)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "1 1 420px", width: isNarrow ? "100%" : undefined }}>
            <span style={{ fontSize: 12, color: "#9ca3af", minWidth: isNarrow ? 56 : undefined }}>Layer</span>
            <select
              value={selectedLayerKey ?? ""}
              onChange={(e) => setSelectedLayerKey(e.target.value || null)}
              style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
              disabled={!layersForStep.length}
            >
              {layersForStep.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.layer.layerId} ({l.layer.kind})
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "0 0 auto", width: isNarrow ? "100%" : undefined }}>
            <span style={{ fontSize: 12, color: "#9ca3af", minWidth: isNarrow ? 76 : undefined }}>Hex layout</span>
            <select
              value={tileLayout}
              onChange={(e) => setTileLayout(e.target.value as TileLayout)}
              style={{ ...controlBaseStyle, flex: 1, width: isNarrow ? "100%" : 220 }}
            >
              <option value="row-offset">row-offset (Civ-like)</option>
              <option value="col-offset">col-offset</option>
            </select>
          </label>

          {eraInfo && eraMax != null ? (
            <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "1 1 420px", width: isNarrow ? "100%" : undefined }}>
              <span style={{ fontSize: 12, color: "#9ca3af", minWidth: isNarrow ? 76 : undefined }}>Era</span>
              <input
                type="range"
                min={0}
                max={eraMax}
                step={1}
                value={clamp(eraIndex, 0, eraMax)}
                onChange={(e) => setEraIndex(Number.parseInt(e.target.value, 10))}
                style={{ flex: 1, width: "100%" }}
              />
              <span style={{ fontSize: 12, color: "#e5e7eb", minWidth: 26, textAlign: "right" }}>
                {clamp(eraIndex, 0, eraMax)}
              </span>
            </label>
          ) : null}
        </div>
      </div>

      {error ? (
        <div style={{ padding: 12, background: "#2a0b0b", borderBottom: "1px solid #7f1d1d", color: "#fecaca" }}>
          {error}
        </div>
      ) : null}

      <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
        {manifest ? (
          <DeckGL
            views={new OrthographicView({ id: "ortho" })}
            controller={true}
            viewState={viewState}
            onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
            layers={[...(backgroundGridLayer ? [backgroundGridLayer] : []), ...resolvedLayers]}
          />
        ) : (
          <div style={{ padding: 18, color: "#9ca3af" }}>
            Select a dump folder containing `manifest.json` (e.g. `mods/mod-swooper-maps/dist/visualization/&lt;runId&gt;`).
          </div>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: 12, color: "#9ca3af", background: "rgba(0,0,0,0.35)", padding: "6px 8px", borderRadius: 8 }}>
          {manifest ? (
            <>
              runId: <span style={{ color: "#e5e7eb" }}>{manifest.runId.slice(0, 12)}…</span>
              {" · "}
              viewport: {Math.round(viewportSize.width)}×{Math.round(viewportSize.height)}
            </>
          ) : (
            <>No dump loaded</>
          )}
        </div>

        {manifest && effectiveLayer && legend ? (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 12,
              color: "#e5e7eb",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: "10px 10px",
              borderRadius: 10,
              maxWidth: isNarrow ? "calc(100% - 20px)" : 360,
              maxHeight: isNarrow ? "40vh" : "70vh",
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{legend.title}</div>
            <div style={{ color: "#9ca3af", marginBottom: 8 }}>
              <div>step: {formatLabel(effectiveLayer.stepId)}</div>
              <div>layer: {effectiveLayer.layerId} ({effectiveLayer.kind})</div>
              {eraInfo && eraMax != null ? <div>era: {clamp(eraIndex, 0, eraMax)}</div> : null}
              {effectiveLayer.kind === "grid" ? <div>tile layout: {tileLayout}</div> : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {legend.items.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: `rgba(${item.color[0]},${item.color[1]},${item.color[2]},${item.color[3] / 255})`,
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#e5e7eb" }}>{item.label}</span>
                </div>
              ))}
            </div>
            {legend.note ? <div style={{ marginTop: 8, color: "#9ca3af" }}>{legend.note}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
