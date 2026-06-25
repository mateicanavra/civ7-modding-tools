import { module } from "./module.js";

export const graphRouter = {
  workspaceGraph: module.workspaceGraph.effect(function* ({ context, errors }) {
    return yield* context.withWorkspaceGraphFile(function* (graphPath) {
      const spawnResult = yield* context.runNxWorkspaceGraph({ outputPath: graphPath });
      if (spawnResult.exitCode !== 0) return { kind: "command-failed" as const, ...spawnResult };

      const graphText = yield* context.readWorkspaceGraphText(graphPath);
      const graphPayload = yield* context.parseWorkspaceGraphJson(
        graphPath,
        graphText,
        errors.BAD_REQUEST
      );
      const selectedPayload = yield* context.selectWorkspaceGraphPayload(
        graphPath,
        graphPayload,
        errors.BAD_REQUEST
      );
      return {
        kind: "completed" as const,
        graph: selectedPayload,
      };
    });
  }),
};

export const router = graphRouter;
