import type {
  Civ7OperationFamily,
  Civ7OperationInput,
  Civ7OperationValidationResult,
} from "./types.js";
import { probeValueChanged } from "./probe-values.js";
import { stableJson } from "./stable-json.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

export type Civ7PopulationPlacementPostconditionClassification =
  | "not-sent"
  | "population-ready-cleared"
  | "placement-state-changed"
  | "validation-changed"
  | "no-state-change";

export type Civ7PopulationPlacementPostconditionSnapshot = Readonly<{
  cityId: Civ7ComponentId | null;
  city: Civ7RuntimeProbe<unknown>;
  isReadyToPlacePopulation: Civ7RuntimeProbe<unknown>;
  cityWorkerCap: Civ7RuntimeProbe<unknown>;
  workablePlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  blockedPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
  expansionPlotIndexes: Civ7RuntimeProbe<ReadonlyArray<unknown>>;
}>;

export type Civ7PopulationPlacementPostcondition = Readonly<{
  family: "player-operation" | "city-command";
  operationType: string;
  classification: Civ7PopulationPlacementPostconditionClassification;
  before?: Civ7PopulationPlacementPostconditionSnapshot;
  after?: Civ7PopulationPlacementPostconditionSnapshot;
  readyCleared: boolean;
  placementStateChanged: boolean;
  reason: string;
}>;

export function populationPlacementPostcondition(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  beforeSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined,
  afterSnapshot: Civ7PopulationPlacementPostconditionSnapshot | undefined
): Civ7PopulationPlacementPostcondition | undefined {
  if (!populationPlacementPostconditionEligible(family, input)) return undefined;
  const readyCleared = probeReadyCleared(
    beforeSnapshot?.isReadyToPlacePopulation,
    afterSnapshot?.isReadyToPlacePopulation
  );
  const placementStateChanged =
    probeValueChanged(beforeSnapshot?.city, afterSnapshot?.city) ||
    probeValueChanged(
      beforeSnapshot?.isReadyToPlacePopulation,
      afterSnapshot?.isReadyToPlacePopulation
    ) ||
    probeValueChanged(beforeSnapshot?.cityWorkerCap, afterSnapshot?.cityWorkerCap) ||
    probeValueChanged(beforeSnapshot?.workablePlotIndexes, afterSnapshot?.workablePlotIndexes) ||
    probeValueChanged(beforeSnapshot?.blockedPlotIndexes, afterSnapshot?.blockedPlotIndexes) ||
    probeValueChanged(beforeSnapshot?.expansionPlotIndexes, afterSnapshot?.expansionPlotIndexes);
  const classification = classifyPopulationPlacementPostcondition(
    sent,
    before,
    after,
    readyCleared,
    placementStateChanged
  );
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

function populationPlacementPostconditionEligible(
  family: Civ7OperationFamily,
  input: Civ7OperationInput
): boolean {
  return (
    (family === "player-operation" && input.operationType === "ASSIGN_WORKER") ||
    (family === "city-command" && input.operationType === "EXPAND")
  );
}

function probeReadyCleared(
  before: Civ7RuntimeProbe<unknown> | undefined,
  after: Civ7RuntimeProbe<unknown> | undefined
): boolean {
  return (
    before?.ok === true && before.value === true && after?.ok === true && after.value === false
  );
}

function classifyPopulationPlacementPostcondition(
  sent: boolean,
  before: Civ7OperationValidationResult,
  after: Civ7OperationValidationResult,
  readyCleared: boolean,
  placementStateChanged: boolean
): Civ7PopulationPlacementPostconditionClassification {
  if (!sent) return "not-sent";
  if (readyCleared) return "population-ready-cleared";
  if (placementStateChanged) return "placement-state-changed";
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result))
    return "validation-changed";
  return "no-state-change";
}

function populationPlacementPostconditionReason(
  classification: Civ7PopulationPlacementPostconditionClassification
): string {
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
