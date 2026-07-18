import type {
  VizLayerEntryV1,
  VizLayerKind,
  VizLayerMeta,
  VizLayerVisibility,
  VizNoDataSpec,
  VizResolvedCategoricalPalette,
  VizScalarField,
  VizScalarSource,
  VizScalarStats,
  VizScaleType,
  VizValueDomain,
  VizValueSpec,
  VizValueTransform,
} from "@swooper/mapgen-viz";

/** Mutable renderer color tuple with byte-valued red, green, blue, and alpha channels. */
export type RgbaColor = [number, number, number, number];

/** Renderer-ready palette authority resolved from portable layer metadata and observed values. */
export type VizPalettePresentation =
  | Readonly<{
      kind: "continuous";
      colors: readonly RgbaColor[];
      exactColorsByValue?: ReadonlyMap<number, RgbaColor>;
    }>
  | Readonly<{
      kind: "categorical";
      valueIdentity: "exact" | "legacy-int32";
      colorsByValue: ReadonlyMap<number, RgbaColor>;
      exactColorsByValue?: ReadonlyMap<number, RgbaColor>;
      hasUnmappedValues: boolean;
    }>;

/** Palette mapping and truthful bounds for the scalar field selected by the renderer. */
export type VizRenderedScalarPresentation = Readonly<{
  stats: VizScalarStats | null;
  palette: VizPalettePresentation;
}>;

/** One human-readable legend entry paired with the exact color used by the renderer. */
export type VizLegendItem = { label: string; color: RgbaColor };

/** Legend presentation for one selected layer and its optional pipeline address context. */
export type VizLegendModel = {
  title: string;
  items: VizLegendItem[];
  note?: string;
  context?: {
    stepId: string;
    stepLabel: string;
    layerKey: string;
    dataTypeKey: string;
    kind: VizLayerKind;
    spaceId: string;
    variantKey?: string;
    tileLayout?: string;
  };
};

/** Derives a compact display label from a stable dotted recipe step identity. */
export function formatStepLabel(stepId: string): string {
  return stepId.split(".").slice(-1)[0] ?? stepId;
}

