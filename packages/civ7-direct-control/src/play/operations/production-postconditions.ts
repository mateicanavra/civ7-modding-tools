import { type Static, Type } from "typebox";

import { Civ7ComponentIdSchema } from "../../civ7-component-id";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import { Civ7RuntimeProbeSchema } from "../../runtime/probe";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import { probeValue, probeValueChanged } from "./probe-values.js";
import { stableJson } from "./stable-json.js";
import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types.js";

export type Civ7ProductionPostconditionClassification =
  | "not-sent"
  | "production-choice-cleared"
  | "production-state-changed"
  | "production-state-changed-blocker-still-live"
  | "validation-changed"
  | "no-state-change";

export const Civ7ProductionPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("production-choice-cleared"),
  Type.Literal("production-state-changed"),
  Type.Literal("production-state-changed-blocker-still-live"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
]);

export type Civ7ProductionPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  buildQueue: Civ7RuntimeProbe<unknown>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
  canEndTurn: Civ7RuntimeProbe<unknown>;
  blockingProductionNotification: Civ7RuntimeProbe<unknown>;
}>;

export const Civ7ProductionPostconditionSnapshotSchema = Type.Object(
  {
    cityId: Type.Union([Civ7ComponentIdSchema, Type.Null()]),
    city: Civ7RuntimeProbeSchema(Type.Unknown()),
    buildQueue: Civ7RuntimeProbeSchema(Type.Unknown()),
    selectedCityId: Civ7RuntimeProbeSchema(Type.Union([Civ7ComponentIdSchema, Type.Null()])),
    blocker: Civ7RuntimeProbeSchema(Type.Unknown()),
    canEndTurn: Civ7RuntimeProbeSchema(Type.Unknown()),
    blockingProductionNotification: Civ7RuntimeProbeSchema(Type.Unknown()),
  },
  { additionalProperties: false }
);

export type Civ7ProductionPostcondition = Readonly<{
  family: "city-operation";
  operationType: "BUILD";
  classification: Civ7ProductionPostconditionClassification;
  before?: Civ7ProductionPostconditionSnapshot;
  after?: Civ7ProductionPostconditionSnapshot;
  productionStateChanged: boolean;
  blockerStillLive: boolean;
  reason: string;
}>;

export const Civ7ProductionPostconditionSchema = Type.Object(
  {
    family: Type.Literal("city-operation"),
    operationType: Type.Literal("BUILD"),
    classification: Civ7ProductionPostconditionClassificationSchema,
    before: Type.Optional(Civ7ProductionPostconditionSnapshotSchema),
    after: Type.Optional(Civ7ProductionPostconditionSnapshotSchema),
    productionStateChanged: Type.Boolean(),
    blockerStillLive: Type.Boolean(),
    reason: Type.String(),
  },
  { additionalProperties: false }
);
export type Civ7ProductionPostconditionSchemaType = Static<
  typeof Civ7ProductionPostconditionSchema
>;

export function productionPostconditionFor(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7ProductionPostconditionSnapshot | undefined,
  afterSnapshot: Civ7ProductionPostconditionSnapshot | undefined
): Civ7ProductionPostcondition | undefined {
  if (family !== "city-operation" || input.operationType !== "BUILD") return undefined;
  const productionStateChanged = productionSnapshotChanged(beforeSnapshot, afterSnapshot);
  const blockerStillLive = productionBlockerStillLive(afterSnapshot);
  const classification = classifyProductionPostcondition(
    sent,
    before,
    after,
    productionStateChanged,
    blockerStillLive
  );
  return {
    family: "city-operation",
    operationType: "BUILD",
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    productionStateChanged,
    blockerStillLive,
    reason: productionPostconditionReason(classification),
  };
}

function productionSnapshotChanged(
  before: Civ7ProductionPostconditionSnapshot | undefined,
  after: Civ7ProductionPostconditionSnapshot | undefined
): boolean {
  if (!before || !after) return false;
  return (
    probeValueChanged(before.city, after.city) ||
    probeValueChanged(before.buildQueue, after.buildQueue) ||
    probeValueChanged(before.selectedCityId, after.selectedCityId)
  );
}

function productionBlockerStillLive(
  snapshot: Civ7ProductionPostconditionSnapshot | undefined
): boolean {
  const value = snapshot ? probeValue(snapshot.blockingProductionNotification) : undefined;
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.matchesCity !== false;
}

function classifyProductionPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  productionStateChanged: boolean,
  blockerStillLive: boolean
): Civ7ProductionPostconditionClassification {
  if (!sent) return "not-sent";
  if (productionStateChanged && blockerStillLive)
    return "production-state-changed-blocker-still-live";
  if (!blockerStillLive) return "production-choice-cleared";
  if (productionStateChanged) return "production-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result))
    return "validation-changed";
  return "no-state-change";
}

function productionPostconditionReason(
  classification: Civ7ProductionPostconditionClassification
): string {
  switch (classification) {
    case "not-sent":
      return "The production request was not sent, so no production postcondition can be verified.";
    case "production-choice-cleared":
      return "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.";
    case "production-state-changed":
      return "The sent BUILD request changed observed city production state.";
    case "production-state-changed-blocker-still-live":
      return "The sent BUILD request changed observed production state, but the matching production-choice notification still blocks turn flow; use notification/chooser closeout diagnostics rather than repeating BUILD blindly.";
    case "validation-changed":
      return "The sent BUILD request changed the subsequent BUILD validation result.";
    case "no-state-change":
      return "The sent BUILD request returned, but observed city production state and the production-choice blocker did not change.";
  }
}
