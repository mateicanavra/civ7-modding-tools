import type { Effect } from "effect";

import type { StudioRuntimeFailure } from "../errors/index.js";
import type {
  RunInGameFailurePhase,
  RunInGameTransition,
  SaveDeployTransition,
} from "../operationRuntime/registry.js";

export type RunInGameWorkflowTransitions = Readonly<{
  transition(transition: RunInGameTransition): Effect.Effect<void, StudioRuntimeFailure>;
  registerCleanup(cleanup: () => Effect.Effect<void, unknown>): Effect.Effect<void, never>;
  fail(
    args: Readonly<{
      phase: RunInGameFailurePhase;
      err: unknown;
    }>
  ): Effect.Effect<void, never>;
}>;

export type SaveDeployWorkflowTransitions = Readonly<{
  transition(transition: SaveDeployTransition): Effect.Effect<void, StudioRuntimeFailure>;
  fail(
    args: Readonly<{
      phase: "saving" | "deploying";
      err: unknown;
    }>
  ): Effect.Effect<void, never>;
}>;
