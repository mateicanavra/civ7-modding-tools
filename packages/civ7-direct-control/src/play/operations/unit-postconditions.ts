import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import { probeValueChanged } from "./probe-values.js";
import { isRecord, stableJson } from "./stable-json.js";
import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types.js";

export type Civ7UnitOperationPostconditionClassification =
  | "not-sent"
  | "queue-advanced"
  | "selected-unit-changed"
  | "activity-changed"
  | "unit-state-changed"
  | "blocker-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7UnitOperationPostconditionSnapshot = Readonly<{
  unit: Civ7RuntimeProbe<unknown>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  blocker: Civ7RuntimeProbe<unknown>;
}>;

export type Civ7UnitOperationPostcondition = Readonly<{
  family: "unit-operation" | "unit-command";
  operationType: string;
  classification: Civ7UnitOperationPostconditionClassification;
  before?: Civ7UnitOperationPostconditionSnapshot;
  after?: Civ7UnitOperationPostconditionSnapshot;
  reason: string;
}>;

export function unitOperationPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined
): Civ7UnitOperationPostcondition | undefined {
  if (family !== "unit-operation" && family !== "unit-command") return undefined;
  const classification = classifyUnitOperationPostcondition(
    sent,
    before,
    after,
    beforeSnapshot,
    afterSnapshot
  );
  return {
    family,
    operationType: input.operationType,
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    reason: unitOperationPostconditionReason(classification),
  };
}

function classifyUnitOperationPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined
): Civ7UnitOperationPostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValueChanged(beforeSnapshot?.firstReadyUnitId, afterSnapshot?.firstReadyUnitId))
    return "queue-advanced";
  if (probeValueChanged(beforeSnapshot?.selectedUnitId, afterSnapshot?.selectedUnitId))
    return "selected-unit-changed";
  if (probeFieldChanged(beforeSnapshot?.unit, afterSnapshot?.unit, "activity"))
    return "activity-changed";
  if (probeValueChanged(beforeSnapshot?.unit, afterSnapshot?.unit)) return "unit-state-changed";
  if (probeValueChanged(beforeSnapshot?.blocker, afterSnapshot?.blocker)) return "blocker-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result))
    return "validation-changed";
  return "no-state-change";
}

function unitOperationPostconditionReason(
  classification: Civ7UnitOperationPostconditionClassification
): string {
  switch (classification) {
    case "not-sent":
      return "The operation was not sent, so no unit-side postcondition can be verified.";
    case "queue-advanced":
      return "The first ready unit changed after the request, which shows the unit queue advanced.";
    case "selected-unit-changed":
      return "The selected unit changed after the request, which shows the game consumed the unit action.";
    case "activity-changed":
      return "The unit activity changed after the request.";
    case "unit-state-changed":
      return "The unit summary changed after the request.";
    case "blocker-changed":
      return "The end-turn blocker changed after the request.";
    case "validation-changed":
      return "The operation validation result changed after the request.";
    case "no-state-change":
      return "The request was sent, but no observed unit, queue, blocker, or validation state changed.";
  }
}

function probeFieldChanged(
  left: Civ7RuntimeProbe<unknown> | undefined,
  right: Civ7RuntimeProbe<unknown> | undefined,
  field: string
): boolean {
  if (!left?.ok || !right?.ok) return false;
  if (!isRecord(left.value) || !isRecord(right.value)) return false;
  return stableJson(left.value[field]) !== stableJson(right.value[field]);
}
