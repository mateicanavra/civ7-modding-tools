import type {
  Civ7ControlOrpcCityExpansionCheckResult,
  Civ7ControlOrpcCityExpansionSnapshot,
  Civ7ControlOrpcWorkerAssignmentCheckResult,
  Civ7ControlOrpcWorkerAssignmentSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7CityPopulationPlacementInput,
  Civ7CityPopulationPlacementResult,
} from "../../contract";

type PopulationPlacementPostcondition = Civ7CityPopulationPlacementResult["postcondition"];

export type Civ7PopulationPlacementPostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "worker-observed";
      input: Extract<Civ7CityPopulationPlacementInput, { mode: "assign-worker" }>;
      before: Civ7ControlOrpcWorkerAssignmentSnapshot;
      after: Civ7ControlOrpcWorkerAssignmentSnapshot;
    }>
  | Readonly<{
      kind: "expansion-observed";
      input: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>;
      before: Civ7ControlOrpcCityExpansionSnapshot;
      after: Civ7ControlOrpcCityExpansionSnapshot;
    }>;

export function workerAssignmentAvailable(
  input: Extract<Civ7CityPopulationPlacementInput, { mode: "assign-worker" }>,
  check: Civ7ControlOrpcWorkerAssignmentCheckResult
): boolean {
  const snapshot = check.snapshot;
  const cityId = snapshot.candidateCityId;
  return (
    check.valid &&
    snapshot.location === input.location &&
    snapshot.isReadyToPlacePopulation === true &&
    cityId !== null &&
    cityId.owner === snapshot.localPlayerId &&
    snapshot.readyCityIds.some((readyCityId) => componentIdMatch(readyCityId, cityId)) &&
    workerPlacementInfoMatches(snapshot.placementInfo, input.location, snapshot.numWorkers)
  );
}

export function cityExpansionAvailable(
  input: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>,
  check: Civ7ControlOrpcCityExpansionCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    check.valid &&
    snapshot.localPlayerId === input.cityId.owner &&
    componentIdMatch(snapshot.cityId, input.cityId) &&
    snapshot.destination.x === input.destination.x &&
    snapshot.destination.y === input.destination.y &&
    snapshot.isReadyToPlacePopulation === true &&
    snapshot.candidate?.plotIndex === snapshot.plotIndex &&
    snapshot.ownership.status === "unowned"
  );
}

export function civ7PopulationPlacementPostcondition(
  evidence: Civ7PopulationPlacementPostconditionEvidence
): PopulationPlacementPostcondition {
  switch (evidence.kind) {
    case "not-sent":
      return notSentPostcondition();
    case "send-result-unavailable":
      return missingTargetPostcondition(
        "The population placement send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
      );
    case "postcheck-unavailable":
      return missingTargetPostcondition(
        "The placement was sent, but no readable post-send target evidence was available before the polling deadline."
      );
    case "worker-observed":
      return workerAssignmentPostcondition(evidence);
    case "expansion-observed":
      return cityExpansionPostcondition(evidence);
  }
}

function workerAssignmentPostcondition(
  evidence: Extract<Civ7PopulationPlacementPostconditionEvidence, { kind: "worker-observed" }>
): PopulationPlacementPostcondition {
  if (
    evidence.before.location !== evidence.input.location ||
    evidence.after.location !== evidence.input.location ||
    evidence.before.numWorkers === null ||
    evidence.after.numWorkers === null
  ) {
    return missingTargetPostcondition(
      "The requested plot's worker count was unreadable, so readiness or unrelated city changes cannot confirm the assignment."
    );
  }
  if (evidence.after.numWorkers > evidence.before.numWorkers) {
    const readinessCorroborated =
      evidence.before.isReadyToPlacePopulation === true &&
      evidence.after.isReadyToPlacePopulation === false;
    return confirmedWorkerAssignmentPostcondition(
      readinessCorroborated
        ? "The requested plot's NumWorkers increased and population readiness also cleared."
        : "The requested plot's NumWorkers increased; that target-specific change confirms the worker assignment."
    );
  }
  return unchangedTargetPostcondition(
    "The requested plot's readable NumWorkers value did not increase; readiness or unrelated changes do not independently prove the target assignment."
  );
}

