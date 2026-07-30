import type { RunInGameOperationKind, RunInGamePhase } from "@civ7/studio-contract";

// Presentation labels live in `@swooper/mapgen-studio-ui`; this file keeps the
// app-side phase classification used by run-in-game state plumbing.

const TERMINAL_PHASES = new Set<RunInGamePhase>(["completed", "failed", "cancelled"]);

/** Reports when a Run in Game phase can no longer advance. */
export function isRunInGameTerminalPhase(phase: RunInGamePhase): boolean {
  return TERMINAL_PHASES.has(phase);
}

/** Collapses lifecycle detail into the operation kind consumed by Studio presentation. */
export function kindForRunInGamePhase(phase: RunInGamePhase): RunInGameOperationKind {
  if (phase === "completed") return "completed";
  if (phase === "failed") return "failed";
  if (phase === "cancelled") return "cancelled";
  return "running";
}
