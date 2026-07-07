// Presentation-only labels and predicates for operation status surfaces. App
// and server modules construct public operation state; this module only turns
// contract status into Game bar wording and action labels.

import type {
  MapConfigSaveDeployPhase,
  RunInGameOperationStatus,
  RunInGamePhase,
} from "@civ7/studio-contract";

/** How a recorded Run in Game operation relates to the current authored Studio state. */
export type RunInGameRelation = "current" | "stale" | "unknown";

export function formatMapConfigSaveDeployPhaseLabel(phase: MapConfigSaveDeployPhase): string {
  switch (phase) {
    case "idle":
      return "Save";
    case "queued":
      return "Queued";
    case "saving":
      return "Saving";
    case "deploying":
      return "Deploying";
    case "complete":
      return "Saved";
    case "failed":
      return "Save Failed";
  }
}

export function formatRunInGamePhaseLabel(phase: RunInGamePhase): string {
  switch (phase) {
    case "resolving-source":
      return "Resolving Source";
    case "generating-artifacts":
      return "Generating";
    case "deploying":
      return "Deploying";
    case "preparing-civ7":
      return "Preparing Civ7";
    case "starting-game":
      return "Starting Game";
    case "observing-runtime":
      return "Observing Runtime";
    case "completed":
      return "Complete";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
  }
}

export function runInGameRequiresProcessRestart(
  status?: RunInGameOperationStatus | null,
  relation: RunInGameRelation = "unknown"
): boolean {
  return (
    relation !== "stale" &&
    status?.recoveryActions.includes("restart-civ-process-and-retry") === true
  );
}

export function runInGamePrimaryActionLabel(
  status?: RunInGameOperationStatus | null,
  relation: RunInGameRelation = "unknown"
): string {
  if (status?.status === "running") return formatRunInGamePhaseLabel(status.phase);
  if (status && runInGameRequiresProcessRestart(status, relation)) return "Restart Civ & Run";
  if (status?.status === "failed" || status?.status === "cancelled") {
    return relation === "stale" ? "Run Current" : "Retry Run";
  }
  return "Run in Game";
}
