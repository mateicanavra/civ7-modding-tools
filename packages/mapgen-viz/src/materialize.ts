import type {
  VizBinaryRef,
  VizLayerCategory,
  VizLayerEmissionV1,
  VizLayerIdentityV1,
  VizLayerMeta,
  VizResolvedPalette,
  VizRgbaColor,
  VizScalarField,
  VizStepId,
  VizValueSpec,
} from "./model.js";
import type { VizBinarySource, VizProjection, VizScalarSource } from "./projection.js";
import { createVizLayerKey } from "./projection.js";
import { computeVizScalarStats } from "./stats.js";

/** One binary slot the portable kernel delegates to an environment-owned adapter exactly once. */
export type VizBinarySlot =
  | Readonly<{ kind: "grid-values"; layerKey: string; source: VizBinarySource }>
  | Readonly<{ kind: "points-positions"; layerKey: string; source: Float32Array }>
  | Readonly<{ kind: "points-values"; layerKey: string; source: VizBinarySource }>
  | Readonly<{ kind: "segments-geometry"; layerKey: string; source: Float32Array }>
  | Readonly<{ kind: "segments-values"; layerKey: string; source: VizBinarySource }>
  | Readonly<{
      kind: "grid-field-values";
      layerKey: string;
      fieldKey: string;
      source: VizBinarySource;
    }>;

/**
 * Environment boundary that copies or persists one validated binary source and returns its ref.
 * Callback failures propagate; the kernel never retries a slot or mutates/detaches source buffers.
 */
export type VizBinaryMaterializer<Ref extends VizBinaryRef> = (slot: VizBinarySlot) => Ref;

/** Execution-owned identity attached while projections cross a transport boundary. */
export type VizMaterializationContext = Readonly<{ stepId: VizStepId; phase?: string }>;

function assertPositiveDimensions(width: number, height: number): number {
  if (!Number.isSafeInteger(width) || width <= 0)
    throw new RangeError(`Visualization width must be a positive safe integer; received ${width}.`);
  if (!Number.isSafeInteger(height) || height <= 0)
    throw new RangeError(
      `Visualization height must be a positive safe integer; received ${height}.`
    );
  const size = width * height;
  if (!Number.isSafeInteger(size))
    throw new RangeError(`Visualization grid cardinality exceeds the safe integer range.`);
  return size;
}

function assertScalarCardinality(source: VizScalarSource, expected: number, label: string): void {
  if (source.values.length !== expected) {
    throw new RangeError(
      `${label} requires ${expected} scalar values; received ${source.values.length}.`
    );
  }
}

function deriveGeometryBounds(
  values: Float32Array,
  label: string
): [minX: number, minY: number, maxX: number, maxY: number] {
  if (values.length === 0) return [0, 0, 1, 1];

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 2) {
    const x = values[index] as number;
    const y = values[index + 1] as number;
    if (!Number.isFinite(x) || !Number.isFinite(y))
      throw new RangeError(`${label} geometry must contain only finite coordinates.`);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return [minX, minY, maxX, maxY];
}

type VizScalarFieldEvidence = Omit<VizScalarField, "data">;

function snapshotScalarField(source: VizScalarSource): VizScalarFieldEvidence {
  return {
    format: source.format,
    stats: computeVizScalarStats(source) ?? undefined,
    valueSpec: snapshotValueSpec(source.valueSpec),
  };
}

function materializeScalarField<Ref extends VizBinaryRef>(
  evidence: VizScalarFieldEvidence,
  ref: Ref
): VizScalarField<Ref> {
  return { ...evidence, data: ref };
}

function snapshotValueSpec(valueSpec: VizValueSpec | undefined): VizValueSpec | undefined {
  if (!valueSpec) return undefined;
  const transform = valueSpec.transform;
  return {
    ...valueSpec,
    domain: { ...valueSpec.domain },
    noData: valueSpec.noData ? { ...valueSpec.noData } : undefined,
    transform:
      transform?.kind === "piecewise"
        ? { ...transform, points: transform.points.map((point) => ({ ...point })) }
        : transform?.kind === "normalize"
          ? { ...transform, domain: { ...transform.domain } }
          : transform
            ? { ...transform }
            : undefined,
  };
}

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

function normalizedCategoryValue(value: number | string, requireInteger: boolean): number {
  const normalized = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(normalized)) {
    throw new RangeError(
      `Visualization category values must be finite numbers or numeric strings.`
    );
  }
  if (requireInteger && !Number.isSafeInteger(normalized)) {
    throw new RangeError(
      `Resolved visualization category values must be safe integers or integer strings.`
    );
  }
  return normalized;
}

