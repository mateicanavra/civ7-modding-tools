import { module } from "../module.js";

/** Runs the bounded Codex Stop gate through the native Habitat hook service. */
export const agentStopRouter = module.agentStop.effect(function* ({ context }) {
  return yield* context.agentStop.run();
});
