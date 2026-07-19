import { type Static, Type } from "typebox";
import { ParseError, Value } from "typebox/value";
import {
  assertCanonicalVizLayerKey,
  assertUniqueVizLayerKeys,
  assertVizVectorReferences,
  snapshotVizLayerMeta,
} from "./semantic.js";

const NonEmptyStringSchema = Type.String({ minLength: 1 });
const SafeIntegerSchema = Type.Integer({
  minimum: Number.MIN_SAFE_INTEGER,
  maximum: Number.MAX_SAFE_INTEGER,
});
const NonNegativeSafeIntegerSchema = Type.Integer({
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
});
const PositiveSafeIntegerSchema = Type.Integer({
  minimum: 1,
  maximum: Number.MAX_SAFE_INTEGER,
});

const VizPathRefSchema = Type.Object(
  {
    kind: Type.Literal("path"),
    path: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

const VizScalarStatsSchema = Type.Object(
  {
    min: Type.Number(),
    max: Type.Number(),
    mean: Type.Optional(Type.Number()),
    stddev: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);

const VizValueDomainSchema = Type.Union([
  Type.Object(
    { kind: Type.Literal("unit"), min: Type.Literal(0), max: Type.Literal(1) },
    { additionalProperties: false }
  ),
  Type.Object(
    { kind: Type.Literal("explicit"), min: Type.Number(), max: Type.Number() },
    { additionalProperties: false }
  ),
  Type.Object({ kind: Type.Literal("fromStats") }, { additionalProperties: false }),
]);

const VizNoDataSpecSchema = Type.Union([
  Type.Object({ kind: Type.Literal("none") }, { additionalProperties: false }),
  Type.Object(
    { kind: Type.Literal("sentinel"), value: Type.Number() },
    { additionalProperties: false }
  ),
  Type.Object({ kind: Type.Literal("nan") }, { additionalProperties: false }),
]);

const VizValueTransformSchema = Type.Union([
  Type.Object({ kind: Type.Literal("identity") }, { additionalProperties: false }),
  Type.Object(
    { kind: Type.Literal("clamp"), min: Type.Number(), max: Type.Number() },
    { additionalProperties: false }
  ),
  Type.Object(
    { kind: Type.Literal("normalize"), domain: VizValueDomainSchema },
    { additionalProperties: false }
  ),
  Type.Object(
    { kind: Type.Literal("affine"), scale: Type.Number(), offset: Type.Number() },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("piecewise"),
      points: Type.Array(
        Type.Object({ x: Type.Number(), y: Type.Number() }, { additionalProperties: false })
      ),
    },
    { additionalProperties: false }
  ),
]);

const VizValueSpecSchema = Type.Object(
  {
    scale: Type.Union([
      Type.Literal("categorical"),
      Type.Literal("linear"),
      Type.Literal("log"),
      Type.Literal("symlog"),
      Type.Literal("quantile"),
    ]),
    domain: VizValueDomainSchema,
    noData: Type.Optional(VizNoDataSpecSchema),
    transform: Type.Optional(VizValueTransformSchema),
    units: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

const VizScalarFieldSchema = Type.Object(
  {
    format: Type.Union([
      Type.Literal("u8"),
      Type.Literal("i8"),
      Type.Literal("u16"),
      Type.Literal("i16"),
      Type.Literal("i32"),
      Type.Literal("f32"),
    ]),
    data: VizPathRefSchema,
    stats: Type.Optional(VizScalarStatsSchema),
    valueSpec: Type.Optional(VizValueSpecSchema),
  },
  { additionalProperties: false }
);

const VizRgbaColorSchema = Type.Tuple([
  Type.Integer({ minimum: 0, maximum: 255 }),
  Type.Integer({ minimum: 0, maximum: 255 }),
  Type.Integer({ minimum: 0, maximum: 255 }),
  Type.Integer({ minimum: 0, maximum: 255 }),
]);

const VizLayerCategorySchema = Type.Object(
  {
    value: SafeIntegerSchema,
    label: Type.String(),
    color: VizRgbaColorSchema,
  },
  { additionalProperties: false }
);

const VizLayerMetaBaseProperties = {
  label: Type.Optional(Type.String()),
  group: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  visibility: Type.Optional(
    Type.Union([Type.Literal("default"), Type.Literal("debug"), Type.Literal("hidden")])
  ),
  role: Type.Optional(Type.String()),
  showGrid: Type.Optional(Type.Boolean()),
} as const;

const VizLayerMetaSchema = Type.Union([
  Type.Object(VizLayerMetaBaseProperties, { additionalProperties: false }),
  Type.Object(
    {
      ...VizLayerMetaBaseProperties,
      palette: Type.Object(
        {
          kind: Type.Literal("continuous"),
          stops: Type.Array(VizRgbaColorSchema, { minItems: 2 }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...VizLayerMetaBaseProperties,
      palette: Type.Object(
        {
          kind: Type.Literal("categorical"),
          colors: Type.Array(VizRgbaColorSchema, { minItems: 1 }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...VizLayerMetaBaseProperties,
      palette: Type.Object({ kind: Type.Literal("categorical") }, { additionalProperties: false }),
      categories: Type.Array(VizLayerCategorySchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);

const VizDimensionsSchema = Type.Object(
  {
    width: PositiveSafeIntegerSchema,
    height: PositiveSafeIntegerSchema,
  },
  { additionalProperties: false }
);

const VizLayerIdentityProperties = {
  layerKey: NonEmptyStringSchema,
  dataTypeKey: NonEmptyStringSchema,
  variantKey: Type.Optional(NonEmptyStringSchema),
  stepId: NonEmptyStringSchema,
  stageId: NonEmptyStringSchema,
  stepIndex: NonNegativeSafeIntegerSchema,
  spaceId: Type.Union([
    Type.Literal("tile.hexOddR"),
    Type.Literal("tile.hexOddQ"),
    Type.Literal("mesh.world"),
    Type.Literal("world.xy"),
  ]),
  bounds: Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Number()]),
  meta: Type.Optional(VizLayerMetaSchema),
} as const;

const PathVizGridLayerSchema = Type.Object(
  {
    ...VizLayerIdentityProperties,
    kind: Type.Literal("grid"),
    dims: VizDimensionsSchema,
    field: VizScalarFieldSchema,
  },
  { additionalProperties: false }
);

const PathVizGridFieldsLayerSchema = Type.Object(
  {
    ...VizLayerIdentityProperties,
    kind: Type.Literal("gridFields"),
    dims: VizDimensionsSchema,
    fields: Type.Record(NonEmptyStringSchema, VizScalarFieldSchema, { minProperties: 1 }),
    vector: Type.Optional(
      Type.Object(
        {
          u: NonEmptyStringSchema,
          v: NonEmptyStringSchema,
          magnitude: Type.Optional(NonEmptyStringSchema),
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

const PathVizPointsLayerSchema = Type.Object(
  {
    ...VizLayerIdentityProperties,
    kind: Type.Literal("points"),
    count: NonNegativeSafeIntegerSchema,
    positions: VizPathRefSchema,
    values: Type.Optional(VizScalarFieldSchema),
  },
  { additionalProperties: false }
);

const PathVizSegmentsLayerSchema = Type.Object(
  {
    ...VizLayerIdentityProperties,
    kind: Type.Literal("segments"),
    count: NonNegativeSafeIntegerSchema,
    segments: VizPathRefSchema,
    values: Type.Optional(VizScalarFieldSchema),
  },
  { additionalProperties: false }
);

const PathVizLayerSchema = Type.Union([
  PathVizGridLayerSchema,
  PathVizGridFieldsLayerSchema,
  PathVizPointsLayerSchema,
  PathVizSegmentsLayerSchema,
]);

const PathVizStepSchema = Type.Object(
  {
    stepId: NonEmptyStringSchema,
    stageId: NonEmptyStringSchema,
    stepIndex: NonNegativeSafeIntegerSchema,
  },
  { additionalProperties: false }
);

/**
 * Closed JSON Schema for filesystem-portable Viz v2 manifests.
 *
 * The schema admits only relative-path binary references and the complete renderer-neutral
 * presentation contract. Cross-row execution identity is enforced by `admitPathVizManifest`.
 */
export const PathVizManifestSchema = Type.Object(
  {
    version: Type.Literal(2),
    runId: NonEmptyStringSchema,
    planFingerprint: NonEmptyStringSchema,
    steps: Type.Array(PathVizStepSchema),
    layers: Type.Array(PathVizLayerSchema),
  },
  { additionalProperties: false }
);

type DeepReadonly<Value> = Value extends (...args: never[]) => unknown
  ? Value
  : Value extends object
    ? { readonly [Key in keyof Value]: DeepReadonly<Value[Key]> }
    : Value;

/** Filesystem-portable Viz v2 manifest derived from its owning runtime schema. */
export type PathVizManifest = DeepReadonly<Static<typeof PathVizManifestSchema>>;

/** Path-backed scalar grid entry admitted as part of a Viz v2 manifest. */
export type PathVizGridLayer = DeepReadonly<Static<typeof PathVizGridLayerSchema>>;

function assertManifestExecutionIdentity(manifest: PathVizManifest): void {
  const admittedStepsByIndex = new Map<number, Readonly<{ stageId: string; stepId: string }>>();
  const admittedStepIds = new Set<string>();

  for (const step of manifest.steps) {
    if (admittedStepIds.has(step.stepId) || admittedStepsByIndex.has(step.stepIndex)) {
      throw new TypeError("Visualization manifest contains duplicate step execution identity.");
    }
    admittedStepIds.add(step.stepId);
    admittedStepsByIndex.set(step.stepIndex, {
      stageId: step.stageId,
      stepId: step.stepId,
    });
  }

  for (const layer of manifest.layers) {
    const admittedStep = admittedStepsByIndex.get(layer.stepIndex);
    if (
      !admittedStep ||
      admittedStep.stageId !== layer.stageId ||
      admittedStep.stepId !== layer.stepId
    ) {
      throw new TypeError(
        `Layer "${layer.layerKey}" does not reference an admitted manifest step.`
      );
    }
  }
}

const PORTABLE_PATH_CONTROL_RE = /[\u0000-\u001f\u007f]/;
const PORTABLE_PATH_RESERVED_PUNCTUATION_RE = /[<>:"|?*]/;
const PORTABLE_PATH_RESERVED_NAME_RE =
  /^(?:con|prn|aux|nul|clock\$|conin\$|conout\$|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i;

function assertPortableRelativePath(path: string): void {
  const segments = path.split("/");
  if (
    path.startsWith("/") ||
    path.includes("\\") ||
    PORTABLE_PATH_CONTROL_RE.test(path) ||
    PORTABLE_PATH_RESERVED_PUNCTUATION_RE.test(path) ||
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        /[. ]$/.test(segment) ||
        PORTABLE_PATH_RESERVED_NAME_RE.test(segment)
    )
  ) {
    throw new TypeError(`Visualization binary path must be a portable relative path: "${path}".`);
  }
}

function assertManifestLayerSemantics(manifest: PathVizManifest): void {
  assertUniqueVizLayerKeys(manifest.layers, "Visualization manifest");
  for (const layer of manifest.layers) {
    snapshotVizLayerMeta(layer.meta);
    assertCanonicalVizLayerKey(layer);
    if (layer.kind === "gridFields") {
      assertVizVectorReferences(layer.fields, layer.vector);
    }
  }
}

function deepFreeze<Value>(value: Value, seen = new WeakSet<object>()): DeepReadonly<Value> {
  if (value === null || typeof value !== "object") return value as DeepReadonly<Value>;
  if (seen.has(value)) return value as DeepReadonly<Value>;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value) as DeepReadonly<Value>;
}

function assertManifestPaths(manifest: PathVizManifest): void {
  for (const layer of manifest.layers) {
    switch (layer.kind) {
      case "grid":
        assertPortableRelativePath(layer.field.data.path);
        break;
      case "gridFields":
        for (const field of Object.values(layer.fields)) {
          assertPortableRelativePath(field.data.path);
        }
        break;
      case "points":
        assertPortableRelativePath(layer.positions.path);
        if (layer.values) assertPortableRelativePath(layer.values.data.path);
        break;
      case "segments":
        assertPortableRelativePath(layer.segments.path);
        if (layer.values) assertPortableRelativePath(layer.values.data.path);
        break;
    }
  }
}

/**
 * Admits untrusted JSON as one filesystem-portable Viz v2 manifest.
 *
 * Besides the closed wire schema, admission requires every authored step id and execution index
 * to be unique and every layer's exact `(stageId, stepId, stepIndex)` tuple to reference that
 * inventory. The function is environment neutral and performs no filesystem access.
 */
export function admitPathVizManifest(value: unknown): PathVizManifest {
  let manifest: Static<typeof PathVizManifestSchema>;
  try {
    manifest = Value.Parse(PathVizManifestSchema, value);
  } catch (error) {
    if (!(error instanceof ParseError)) throw error;
    const details = error.cause.errors
      .map((issue) => `${issue.instancePath || "/"}: ${issue.message}`)
      .join("; ");
    throw new TypeError(`Invalid path-backed visualization manifest v2: ${details}`, {
      cause: error,
    });
  }

  assertManifestExecutionIdentity(manifest);
  assertManifestLayerSemantics(manifest);
  assertManifestPaths(manifest);
  return deepFreeze(structuredClone(manifest));
}
