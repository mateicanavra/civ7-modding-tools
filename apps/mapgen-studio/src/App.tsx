import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import type { BrowserRunEvent, BrowserRunRequest } from "./browser-runner/protocol";

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
      path?: string;
      values?: ArrayBuffer;
      bounds: Bounds;
    }
  | {
      kind: "points";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      positionsPath?: string;
      positions?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
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
      segmentsPath?: string;
      segments?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
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

function safeStringify(value: unknown): string | null {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "bigint") return `${v}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    return null;
  }
}

function formatErrorForUi(e: unknown): string {
  if (e instanceof Error) {
    const parts: string[] = [];
    const header = e.name ? `${e.name}: ${e.message}` : e.message;
    parts.push(header || "Error");
    const details = safeStringify(e);
    if (details && details !== "{}") parts.push(details);
    if (e.stack) parts.push(e.stack);
    return parts.join("\n\n");
  }

  if (e instanceof ErrorEvent) {
    const parts: string[] = [];
    parts.push(e.message || "ErrorEvent");
    if (e.filename) parts.push(`${e.filename}:${e.lineno}:${e.colno}`);
    if (e.error) parts.push(formatErrorForUi(e.error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}

function randomU32(): number {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] ?? 0;
    }
  } catch {
    // ignore
  }
  return (Math.random() * 0xffffffff) >>> 0;
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

type RgbaColor = [number, number, number, number];

function hashStringToSeed(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function randomColor(rng: () => number): RgbaColor {
  const hue = rng() * 360;
  const saturation = 0.62 + rng() * 0.28;
  const lightness = 0.48 + rng() * 0.18;
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return [r, g, b, 230];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToOklab(rgb: RgbaColor): [number, number, number] {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return [L, A, B];
}

function oklabDistance(a: RgbaColor, b: RgbaColor): number {
  const [l1, a1, b1] = rgbToOklab(a);
  const [l2, a2, b2] = rgbToOklab(b);
  const dl = l1 - l2;
  const da = a1 - a2;
  const db = b1 - b2;
  return dl * dl + da * da + db * db;
}

function isPlateIdLayer(layerId: string): boolean {
  const lower = layerId.toLowerCase();
  if (lower.includes("boundarytype")) return false;
  if (!lower.includes("plate")) return false;
  if (lower.includes("celltoplate")) return true;
  if (lower.includes("tileplate")) return true;
  if (lower.includes("plateid")) return true;
  if (lower.includes("plateseed")) return true;
  return lower.includes("plate") && lower.includes("id");
}

function collectPlateIds(values: ArrayBufferView): number[] {
  const view = values as unknown as ArrayLike<number>;
  const ids = new Set<number>();
  for (let i = 0; i < view.length; i++) {
    const v = view[i] ?? 0;
    ids.add((v as number) | 0);
  }
  return [...ids].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
}

function generateOpposedPalette(count: number, seedKey: string): RgbaColor[] {
  if (count <= 0) return [];
  const rng = createRng(hashStringToSeed(seedKey));
  const poolSize = Math.max(64, count * 12);
  const candidates: RgbaColor[] = Array.from({ length: poolSize }, () => randomColor(rng));
  const used = new Array(candidates.length).fill(false);
  const selected: RgbaColor[] = [];

  const firstIndex = Math.floor(rng() * candidates.length);
  selected.push(candidates[firstIndex] ?? [148, 163, 184, 220]);
  used[firstIndex] = true;

  while (selected.length < count) {
    let bestIndex = -1;
    let bestScore = -Infinity;
    const allowReuse = selected.length >= candidates.length;

    for (let i = 0; i < candidates.length; i++) {
      if (!allowReuse && used[i]) continue;
      const color = candidates[i]!;

      let minDist = Infinity;
      for (const chosen of selected) {
        const d = oklabDistance(color, chosen);
        if (d < minDist) minDist = d;
      }

      if (!Number.isFinite(minDist)) minDist = 0;
      const score = minDist + rng() * 1e-3;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) {
      bestIndex = Math.floor(rng() * candidates.length);
    }

    const chosen = candidates[bestIndex] ?? [148, 163, 184, 220];
    selected.push(chosen);
    if (bestIndex >= 0 && bestIndex < used.length) used[bestIndex] = true;
  }

  return selected;
}

function buildPlateColorMap(options: {
  values: ArrayBufferView;
  seedKey: string;
}): Map<number, RgbaColor> {
  const ids = collectPlateIds(options.values);
  const palette = generateOpposedPalette(ids.length, options.seedKey);
  const colorById = new Map<number, RgbaColor>();
  for (let i = 0; i < ids.length; i++) {
    colorById.set(ids[i]!, palette[i] ?? [148, 163, 184, 220]);
  }

  return colorById;
}

function colorForValue(layerId: string, value: number, plateColorMap?: Map<number, RgbaColor>): RgbaColor {
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

  if (isPlateIdLayer(layerId)) {
    if (plateColorMap) {
      return plateColorMap.get(value | 0) ?? [148, 163, 184, 220];
    }
    const seedKey = `${layerId}:${value}`;
    const rng = createRng(hashStringToSeed(seedKey));
    return randomColor(rng);
  }

  // generic 0..1 mapping (expanded palette)
  const t = clamp(value, 0, 1);
  const ramp: RgbaColor[] = [
    [68, 1, 84, 230],
    [59, 82, 139, 230],
    [33, 145, 140, 230],
    [94, 201, 98, 230],
    [253, 231, 37, 230],
  ];

  const idx = t * (ramp.length - 1);
  const i0 = Math.max(0, Math.min(ramp.length - 1, Math.floor(idx)));
  const i1 = Math.max(0, Math.min(ramp.length - 1, Math.ceil(idx)));
  const tt = idx - i0;
  const a = ramp[i0]!;
  const b = ramp[i1]!;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * tt);
  return [lerp(a[0], b[0]), lerp(a[1], b[1]), lerp(a[2], b[2]), lerp(a[3], b[3])];
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
        { label: "categorical (random palette; neighboring plates avoid similar colors)", color: [148, 163, 184, 220] },
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

  const [mode, setMode] = useState<"browser" | "dump">("browser");

  const [dumpFileMap, setDumpFileMap] = useState<FileMap | null>(null);
  const [dumpManifest, setDumpManifest] = useState<VizManifestV0 | null>(null);

  const [browserManifest, setBrowserManifest] = useState<VizManifestV0 | null>(null);
  const browserWorkerRef = useRef<Worker | null>(null);
  const browserRunTokenRef = useRef<string | null>(null);
  const [browserRunning, setBrowserRunning] = useState(false);
  const [browserLastStep, setBrowserLastStep] = useState<{ stepId: string; stepIndex: number } | null>(null);
  const [browserSeed, setBrowserSeed] = useState(123);
  const [browserWidth, setBrowserWidth] = useState(106);
  const [browserHeight, setBrowserHeight] = useState(66);

  const manifest = mode === "dump" ? dumpManifest : browserManifest;
  const fileMap = mode === "dump" ? dumpFileMap : null;
  const [error, setError] = useState<string | null>(null);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);
  const selectedStepIdRef = useRef<string | null>(null);
  const selectedLayerKeyRef = useRef<string | null>(null);

  useEffect(() => {
    selectedStepIdRef.current = selectedStepId;
  }, [selectedStepId]);

  useEffect(() => {
    selectedLayerKeyRef.current = selectedLayerKey;
  }, [selectedLayerKey]);

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

  useEffect(() => {
    if (!manifest) return;
    if (selectedStepId && manifest.steps.some((s) => s.stepId === selectedStepId)) return;
    // For the in-browser runner, allow re-running the pipeline from step 0 while keeping
    // the UI pinned to a later step until the worker streams back up to it.
    if (mode === "browser" && browserRunning && selectedStepId) return;
    const firstStep = [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
    setSelectedStepId(firstStep);
    setSelectedLayerKey(null);
  }, [browserRunning, manifest, mode, selectedStepId]);

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
      setMode("dump");
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
        setDumpFileMap(normalized);
        const m = await loadManifestFromFileMap(normalized);
        setDumpManifest(m);
        const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
        setSelectedStepId(firstStep);
        setSelectedLayerKey(null);
        setFittedView([0, 0, 1, 1]);
        return;
      }

      // Fallback: directory upload (Chromium via webkitdirectory).
      setError("Your browser does not support folder picking. Use a Chromium-based browser, or enable directory picking.");
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [setFittedView]);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const onDirectoryFiles = useCallback(async () => {
    setError(null);
    try {
      const input = directoryInputRef.current;
      if (!input?.files) return;
      setMode("dump");
      const files: FileMap = new Map();
      for (const file of Array.from(input.files)) {
        const rel = (file as any).webkitRelativePath ? String((file as any).webkitRelativePath) : file.name;
        files.set(stripRootDirPrefix(rel), file);
      }
      setDumpFileMap(files);
      const m = await loadManifestFromFileMap(files);
      setDumpManifest(m);
      const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
      setSelectedStepId(firstStep);
      setSelectedLayerKey(null);
      setFittedView([0, 0, 1, 1]);
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [setFittedView]);

  const stopBrowserRun = useCallback(() => {
    const w = browserWorkerRef.current;
    browserWorkerRef.current = null;
    browserRunTokenRef.current = null;
    setBrowserRunning(false);
    setBrowserLastStep(null);
    if (w) w.terminate();
  }, []);

  useEffect(() => {
    return () => stopBrowserRun();
  }, [stopBrowserRun]);

  useEffect(() => {
    if (mode === "dump") stopBrowserRun();
  }, [mode, stopBrowserRun]);

  const startBrowserRun = useCallback((overrides?: { seed?: number }) => {
    setError(null);
    const pinnedStepId = mode === "browser" ? selectedStepIdRef.current : null;
    const pinnedLayerKey = mode === "browser" ? selectedLayerKeyRef.current : null;
    const retainStep = Boolean(pinnedStepId);
    const retainLayer = Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(`${pinnedStepId}::`));
    setMode("browser");
    setBrowserManifest(null);
    if (!retainStep) setSelectedStepId(null);
    if (!retainLayer) setSelectedLayerKey(null);
    if (!retainStep) setFittedView([0, 0, 1, 1]);
    setBrowserLastStep(null);

    stopBrowserRun();

    const runToken =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    browserRunTokenRef.current = runToken;

    const worker = new Worker(new URL("./browser-runner/foundation.worker.ts", import.meta.url), { type: "module" });
    browserWorkerRef.current = worker;
    setBrowserRunning(true);

    worker.onmessage = (ev: MessageEvent<BrowserRunEvent>) => {
      const msg = ev.data;
      if (!msg || msg.runToken !== browserRunTokenRef.current) return;

      if (msg.type === "run.started") {
        setBrowserManifest({
          version: 0,
          runId: msg.runId,
          planFingerprint: msg.planFingerprint,
          steps: [],
          layers: [],
        });
        return;
      }

      if (msg.type === "run.progress") {
        if (msg.kind === "step.start") {
          setBrowserLastStep({ stepId: msg.stepId, stepIndex: msg.stepIndex });
          setBrowserManifest((prev) => {
            if (!prev) return prev;
            if (prev.steps.some((s) => s.stepId === msg.stepId)) return prev;
            return {
              ...prev,
              steps: [...prev.steps, { stepId: msg.stepId, phase: msg.phase, stepIndex: msg.stepIndex }],
            };
          });
          setSelectedStepId((prev) => prev ?? msg.stepId);
        }
        return;
      }

      if (msg.type === "viz.layer.upsert") {
        setBrowserManifest((prev) => {
          if (!prev) return prev;

          const entry: VizLayerEntryV0 =
            msg.layer.kind === "grid"
              ? {
                  kind: "grid",
                  layerId: msg.layer.layerId,
                  stepId: msg.layer.stepId,
                  phase: msg.layer.phase,
                  stepIndex: msg.layer.stepIndex,
                  format: msg.layer.format,
                  dims: msg.layer.dims,
                  values: msg.payload.kind === "grid" ? msg.payload.values : undefined,
                  bounds: msg.layer.bounds,
                }
              : msg.layer.kind === "points"
                ? {
                    kind: "points",
                    layerId: msg.layer.layerId,
                    stepId: msg.layer.stepId,
                    phase: msg.layer.phase,
                    stepIndex: msg.layer.stepIndex,
                    count: msg.layer.count,
                    positions: msg.payload.kind === "points" ? msg.payload.positions : undefined,
                    values: msg.payload.kind === "points" ? msg.payload.values : undefined,
                    valueFormat: msg.layer.valueFormat,
                    bounds: msg.layer.bounds,
                  }
                : {
                    kind: "segments",
                    layerId: msg.layer.layerId,
                    stepId: msg.layer.stepId,
                    phase: msg.layer.phase,
                    stepIndex: msg.layer.stepIndex,
                    count: msg.layer.count,
                    segments: msg.payload.kind === "segments" ? msg.payload.segments : undefined,
                    values: msg.payload.kind === "segments" ? msg.payload.values : undefined,
                    valueFormat: msg.layer.valueFormat,
                    bounds: msg.layer.bounds,
                  };

          const key = `${entry.stepId}::${entry.layerId}::${entry.kind}`;
          const layers = [...prev.layers];
          const idx = layers.findIndex((l) => `${l.stepId}::${l.layerId}::${l.kind}` === key);
          if (idx >= 0) layers[idx] = entry;
          else layers.push(entry);

          return { ...prev, layers };
        });

        setSelectedStepId((prev) => prev ?? msg.layer.stepId);
        setSelectedLayerKey((prev) => {
          if (prev) return prev;
          const desiredStep = selectedStepIdRef.current ?? msg.layer.stepId;
          if (msg.layer.stepId !== desiredStep) return prev;
          return `${msg.layer.stepId}::${msg.layer.layerId}::${msg.layer.kind}`;
        });
        return;
      }

      if (msg.type === "run.finished") {
        setBrowserRunning(false);
        return;
      }

      if (msg.type === "run.error") {
        setBrowserRunning(false);
        const parts: string[] = [];
        if (msg.name) parts.push(`${msg.name}: ${msg.message}`);
        else parts.push(msg.message);
        if (msg.details) parts.push(msg.details);
        if (msg.stack) parts.push(msg.stack);
        setError(parts.filter(Boolean).join("\n\n"));
        return;
      }
    };

    worker.onerror = (e) => {
      setBrowserRunning(false);
      setError(formatErrorForUi(e));
    };

    const seedToUse = overrides?.seed ?? browserSeed;

    const req: BrowserRunRequest = {
      type: "run.start",
      runToken,
      seed: seedToUse,
      dimensions: { width: browserWidth, height: browserHeight },
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: { foundation: {} },
    };

    worker.postMessage(req);
  }, [browserHeight, browserSeed, browserWidth, mode, setFittedView, stopBrowserRun]);

  useEffect(() => {
    if (!manifest || !selectedStepId) return;
    if (selectedLayerKey && selectedLayerKey.startsWith(`${selectedStepId}::`)) return;
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
  }, [manifest, selectedLayerKey, selectedStepId, setFittedView, tileLayout]);

  useEffect(() => {
    if (!eraInfo) return;
    setEraIndex(eraInfo.eraIndex);
  }, [eraInfo]);

  const deckLayers = useMemo(() => {
    if (!manifest || !effectiveLayer) return [];

    const layerId = effectiveLayer.layerId;
    const isTileOddQLayer = effectiveLayer.kind === "grid" || layerId.startsWith("foundation.plateTopology.");
    const tileSize = 1;

    const meshEdges = manifest.layers.find(
      (l) => l.kind === "segments" && l.layerId === "foundation.mesh.edges"
    ) as Extract<VizLayerEntryV0, { kind: "segments" }> | undefined;

    const loadScalar = async (
      path: string | undefined,
      buffer: ArrayBuffer | undefined,
      format: VizScalarFormat
    ): Promise<ArrayBufferView> => {
      if (buffer) return decodeScalarArray(buffer, format);
      if (!fileMap || !path) throw new Error(`Missing scalar payload for ${layerId}`);
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
        let seg: Float32Array;
        if (meshEdges.segments) {
          seg = new Float32Array(meshEdges.segments);
        } else {
          if (!fileMap || !meshEdges.segmentsPath) throw new Error("Missing mesh edge payload");
          const segFile = fileMap.get(meshEdges.segmentsPath);
          if (!segFile) throw new Error(`Missing file: ${meshEdges.segmentsPath}`);
          const segBuf = await readFileAsArrayBuffer(segFile);
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

      if (effectiveLayer.kind === "grid") {
        const values = await loadScalar(effectiveLayer.path, effectiveLayer.values, effectiveLayer.format);
        const { width, height } = effectiveLayer.dims;

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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PolygonLayer({
            id: `${layerId}::hex`,
            data: tiles,
            getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap),
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
        let positions: Float32Array;
        if (effectiveLayer.positions) {
          positions = new Float32Array(effectiveLayer.positions);
        } else {
          if (!fileMap || !effectiveLayer.positionsPath) throw new Error("Missing points payload");
          const posFile = fileMap.get(effectiveLayer.positionsPath);
          if (!posFile) throw new Error(`Missing file: ${effectiveLayer.positionsPath}`);
          const posBuf = await readFileAsArrayBuffer(posFile);
          positions = new Float32Array(posBuf);
        }

        const values =
          effectiveLayer.values && effectiveLayer.valueFormat
            ? decodeScalarArray(effectiveLayer.values, effectiveLayer.valueFormat)
            : effectiveLayer.valuesPath && effectiveLayer.valueFormat
              ? await loadScalar(effectiveLayer.valuesPath, undefined, effectiveLayer.valueFormat)
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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new ScatterplotLayer({
            id: `${layerId}::points`,
            data: points,
            getPosition: (d) => [d.x, d.y],
            getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap),
            radiusUnits: "common",
            getRadius: 0.95,
            pickable: true,
          }),
        ];
      }

      if (effectiveLayer.kind === "segments") {
        let seg: Float32Array;
        if (effectiveLayer.segments) {
          seg = new Float32Array(effectiveLayer.segments);
        } else {
          if (!fileMap || !effectiveLayer.segmentsPath) throw new Error("Missing segments payload");
          const segFile = fileMap.get(effectiveLayer.segmentsPath);
          if (!segFile) throw new Error(`Missing file: ${effectiveLayer.segmentsPath}`);
          const segBuf = await readFileAsArrayBuffer(segFile);
          seg = new Float32Array(segBuf);
        }

        const values =
          effectiveLayer.values && effectiveLayer.valueFormat
            ? decodeScalarArray(effectiveLayer.values, effectiveLayer.valueFormat)
            : effectiveLayer.valuesPath && effectiveLayer.valueFormat
              ? await loadScalar(effectiveLayer.valuesPath, undefined, effectiveLayer.valueFormat)
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

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PathLayer({
            id: `${layerId}::segments`,
            data: segments,
            getPath: (d) => d.path,
            getColor: (d) => colorForValue(layerId, d.v, plateColorMap),
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
      v.then(setResolvedLayers).catch((e: unknown) => setError(formatErrorForUi(e)));
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
          <div style={{ color: "#9ca3af", fontSize: isNarrow ? 13 : 12 }}>
            {mode === "browser" ? "Browser Runner (V0.1 Slice)" : "Dump Viewer (V0)"}
          </div>
          <div style={{ flex: 1 }} />
          {!isNarrow && mode === "dump" ? (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Open a run folder under <span style={{ color: "#e5e7eb" }}>mods/mod-swooper-maps/dist/visualization</span>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              style={{ ...controlBaseStyle, width: isNarrow ? "100%" : 170 }}
            >
              <option value="browser">browser</option>
              <option value="dump">dump</option>
            </select>
          </label>

          {mode === "browser" ? (
            <>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Seed</span>
                <input
                  value={browserSeed}
                  onChange={(e) => setBrowserSeed(Number.parseInt(e.target.value || "0", 10) || 0)}
                  style={{ ...controlBaseStyle, width: 96 }}
                />
                <button
                  onClick={() => {
                    const next = randomU32();
                    setBrowserSeed(next);
                    startBrowserRun({ seed: next });
                  }}
                  style={{ ...buttonStyle, padding: "6px 10px" }}
                  title="Reroll seed"
                  type="button"
                >
                  Reroll
                </button>
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>W×H</span>
                <input
                  value={browserWidth}
                  onChange={(e) => setBrowserWidth(Number.parseInt(e.target.value || "0", 10) || 0)}
                  style={{ ...controlBaseStyle, width: 70 }}
                />
                <input
                  value={browserHeight}
                  onChange={(e) => setBrowserHeight(Number.parseInt(e.target.value || "0", 10) || 0)}
                  style={{ ...controlBaseStyle, width: 70 }}
                />
              </label>
              <button
                onClick={() => startBrowserRun()}
                style={{ ...buttonStyle, opacity: browserRunning ? 0.6 : 1 }}
                disabled={browserRunning}
              >
                Run (Browser)
              </button>
              <button
                onClick={stopBrowserRun}
                style={{ ...buttonStyle, opacity: browserRunning ? 1 : 0.6 }}
                disabled={!browserRunning}
              >
                Cancel
              </button>
              {browserLastStep ? (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  step: <span style={{ color: "#e5e7eb" }}>{browserLastStep.stepIndex}</span> ·{" "}
                  {formatLabel(browserLastStep.stepId)}
                </div>
              ) : null}
            </>
          ) : (
            <>
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
            </>
          )}

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
              disabled={!steps.length && !selectedStepId}
            >
              {selectedStepId && !steps.some((s) => s.stepId === selectedStepId) ? (
                <option value={selectedStepId}>{formatLabel(selectedStepId)} (pending)</option>
              ) : null}
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
              disabled={!layersForStep.length && !selectedLayerKey}
            >
              {selectedLayerKey && !layersForStep.some((l) => l.key === selectedLayerKey) ? (
                <option value={selectedLayerKey}>
                  {(() => {
                    const parts = selectedLayerKey.split("::");
                    const label = parts.length >= 3 ? `${parts[1]} (${parts[2]})` : selectedLayerKey;
                    return `${label} (pending)`;
                  })()}
                </option>
              ) : null}
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
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
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
            {mode === "browser"
              ? "Click “Run (Browser)” to execute Foundation in a Web Worker and stream layers directly to deck.gl."
              : "Select a dump folder containing `manifest.json` (e.g. `mods/mod-swooper-maps/dist/visualization/<runId>`)."}
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
            <>{mode === "browser" ? "No run loaded" : "No dump loaded"}</>
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
