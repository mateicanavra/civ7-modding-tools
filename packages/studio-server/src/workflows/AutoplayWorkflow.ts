import { Context, Effect, Layer } from "effect";

import type { StudioInputs, StudioOutputs } from "../context.js";
import type { StudioRuntimeFailure } from "../errors/index.js";
import { Civ7WorkflowControl } from "../ports/index.js";

export interface AutoplayWorkflowApi {
  readonly run: (
    input: StudioInputs["civ7"]["autoplay"]
  ) => Effect.Effect<StudioOutputs["civ7"]["autoplay"], StudioRuntimeFailure>;
}

/** Effect service owning the admitted autoplay start/stop command sequence. */
export class AutoplayWorkflow extends Context.Tag("@civ7/studio-server/AutoplayWorkflow")<
  AutoplayWorkflow,
  AutoplayWorkflowApi
>() {}

/** Builds autoplay orchestration from the shared Civ7 workflow-control port. */
export function makeAutoplayWorkflowLayer(): Layer.Layer<
  AutoplayWorkflow,
  never,
  Civ7WorkflowControl
> {
  return Layer.effect(
    AutoplayWorkflow,
    Effect.map(Civ7WorkflowControl, (civ7) => ({
      run: (input) => civ7.runAutoplay(input),
    }))
  );
}
