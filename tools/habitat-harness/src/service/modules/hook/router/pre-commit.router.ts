import { module } from "../module.js";

export const preCommitRouter = module.preCommit.effect(function* ({ context, input = {} }) {
  const begun = yield* context.preCommit.begin(input.resourcePolicy);
  if (begun.kind === "done") {
    return yield* context.lifecycle.finalizePreCommit(begun.outcome, begun.result);
  }
  const fileLayer = yield* context.preCommit.stagedCheck("file-layer", begun.state.staged);
  const afterFileLayer = yield* context.preCommit.continueAfterFileLayer(begun.state, fileLayer);
  if (afterFileLayer.kind === "done") {
    return yield* context.lifecycle.finalizePreCommit(
      afterFileLayer.outcome,
      afterFileLayer.result
    );
  }
  const afterBiome = yield* context.preCommit.runBiome(afterFileLayer.state);
  if (afterBiome.kind === "done") {
    return yield* context.lifecycle.finalizePreCommit(afterBiome.outcome, afterBiome.result);
  }

  const sourceCheckResult =
    afterBiome.state.sourceCheckPaths.length > 0
      ? yield* context.preCommit.stagedCheck("source-check", afterBiome.state.sourceCheckPaths)
      : undefined;
  return yield* context.preCommit.finish(afterBiome.state, sourceCheckResult);
});
