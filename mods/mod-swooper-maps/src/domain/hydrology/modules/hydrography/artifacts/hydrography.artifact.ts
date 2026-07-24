import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { findInvalidRiverClassIndex } from "../model/policy/river-class.js";

type Hydrography = Readonly<{
  runoff: Float32Array;
  discharge: Float32Array;
  riverClass: Uint8Array;
  flowDir: Int32Array;
  sinkMask: Uint8Array;
  outletMask: Uint8Array;
  basinId: Int32Array;
  routingElevation: Float32Array;
  depressionDepth: Float32Array;
  terminalType: Uint8Array;
}>;

/**
 * Registers canonical Hydrology routing, runoff, discharge, river class, and
 * drainage-depression model before engine projection. Consumers must use this artifact rather
 * than treating observed Civ7 rivers as the Hydrology model.
 */
export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Type.Object(
    {
      runoff: TypedArraySchemas.f32({
        description: "Local runoff supplied by precipitation and humidity at each tile.",
      }),
      discharge: TypedArraySchemas.f32({
        description: "Runoff accumulated through the Hydrology drainage graph at each tile.",
      }),
      riverClass: TypedArraySchemas.u8({
        description: "River class: 0=none, 1=minor, and 2 or greater=major/projectable.",
      }),
      flowDir: TypedArraySchemas.i32({
        description: "Conditioned receiver tile index, or -1 for a typed terminal basin.",
      }),
      sinkMask: TypedArraySchemas.u8({
        description: "Raw drainage minimum eligible for lake or depression planning (1=yes).",
      }),
      outletMask: TypedArraySchemas.u8({
        description: "Land tile that drains directly to ocean, water, or the map edge (1=yes).",
      }),
      basinId: TypedArraySchemas.i32({
        description: "Drainage-basin identifier per tile, or -1 when unassigned.",
      }),
      routingElevation: TypedArraySchemas.f32({
        description:
          "Hydrologically conditioned routing surface that leaves Morphology elevation unchanged.",
      }),
      depressionDepth: TypedArraySchemas.f32({
        description: "Depth added while conditioning a depression to its spill surface.",
      }),
      terminalType: TypedArraySchemas.u8({
        description: "Drainage terminal: 0=none, 1=ocean/water outlet, 2=closed basin.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology routing, runoff, discharge, river, and drainage-depression state before Civ7 projection.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as Hydrography;
    const expectedLength = artifactCellCount(context);
    const errors: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.runoff",
      value.runoff,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.discharge",
      value.discharge,
      Float32Array,
      expectedLength
    );
    if (
      appendArtifactTypedArrayIssues(
        errors,
        "hydrography.riverClass",
        value.riverClass,
        Uint8Array,
        expectedLength
      )
    ) {
      const invalidIndex = findInvalidRiverClassIndex(value.riverClass);
      if (invalidIndex >= 0) {
        errors.push({
          message: `Expected hydrography.riverClass values to be non-negative integer river classes (first invalid index ${invalidIndex}).`,
        });
      }
    }
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.flowDir",
      value.flowDir,
      Int32Array,
      expectedLength
    );
    if (
      appendArtifactTypedArrayIssues(
        errors,
        "hydrography.sinkMask",
        value.sinkMask,
        Uint8Array,
        expectedLength
      )
    ) {
      validateCategoricalGrid(errors, "hydrography.sinkMask", value.sinkMask, 1);
    }
    if (
      appendArtifactTypedArrayIssues(
        errors,
        "hydrography.outletMask",
        value.outletMask,
        Uint8Array,
        expectedLength
      )
    ) {
      validateCategoricalGrid(errors, "hydrography.outletMask", value.outletMask, 1);
    }
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.basinId",
      value.basinId,
      Int32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.routingElevation",
      value.routingElevation,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "hydrography.depressionDepth",
      value.depressionDepth,
      Float32Array,
      expectedLength
    );
    if (
      appendArtifactTypedArrayIssues(
        errors,
        "hydrography.terminalType",
        value.terminalType,
        Uint8Array,
        expectedLength
      )
    ) {
      validateCategoricalGrid(errors, "hydrography.terminalType", value.terminalType, 2);
    }
    return errors;
  },
});

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
