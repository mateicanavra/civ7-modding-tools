import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  ErodibilityFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
  SedimentDepthFieldSchema,
} from "../../../../model/atoms/index.js";
import strategyDefinition from "./strategies/stream-power-diffusion/config.js";

/**
 * Evolves admitted relief and substrate through one complete geomorphic cycle.
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
      flowDir: TypedArraySchemas.i32({
        description: "Flow receiver index per tile (-1 for sinks).",
      }),
      flowAccum: TypedArraySchemas.f32({ description: "Flow accumulation per tile." }),
      erodibilityK: TypedArraySchemas.f32({ description: "Erodibility proxy per tile." }),
      sedimentDepth: TypedArraySchemas.f32({ description: "Sediment depth proxy per tile." }),
    },
    {
      additionalProperties: false,
      description: "Admitted base relief, routing, and material fields for geomorphic evolution.",
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
          description: "Post-erosion material resistance and sediment depth.",
        }
      ),
      deltas: Type.Object(
        {
          elevationDelta: TypedArraySchemas.f32({
            cardinality: "map-grid",
            description:
              "Diagnostic pre-quantization elevation change accumulated across the geomorphic eras.",
          }),
          sedimentDelta: TypedArraySchemas.f32({
            cardinality: "map-grid",
            description:
              "Diagnostic pre-floor sediment-depth change accumulated across the geomorphic eras.",
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
  strategies: [strategyDefinition],
});

export default ComputeGeomorphicCycleContract;
