import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import type { NonEmptyTuple } from "type-fest";
import { NaturalWonderPlanIntentSchema } from "../../model/atoms/natural-wonder-plan-intent.schema.js";
import suitabilityDiversityDefinition from "./strategies/suitability-diversity/config.js";

/**
 * Defines the pure planning boundary for selecting natural wonders and primary/fallback anchors
 * from catalog constraints plus map truth. The bound strategy emits intent; Civ7 remains the final
 * stamping authority.
 */
const PlanNaturalWondersContract = defineOp({
  kind: "plan",
  id: "placement/plan-natural-wonders",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    riverClass: TypedArraySchemas.u8({
      description: "Hydrology river class per tile (0=none,1=minor,>=2=major/projectable).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Hydrology lake mask per tile (1=lake, 0=non-lake).",
    }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Ecology vegetation density per tile (0..1).",
    }),
    effectiveMoisture: TypedArraySchemas.f32({
      description: "Final climate effective-moisture field per tile.",
    }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Final climate surface temperature per tile (C).",
    }),
    fertility: TypedArraySchemas.f32({
      description: "Pedology fertility per tile (0..1).",
    }),
    discharge: TypedArraySchemas.f32({
      description: "Hydrology accumulated discharge proxy per tile.",
    }),
    slopeClass: TypedArraySchemas.u8({
      description: "Hydrology slope class per tile.",
    }),
    coastTerrainType: Type.Integer({ minimum: 0 }),
    mountainTerrainType: Type.Integer({ minimum: 0 }),
    iceFeatureType: Type.Integer({ minimum: 0 }),
    terrainType: TypedArraySchemas.i32({ description: "Current engine terrain type per tile." }),
    biomeType: TypedArraySchemas.i32({ description: "Current engine biome type per tile." }),
    featureType: TypedArraySchemas.i32({ description: "Current engine feature type per tile." }),
    noFeatureType: Type.Integer({ description: "Engine sentinel for an unoccupied feature slot." }),
    naturalWonderBlockedMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): tile terrain/placement is protected by static map policy and must not host natural-wonder placement.",
    }),
    featureCatalog: Type.Immutable(
      Type.Array(
        Type.ReadonlyObject(
          Type.Object(
            {
              featureType: Type.Integer({
                minimum: 0,
                description:
                  "Official Civ7 feature-type index identifying this planner-ready natural wonder.",
              }),
              direction: Type.Integer({
                description:
                  "Civ7 materialization direction resolved from static natural-wonder policy before planning.",
              }),
              validTerrainTypes: Type.Immutable(
                Type.Array(Type.Integer({ minimum: 0 }), {
                  description:
                    "Official Civ7 terrain-type indices that may anchor this wonder; an empty list means Civ7 declares no terrain restriction.",
                })
              ),
              validBiomeTypes: Type.Immutable(
                Type.Array(Type.Integer({ minimum: 0 }), {
                  description:
                    "Official Civ7 biome-type indices that may anchor this wonder; an empty list means Civ7 declares no biome restriction.",
                })
              ),
              minimumElevation: Type.Union([Type.Number(), Type.Null()], {
                description:
                  "Minimum Civ7 engine elevation at the anchor, or null when Civ7 declares no elevation floor.",
              }),
              noLake: Type.Boolean({
                description:
                  "Whether Civ7 forbids lake tiles anywhere in this wonder's planned footprint.",
              }),
              placeFirst: Type.Boolean({
                description:
                  "Whether Civ7 asks the planner to consider this wonder before ordinary catalog entries.",
              }),
              featureTags: Type.Immutable(
                Type.Array(Type.String(), {
                  description:
                    "Official Civ7 feature-placement tags constraining the wonder; an empty list means no tag predicates.",
                })
              ),
              footprintOffsetsByParity: Type.ReadonlyObject(
                Type.Object(
                  {
                    even: Type.Unsafe<
                      NonEmptyTuple<
                        Readonly<{
                          dx: number;
                          dy: number;
                        }>
                      >
                    >(
                      Type.Array(
                        Type.ReadonlyObject(
                          Type.Object(
                            {
                              dx: Type.Integer({
                                description:
                                  "Horizontal odd-R offset from an anchor on an even row.",
                              }),
                              dy: Type.Integer({
                                description: "Vertical offset from an anchor on an even row.",
                              }),
                            },
                            {
                              additionalProperties: false,
                              description:
                                "One cell in the wonder footprint relative to an even-row anchor.",
                            }
                          )
                        ),
                        {
                          minItems: 1,
                          description:
                            "Nonempty footprint offsets used when the anchor lies on an even odd-R row.",
                        }
                      )
                    ),
                    odd: Type.Unsafe<
                      NonEmptyTuple<
                        Readonly<{
                          dx: number;
                          dy: number;
                        }>
                      >
                    >(
                      Type.Array(
                        Type.ReadonlyObject(
                          Type.Object(
                            {
                              dx: Type.Integer({
                                description:
                                  "Horizontal odd-R offset from an anchor on an odd row.",
                              }),
                              dy: Type.Integer({
                                description: "Vertical offset from an anchor on an odd row.",
                              }),
                            },
                            {
                              additionalProperties: false,
                              description:
                                "One cell in the wonder footprint relative to an odd-row anchor.",
                            }
                          )
                        ),
                        {
                          minItems: 1,
                          description:
                            "Nonempty footprint offsets used when the anchor lies on an odd odd-R row.",
                        }
                      )
                    ),
                  },
                  {
                    additionalProperties: false,
                    description:
                      "Parity-resolved odd-R footprint geometry admitted by Civ7 map policy.",
                  }
                )
              ),
            },
            {
              additionalProperties: false,
              description:
                "One total, planner-ready natural-wonder policy row resolved before operation admission.",
            }
          )
        ),
        {
          description:
            "Planner-ready Civ7 natural-wonder policy rows; the catalog may be empty when no supported wonder is available.",
        }
      )
    ),
  }),
  output: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    targetCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    placements: Type.Array(NaturalWonderPlanIntentSchema),
  }),
  strategies: [suitabilityDiversityDefinition],
});

export default PlanNaturalWondersContract;
