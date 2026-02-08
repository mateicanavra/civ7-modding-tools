import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import type {
  FoundationTectonicHistoryTiles,
  FoundationTectonicProvenanceTiles,
} from "@mapgen/domain/foundation/ops/compute-plates-tensors/contract.js";

const BeltComponentSummarySchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable id within this belt-driver snapshot (1..n)." }),
    boundaryType: Type.Integer({
      minimum: 0,
      description: "Boundary type (BOUNDARY_TYPE values).",
    }),
    size: Type.Integer({ minimum: 0, description: "Number of tiles in this connected belt seed component." }),
    meanUpliftBlend: Type.Number({
      description: "Mean uplift blend intensity (0..255) across belt seeds in this component (pre-decay).",
    }),
    meanWidthScale: Type.Number({
      description: "Mean width scale multiplier (unitless) across belt seeds in this component.",
    }),
    meanSigma: Type.Number({
      description: "Mean sigma used to decay belt influence (unitless; larger = wider belts).",
    }),
    meanOriginEra: Type.Number({
      description: "Mean origin era index across belt seeds in this component (0..eraCount-1).",
    }),
    meanOriginPlateId: Type.Number({
      description: "Mean origin plate id across belt seeds in this component (plate id; -1 for unknown).",
    }),
  },
  {
    additionalProperties: false,
    description: "One connected belt seed component summary (debugging/diagnostics payload).",
  }
);

const StrategySchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Belt-driver derivation configuration. This op is intentionally config-light; derived fields are physics outputs.",
  }
);

const ComputeBeltDriversContract = defineOp({
  kind: "compute",
  id: "morphology/compute-belt-drivers",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      historyTiles: Type.Unsafe<FoundationTectonicHistoryTiles>({
        description: "Tile-space tectonic history fields (per-era + rollups).",
      }),
      provenanceTiles: Type.Unsafe<FoundationTectonicProvenanceTiles>({
        description: "Tile-space tectonic provenance scalars (origin + last-boundary state).",
      }),
    },
    { description: "Inputs for deriving morphology belt drivers from tectonic history/provenance tiles." }
  ),
  output: Type.Object(
    {
      boundaryCloseness: TypedArraySchemas.u8({
        description: "Boundary proximity field per tile (0..255), derived from distance to active belt seed spines.",
      }),
      boundaryType: TypedArraySchemas.u8({
        description: "Boundary regime per tile (BOUNDARY_TYPE values), resolved from active eras/provenance.",
      }),
      upliftPotential: TypedArraySchemas.u8({
        description: "Orogeny / uplift potential per tile (0..255), decayed away from belt seed centers.",
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
      beltComponents: Type.Immutable(Type.Array(BeltComponentSummarySchema)),
    },
    { description: "Derived belt-driver fields used by morphology landmask + belts + mountains." }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeBeltDriversContract;
