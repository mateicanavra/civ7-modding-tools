import type { VizLayerEntryV0, VizLayerVisibility, VizLayerKind } from "./model";

export type RgbaColor = [number, number, number, number];

export type VizLegendItem = { label: string; color: RgbaColor };

export type VizLegendModel = {
  title: string;
  items: VizLegendItem[];
  note?: string;
  context?: {
    stepId: string;
    stepLabel: string;
    layerId: string;
    kind: VizLayerKind;
    eraIndex?: number;
    tileLayout?: string;
  };
};

export function formatStepLabel(stepId: string): string {
  return stepId.split(".").slice(-1)[0] ?? stepId;
}

export function resolveLayerVisibility(layer: VizLayerEntryV0): VizLayerVisibility {
  const visibility = layer.meta?.visibility;
  if (visibility === "debug") return "debug";
  if (visibility === "hidden") return "hidden";
  return "default";
}

function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hh >= 0 && hh < 1) {
    r = c;
    g = x;
  } else if (hh < 2) {
    r = x;
    g = c;
  } else if (hh < 3) {
    g = c;
    b = x;
  } else if (hh < 4) {
    g = x;
    b = c;
  } else if (hh < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const m = l - c / 2;
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

export function isPlateIdLayer(layerId: string): boolean {
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

export function buildPlateColorMap(options: { values: ArrayBufferView; seedKey: string }): Map<number, RgbaColor> {
  const ids = collectPlateIds(options.values);
  const palette = generateOpposedPalette(ids.length, options.seedKey);
  const colorById = new Map<number, RgbaColor>();
  for (let i = 0; i < ids.length; i++) {
    colorById.set(ids[i]!, palette[i] ?? [148, 163, 184, 220]);
  }

  return colorById;
}

function resolveCategoryColor(meta: VizLayerEntryV0["meta"], value: number): RgbaColor | null {
  if (!meta?.categories?.length) return null;
  for (const entry of meta.categories) {
    if (typeof entry.value === "number") {
      if (Number(entry.value) === value) return entry.color;
      continue;
    }
    if (String(entry.value) === String(value)) return entry.color;
  }
  return null;
}

const VALUE_RAMP: ReadonlyArray<RgbaColor> = [
  [68, 1, 84, 230],
  [59, 82, 139, 230],
  [33, 145, 140, 230],
  [94, 201, 98, 230],
  [253, 231, 37, 230],
];

const UNKNOWN_COLOR: RgbaColor = [120, 120, 120, 220];

type ColorOut = { [index: number]: number };

function writeRgba(out: ColorOut, offset: number, color: RgbaColor): void {
  out[offset] = color[0];
  out[offset + 1] = color[1];
  out[offset + 2] = color[2];
  out[offset + 3] = color[3];
}

function resolveColorForValue(
  layerId: string,
  value: number,
  plateColorMap: Map<number, RgbaColor> | undefined,
  meta: VizLayerEntryV0["meta"] | undefined,
  out: ColorOut,
  offset: number
): void {
  if (!Number.isFinite(value)) {
    writeRgba(out, offset, UNKNOWN_COLOR);
    return;
  }

  const categoryColor = resolveCategoryColor(meta, value);
  if (categoryColor) {
    writeRgba(out, offset, categoryColor);
    return;
  }

  if (layerId.toLowerCase().includes("landmask")) {
    writeRgba(out, offset, value > 0 ? [34, 197, 94, 230] : [37, 99, 235, 230]);
    return;
  }

  if (layerId.includes("crust") && layerId.toLowerCase().includes("type")) {
    writeRgba(out, offset, value === 1 ? [34, 197, 94, 230] : [37, 99, 235, 230]);
    return;
  }

  if (layerId.includes("boundaryType")) {
    if (value === 1) {
      writeRgba(out, offset, [239, 68, 68, 240]);
      return;
    }
    if (value === 2) {
      writeRgba(out, offset, [59, 130, 246, 240]);
      return;
    }
    if (value === 3) {
      writeRgba(out, offset, [245, 158, 11, 240]);
      return;
    }
    writeRgba(out, offset, [107, 114, 128, 180]);
    return;
  }

  if (isPlateIdLayer(layerId)) {
    if (plateColorMap) {
      writeRgba(out, offset, plateColorMap.get(value | 0) ?? [148, 163, 184, 220]);
      return;
    }
    const seedKey = `${layerId}:${value}`;
    const rng = createRng(hashStringToSeed(seedKey));
    writeRgba(out, offset, randomColor(rng));
    return;
  }

  const t = Math.max(0, Math.min(1, value));
  const idx = t * (VALUE_RAMP.length - 1);
  const i0 = Math.max(0, Math.min(VALUE_RAMP.length - 1, Math.floor(idx)));
  const i1 = Math.max(0, Math.min(VALUE_RAMP.length - 1, Math.ceil(idx)));
  const tt = idx - i0;
  const a = VALUE_RAMP[i0] ?? UNKNOWN_COLOR;
  const b = VALUE_RAMP[i1] ?? UNKNOWN_COLOR;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * tt);
  out[offset] = lerp(a[0], b[0]);
  out[offset + 1] = lerp(a[1], b[1]);
  out[offset + 2] = lerp(a[2], b[2]);
  out[offset + 3] = lerp(a[3], b[3]);
}

export function formatLayerLabel(layer: VizLayerEntryV0): string {
  const base = layer.meta?.label ?? layer.layerId;
  const visibility = layer.meta?.visibility === "debug" ? ", debug" : "";
  const variant = formatLayerVariant(layer);
  const suffix = variant ? ` · ${variant}` : "";
  return `${base}${suffix} (${layer.kind}${visibility})`;
}

function formatLayerVariant(layer: VizLayerEntryV0): string | null {
  if (layer.fileKey) return layer.fileKey;
  const path =
    layer.kind === "grid"
      ? layer.path
      : layer.kind === "points"
        ? layer.valuesPath ?? layer.positionsPath
        : layer.valuesPath ?? layer.segmentsPath;
  if (!path) return null;
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export function colorForValue(
  layerId: string,
  value: number,
  plateColorMap?: Map<number, RgbaColor>,
  meta?: VizLayerEntryV0["meta"]
): RgbaColor {
  const out: RgbaColor = [0, 0, 0, 255];
  resolveColorForValue(layerId, value, plateColorMap, meta, out, 0);
  return out;
}

export function writeColorForValue(
  out: Uint8ClampedArray,
  offset: number,
  layerId: string,
  value: number,
  plateColorMap?: Map<number, RgbaColor>,
  meta?: VizLayerEntryV0["meta"]
): void {
  resolveColorForValue(layerId, value, plateColorMap, meta, out, offset);
}

export function legendForLayer(
  layer: VizLayerEntryV0 | null,
  stats: { min?: number; max?: number } | null,
  context?: VizLegendModel["context"]
): VizLegendModel | null {
  if (!layer) return null;
  const id = layer.layerId;
  const label = layer.meta?.label ?? id;

  if (layer.meta?.categories?.length) {
    return {
      title: label,
      items: layer.meta.categories.map((entry) => ({
        label: entry.label,
        color: entry.color,
      })),
      context,
    };
  }

  if (id.toLowerCase().includes("landmask")) {
    return {
      title: label,
      items: [
        { label: "0 = water", color: [37, 99, 235, 230] },
        { label: "1 = land", color: [34, 197, 94, 230] },
      ],
      context,
    };
  }

  if (id.endsWith("tileBoundaryType") || id.endsWith("boundaryType") || id.includes("boundaryType")) {
    return {
      title: label,
      items: [
        { label: "0 = none/unknown", color: [107, 114, 128, 180] },
        { label: "1 = convergent", color: [239, 68, 68, 240] },
        { label: "2 = divergent", color: [59, 130, 246, 240] },
        { label: "3 = transform", color: [245, 158, 11, 240] },
      ],
      context,
    };
  }

  if (id.includes("crusttiles") || (id.includes("crust") && id.toLowerCase().includes("type"))) {
    return {
      title: label,
      items: [
        { label: "0 = oceanic", color: [37, 99, 235, 230] },
        { label: "1 = continental", color: [34, 197, 94, 230] },
      ],
      context,
    };
  }

  if (id.toLowerCase().includes("tile.height") || id.toLowerCase().includes("tileheight")) {
    if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) {
      const min = stats.min ?? 0;
      const max = stats.max ?? 1;
      return {
        title: label,
        items: [
          { label: `min = ${min.toFixed(3)}`, color: colorForValue(id, 0) },
          { label: `max = ${max.toFixed(3)}`, color: colorForValue(id, 1) },
        ],
        note: "Values are mapped with a simple palette in V0.",
        context,
      };
    }
    return {
      title: label,
      items: [{ label: "continuous scalar", color: colorForValue(id, 0.5) }],
      context,
    };
  }

  if (id.includes("plate") && (id.toLowerCase().includes("id") || id.toLowerCase().includes("plate"))) {
    return {
      title: label,
      items: [
        { label: "categorical (random palette; neighboring plates avoid similar colors)", color: [148, 163, 184, 220] },
      ],
      context,
    };
  }

  if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) {
    const min = stats.min ?? 0;
    const max = stats.max ?? 1;
    return {
      title: label,
      items: [
        { label: `min = ${min.toFixed(3)}`, color: colorForValue(id, 0) },
        { label: `max = ${max.toFixed(3)}`, color: colorForValue(id, 1) },
      ],
      note: "Values are mapped with a simple palette in V0.",
      context,
    };
  }

  return {
    title: "Legend",
    items: [{ label: "no legend available for this layer yet", color: [148, 163, 184, 220] }],
    context,
  };
}
