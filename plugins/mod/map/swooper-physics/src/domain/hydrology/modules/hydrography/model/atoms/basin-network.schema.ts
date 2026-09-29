import { type Static, type TSchema, Type } from "@swooper/mapgen-core/authoring/schema";
import { BasinFluxSchema, BasinLevelIntervalSchema } from "./basin-water-budget.schema.js";

const cell = () => Type.Integer({ minimum: 0 });
const id = () => Type.Integer({ minimum: 1 });
const cells = () => Type.Array(cell());
const ids = () => Type.Array(id());
const flux = () => Type.Number({ minimum: 0 });
const object = <T extends Record<string, TSchema>>(properties: T) => Type.Object(properties, { additionalProperties: false });

/** Grid terminal tags describe resolved destinations, not channel-mouth kinds. */
export const BASIN_TERMINAL = { none: 0, marine: 1, "boundary-export": 2, "closed-wet": 3, subtile: 4, dry: 5 } as const;
export const BASIN_INTERNAL_RECEIVER = -2;
export const BasinTerminalRoleSchema = Type.Union([Type.Literal("marine"), Type.Literal("boundary-export"), Type.Literal("closed-wet"), Type.Literal("subtile"), Type.Literal("dry")]);
export const BasinClosureSchema = Type.Union([
  object({ resolution: Type.Literal("exact-balance"), levels: BasinLevelIntervalSchema }),
  object({ resolution: Type.Literal("shoreline-quantization"), level: Type.Number(), cohortCells: cells(), before: BasinFluxSchema, after: BasinFluxSchema, jumpMagnitude: Type.Number({ exclusiveMinimum: 0 }), unresolvedResidual: Type.Number({ exclusiveMinimum: 0 }) }),
  Type.Null(),
]);
export const BasinPoolSchema = object({
  poolId: Type.Integer({ minimum: 1, description: "Minimum descendant geometry leaf ID; provenance, never a terminal identity." }), componentId: id(), leafIds: ids(),
  catchmentCells: Type.Array(cell(), { description: "Disjoint original-land sources assigned to their first active component, including dry uplands." }), wetCells: cells(),
  state: Type.Union([Type.Literal("open"), Type.Literal("closed"), Type.Literal("subtile"), Type.Literal("dry")]),
  level: Type.Number(), flux: BasinFluxSchema, outflow: flux(), unresolvedResidual: flux(), closure: BasinClosureSchema,
});
export const BasinWetBodySchema = object({
  bodyId: id(), componentId: id(), poolId: id(), wetCells: cells(), level: Type.Number(),
  flux: BasinFluxSchema, outflow: Type.Number({ minimum: 0, description: "Sum of actual outward reservoir transfers and any wet-source external port; not component export." }), unresolvedResidual: flux(),
});
export const BasinPortSchema = Type.Union([
  object({ kind: Type.Literal("adjacent"), componentId: id(), fromCell: cell(), toCell: cell(), destination: Type.Union([Type.Literal("component"), Type.Literal("dry-reach"), Type.Literal("marine")]), destinationComponentId: Type.Integer({ minimum: 0 }), discharge: flux() }),
  object({ kind: Type.Literal("boundary-export"), componentId: id(), fromCell: cell(), side: Type.Union([Type.Literal("north"), Type.Literal("south")]), discharge: flux() }),
]);
export const BasinInternalTransferSchema = object({
  componentId: id(), cellA: cell(), cellB: cell(), bodyA: Type.Integer({ minimum: 0 }), bodyB: Type.Integer({ minimum: 0 }),
  signedDischarge: Type.Number({ description: "Signed finite flux in canonical cellA-to-cellB orientation; negative flow is retained, never clamped." }),
});
export const BasinHydraulicComponentSchema = object({
  componentId: id(), poolId: id(), bodyIds: ids(), memberCells: cells(),
  junctionCells: Type.Array(cell(), { description: "Admitted dry sill/plateau members, or the canonical pit anchor for a body-free terminal." }), anchorCell: cell(), level: Type.Number(),
  state: Type.Union([Type.Literal("open"), Type.Literal("closed"), Type.Literal("subtile"), Type.Literal("dry")]),
  flux: BasinFluxSchema, outflow: flux(), unresolvedResidual: flux(), terminalId: id(),
});
export const BasinTerminalSchema = object({ terminalId: id(), role: BasinTerminalRoleSchema, anchorCell: cell(), componentId: Type.Integer({ minimum: 0 }) });
export const MarineDischargeExitSchema = object({ fromCell: cell(), marineCell: cell(), discharge: flux() });
export const BoundaryDischargeExitSchema = object({ fromCell: cell(), side: Type.Union([Type.Literal("north"), Type.Literal("south")]), discharge: flux() });
export const WaterConservationSchema = object({
  dryRunoff: flux(), wetPrecipitation: flux(), wetDemand: flux(), marineDischarge: flux(), boundaryDischarge: flux(), externalDischarge: flux(),
  unresolvedResidual: flux(), normalizedUnresolvedResidual: flux(), residual: Type.Number(), roundoffBound: flux(),
});

export type BasinPool = Static<typeof BasinPoolSchema>;
export type BasinWetBody = Static<typeof BasinWetBodySchema>;
export type BasinHydraulicComponent = Static<typeof BasinHydraulicComponentSchema>;
export type BasinPort = Static<typeof BasinPortSchema>;
export type BasinInternalTransfer = Static<typeof BasinInternalTransferSchema>;
export type BasinTerminal = Static<typeof BasinTerminalSchema>;
