import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { RawReceiverSchema, DrainagePlateauIdSchema, DrainageLeafIdSchema, BasinNodesSchema, BasinRootsSchema, BasinSaddlesSchema, BasinCatchmentCellsSchema, ExternalCatchmentCellsSchema, BasinHypsometrySchema } from "../../model/atoms/index.js";
import { BasinFluxSchema as FluxSchema, BasinLevelIntervalSchema as LevelIntervalSchema } from "../../model/atoms/index.js";
import { OpenBasinBodySchema, OpenBasinCertificateSchema, MarineDischargeExitSchema, WaterConservationSchema } from "../../model/atoms/index.js";
import certifiedSillSpillDefinition from "./strategies/certified-sill-spill/config.js";

const footprint = {
  wetCells: Type.Array(Type.Integer({ minimum: 0 }), {
    description: "Strictly submerged active cell IDs, sorted by ID; not a network lake plan.",
  }),
  flux: FluxSchema,
};

const quantization = {
  ...footprint,
  resolution: Type.Literal("shoreline-quantization"),
  level: Type.Number({ description: "Cohort ground height; this cohort remains dry at the retained level." }),
  overflow: Type.Literal(0),
  unresolvedResidual: Type.Number({
    exclusiveMinimum: 0,
    description: "Retained positive balance, bounded by the shoreline jump; not loss or exported flow.",
  }),
  bracket: Type.Object(
    {
      cohortCells: Type.Array(Type.Integer({ minimum: 0 })),
      before: FluxSchema,
      after: FluxSchema,
      jumpMagnitude: Type.Number({ exclusiveMinimum: 0 }),
    },
    { additionalProperties: false }
  ),
};

const cell = () => Type.Integer({ minimum: 0 });
const node = () => Type.Integer({ minimum: 1 });
const flux = () => Type.Number({ minimum: 0 });
const witness = Type.Union([
  Type.Object({ kind: Type.Literal("outlet-free-root"), nodeId: node() }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("uncertified-node"), nodeId: node(), response: Type.Union([
    Type.Object(
      { ...footprint, state: Type.Literal("dry"), overflow: Type.Literal(0), unresolvedResidual: Type.Literal(0) },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("closed"),
        resolution: Type.Literal("exact-balance"),
        levels: LevelIntervalSchema,
        overflow: Type.Literal(0),
        unresolvedResidual: Type.Literal(0),
      },
      { additionalProperties: false, description: "Balanced footprint and level interval, not a unique water height. The interval may include the sill." }
    ),
    Type.Object({ ...quantization, state: Type.Literal("closed") }, { additionalProperties: false }),
    Type.Object({ ...quantization, state: Type.Literal("subtile") }, { additionalProperties: false }),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("open"),
        level: Type.Number(),
        overflow: Type.Number({ minimum: 0, description: "Exactly the strict-footprint balance at the sill." }),
        unresolvedResidual: Type.Literal(0),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("infeasible-attained-state"),
        attainedLevel: Type.Number(),
        shortfall: Type.Number({ exclusiveMinimum: 0 }),
      },
      { additionalProperties: false, description: "Negative starting balance cannot sustain the supplied attained state; no fake closure or retreat." }
    ),
    Type.Object(
      {
        ...footprint,
        state: Type.Literal("no-stationary-solution"),
        evaluatedLevels: LevelIntervalSchema,
        unresolvedSurplus: Type.Number({ exclusiveMinimum: 0 }),
      },
      { additionalProperties: false, description: "Persistent outlet-free surplus after the last cohort; footprint/interval are diagnostic, not an admitted lake." }
    ),
  ]) }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("external-land-terminal"), cell: cell() }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("disconnected-wet-footprint"), nodeId: node(), cell: cell() }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("shared-wet-body"), nodeIds: Type.Array(node()), cell: cell(), neighbor: cell() }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("cyclic-network"), cells: Type.Array(cell()) }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("negative-body-outflow"), nodeId: node(), wetCells: Type.Array(cell()), flux: FluxSchema }, { additionalProperties: false }),
]);

/** A bounded stationary candidate, never a recipe activation or native lake projection. */
const ComputeOpenBasinNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-open-basin-network",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    elevation: TypedArraySchemas.i16({ description: "Unchanged original ground, not conditioned drainage height." }),
    landMask: TypedArraySchemas.u8({ description: "Original binary marine mask; lake candidates are still land here." }),
    geometry: Type.Object(
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
    localRunoff: Type.Array(Type.Number({ minimum: 0 }), {
      description: "Map-grid attributed local dry-land supply in Number precision. Used exactly as supplied, never recomputed, rounded to Float32, or treated as accumulated flow. Marine entries must be zero.",
    }),
    rainfall: TypedArraySchemas.u8({ description: "Baseline precipitation, charged only to strict wet cells." }),
    potentialDemand: TypedArraySchemas.f32({ description: "Baseline potential demand, charged only to strict wet cells; not reconstructed refined PET." }),
  }, {
    additionalProperties: false,
    description: "Caller supplies canonical geometry for this exact ground/mask and consistently attributed rainfall-index fluxes. Structural admission does not re-prove minimal saddle optimality.",
  }),
  output: Type.Union([
    Type.Object({ status: Type.Literal("unsupported"), witness }, {
      additionalProperties: false,
      description: "Valid input outside this bounded solver's support; no partial authoritative plan or fallback.",
    }),
    Type.Object({
      status: Type.Literal("supported"),
      plan: Type.Object({
        wetMask: TypedArraySchemas.u8(),
        waterSurface: TypedArraySchemas.i16({ description: "Ground outside strict wet cells; the root spill elevation inside them." }),
        receiver: TypedArraySchemas.i32({ description: "Adjacent routing connectivity; internal wet BFS edges do not own cell-wise discharge." }),
        terminalType: TypedArraySchemas.u8({ description: "1 only on land-to-original-marine exits; 0 otherwise. No closed or untyped land terminals." }),
        bodyId: TypedArraySchemas.i32({ description: "Containing root node ID on strict wet cells, 0 elsewhere." }),
        dryDischarge: Type.Array(flux(), { description: "Number-precision outflow on dry land only; zero on wet/marine cells is a sentinel, not a wet-cell flow allocation." }),
        bodies: Type.Array(OpenBasinBodySchema),
        certificates: Type.Array(OpenBasinCertificateSchema),
        marineExits: Type.Array(MarineDischargeExitSchema),
        conservation: WaterConservationSchema,
      }, { additionalProperties: false }),
    }, { additionalProperties: false }),
  ]),
  strategies: [certifiedSillSpillDefinition],
});

export default ComputeOpenBasinNetworkContract;