function snapshotResolvedPalette(palette: VizResolvedPalette): VizResolvedPalette {
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

  const [first, ...rest] = palette.colors;
  if (!first) {
    throw new RangeError(`A resolved categorical palette color pool must be nonempty.`);
  }
  palette.colors.forEach((color, index) => {
    assertRgbaColor(color, `Categorical palette color ${index}`);
    assertVisibleColor(color, `Categorical palette color ${index}`);
  });
  return {
    kind: "categorical",
    colors: [copyRgbaColor(first), ...rest.map(copyRgbaColor)],
  };
}

function requireNonEmptyCategories(
  categories: readonly VizLayerCategory[] | undefined
): readonly [VizLayerCategory, ...VizLayerCategory[]] {
  const [first, ...rest] = categories ?? [];
  if (!first) {
    throw new RangeError(
      `A resolved categorical palette requires exactly one color authority: palette colors or categories.`
    );
  }
  return [first, ...rest];
}

function snapshotMeta(meta: VizLayerMeta | undefined): VizLayerMeta | undefined {
  if (!meta) return undefined;
  const requiresIntegerCategories =
    typeof meta.palette === "object" &&
    meta.palette.kind === "categorical" &&
    meta.palette.colors === undefined;
  const categories = meta.categories?.map((category) => {
    normalizedCategoryValue(category.value, requiresIntegerCategories);
    assertRgbaColor(category.color, `Category ${String(category.value)} color`);
    return { ...category, color: copyRgbaColor(category.color) };
  });
  if (categories?.length) {
    const identities = new Set<number>();
    for (const category of categories) {
      const identity = normalizedCategoryValue(category.value, requiresIntegerCategories);
      if (identities.has(identity)) {
        throw new RangeError(`Visualization category values must be unique; found ${identity}.`);
      }
      identities.add(identity);
    }
  }

  const palette =
    typeof meta.palette !== "object"
      ? meta.palette
      : meta.palette.kind === "continuous"
        ? snapshotResolvedPalette(meta.palette)
        : meta.palette.colors === undefined
          ? ({ kind: "categorical" } as const)
          : snapshotResolvedPalette(meta.palette);
  if (typeof palette === "object" && palette.kind === "continuous" && categories?.length) {
    throw new RangeError(`A resolved continuous palette cannot also define categories.`);
  }
  if (typeof palette === "object" && palette.kind === "categorical") {
    const hasColors = "colors" in palette;
    const hasCategories = Boolean(categories?.length);
    if (hasColors === hasCategories) {
      throw new RangeError(
        `A resolved categorical palette requires exactly one color authority: palette colors or categories.`
      );
    }
  }

  const { categories: _categories, palette: _palette, ...base } = meta;
  if (typeof palette === "object") {
    if (palette.kind === "continuous" || "colors" in palette) {
      return { ...base, palette };
    }
    return {
      ...base,
      palette,
      categories: requireNonEmptyCategories(categories),
    };
  }
  if (palette === undefined && categories === undefined) return base;
  if (palette === undefined) return { ...base, categories };
  if (categories === undefined) return { ...base, palette };
  return { ...base, palette, categories };
}

function materializedIdentity(
  projection: VizProjection,
  context: VizMaterializationContext
): Omit<VizLayerIdentityV1, "bounds"> {
  const layerKey = createVizLayerKey({
    stepId: context.stepId,
    dataTypeKey: projection.dataTypeKey,
    spaceId: projection.spaceId,
    kind: projection.kind,
    role: projection.meta?.role,
    variantKey: projection.variantKey,
  });
  return {
    kind: projection.kind,
    layerKey,
    dataTypeKey: projection.dataTypeKey,
    variantKey: projection.variantKey,
    stepId: context.stepId,
    phase: context.phase,
    spaceId: projection.spaceId,
    meta: snapshotMeta(projection.meta),
  };
}

/**
 * Validates and materializes one environment-neutral visualization projection.
 *
 * The function owns identity, bounds, counts, scalar statistics, vector references, and binary
 * slot order. It validates the complete projection before invoking the adapter, invokes that
 * adapter exactly once per slot, and never mutates or detaches an input buffer.
 */
