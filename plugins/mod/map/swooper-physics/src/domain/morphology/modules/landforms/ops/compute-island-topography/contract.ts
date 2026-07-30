import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../../model/atoms/index.js";
import strategyDefinition from "./strategies/plate-aware-volcanic/config.js";

/**
 * Computes the complete post-island topography and formation evidence.
 */
const ComputeIslandTopographyContract = defineOp({
  kind: "compute",
  id: "morphology/compute-island-topography",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      elevation: TypedArraySchemas.i16({
        cardinality: ["width", "height"],
        description: "Post-erosion elevation admitted against the operation grid.",
      }),
      seaLevel: SeaLevelDatumSchema,
      landMask: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Post-erosion land classification admitted against the operation grid.",
      }),
      bathymetry: TypedArraySchemas.i16({
        cardinality: ["width", "height"],
        description: "Post-erosion submerged relief admitted against the operation grid.",
      }),
      distanceToCoast: TypedArraySchemas.u16({
        cardinality: ["width", "height"],
        description: "Wrapped-hex distance to the nearest base-coastline tile.",
      }),
      boundaryCloseness: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Boundary proximity per tile (0..255).",
      }),
      boundaryType: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Boundary type per tile (1=convergent, 2=divergent, 3=transform).",
      }),
      volcanism: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Volcanism signal per tile (0..255).",
      }),
      rngSeed: Type.Integer({ description: "Map-seed-derived island formation seed." }),
    },
    {
      additionalProperties: false,
      description:
        "Post-erosion topography, base-coast distance, and tectonic evidence admitted for island formation.",
    }
  ),
  output: Type.Object(
    {
      topography: Type.Object(
        {
          elevation: ElevationFieldSchema,
          seaLevel: SeaLevelDatumSchema,
          landMask: LandMaskSchema,
          bathymetry: BathymetryFieldSchema,
        },
        {
          additionalProperties: false,
          description: "Coherent post-island topography with newly admitted island land applied.",
        }
      ),
      islandClass: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Formation class per tile: 0 unchanged, 1 island-chain land, 2 microcontinent land.",
      }),
    },
    {
      additionalProperties: false,
      description: "Completed island topography and exact formation provenance.",
    }
  ),
  strategies: [strategyDefinition],
});

export default ComputeIslandTopographyContract;
