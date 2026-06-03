import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types";
import type { Civ7ComponentId } from "../../civ7-component-id";
import type { Civ7RuntimeProbe } from "../../runtime/probe";
import type {
  Civ7UnitOperationPostcondition,
  Civ7UnitOperationPostconditionClassification,
  Civ7UnitOperationPostconditionSnapshot,
} from "../../index";

export function unitOperationPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
): Civ7UnitOperationPostcondition | undefined {
  if (family !== "unit-operation" && family !== "unit-command") return undefined;
  const classification = classifyUnitOperationPostcondition(sent, before, after, beforeSnapshot, afterSnapshot);
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
  afterSnapshot: Civ7UnitOperationPostconditionSnapshot | undefined,
): Civ7UnitOperationPostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValueChanged(beforeSnapshot?.firstReadyUnitId, afterSnapshot?.firstReadyUnitId)) return "queue-advanced";
  if (probeValueChanged(beforeSnapshot?.selectedUnitId, afterSnapshot?.selectedUnitId)) return "selected-unit-changed";
  if (probeFieldChanged(beforeSnapshot?.unit, afterSnapshot?.unit, "activity")) return "activity-changed";
  if (probeValueChanged(beforeSnapshot?.unit, afterSnapshot?.unit)) return "unit-state-changed";
  if (probeValueChanged(beforeSnapshot?.blocker, afterSnapshot?.blocker)) return "blocker-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function unitOperationPostconditionReason(classification: Civ7UnitOperationPostconditionClassification): string {
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

function probeValueChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined): boolean {
  if (!left || !right) return false;
  if (left.ok !== right.ok) return true;
  if (!left.ok || !right.ok) return stableJson(left) !== stableJson(right);
  return stableJson(left.value) !== stableJson(right.value);
}

function probeFieldChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined, field: string): boolean {
  if (!left?.ok || !right?.ok) return false;
  if (!isRecord(left.value) || !isRecord(right.value)) return false;
  return stableJson(left.value[field]) !== stableJson(right.value[field]);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort()) ?? String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenKeys(value: unknown, keys: Record<string, true> = {}): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      keys[key] = true;
      flattenKeys(child, keys);
    }
  }
  return keys;
}