function cityExpansionPostcondition(
  evidence: Extract<Civ7PopulationPlacementPostconditionEvidence, { kind: "expansion-observed" }>
): PopulationPlacementPostcondition {
  if (
    !componentIdMatch(evidence.before.cityId, evidence.input.cityId) ||
    !componentIdMatch(evidence.after.cityId, evidence.input.cityId) ||
    !locationMatch(evidence.before.destination, evidence.input.destination) ||
    !locationMatch(evidence.after.destination, evidence.input.destination)
  ) {
    return missingTargetPostcondition(
      "The post-send expansion evidence did not identify the requested city and destination."
    );
  }

  const beforeOwnership = expansionOwnershipMatchState(
    evidence.before.ownership,
    evidence.input.cityId
  );
  const afterOwnership = expansionOwnershipMatchState(
    evidence.after.ownership,
    evidence.input.cityId
  );
  if (beforeOwnership === "unknown" || afterOwnership === "unknown") {
    return missingTargetPostcondition(
      "Ownership of the requested expansion plot was unreadable or only partially identified."
    );
  }
  if (evidence.before.ownership.status === "unowned" && afterOwnership === "matching") {
    const readinessCorroborated =
      evidence.before.isReadyToPlacePopulation === true &&
      evidence.after.isReadyToPlacePopulation === false;
    return confirmedCityExpansionPostcondition(
      readinessCorroborated
        ? "The requested plot became owned by the requested city and population readiness also cleared."
        : "The requested plot became owned by the requested city; that target-specific ownership change confirms the expansion."
    );
  }
  return unchangedTargetPostcondition(
    "The requested plot did not transition from explicitly unowned to ownership by the requested city."
  );
}

function confirmedWorkerAssignmentPostcondition(
  reason: string
): Extract<PopulationPlacementPostcondition, { classification: "worker-assignment-confirmed" }> {
  return {
    classification: "worker-assignment-confirmed",
    reason,
    outcome: "worker-assigned",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function confirmedCityExpansionPostcondition(
  reason: string
): Extract<PopulationPlacementPostcondition, { classification: "city-expansion-confirmed" }> {
  return {
    classification: "city-expansion-confirmed",
    reason,
    outcome: "city-expanded",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function unchangedTargetPostcondition(
  reason: string
): Extract<PopulationPlacementPostcondition, { classification: "no-target-state-change" }> {
  return {
    classification: "no-target-state-change",
    reason,
    outcome: "no-target-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function missingTargetPostcondition(
  reason: string
): Extract<PopulationPlacementPostcondition, { classification: "missing-postcondition" }> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function notSentPostcondition(): Extract<
  PopulationPlacementPostcondition,
  { classification: "not-sent" }
> {
  return {
    classification: "not-sent",
    reason: "The exact population placement was unavailable and no gameplay send was attempted.",
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function workerPlacementInfoMatches(
  value: unknown,
  location: number,
  numWorkers: number | null
): boolean {
  return (
    isRecord(value) &&
    value.PlotIndex === location &&
    value.IsBlocked !== true &&
    Number.isInteger(value.NumWorkers) &&
    value.NumWorkers === numWorkers
  );
}

function componentIdMatch(left: ComponentId, right: ComponentId): boolean {
  return componentIdMatchState(left, right) === "matching";
}

type ComponentId = Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>["cityId"];
type ExpansionOwnership = Civ7ControlOrpcCityExpansionSnapshot["ownership"];

function expansionOwnershipMatchState(
  ownership: ExpansionOwnership,
  cityId: ComponentId
): "matching" | "clear" | "unknown" {
  if (ownership.status === "unavailable") return "unknown";
  if (ownership.status === "unowned") return "clear";
  return componentIdMatchState(ownership.cityId, cityId);
}

function componentIdMatchState(
  left: ComponentId | null,
  right: ComponentId
): "matching" | "clear" | "unknown" {
  if (left === null) return "clear";
  if (left.owner !== right.owner || left.id !== right.id) return "clear";
  if (left.type === undefined && right.type === undefined) return "matching";
  if (left.type === undefined || right.type === undefined) return "unknown";
  return left.type === right.type ? "matching" : "clear";
}

function locationMatch(
  left: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>["destination"],
  right: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>["destination"]
): boolean {
  return left.x === right.x && left.y === right.y;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
