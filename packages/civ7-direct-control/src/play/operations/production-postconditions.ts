import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
  Civ7ProductionPostcondition,
  Civ7ProductionPostconditionClassification,
  Civ7ProductionPostconditionSnapshot,
  Civ7RuntimeProbe,
} from "../../index";

export function productionPostconditionFor(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7ProductionPostconditionSnapshot | undefined,
  afterSnapshot: Civ7ProductionPostconditionSnapshot | undefined,
): Civ7ProductionPostcondition | undefined {
  if (family !== "city-operation" || input.operationType !== "BUILD") return undefined;
  const productionStateChanged = productionSnapshotChanged(beforeSnapshot, afterSnapshot);
  const blockerStillLive = productionBlockerStillLive(afterSnapshot);
  const classification = classifyProductionPostcondition(sent, before, after, productionStateChanged, blockerStillLive);
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
  after: Civ7ProductionPostconditionSnapshot | undefined,
): boolean {
  if (!before || !after) return false;
  return probeValueChanged(before.city, after.city)
    || probeValueChanged(before.buildQueue, after.buildQueue)
    || probeValueChanged(before.selectedCityId, after.selectedCityId);
}

function productionBlockerStillLive(snapshot: Civ7ProductionPostconditionSnapshot | undefined): boolean {
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
  blockerStillLive: boolean,
): Civ7ProductionPostconditionClassification {
  if (!sent) return "not-sent";
  if (productionStateChanged && blockerStillLive) return "production-state-changed-blocker-still-live";
  if (!blockerStillLive) return "production-choice-cleared";
  if (productionStateChanged) return "production-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function productionPostconditionReason(classification: Civ7ProductionPostconditionClassification): string {
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

function probeValueChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined): boolean {
  if (!left || !right) return false;
  if (left.ok !== right.ok) return true;
  if (!left.ok || !right.ok) return stableJson(left) !== stableJson(right);
  return stableJson(left.value) !== stableJson(right.value);
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
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
