import type {
  VizLayerCategory,
  VizLayerKind,
  VizLayerMeta,
  VizLayerVisibility,
  VizResolvedPalette,
  VizRgbaColor,
  VizSpaceId,
} from "./model.js";
import { createVizLayerKey } from "./projection.js";

type VizLayerPaletteInput =
  | Readonly<{ kind: "continuous"; stops: readonly VizRgbaColor[] }>
  | Readonly<{ kind: "categorical"; colors?: readonly VizRgbaColor[] }>;

type VizLayerMetaInput = Readonly<{
  label?: string;
  group?: string;
  description?: string;
  visibility?: VizLayerVisibility;
  role?: string;
  showGrid?: boolean;
  palette?: VizLayerPaletteInput;
  categories?: readonly VizLayerCategory[];
}>;

type VizLayerMetaBaseSnapshot = Readonly<{
  label?: string;
  group?: string;
  description?: string;
  visibility?: VizLayerVisibility;
  role?: string;
  showGrid?: boolean;
}>;

function assertRgbaColor(color: readonly number[], label: string): asserts color is VizRgbaColor {
  if (
    color.length !== 4 ||
    color.some((channel) => !Number.isInteger(channel) || channel < 0 || channel > 255)
  ) {
    throw new RangeError(`${label} must contain exactly four integer channels from 0 through 255.`);
  }
}

function assertVisibleColor(color: VizRgbaColor, label: string): void {
  if (color[3] === 0) {
    throw new RangeError(
      `${label} must remain visible; only explicit categories may be transparent.`
    );
  }
}

function copyRgbaColor(color: VizRgbaColor): VizRgbaColor {
  return [color[0], color[1], color[2], color[3]];
}

function snapshotResolvedPalette(palette: VizLayerPaletteInput): VizResolvedPalette {
  if (palette.kind === "continuous") {
    const [first, second, ...rest] = palette.stops;
    if (!first || !second) {
      throw new RangeError(`A resolved continuous palette requires at least two color stops.`);
    }
    palette.stops.forEach((color, index) => {
      assertRgbaColor(color, `Continuous palette stop ${index}`);
      assertVisibleColor(color, `Continuous palette stop ${index}`);
    });
    return {
      kind: "continuous",
      stops: [copyRgbaColor(first), copyRgbaColor(second), ...rest.map(copyRgbaColor)],
    };
  }

  const colors = palette.colors;
  if (!colors) {
    throw new RangeError(
      `A resolved categorical palette requires exactly one color authority: palette colors or categories.`
    );
  }
  const [first, ...rest] = colors;
  if (!first) {
    throw new RangeError(`A resolved categorical palette color pool must be nonempty.`);
  }
  colors.forEach((color, index) => {
    assertRgbaColor(color, `Categorical palette color ${index}`);
    assertVisibleColor(color, `Categorical palette color ${index}`);
  });
  return {
    kind: "categorical",
    colors: [copyRgbaColor(first), ...rest.map(copyRgbaColor)],
  };
}

function snapshotCategories(
  categories: readonly VizLayerCategory[] | undefined
): readonly [VizLayerCategory, ...VizLayerCategory[]] | undefined {
  if (!categories) return undefined;

  const snapshot = categories.map((category) => {
    if (!Number.isSafeInteger(category.value)) {
      throw new RangeError(`Visualization category values must be safe integers.`);
    }
    assertRgbaColor(category.color, `Category ${String(category.value)} color`);
    return {
      value: category.value,
      label: category.label,
      color: copyRgbaColor(category.color),
    };
  });

  const identities = new Set<number>();
  for (const category of snapshot) {
    if (identities.has(category.value)) {
      throw new RangeError(
        `Visualization category values must be unique; found ${category.value}.`
      );
    }
    identities.add(category.value);
  }

  const [first, ...rest] = snapshot;
  return first ? [first, ...rest] : undefined;
}

