import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
        cardinality: "map-grid",
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
  refine: (value, { issues }) => {
    let plannedLakeTileCount = 0;
    for (const cell of value.lakeMask) {
      if (cell === 1) plannedLakeTileCount += 1;
    }
    if (value.plannedLakeTileCount !== plannedLakeTileCount) {
      issues.add(
        `plannedLakeTileCount ${value.plannedLakeTileCount} does not match ` +
          `the ${plannedLakeTileCount} planned tiles in lakeMask.`
      );
    }
  },
});
