import type {
  VizLayerEntryV2,
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
    }>
  | Readonly<{
      kind: "categorical";
      colorsByValue: ReadonlyMap<number, RgbaColor>;
      hasUnmappedValues: boolean;
    }>;

/** Palette mapping and truthful bounds for the scalar field selected by the renderer. */
export type VizRenderedScalarPresentation = Readonly<{
  stats: VizScalarStats | null;
  palette: VizPalettePresentation;
}>;

/** One human-readable legend entry paired with the exact color used by the renderer. */
export type VizLegendItem = { label: string; color: RgbaColor };

/** Legend presentation for one selected layer and its exact owning-step presentation context. */
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
export function resolveLayerVisibility(layer: VizLayerEntryV2): VizLayerVisibility {
  const visibility = layer.meta?.visibility;
  if (visibility === "debug") return "debug";
  if (visibility === "hidden") return "hidden";
  return "default";
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

const NEUTRAL_SCALAR_RAMP: ReadonlyArray<RgbaColor> = [
  [35, 35, 41, 72],
  [35, 35, 41, 150],
  [35, 35, 41, 230],
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
 * Resolves portable v2 palette metadata through one renderer-facing path.
 * Resolved category pools bind to sorted observed ids; omitted palettes use one neutral scalar
 * ramp and never invent run-specific presentation state.
 */
export function resolveVizPalettePresentation(
  options: Readonly<{
    meta?: VizLayerMeta;
    field?: VizScalarField | null;
    values: VizScalarSource["values"];
  }>
): VizPalettePresentation {
  const categories = options.meta?.categories;
  const colorsByValue = new Map<number, RgbaColor>();
  if (categories) {
    for (const category of categories) {
      colorsByValue.set(category.value, copyColor(category.color));
    }
  }

  const palette = options.meta?.palette;
  if (palette?.kind === "categorical") {
    if (!hasResolvedCategoryColors(palette)) {
      const observedIds = collectResolvedCategoryIds(
        options.values,
        options.field?.valueSpec?.noData
      );
      return {
        kind: "categorical",
        colorsByValue,
        hasUnmappedValues: observedIds.some((value) => !colorsByValue.has(value)),
      };
    }
    const ids = collectResolvedCategoryIds(options.values, options.field?.valueSpec?.noData);
    const colors = palette.colors;
    const pooledColorsByValue = new Map<number, RgbaColor>();
    for (let index = 0; index < ids.length; index++) {
      const color = colors[index % colors.length];
      if (color) pooledColorsByValue.set(ids[index]!, copyColor(color));
    }
    return {
      kind: "categorical",
      colorsByValue: pooledColorsByValue,
      hasUnmappedValues: false,
    };
  }
  if (palette?.kind === "continuous") {
    return { kind: "continuous", colors: palette.stops.map(copyColor) };
  }
  return {
    kind: "continuous",
    colors: NEUTRAL_SCALAR_RAMP.map(copyColor),
  };
}

/**
 * Canonical dark-theme `--border` color used to grout every present map tile.
 * Keeping the border independent of semantic fill hue makes the hex lattice read as one matte
 * graphite surface while transparent tiles continue to opt out at the renderer call site.
 */
export const TILE_BORDER_COLOR = [52, 52, 61, 255] as const satisfies Readonly<RgbaColor>;

/** Returns the shared graphite border for a present tile. */
export function tileBorderColorForPresentTile(): RgbaColor {
  return copyColor(TILE_BORDER_COLOR);
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

  if (args.palette.kind === "categorical") {
    const color = args.palette.colorsByValue.get(rawValue) ?? UNKNOWN_COLOR;
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
export function formatLayerLabel(layer: VizLayerEntryV2): string {
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
export function selectVizScalarField(layer: VizLayerEntryV2): VizScalarField | null {
  if (layer.kind === "grid") return layer.field;
  if (layer.kind === "points" || layer.kind === "segments") return layer.values ?? null;
  const fieldKey = layer.vector?.magnitude ?? layer.vector?.u ?? Object.keys(layer.fields)[0];
  return fieldKey === undefined ? null : (layer.fields[fieldKey] ?? null);
}

/** Builds the legend for the exact scalar field selected by the renderer. */
export function legendForLayer(
  layer: VizLayerEntryV2 | null,
  scalar: VizRenderedScalarPresentation | null,
  context?: VizLegendModel["context"]
): VizLegendModel | null {
  if (!layer) return null;

  const title = layer.meta?.label ?? layer.dataTypeKey;
  const palette = layer.meta?.palette;

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

  if (palette?.kind === "categorical") {
    const colors = hasResolvedCategoryColors(palette) ? palette.colors : undefined;
    return {
      title,
      items: colors?.length
        ? colors.map((color, index) => ({
            label: `category color ${index + 1}`,
            color: copyColor(color),
          }))
        : [{ label: "categorical palette", color: [148, 163, 184, 220] }],
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
        : palette?.kind === "continuous"
          ? palette.stops.map(copyColor)
          : NEUTRAL_SCALAR_RAMP;
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
