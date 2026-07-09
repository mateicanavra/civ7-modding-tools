import type {
  RunInGameOperationKind,
  RunInGameOperationStatus,
  RunInGamePhase,
} from "@civ7/studio-contract";
import type { RunInGameRelation } from "@swooper/mapgen-studio-ui";

// The presentation half of this module (`formatRunInGamePhaseLabel`,
// `runInGamePrimaryActionLabel`, `runInGameRequiresProcessRestart`) lives in
// `@swooper/mapgen-studio-ui` (panels/statusLabels — B5 split); this file
// keeps the phase classification + diagnostics serialization the run-in-game
// hooks build state with.

const TERMINAL_PHASES = new Set<RunInGamePhase>(["complete", "blocked", "failed", "uncertain"]);

const RUNNING_PHASES = new Set<RunInGamePhase>([
  "materializing",
  "deploying",
  "restarting-civ",
  "checking-civ7",
  "reload-needed",
  "preparing-setup",
  "starting-game",
  "waiting-for-proof",
]);

// Alias of the package's re-homed relation union (adjudication 7 — never a
// third copy); kept so app call sites keep their vocabulary.
export type RunInGameActionRelation = RunInGameRelation;

export function isRunInGameTerminalPhase(phase: RunInGamePhase): boolean {
  return TERMINAL_PHASES.has(phase);
}

export function kindForRunInGamePhase(phase: RunInGamePhase): RunInGameOperationKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed") return "failed";
  if (phase === "uncertain") return "uncertain";
  return RUNNING_PHASES.has(phase) ? "running" : "running";
}

export function formatRunInGameDiagnostics(status: RunInGameOperationStatus): string {
  return stableRunInGameStringify({
    requestId: status.requestId,
    phase: status.phase,
    status: status.status,
    startedAt: status.startedAt,
    updatedAt: status.updatedAt,
    serverInstanceId: status.serverInstanceId,
    serverStartedAt: status.serverStartedAt,
    completedPhases: status.completedPhases,
    request: status.request,
    materialization: status.materialization,
    processRestart: status.processRestart,
    exactAuthorshipProof: status.exactAuthorshipProof,
    error: status.error,
    details: status.details,
  });
}

export function stableRunInGameStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value), null, 2);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}
