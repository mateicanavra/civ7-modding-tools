import type { RunInGameOperationKind, RunInGamePhase } from "@civ7/studio-contract";
import type { RunInGameRelation } from "@swooper/mapgen-studio-ui";

// Presentation labels live in `@swooper/mapgen-studio-ui`; this file keeps the
// app-side phase classification used by run-in-game state plumbing.

const TERMINAL_PHASES = new Set<RunInGamePhase>(["completed", "failed", "cancelled"]);

// Alias of the package's re-homed relation union (adjudication 7 — never a
// third copy); kept so app call sites keep their vocabulary.
export type RunInGameActionRelation = RunInGameRelation;

export function isRunInGameTerminalPhase(phase: RunInGamePhase): boolean {
  return TERMINAL_PHASES.has(phase);
}

export function kindForRunInGamePhase(phase: RunInGamePhase): RunInGameOperationKind {
  if (phase === "completed") return "completed";
  if (phase === "failed") return "failed";
  if (phase === "cancelled") return "cancelled";
  return "running";
}
