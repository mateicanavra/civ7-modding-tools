import { findInvalidRiverClassIndex } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Snapshot of Hydrology hydrography derived from Morphology topography + Hydrology discharge projection.
 *
 * This is the canonical read path for “river-ness” and discharge-like signals inside the pipeline.
 * Engine rivers/lakes may differ because they are downstream projections of this model.
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

/** Canonical schema entrypoint for Hydrology routing, discharge, and river-class evidence. */
export const Schema = HydrologyHydrographyArtifactSchema;

/**
 * Registers canonical Hydrology routing, runoff, discharge, river class, and
 * drainage-depression model before engine projection. Consumers must use this artifact rather
 * than treating observed Civ7 rivers as the Hydrology model.
 */
export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown, expectedLength?: number): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
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
  appendArtifactTypedArrayIssues(
    errors,
    "hydrography.runoff",
    candidate.runoff,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "hydrography.discharge",
    candidate.discharge,
    Float32Array,
    expectedLength
  );
  if (
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.riverClass",
      candidate.riverClass,
      Uint8Array,
      expectedLength
    )
  ) {
    const invalidIndex = findInvalidRiverClassIndex(candidate.riverClass);
    if (invalidIndex >= 0) {
      errors.push({
        message: `Expected hydrography.riverClass values to be non-negative integer river classes (first invalid index ${invalidIndex}).`,
      });
    }
  }
  appendArtifactTypedArrayIssues(
    errors,
    "hydrography.flowDir",
    candidate.flowDir,
    Int32Array,
    expectedLength
  );
  if (
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.sinkMask",
      candidate.sinkMask,
      Uint8Array,
      expectedLength
    )
  ) {
    validateCategoricalGrid(errors, "hydrography.sinkMask", candidate.sinkMask, 1);
  }
  if (
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.outletMask",
      candidate.outletMask,
      Uint8Array,
      expectedLength
    )
  ) {
    validateCategoricalGrid(errors, "hydrography.outletMask", candidate.outletMask, 1);
  }
  if (candidate.basinId !== undefined) {
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.basinId",
      candidate.basinId,
      Int32Array,
      expectedLength
    );
  }
  if (candidate.routingElevation !== undefined) {
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.routingElevation",
      candidate.routingElevation,
      Float32Array,
      expectedLength
    );
  }
  if (candidate.depressionDepth !== undefined) {
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.depressionDepth",
      candidate.depressionDepth,
      Float32Array,
      expectedLength
    );
  }
  if (candidate.terminalType !== undefined) {
    if (
      appendArtifactTypedArrayIssues(
        errors,
        "hydrography.terminalType",
        candidate.terminalType,
        Uint8Array,
        expectedLength
      )
    ) {
      validateCategoricalGrid(errors, "hydrography.terminalType", candidate.terminalType, 2);
    }
  }
  return errors;
}

function validateCategoricalGrid(
  errors: ArtifactValidationIssue[],
  label: string,
  value: { readonly [index: number]: number; readonly length: number },
  maximum: number
): void {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index]! > maximum) {
      errors.push({
        message: `Expected ${label} values in 0..${maximum} (first invalid index ${index}).`,
      });
      return;
    }
  }
}

/**
 * Validates hydrography against its closed schema and, when map dimensions are supplied,
 * verifies every tile field matches that width × height. It returns accumulated issues so
 * artifact admission can reject a structurally valid but spatially inconsistent payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, artifactCellCount(context)),
  ]);
}
