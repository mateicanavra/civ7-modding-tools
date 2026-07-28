import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategyDefinition from "./strategies/history-derived/config.js";

/**
 * Declares the causal-history boundary that converts tectonic eras into localized belt drivers.
 * The resulting fields seed base terrain and later landform planning without rereading plate state.
 */
const ComputeBeltDriversContract = defineOp({
  kind: "compute",
  id: "morphology/compute-belt-drivers",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      historyTiles: Type.Object(
        {
          perEra: Type.Immutable(
            Type.Array(
              Type.Object(
                {
                  boundaryType: TypedArraySchemas.u8({
                    description: "Boundary regime per tile during this tectonic era.",
                  }),
                  upliftPotential: TypedArraySchemas.u8({
                    description: "Uplift potential per tile during this tectonic era.",
                  }),
                  collisionPotential: TypedArraySchemas.u8({
                    description: "Collision potential per tile during this tectonic era.",
                  }),
                  subductionPotential: TypedArraySchemas.u8({
                    description: "Subduction potential per tile during this tectonic era.",
                  }),
                  riftPotential: TypedArraySchemas.u8({
                    description: "Rift potential per tile during this tectonic era.",
                  }),
                  shearStress: TypedArraySchemas.u8({
                    description: "Shear-stress potential per tile during this tectonic era.",
                  }),
                },
                {
                  additionalProperties: false,
                  description: "Grid-aligned boundary and stress fields for one tectonic era.",
                }
              ),
              {
                minItems: 1,
                description:
                  "Causal tectonic history rows ordered from the earliest era to the current era.",
              }
            )
          ),
          rollups: Type.Object(
            {
              upliftTotal: TypedArraySchemas.u8({
                description: "Cumulative uplift potential per tile across all tectonic eras.",
              }),
              collisionTotal: TypedArraySchemas.u8({
                description: "Cumulative collision potential per tile across all tectonic eras.",
              }),
              subductionTotal: TypedArraySchemas.u8({
                description: "Cumulative subduction potential per tile across all tectonic eras.",
              }),
              upliftRecentFraction: TypedArraySchemas.u8({
                description: "Share of cumulative uplift attributable to recent eras per tile.",
              }),
              collisionRecentFraction: TypedArraySchemas.u8({
                description: "Share of cumulative collision attributable to recent eras per tile.",
              }),
              subductionRecentFraction: TypedArraySchemas.u8({
                description: "Share of cumulative subduction attributable to recent eras per tile.",
              }),
              lastActiveEra: TypedArraySchemas.u8({
                description: "Most recent active tectonic era per tile, or 255 when inactive.",
              }),
            },
            {
              additionalProperties: false,
              description: "Grid-aligned tectonic history rollups consumed by belt synthesis.",
            }
          ),
        },
        {
          additionalProperties: false,
          description: "Tile-space tectonic history fields required to derive morphology belts.",
        }
      ),
      provenanceTiles: Type.Object(
        {
          originEra: TypedArraySchemas.u8({
            description: "Tectonic origin era assigned to each tile.",
          }),
          originPlateId: TypedArraySchemas.i16({
            description: "Origin plate identifier assigned to each tile, or -1 when unknown.",
          }),
          lastBoundaryType: TypedArraySchemas.u8({
            description: "Most recent tectonic boundary regime observed at each tile.",
          }),
        },
        {
          additionalProperties: false,
          description: "Tile-space tectonic provenance required to derive morphology belts.",
        }
      ),
    },
    {
      description:
        "Inputs for deriving morphology belt drivers from tectonic history/provenance tiles.",
    }
  ),
  output: Type.Object(
    {
      boundaryCloseness: TypedArraySchemas.u8({
        description:
          "Boundary proximity field per tile (0..255), derived from distance to active belt seed spines.",
      }),
      boundaryType: TypedArraySchemas.u8({
        description:
          "Boundary regime per tile (BOUNDARY_TYPE values), resolved from active eras/provenance.",
      }),
      upliftPotential: TypedArraySchemas.u8({
        description:
          "Orogeny / uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      collisionPotential: TypedArraySchemas.u8({
        description:
          "Collision-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      subductionPotential: TypedArraySchemas.u8({
        description:
          "Subduction-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      riftPotential: TypedArraySchemas.u8({
        description: "Rift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      tectonicStress: TypedArraySchemas.u8({
        description:
          "Combined tectonic stress per tile (0..255), derived from uplift/rift/shear contributions.",
      }),
      beltAge: TypedArraySchemas.u8({
        description:
          "Normalized belt age proxy per tile (0..255). 0=youngest/most recently active, 255=oldest/least recently active.",
      }),
      dominantEra: TypedArraySchemas.u8({
        description:
          "Dominant tectonic era index per tile (0..eraCount-1), based on weighted boundary intensity.",
      }),
      beltMask: TypedArraySchemas.u8({
        description: "Seed mask (1/0): tiles considered belt seed centers prior to decay.",
      }),
      beltDistance: TypedArraySchemas.u8({
        description: "Discrete distance-to-nearest-belt-seed per tile (0..255; 255=unreached).",
      }),
      beltNearestSeed: TypedArraySchemas.i32({
        description: "Nearest belt seed tile index per tile (-1 when no seed is within reach).",
      }),
      beltComponents: Type.Immutable(
        Type.Array(
          Type.Object(
            {
              id: Type.Integer({
                minimum: 0,
                description: "Stable id within this belt-driver snapshot (1..n).",
              }),
              boundaryType: Type.Integer({
                minimum: 0,
                description: "Boundary type (BOUNDARY_TYPE values).",
              }),
              size: Type.Integer({
                minimum: 0,
                description: "Number of tiles in this connected belt seed component.",
              }),
              diameter: Type.Integer({
                minimum: 0,
                description:
                  "Approximate hex-graph end-to-end length of this connected belt seed component.",
              }),
              meanUpliftBlend: Type.Number({
                description: "Mean uplift blend intensity (0..255) across belt seeds before decay.",
              }),
              meanWidthScale: Type.Number({
                description: "Mean width multiplier across belt seeds in this component.",
              }),
              meanSigma: Type.Number({
                description: "Mean distance-decay sigma across belt seeds in this component.",
              }),
              meanOriginEra: Type.Number({
                description: "Mean origin era across belt seeds in this component.",
              }),
              meanOriginPlateId: Type.Number({
                description: "Mean origin plate id across belt seeds, with -1 denoting unknown.",
              }),
            },
            {
              additionalProperties: false,
              description: "One connected belt-seed component and its aggregate provenance.",
            }
          )
        )
      ),
    },
    { description: "Derived belt-driver fields used by morphology landmask + belts + mountains." }
  ),
  strategies: [strategyDefinition],
});

export default ComputeBeltDriversContract;
