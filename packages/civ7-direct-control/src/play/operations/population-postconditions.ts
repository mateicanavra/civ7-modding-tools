import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
  Civ7PopulationPlacementPostcondition,
  Civ7PopulationPlacementPostconditionClassification,
  Civ7PopulationPlacementPostconditionSnapshot,
  Civ7RuntimeProbe,
} from "../../index";

export function populationPlacementPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined,
  afterSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined,
): Civ7PopulationPlacementPostcondition | undefined {
  if (!populationPlacementPostconditionEligible(family, input)) return undefined;
  const readyCleared = probeReadyCleared(beforeSnapshot?.isReadyToPlacePopulation, afterSnapshot?.isReadyToPlacePopulation);
  const placementStateChanged =
    probeValueChanged(beforeSnapshot?.city, afterSnapshot?.city)
    || probeValueChanged(beforeSnapshot?.isReadyToPlacePopulation, afterSnapshot?.isReadyToPlacePopulation)
    || probeValueChanged(beforeSnapshot?.cityWorkerCap, afterSnapshot?.cityWorkerCap)
    || probeValueChanged(beforeSnapshot?.workablePlotIndexes, afterSnapshot?.workablePlotIndexes)
    || probeValueChanged(beforeSnapshot?.blockedPlotIndexes, afterSnapshot?.blockedPlotIndexes)
    || probeValueChanged(beforeSnapshot?.expansionPlotIndexes, afterSnapshot?.expansionPlotIndexes);
  const classification = classifyPopulationPlacementPostcondition(sent, before, after, readyCleared, placementStateChanged);
  return {
    family: family as "player-operation" | "city-command",
    operationType: input.operationType,
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    readyCleared,
    placementStateChanged,
    reason: populationPlacementPostconditionReason(classification),
  };
}

function populationPlacementPostconditionEligible(family: Civ7OperationFamily, input: Civ7OperationInput): boolean {
  return (family === "player-operation" && input.operationType === "ASSIGN_WORKER")
    || (family === "city-command" && input.operationType === "EXPAND");
}

function probeReadyCleared(before: Civ7RuntimeProbe<unknown> | undefined, after: Civ7RuntimeProbe<unknown> | undefined): boolean {
  return before?.ok === true && before.value === true && after?.ok === true && after.value === false;
}

function classifyPopulationPlacementPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  readyCleared: boolean,
  placementStateChanged: boolean,
): Civ7PopulationPlacementPostconditionClassification {
  if (!sent) return "not-sent";
  if (readyCleared) return "population-ready-cleared";
  if (placementStateChanged) return "placement-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) return "validation-changed";
  return "no-state-change";
}

function populationPlacementPostconditionReason(classification: Civ7PopulationPlacementPostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The operation was not sent, so no population-placement postcondition can be verified.";
    case "population-ready-cleared":
      return "Growth.isReadyToPlacePopulation cleared after the placement request.";
    case "placement-state-changed":
      return "The city population placement snapshot changed after the request, but readiness did not clearly clear.";
    case "validation-changed":
      return "The operation validation result changed after the placement request.";
    case "no-state-change":
      return "The request was sent, but no observed population-placement, city, or validation state changed.";
  }
}

function probeValueChanged(left: Civ7RuntimeProbe<unknown> | undefined, right: Civ7RuntimeProbe<unknown> | undefined): boolean {
  if (!left || !right) return false;
  if (left.ok !== right.ok) return true;
  if (!left.ok || !right.ok) return stableJson(left) !== stableJson(right);
  return stableJson(left.value) !== stableJson(right.value);
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