export function materializeVizProjection<Ref extends VizBinaryRef>(
  projection: VizProjection,
  context: VizMaterializationContext,
  materializeBinary: VizBinaryMaterializer<Ref>
): VizLayerEmissionV1<Ref> {
  const identity = materializedIdentity(projection, context);

  if (projection.kind === "grid") {
    const size = assertPositiveDimensions(projection.dims.width, projection.dims.height);
    assertScalarCardinality(projection.field, size, "Grid projection");
    const field = snapshotScalarField(projection.field);
    const ref = materializeBinary({
      kind: "grid-values",
      layerKey: identity.layerKey,
      source: projection.field.values,
    });
    return {
      ...identity,
      kind: "grid",
      bounds: [0, 0, projection.dims.width, projection.dims.height],
      dims: { ...projection.dims },
      field: materializeScalarField(field, ref),
    };
  }

  if (projection.kind === "points") {
    if (projection.positions.length % 2 !== 0)
      throw new RangeError(`Point geometry must contain complete [x, y] pairs.`);
    const count = projection.positions.length / 2;
    if (!Number.isSafeInteger(count))
      throw new RangeError(`Point count exceeds safe integer range.`);
    if (projection.values) assertScalarCardinality(projection.values, count, "Point projection");
    const bounds = deriveGeometryBounds(projection.positions, "Point projection");
    const valueEvidence = projection.values ? snapshotScalarField(projection.values) : undefined;

    const positions = materializeBinary({
      kind: "points-positions",
      layerKey: identity.layerKey,
      source: projection.positions,
    });
    const values =
      projection.values && valueEvidence
        ? materializeScalarField(
            valueEvidence,
            materializeBinary({
              kind: "points-values",
              layerKey: identity.layerKey,
              source: projection.values.values,
            })
          )
        : undefined;
    return { ...identity, kind: "points", bounds, count, positions, values };
  }

  if (projection.kind === "segments") {
    if (projection.segments.length % 4 !== 0)
      throw new RangeError(`Segment geometry must contain complete [x0, y0, x1, y1] values.`);
    const count = projection.segments.length / 4;
    if (!Number.isSafeInteger(count))
      throw new RangeError(`Segment count exceeds safe integer range.`);
    if (projection.values) assertScalarCardinality(projection.values, count, "Segment projection");
    const bounds = deriveGeometryBounds(projection.segments, "Segment projection");
    const valueEvidence = projection.values ? snapshotScalarField(projection.values) : undefined;

    const segments = materializeBinary({
      kind: "segments-geometry",
      layerKey: identity.layerKey,
      source: projection.segments,
    });
    const values =
      projection.values && valueEvidence
        ? materializeScalarField(
            valueEvidence,
            materializeBinary({
              kind: "segments-values",
              layerKey: identity.layerKey,
              source: projection.values.values,
            })
          )
        : undefined;
    return { ...identity, kind: "segments", bounds, count, segments, values };
  }

  const size = assertPositiveDimensions(projection.dims.width, projection.dims.height);
  const entries = Object.entries(projection.fields);
  if (entries.length === 0)
    throw new RangeError(`Grid-fields projection requires at least one field.`);
  for (const [fieldKey, field] of entries) {
    if (fieldKey.length === 0) throw new RangeError(`Grid-fields keys must not be empty.`);
    assertScalarCardinality(field, size, `Grid field ${fieldKey}`);
  }
  if (projection.vector) {
    const { u: uKey, v: vKey, magnitude: magnitudeKey } = projection.vector;
    if (uKey === vKey || magnitudeKey === uKey || magnitudeKey === vKey) {
      throw new RangeError(`Vector u, v, and magnitude references must name distinct grid fields.`);
    }
    const fieldByKey = new Map(entries);
    const u = fieldByKey.get(uKey);
    const v = fieldByKey.get(vKey);
    if (!u || !v) throw new RangeError(`Vector u and v references must name existing grid fields.`);
    if (magnitudeKey && !fieldByKey.has(magnitudeKey)) {
      throw new RangeError(`Vector magnitude reference must name an existing grid field.`);
    }
  }

  const fieldEvidence = entries.map(
    ([fieldKey, field]) => [fieldKey, field, snapshotScalarField(field)] as const
  );
  const materializedFields: Array<readonly [string, VizScalarField<Ref>]> = [];
  for (const [fieldKey, field, evidence] of fieldEvidence) {
    const ref = materializeBinary({
      kind: "grid-field-values",
      layerKey: identity.layerKey,
      fieldKey,
      source: field.values,
    });
    materializedFields.push([fieldKey, materializeScalarField(evidence, ref)]);
  }
  return {
    ...identity,
    kind: "gridFields",
    bounds: [0, 0, projection.dims.width, projection.dims.height],
    dims: { ...projection.dims },
    fields: Object.fromEntries(materializedFields),
    vector: projection.vector ? { ...projection.vector } : undefined,
  };
}
