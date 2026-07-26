import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";
import { summarizeMetricComponents } from "@swooper/mapgen-metrics";
import { type Static, Type } from "typebox";

const ComponentSummarySchema = Type.Object(
  {
    componentCount: Type.Integer({ minimum: 0 }),
    largestComponentSize: Type.Integer({ minimum: 0 }),
    maximumComponentDiameter: Type.Integer({ minimum: 0 }),
    singleTileComponentCount: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: false,
    description: "Connected-component measurements for the lakes accepted by Civ7.",
  }
);

/** Closed measurements emitted when the Standard recipe projects lake intent into Civ7. */
export const StandardLakeProjectionMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard lake-projection measurement record.",
    }),
    plannedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of domain-planned lake tiles presented to the Civ7 adapter.",
    }),
    morphologyProtectedLakeTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of domain-planned lake tiles withheld because final Morphology marks them as mountains or volcanoes.",
    }),
    stampedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of planned lake tiles accepted as lakes by Civ7.",
    }),
    rejectedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of planned lake tiles Civ7 did not retain as lakes.",
    }),
    nonLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of projected candidates whose current Civ7 classification is not lake.",
    }),
    terrainMismatchTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of projected candidates whose current Civ7 terrain disagrees with lake intent.",
    }),
    components: ComponentSummarySchema,
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe measurements of admitted lake intent materialized into current Civ7 state.",
  }
);

/** Measurements projected from one completed Standard lake-materialization step. */
export type StandardLakeProjectionMeasurements = Static<
  typeof StandardLakeProjectionMeasurementsSchema
>;

/** Causal evidence needed to measure one completed lake projection. */
export type StandardLakeProjectionMeasurementInput = Readonly<{
  dimensions: Readonly<{ width: number; height: number }>;
  projectedLakeMask: Uint8Array;
  plannedLakeTileCount: number;
  morphologyProtectedLakeTileCount: number;
  stampedLakeTileCount: number;
  rejectedLakeTileCount: number;
  nonLakeTileCount: number;
  terrainMismatchTileCount: number;
}>;

/**
 * Projects neutral lake-materialization measurements while the exact Civ7 readback is available.
 * The typed grid remains invocation-local; only scalar topology and rejection evidence crosses
 * the metrics boundary.
 */
export function measureStandardLakeProjection(
  input: StandardLakeProjectionMeasurementInput
): StandardLakeProjectionMeasurements {
  const components = summarizeMetricComponents(
    collectMaskComponentsOddQ({
      mask: input.projectedLakeMask,
      width: input.dimensions.width,
      height: input.dimensions.height,
    })
  );
  return Object.freeze({
    version: 1,
    plannedLakeTileCount: input.plannedLakeTileCount,
    morphologyProtectedLakeTileCount: input.morphologyProtectedLakeTileCount,
    stampedLakeTileCount: input.stampedLakeTileCount,
    rejectedLakeTileCount: input.rejectedLakeTileCount,
    nonLakeTileCount: input.nonLakeTileCount,
    terrainMismatchTileCount: input.terrainMismatchTileCount,
    components: Object.freeze({ ...components }),
  });
}
