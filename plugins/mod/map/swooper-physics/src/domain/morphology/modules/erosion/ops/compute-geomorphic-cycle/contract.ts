import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  ErodibilityFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
  SedimentDepthFieldSchema,
} from "../../../../model/atoms/index.js";
import hillslopeDefinition from "./strategies/hillslope-diffusion/config.js";

/**
 * Shapes initial hillslopes while preserving admitted material substrate.
 */
const ComputeGeomorphicCycleContract = defineOp({
  kind: "compute",
  id: "morphology/compute-geomorphic-cycle",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      elevation: TypedArraySchemas.i16({ description: "Elevation per tile (normalized units)." }),
      seaLevel: SeaLevelDatumSchema,
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      erodibilityK: TypedArraySchemas.f32({ description: "Erodibility proxy per tile." }),
      sedimentDepth: TypedArraySchemas.f32({ description: "Sediment depth proxy per tile." }),
    },
    {
      additionalProperties: false,
      description: "Admitted base relief and unchanged material fields for initial hillslope shaping.",
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
          description:
            "Coherent post-erosion relief with the admitted land-water identity preserved.",
        }
      ),
      substrate: Type.Object(
        {
          erodibilityK: ErodibilityFieldSchema,
          sedimentDepth: SedimentDepthFieldSchema,
        },
        {
          additionalProperties: false,
          description: "Unchanged material resistance and sediment depth, copied without transport.",
        }
      ),
      deltas: Type.Object(
        {
          elevationDelta: TypedArraySchemas.f32({
            cardinality: "map-grid",
            description:
              "Diagnostic pre-quantization elevation change accumulated across the geomorphic eras.",
          }),
        },
        {
          additionalProperties: false,
          description:
            "Diagnostic process deltas recorded before final product quantization and coherence floors.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "Completed post-erosion products and their diagnostic field changes.",
    }
  ),
  strategies: [hillslopeDefinition],
});

export default ComputeGeomorphicCycleContract;
