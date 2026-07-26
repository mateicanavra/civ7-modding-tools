import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type LakePlan = Readonly<{
  width: number;
  height: number;
  lakeMask: Uint8Array;
  plannedLakeTileCount: number;
  sinkLakeCount: number;
}>;

/**
 * Registers deterministic lake intent and its drainage evidence before map-hydrology stamps
 * static water. Projection outcomes cannot retroactively redefine this Hydrology plan.
 */
export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Type.Object(
    {
      width: Type.Integer({
        minimum: 1,
        description: "Map-grid width represented by the lake intent mask.",
      }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by the lake intent mask.",
      }),
      lakeMask: TypedArraySchemas.u8({
        description: "Hydrology lake intent per tile (1=planned lake, 0=not planned).",
      }),
      plannedLakeTileCount: Type.Integer({
        minimum: 0,
        description: "Number of tiles admitted into the deterministic lake plan.",
      }),
      sinkLakeCount: Type.Integer({
        minimum: 0,
        description: "Number of planned lake tiles originating from hydrography minima.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology lake intent and the drainage evidence used by map projection and placement.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as LakePlan;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      issues,
      "lakeMask",
      value.lakeMask,
      Uint8Array,
      artifactCellCount(context)
    );
    return Object.freeze(issues);
  },
});
