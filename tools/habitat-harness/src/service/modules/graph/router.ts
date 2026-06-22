import { module } from "./module.js";

export const graphRouter = {
  workspaceGraph: module.workspaceGraph.effect(function* ({ context, errors, input = {} }) {
    return yield* context.withWorkspaceGraphFile(function* (graphPath) {
      const spawnResult = yield* context.runNxWorkspaceGraph({ outputPath: graphPath });
      if (spawnResult.exitCode !== 0) return spawnResult;

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
        exitCode: 0,
        stdout: `${JSON.stringify(selectedPayload, null, input.json ? 0 : 2)}\n`,
        stderr: "",
      };
    });
  }),
};

export const router = graphRouter;
