// ============================================================================
// STATUS LABELS — the split-formatter module (structure-rewire §3.3)
// ============================================================================
// The presentation half of the app's mapConfigSave/runInGame status modules:
// the three phase/action formatters GameConsole + RecipePanel render, plus the
// `runInGameRequiresProcessRestart` predicate `runInGamePrimaryActionLabel`
// depends on (also consumed app-side by StudioShell's restart wiring). The
// status CONSTRUCTORS (create/update/terminal/result projection) stay app-side
// — they build operation state; this module only words it.
//
// `RunInGameRelation` re-homes here as the ONE relation union: the app's
// `RunInGameActionRelation` (runInGame/status.ts) and `RunInGameCurrentRelation`
// (runInGame/clientState.ts) alias it (adjudication 7 — never a third copy).
//
// Contract usage is TYPE-POSITION ONLY (E1-C): `import type` erases at compile,
// so dist JS carries no `@civ7/studio-contract` specifier (verify.mjs asserts).

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
    case "idle":
      return "Run in Game";
    case "materializing":
      return "Materializing";
    case "deploying":
      return "Deploying";
    case "restarting-civ":
      return "Restarting Civ";
    case "checking-civ7":
      return "Checking Civ7";
    case "reload-needed":
      return "Reload Needed";
    case "preparing-setup":
      return "Preparing Setup";
    case "starting-game":
      return "Starting Game";
    case "waiting-for-proof":
      return "Waiting for Proof";
    case "complete":
      return "Complete";
    case "blocked":
      return "Blocked";
    case "failed":
      return "Failed";
    case "uncertain":
      return "Uncertain";
  }
}

export function runInGameRequiresProcessRestart(
  status?: RunInGameOperationStatus | null,
  relation: RunInGameRelation = "unknown"
): boolean {
  return relation !== "stale" && status?.details?.reloadBoundary === "process-restart-required";
}

export function runInGamePrimaryActionLabel(
  status?: RunInGameOperationStatus | null,
  relation: RunInGameRelation = "unknown"
): string {
  if (status?.status === "running") return formatRunInGamePhaseLabel(status.phase);
  if (status && runInGameRequiresProcessRestart(status, relation)) return "Restart Civ & Run";
  if (
    status?.status === "failed" ||
    status?.status === "blocked" ||
    status?.status === "uncertain"
  ) {
    return relation === "stale" ? "Run Current" : "Retry Run";
  }
  return "Run in Game";
}
