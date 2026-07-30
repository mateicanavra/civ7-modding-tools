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

/**
 * Maps save/deploy transport phases to the compact labels used by Studio action surfaces.
 *
 * @param phase - Current save/deploy workflow phase from the Studio contract.
 * @returns The stable user-facing phase label shared by the recipe panel and game console.
 */
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

/**
 * Maps Run in Game workflow phases to the compact labels shown while an operation is active.
 *
 * @param phase - Current public Run in Game workflow phase.
 * @returns The user-facing progress label used by status and primary-action projections.
 */
export function formatRunInGamePhaseLabel(phase: RunInGamePhase): string {
  switch (phase) {
    case "admitting-config":
      return "Admitting Config";
    case "generating-artifacts":
      return "Generating";
    case "deploying":
      return "Deploying";
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

/**
 * Resolves the Run in Game button copy from operation state, recovery policy, and authorship drift.
 * Stale terminal operations invite a fresh current-state run rather than retrying old authorship;
 * current failures expose retry only when the server advertises that recovery action.
 *
 * @param status - Latest operation status, when one has been observed.
 * @param relation - Whether that operation belongs to the currently authored Studio state.
 * @returns The primary-action label that communicates progress or the admitted recovery path.
 */
export function runInGamePrimaryActionLabel(
  status?: RunInGameOperationStatus | null,
  relation: RunInGameRelation = "unknown"
): string {
  if (status?.status === "running") return formatRunInGamePhaseLabel(status.phase);
  if (status?.status === "failed" || status?.status === "cancelled") {
    if (relation === "stale") return "Run Current";
    return status.recoveryActions.includes("retry-run") ? "Retry Run" : "Run Unavailable";
  }
  return "Run in Game";
}
