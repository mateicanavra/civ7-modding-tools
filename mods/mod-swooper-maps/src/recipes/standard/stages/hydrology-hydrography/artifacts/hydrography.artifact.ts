import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import { findInvalidRiverClassIndex } from "@mapgen/domain/hydrology/model/policy/river-class.js";

/**
 * Snapshot of Hydrology hydrography derived from Morphology topography + Hydrology discharge projection.
 *
 * This is the canonical read path for “river-ness” and discharge-like signals inside the pipeline.
 * Engine rivers/lakes may differ (engine projection), and must not be treated as Hydrology internal truth.
 */
export const HydrologyHydrographyArtifactSchema = Type.Object(
  {
    /** Local runoff source proxy per tile (derived from precipitation/humidity inputs). */
    runoff: TypedArraySchemas.f32({
      description: "Local runoff source proxy per tile (derived from precipitation/humidity).",
    }),
    /** Accumulated discharge proxy per tile (routing + runoff accumulation). */
    discharge: TypedArraySchemas.f32({
      description: "Accumulated discharge proxy per tile (routing + runoff accumulation).",
    }),
    /** Discrete river class derived from discharge thresholds (0=none, 1=minor, >=2=major/projectable). */
    riverClass: TypedArraySchemas.u8({
      description: "River class per tile (0=none, 1=minor, >=2=major/projectable).",
    }),
    /** Hydrology-conditioned receiver index per tile, used by downstream Hydrology lake planning. */
    flowDir: TypedArraySchemas.i32({
      description:
        "Hydrology-conditioned receiver index per tile (or -1 for typed terminal basins).",
    }),
    /** Raw drainage minima: lake/depression candidates, not automatic discharge terminals. */
    sinkMask: TypedArraySchemas.u8({
      description: "Mask (1/0): raw local drainage minima used as lake/depression candidates.",
    }),
    /** Routing outlets: land tiles that drain to ocean/edges (land→water/out-of-bounds). */
    outletMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): land tiles that drain directly to ocean/edges (land→water/out-of-bounds).",
    }),
    /** Optional basin identifier per tile (or -1 when unassigned). */
    basinId: Type.Optional(
      TypedArraySchemas.i32({
        description:
          "Optional Hydrology drainage basin identifier per tile (or -1 when unassigned).",
      })
    ),
    routingElevation: Type.Optional(
      TypedArraySchemas.f32({
        description:
          "Hydrologically conditioned routing surface; does not mutate Morphology elevation.",
      })
    ),
    depressionDepth: Type.Optional(
      TypedArraySchemas.f32({
        description:
          "Positive where drainage conditioning fills a raw topographic depression to a spill surface.",
      })
    ),
    terminalType: Type.Optional(
      TypedArraySchemas.u8({
        description:
          "Terminal classification per land tile: 0=none, 1=ocean/water outlet, 2=closed basin.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology hydrography snapshot derived from Morphology topography + Hydrology discharge projection. Engine rivers/lakes may differ (projection-only).",
  }
);

export const Schema = HydrologyHydrographyArtifactSchema;

export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: NonNullable<ArtifactValidationContext["dimensions"]>): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: unknown[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
  if (!isRecord(value)) {
    errors.push({ message: "Missing hydrology hydrography artifact payload." });
    return errors;
  }
  const candidate = value as {
    runoff?: unknown;
    discharge?: unknown;
    riverClass?: unknown;
    flowDir?: unknown;
    sinkMask?: unknown;
    outletMask?: unknown;
    basinId?: unknown;
    routingElevation?: unknown;
    depressionDepth?: unknown;
    terminalType?: unknown;
  };
  validateTypedArray(errors, "hydrography.runoff", candidate.runoff, Float32Array, size);
  validateTypedArray(errors, "hydrography.discharge", candidate.discharge, Float32Array, size);
  if (
    validateTypedArray(errors, "hydrography.riverClass", candidate.riverClass, Uint8Array, size)
  ) {
    const invalidIndex = findInvalidRiverClassIndex(candidate.riverClass);
    if (invalidIndex >= 0) {
      errors.push({
        message: `Expected hydrography.riverClass values to be non-negative integer river classes (first invalid index ${invalidIndex}).`,
      });
    }
  }
  validateTypedArray(errors, "hydrography.flowDir", candidate.flowDir, Int32Array, size);
  validateTypedArray(errors, "hydrography.sinkMask", candidate.sinkMask, Uint8Array, size);
  validateTypedArray(errors, "hydrography.outletMask", candidate.outletMask, Uint8Array, size);
  if (candidate.basinId != null) {
    validateTypedArray(errors, "hydrography.basinId", candidate.basinId, Int32Array, size);
  }
  if (candidate.routingElevation != null) {
    validateTypedArray(
      errors,
      "hydrography.routingElevation",
      candidate.routingElevation,
      Float32Array,
      size
    );
  }
  if (candidate.depressionDepth != null) {
    validateTypedArray(
      errors,
      "hydrography.depressionDepth",
      candidate.depressionDepth,
      Float32Array,
      size
    );
  }
  if (candidate.terminalType != null) {
    validateTypedArray(
      errors,
      "hydrography.terminalType",
      candidate.terminalType,
      Uint8Array,
      size
    );
  }
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
