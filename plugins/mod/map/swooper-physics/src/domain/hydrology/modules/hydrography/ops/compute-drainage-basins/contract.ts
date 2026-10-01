import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { RawReceiverSchema, DrainagePlateauIdSchema, DrainageLeafIdSchema, BasinNodesSchema, BasinRootsSchema, BasinSaddlesSchema, BasinCatchmentCellsSchema, ExternalCatchmentCellsSchema, BasinHypsometrySchema } from "../../model/atoms/index.js";

import plateauSaddleHierarchyDefinition from "./strategies/plateau-saddle-hierarchy/config.js";

/** Computes terrain-preserving depression topology independently of conditioned river routing. */
const ComputeDrainageBasinsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-drainage-basins",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Cylindrical tile grid width." }),
      height: Type.Integer({ minimum: 1, description: "Bounded tile grid height." }),
      elevation: TypedArraySchemas.i16({ description: "Unmodified Morphology ground elevation." }),
      externalWaterMask: TypedArraySchemas.u8({ description: "1=prescribed external water, 0=finite ground, including initially wet inland cells." }),
      externalWaterHead: Type.Number({ description: "Uniform finite receiving surface head of prescribed external water; independent of its bed." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      rawReceiver: RawReceiverSchema,
      plateauId: DrainagePlateauIdSchema,
      leafId: DrainageLeafIdSchema,
      nodes: BasinNodesSchema,
      roots: BasinRootsSchema,
      saddles: BasinSaddlesSchema,
      catchmentCells: BasinCatchmentCellsSchema,
      externalCatchmentCells: ExternalCatchmentCellsSchema,
      hypsometry: BasinHypsometrySchema,
    },
    {
      additionalProperties: false,
      description:
        "Raw catchments, nested storage geometry, and explicit external spill evidence; no terrain, water budget, or recipe mutation.",
    }
  ),
  strategies: [plateauSaddleHierarchyDefinition],
});

export default ComputeDrainageBasinsContract;