function snapshotMetaBase(meta: VizLayerMetaInput): VizLayerMetaBaseSnapshot {
  return {
    ...(meta.label === undefined ? {} : { label: meta.label }),
    ...(meta.group === undefined ? {} : { group: meta.group }),
    ...(meta.description === undefined ? {} : { description: meta.description }),
    ...(meta.visibility === undefined ? {} : { visibility: meta.visibility }),
    ...(meta.role === undefined ? {} : { role: meta.role }),
    ...(meta.showGrid === undefined ? {} : { showGrid: meta.showGrid }),
  };
}

/** Validates and snapshots the one renderer-neutral palette/category authority for a layer. */
export function snapshotVizLayerMeta(
  meta: VizLayerMetaInput | undefined
): VizLayerMeta | undefined {
  if (!meta) return undefined;

  const categories = snapshotCategories(meta.categories);
  const palette = meta.palette;
  if (palette?.kind === "continuous" && categories) {
    throw new RangeError(`A resolved continuous palette cannot also define categories.`);
  }
  if (palette?.kind === "categorical") {
    const hasColors = palette.colors !== undefined;
    const hasCategories = categories !== undefined;
    if (hasColors === hasCategories) {
      throw new RangeError(
        `A resolved categorical palette requires exactly one color authority: palette colors or categories.`
      );
    }
  }

  const base = snapshotMetaBase(meta);
  if (!palette) {
    if (categories) {
      throw new RangeError(`Explicit visualization categories require a categorical palette.`);
    }
    return base;
  }
  if (palette.kind === "continuous" || palette.colors !== undefined) {
    return { ...base, palette: snapshotResolvedPalette(palette) };
  }
  if (!categories) {
    throw new RangeError(
      `A resolved categorical palette requires exactly one color authority: palette colors or categories.`
    );
  }
  return { ...base, palette: { kind: "categorical" }, categories };
}

type VizVectorReferences = Readonly<{ u: string; v: string; magnitude?: string }>;

/** Validates that vector channels name distinct fields in the same grid-fields layer. */
export function assertVizVectorReferences(
  fields: Readonly<Record<string, unknown>>,
  vector: VizVectorReferences | undefined
): void {
  if (!vector) return;
  const { u: uKey, v: vKey, magnitude: magnitudeKey } = vector;
  if (uKey === vKey || magnitudeKey === uKey || magnitudeKey === vKey) {
    throw new RangeError(`Vector u, v, and magnitude references must name distinct grid fields.`);
  }
  if (!Object.hasOwn(fields, uKey) || !Object.hasOwn(fields, vKey)) {
    throw new RangeError(`Vector u and v references must name existing grid fields.`);
  }
  if (magnitudeKey && !Object.hasOwn(fields, magnitudeKey)) {
    throw new RangeError(`Vector magnitude reference must name an existing grid field.`);
  }
}

type VizLayerKeyInput = Readonly<{
  layerKey: string;
  stepId: string;
  dataTypeKey: string;
  spaceId: VizSpaceId;
  kind: VizLayerKind;
  variantKey?: string;
  meta?: Readonly<{ role?: string }>;
}>;

/** Rejects a serialized layer key that contradicts its admitted semantic identity fields. */
export function assertCanonicalVizLayerKey(layer: VizLayerKeyInput): void {
  const canonical = createVizLayerKey({
    stepId: layer.stepId,
    dataTypeKey: layer.dataTypeKey,
    spaceId: layer.spaceId,
    kind: layer.kind,
    role: layer.meta?.role,
    variantKey: layer.variantKey,
  });
  if (layer.layerKey !== canonical) {
    throw new TypeError(`Visualization layer key must be canonical; expected "${canonical}".`);
  }
}

/** Rejects repeated canonical layer identities before a batch crosses an ownership boundary. */
export function assertUniqueVizLayerKeys(
  layers: readonly Readonly<{ layerKey: string }>[],
  label = "Visualization layer batch"
): void {
  const layerKeys = new Set<string>();
  for (const layer of layers) {
    if (layerKeys.has(layer.layerKey)) {
      throw new TypeError(`${label} contains duplicate layer key "${layer.layerKey}".`);
    }
    layerKeys.add(layer.layerKey);
  }
}
