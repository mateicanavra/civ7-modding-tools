import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { RawReceiverSchema, DrainagePlateauIdSchema, DrainageLeafIdSchema, BasinNodesSchema, BasinRootsSchema, BasinSaddlesSchema, BasinCatchmentCellsSchema, ExternalCatchmentCellsSchema, BasinHypsometrySchema, BasinNonstationaryResponseSchema } from "../../model/atoms/index.js";
import { BasinPoolSchema, BasinWetBodySchema, BasinHydraulicComponentSchema, BasinPortSchema, BasinInternalTransferSchema, BasinTerminalSchema, MarineDischargeExitSchema, BoundaryDischargeExitSchema, WaterConservationSchema } from "../../model/atoms/basin-network.schema.js";
import stationarySillSpill from "./strategies/stationary-sill-spill/config.js";

/** Basin solver contract: a complete supported physical ledger or an explicit persistent-surplus witness. */
const ComputeBasinNetworkContract = defineOp({
  kind: "compute", id: "hydrology/compute-basin-network",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
    elevation: Type.Array(Type.Number({ minimum: -32768, maximum: 32767 }), {
      description: "Finite precise working ground in Morphology elevation units; no intermediate quantization.",
    }),
    externalWaterMask: TypedArraySchemas.u8({ description: "1=prescribed external water, 0=finite ground." }),
    externalWaterHead: Type.Number({ description: "Uniform finite receiving head; external bathymetry is not hydraulic terrain." }),
    geometry: Type.Object({ rawReceiver: RawReceiverSchema, plateauId: DrainagePlateauIdSchema, leafId: DrainageLeafIdSchema, nodes: BasinNodesSchema, roots: BasinRootsSchema, saddles: BasinSaddlesSchema, catchmentCells: BasinCatchmentCellsSchema, externalCatchmentCells: ExternalCatchmentCellsSchema, hypsometry: BasinHypsometrySchema }, { additionalProperties: false }),
    localRunoff: Type.Array(Type.Number({ minimum: 0 })), rainfall: TypedArraySchemas.u8(), potentialDemand: TypedArraySchemas.f32(),
  }, { additionalProperties: false }),
  output: Type.Union([
    Type.Object({ status: Type.Literal("unsupported-external-inundation"), witness: Type.Object({
      kind: Type.Literal("below-head-connection"), externalCell: Type.Integer({ minimum: 0 }), finiteCell: Type.Integer({ minimum: 0 }),
      finiteGround: Type.Number(), externalWaterHead: Type.Number(),
    }, { additionalProperties: false }) }, { additionalProperties: false }),
    Type.Object({ status: Type.Literal("no-stationary-solution"), witness: Type.Object({
      kind: Type.Literal("persistent-surplus"), leafIds: Type.Array(Type.Integer({ minimum: 1 })), catchmentCells: Type.Array(Type.Integer({ minimum: 0 })),
      response: BasinNonstationaryResponseSchema,
    }, { additionalProperties: false }) }, { additionalProperties: false }),
    Type.Object({ status: Type.Literal("supported"), plan: Type.Object({
      wetMask: TypedArraySchemas.u8(), exposedLandMask: TypedArraySchemas.u8({ description: "1=finite ground outside resolved finite wetness, 0=external or finite water." }),
      waterSurface: Type.Array(Type.Number({ description: "Physical head on finite wet or prescribed external cells; unchanged finite ground elsewhere." })),
      receiver: TypedArraySchemas.i32({ description: "Ordinary/principal channel receiver; -2 means component-internal without a positive channel attachment, -1 means terminal or prescribed external water." }),
      terminalType: TypedArraySchemas.u8({ description: "Resolved BASIN_TERMINAL role for every finite source." }), terminalId: TypedArraySchemas.i32(),
      bodyId: TypedArraySchemas.i32(), componentId: TypedArraySchemas.i32(),
      dryDischarge: Type.Array(Type.Number({ minimum: 0, description: "Actual ordinary/principal dry edge flux; junction branches are separately retained in transfers." })),
      pools: Type.Array(BasinPoolSchema), bodies: Type.Array(BasinWetBodySchema), components: Type.Array(BasinHydraulicComponentSchema),
      transfers: Type.Array(BasinInternalTransferSchema), ports: Type.Array(BasinPortSchema), terminals: Type.Array(BasinTerminalSchema),
      marineExits: Type.Array(MarineDischargeExitSchema), boundaryExits: Type.Array(BoundaryDischargeExitSchema), conservation: WaterConservationSchema,
    }, { additionalProperties: false }) }, { additionalProperties: false }),
  ]),
  strategies: [stationarySillSpill],
});
export default ComputeBasinNetworkContract;