/** Normalizes omitted layer visibility to the default Studio presentation lane. */
export function resolveLayerVisibility(layer: VizLayerEntryV1): VizLayerVisibility {
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
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function randomColor(rng: () => number): RgbaColor {
  const hue = rng() * 360;
  const saturation = 0.62 + rng() * 0.28;
  const lightness = 0.48 + rng() * 0.18;
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return [r, g, b, 230];
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace(/^#/, "");
  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16);
    const g = Number.parseInt(normalized[1] + normalized[1], 16);
    const b = Number.parseInt(normalized[2] + normalized[2], 16);
    return [r, g, b];
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function hexToRgba(hex: string, alpha = 230): RgbaColor {
  const [r, g, b] = hexToRgb(hex);
  return [r, g, b, alpha];
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

// Tailwind v3 default palette (300-700 shades) from the official docs:
// https://v3.tailwindcss.com/docs/customizing-colors#default-color-palette
const TAILWIND_COLOR_POOL: RgbaColor[] = [
  // Slate
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  // Gray
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
  "#4b5563",
  "#374151",
  // Zinc
  "#d4d4d8",
  "#a1a1aa",
  "#71717a",
  "#52525b",
  "#3f3f46",
  // Neutral
  "#d4d4d4",
  "#a3a3a3",
  "#737373",
  "#525252",
  "#404040",
  // Stone
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  // Red
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  // Orange
  "#fdba74",
  "#fb923c",
  "#f97316",
  "#ea580c",
  "#c2410c",
  // Amber
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  // Yellow
  "#fde047",
  "#facc15",
  "#eab308",
  "#ca8a04",
  "#a16207",
  // Lime
  "#bef264",
  "#a3e635",
  "#84cc16",
  "#65a30d",
  "#4d7c0f",
  // Green
  "#86efac",
  "#4ade80",
  "#22c55e",
  "#16a34a",
  "#15803d",
  // Emerald
  "#6ee7b7",
  "#34d399",
  "#10b981",
  "#059669",
  "#047857",
  // Teal
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  // Cyan
  "#67e8f9",
  "#22d3ee",
  "#06b6d4",
  "#0891b2",
  "#0e7490",
  // Sky
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  // Blue
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  // Indigo
  "#a5b4fc",
  "#818cf8",
  "#6366f1",
  "#4f46e5",
  "#4338ca",
  // Violet
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  // Purple
  "#d8b4fe",
  "#c084fc",
  "#a855f7",
  "#9333ea",
  "#7e22ce",
  // Fuchsia
  "#f0abfc",
  "#e879f9",
  "#d946ef",
  "#c026d3",
  "#a21caf",
  // Pink
  "#f9a8d4",
  "#f472b6",
  "#ec4899",
  "#db2777",
  "#be185d",
  // Rose
  "#fda4af",
  "#fb7185",
  "#f43f5e",
  "#e11d48",
  "#be123c",
].map((hex) => hexToRgba(hex));

function collectLegacyCategoryIds(values: VizScalarSource["values"]): number[] {
  const ids = new Set<number>();
  for (let i = 0; i < values.length; i++) {
    ids.add(Number(values[i] ?? 0) | 0);
  }
  return [...ids].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
}

function collectResolvedCategoryIds(
  values: VizScalarSource["values"],
  noData: VizNoDataSpec | undefined
): number[] {
  const ids = new Set<number>();
  for (let index = 0; index < values.length; index++) {
    const value = Number(values[index]);
    if (!Number.isFinite(value) || isNoData(value, noData)) continue;
    ids.add(value);
  }
  return [...ids].sort((a, b) => a - b);
}

function generateOpposedPalette(count: number, seedKey: string): RgbaColor[] {
  if (count <= 0) return [];
  const rng = createRng(hashStringToSeed(seedKey));
  const candidates = TAILWIND_COLOR_POOL.length ? TAILWIND_COLOR_POOL : [randomColor(rng)];
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

/** Preserves the seeded legacy categorical palette used by v1 string-palette manifests. */
export function buildCategoricalColorMap(options: {
  values: VizScalarSource["values"];
  seedKey: string;
}): Map<number, RgbaColor> {
  const ids = collectLegacyCategoryIds(options.values);
  const palette = generateOpposedPalette(ids.length, options.seedKey);
  const colorById = new Map<number, RgbaColor>();
  for (let i = 0; i < ids.length; i++) {
    colorById.set(ids[i]!, palette[i] ?? [148, 163, 184, 220]);
  }
  return colorById;
}

const VALUE_RAMP: ReadonlyArray<RgbaColor> = [
  [68, 1, 84, 230],
  [59, 82, 139, 230],
  [33, 145, 140, 230],
  [94, 201, 98, 230],
  [253, 231, 37, 230],
];

// Nonfinite/no-data evidence remains transparent under the existing tile contract. A finite
// categorical value without an authored/resolved color is different: it stays visibly unknown.
const ABSENT_COLOR: RgbaColor = [0, 0, 0, 0];
const UNKNOWN_COLOR: RgbaColor = [107, 114, 128, 230];

function copyColor(color: readonly [number, number, number, number]): RgbaColor {
  return [color[0], color[1], color[2], color[3]];
}

function hasResolvedCategoryColors(palette: object): palette is VizResolvedCategoricalPalette {
  return "colors" in palette && Array.isArray(palette.colors);
}

/**
 * Normalizes legacy and resolved palette metadata through one renderer-facing path.
 * Resolved category pools bind to sorted observed ids without run-specific randomness, while
 * legacy categorical strings retain their seeded color selection exactly.
 */
export function resolveVizPalettePresentation(
  options: Readonly<{
    meta?: VizLayerMeta;
    field?: VizScalarField | null;
    values: VizScalarSource["values"];
    seedKey: string;
  }>
): VizPalettePresentation {
  const categories = options.meta?.categories;
  const exactColorsByValue = new Map<number, RgbaColor>();
  if (categories) {
    for (const category of categories) {
      const value = typeof category.value === "number" ? category.value : Number(category.value);
      if (Number.isFinite(value)) exactColorsByValue.set(value, copyColor(category.color));
    }
  }

  const palette = options.meta?.palette ?? "auto";
  if (typeof palette === "object" && palette.kind === "categorical") {
    if (!hasResolvedCategoryColors(palette)) {
      const observedIds = collectResolvedCategoryIds(
        options.values,
        options.field?.valueSpec?.noData
      );
      return {
        kind: "categorical",
        valueIdentity: "exact",
        colorsByValue: exactColorsByValue,
        hasUnmappedValues: observedIds.some((value) => !exactColorsByValue.has(value)),
      };
    }
    const ids = collectResolvedCategoryIds(options.values, options.field?.valueSpec?.noData);
    const colors = palette.colors;
    const colorsByValue = new Map<number, RgbaColor>();
    for (let index = 0; index < ids.length; index++) {
      const color = colors[index % colors.length];
      if (color) colorsByValue.set(ids[index]!, copyColor(color));
    }
    return {
      kind: "categorical",
      valueIdentity: "exact",
      colorsByValue,
      hasUnmappedValues: false,
    };
  }
  if (palette === "categorical") {
    return {
      kind: "categorical",
      valueIdentity: "legacy-int32",
      colorsByValue: buildCategoricalColorMap({ values: options.values, seedKey: options.seedKey }),
      ...(exactColorsByValue.size > 0 ? { exactColorsByValue } : {}),
      hasUnmappedValues: false,
    };
  }
  if (typeof palette === "object") {
    return { kind: "continuous", colors: palette.stops.map(copyColor) };
  }
  return {
    kind: "continuous",
    colors: VALUE_RAMP.map(copyColor),
    ...(exactColorsByValue.size > 0 ? { exactColorsByValue } : {}),
  };
}

/**
 * The one tile-border RULE (Pass-5 tile-orientation spec, retuned twice on
 * user feedback): the border is the tile's OWN fill pulled toward black —
 * self-grout. The previous constant graphite ink (#0d0d11, the page
 * substrate) vanished at map scale: at fit zoom a Huge map's tiles are a few
 * pixels wide, and a page-colored 1px seam between dark fills dissolved the
 * tessellation into disconnected dots — the grid disappeared everywhere the
 * Delaunay mesh (its own slate ink) wasn't drawn. A fill-derived seam is
 * darker than its fill BY CONSTRUCTION, so the hex lattice reads at every
 * zoom, in both themes, for every palette — and up close it still recedes
 * like etched grout instead of glowing slate. Unfilled tiles draw nothing
 * (mesh contract — stroke alpha follows fill alpha). All tile-space polygon
 * strokes use this rule — no per-call border literals.
 */
export const TILE_BORDER_FILL_RATIO = 0.55;

/** Produces self-grout that remains legible against the tile's own fill color. */
export function tileBorderColorForFill(r: number, g: number, b: number): RgbaColor {
  return [
    Math.round(r * TILE_BORDER_FILL_RATIO),
    Math.round(g * TILE_BORDER_FILL_RATIO),
    Math.round(b * TILE_BORDER_FILL_RATIO),
    255,
  ];
}

type ColorOut = { [index: number]: number };

function writeRgba(out: ColorOut, offset: number, color: RgbaColor): void {
  out[offset] = color[0];
  out[offset + 1] = color[1];
  out[offset + 2] = color[2];
  out[offset + 3] = color[3];
}

function isNoData(value: number, noData: VizNoDataSpec | undefined): boolean {
  if (!noData || noData.kind === "none") return false;
  if (noData.kind === "nan") return Number.isNaN(value);
  return value === noData.value;
}

type Domain = { min: number; max: number };

function resolveDomain(
  domain: VizValueDomain | undefined,
  stats: VizScalarStats | null
): Domain | null {
  if (!domain) return null;
  if (domain.kind === "unit") return { min: 0, max: 1 };
  if (domain.kind === "explicit") return { min: domain.min, max: domain.max };
  if (domain.kind === "fromStats") {
    if (!stats) return null;
    if (!Number.isFinite(stats.min) || !Number.isFinite(stats.max)) return null;
    return { min: stats.min, max: stats.max };
  }
  return null;
}

function applyTransform(
  value: number,
  transform: VizValueTransform | undefined,
  stats: VizScalarStats | null
): number {
  if (!transform || transform.kind === "identity") return value;
  if (transform.kind === "clamp") return Math.max(transform.min, Math.min(transform.max, value));
  if (transform.kind === "affine") return value * transform.scale + transform.offset;
  if (transform.kind === "piecewise") {
    const pts = transform.points;
    if (!pts.length) return value;
    const sorted = [...pts].sort((a, b) => a.x - b.x);
    if (value <= sorted[0]!.x) return sorted[0]!.y;
    if (value >= sorted[sorted.length - 1]!.x) return sorted[sorted.length - 1]!.y;
    for (let i = 0; i + 1 < sorted.length; i++) {
      const a = sorted[i]!;
      const b = sorted[i + 1]!;
      if (value < a.x || value > b.x) continue;
      const t = (value - a.x) / Math.max(1e-12, b.x - a.x);
      return a.y + (b.y - a.y) * t;
    }
    return value;
  }
  if (transform.kind === "normalize") {
    const dom = resolveDomain(transform.domain, stats);
    if (!dom) return value;
    const span = dom.max - dom.min;
    if (!Number.isFinite(span) || Math.abs(span) < 1e-12) return 0;
    return (value - dom.min) / span;
  }
  return value;
}

function mapToUnitWithScale(value: number, domain: Domain, scale: VizScaleType): number {
  const min = domain.min;
  const max = domain.max;
  const span = max - min;
  if (!Number.isFinite(span) || Math.abs(span) < 1e-12) return 0;

  if (scale === "linear" || scale === "categorical" || scale === "quantile") {
    return (value - min) / span;
  }

  if (scale === "log") {
    if (!(min > 0) || !(max > 0) || !(value > 0)) return (value - min) / span;
    const a = Math.log(min);
    const b = Math.log(max);
    const denom = b - a;
    if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) return 0;
    return (Math.log(value) - a) / denom;
  }

  if (scale === "symlog") {
    const c = 1;
    const sym = (x: number) => Math.sign(x) * Math.log1p(Math.abs(x) / c);
    const a = sym(min);
    const b = sym(max);
    const denom = b - a;
    if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) return 0;
    return (sym(value) - a) / denom;
  }

  return (value - min) / span;
}

function resolveUnitValue(args: {
  raw: number;
  field?: VizScalarField | null;
  stats?: VizScalarStats | null;
}): number {
  const raw = args.raw;
  if (!Number.isFinite(raw)) return Number.NaN;

  const field = args.field ?? null;
  const valueSpec: VizValueSpec | undefined = field?.valueSpec;
  const stats = args.stats ?? field?.stats ?? null;
  const noData = valueSpec?.noData;
  if (isNoData(raw, noData)) return Number.NaN;

  const transformed = applyTransform(raw, valueSpec?.transform, stats);

  // If the transform already normalized, treat it as a unit value.
  if (valueSpec?.transform?.kind === "normalize") {
    return Math.max(0, Math.min(1, transformed));
  }

  // Otherwise, normalize based on the field's declared domain (or inferred stats).
  const dom = resolveDomain(
    valueSpec?.domain ?? (stats ? { kind: "fromStats" } : undefined),
    stats
  );
  if (!dom) return transformed;

  const unit = mapToUnitWithScale(transformed, dom, valueSpec?.scale ?? "linear");
  return Math.max(0, Math.min(1, unit));
}

function resolveColorForValue(args: {
  rawValue: number;
  palette: VizPalettePresentation;
  field: VizScalarField | null;
  stats: VizScalarStats | null;
  out: ColorOut;
  offset: number;
}): void {
  const rawValue = args.rawValue;

  if (!Number.isFinite(rawValue)) {
    writeRgba(args.out, args.offset, ABSENT_COLOR);
    return;
  }

  if (isNoData(rawValue, args.field?.valueSpec?.noData)) {
    writeRgba(args.out, args.offset, ABSENT_COLOR);
    return;
  }

  const exactColor = args.palette.exactColorsByValue?.get(rawValue);
  if (exactColor) {
    writeRgba(args.out, args.offset, exactColor);
    return;
  }

  if (args.palette.kind === "categorical") {
    const identity = args.palette.valueIdentity === "legacy-int32" ? rawValue | 0 : rawValue;
    const color = args.palette.colorsByValue.get(identity) ?? UNKNOWN_COLOR;
    writeRgba(args.out, args.offset, color);
    return;
  }

  const unit = resolveUnitValue({ raw: rawValue, field: args.field, stats: args.stats });
  if (!Number.isFinite(unit)) {
    writeRgba(args.out, args.offset, ABSENT_COLOR);
    return;
  }

  const t = Math.max(0, Math.min(1, unit));
  const colors = args.palette.colors;
  const idx = t * (colors.length - 1);
  const i0 = Math.max(0, Math.min(colors.length - 1, Math.floor(idx)));
  const i1 = Math.max(0, Math.min(colors.length - 1, Math.ceil(idx)));
  const tt = idx - i0;
  const a = colors[i0] ?? UNKNOWN_COLOR;
  const b = colors[i1] ?? UNKNOWN_COLOR;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * tt);
  args.out[args.offset] = lerp(a[0], b[0]);
  args.out[args.offset + 1] = lerp(a[1], b[1]);
  args.out[args.offset + 2] = lerp(a[2], b[2]);
  args.out[args.offset + 3] = lerp(a[3], b[3]);
}

/** Formats one layer's semantic identity, variant, role, space, and visibility for inspection. */
export function formatLayerLabel(layer: VizLayerEntryV1): string {
  const base = layer.meta?.label ?? layer.dataTypeKey;
  const visibility = layer.meta?.visibility === "debug" ? ", debug" : "";
  const role = layer.meta?.role ? `:${layer.meta.role}` : "";
  const variant = layer.variantKey ? ` · ${layer.variantKey}` : "";
  return `${base}${variant} (${layer.kind}${role}@${layer.spaceId}${visibility})`;
}

/** Writes one scalar color from the renderer-normalized palette without re-resolving recipe policy. */
export function writeColorForScalarValue(
  out: Uint8ClampedArray,
  offset: number,
  args: {
    rawValue: number;
    palette: VizPalettePresentation;
    field?: VizScalarField | null;
    stats?: VizScalarStats | null;
  }
): void {
  resolveColorForValue({
    rawValue: args.rawValue,
    palette: args.palette,
    field: args.field ?? null,
    stats: args.stats ?? null,
    out,
    offset,
  });
}

/** Selects the scalar field rendered for a layer, including the canonical `gridFields` priority. */
export function selectVizScalarField(layer: VizLayerEntryV1): VizScalarField | null {
  if (layer.kind === "grid") return layer.field;
  if (layer.kind === "points" || layer.kind === "segments") return layer.values ?? null;
  const fieldKey = layer.vector?.magnitude ?? layer.vector?.u ?? Object.keys(layer.fields)[0];
  return fieldKey === undefined ? null : (layer.fields[fieldKey] ?? null);
}

/** Builds the legend for the exact scalar field selected by the renderer. */
export function legendForLayer(
  layer: VizLayerEntryV1 | null,
  scalar: VizRenderedScalarPresentation | null,
  context?: VizLegendModel["context"]
): VizLegendModel | null {
  if (!layer) return null;

  const title = layer.meta?.label ?? layer.dataTypeKey;
  const palette = layer.meta?.palette ?? "auto";

  if (layer.meta?.categories?.length) {
    const items = layer.meta.categories.map((entry) => ({
      label: entry.label,
      color: copyColor(entry.color),
    }));
    if (scalar?.palette.kind === "categorical" && scalar.palette.hasUnmappedValues) {
      items.push({ label: "Unknown / undeclared", color: copyColor(UNKNOWN_COLOR) });
    }
    return {
      title,
      items,
      context,
    };
  }

  if (scalar?.palette.kind === "categorical" && scalar.palette.colorsByValue.size > 0) {
    return {
      title,
      items: [...scalar.palette.colorsByValue].map(([value, color]) => ({
        label: String(value),
        color: copyColor(color),
      })),
      context,
    };
  }

  if (
    palette === "categorical" ||
    (typeof palette === "object" && palette.kind === "categorical")
  ) {
    const colors =
      typeof palette === "object" && hasResolvedCategoryColors(palette)
        ? palette.colors
        : undefined;
    return {
      title,
      items: colors?.length
        ? colors.map((color, index) => ({
            label: `category color ${index + 1}`,
            color: copyColor(color),
          }))
        : [{ label: "categorical palette (auto)", color: [148, 163, 184, 220] }],
      context,
    };
  }

  const unitSpec = selectVizScalarField(layer)?.valueSpec;
  const declaredDomain =
    unitSpec?.domain.kind === "unit" || unitSpec?.domain.kind === "explicit"
      ? unitSpec.domain
      : undefined;
  const min = declaredDomain?.min ?? scalar?.stats?.min;
  const max = declaredDomain?.max ?? scalar?.stats?.max;

  if (
    typeof min === "number" &&
    Number.isFinite(min) &&
    typeof max === "number" &&
    Number.isFinite(max)
  ) {
    const units = unitSpec?.units ? ` ${unitSpec.units}` : "";
    const ramp =
      scalar?.palette.kind === "continuous"
        ? scalar.palette.colors
        : typeof palette === "object" && palette.kind === "continuous"
          ? palette.stops.map(copyColor)
          : VALUE_RAMP;
    return {
      title,
      items: [
        { label: `min = ${min.toFixed(3)}${units}`, color: ramp[0] ?? UNKNOWN_COLOR },
        {
          label: `max = ${max.toFixed(3)}${units}`,
          color: ramp[ramp.length - 1] ?? UNKNOWN_COLOR,
        },
      ],
      context,
    };
  }

  return {
    title,
    items: [{ label: "no legend available for this layer yet", color: [148, 163, 184, 220] }],
    context,
  };
}
