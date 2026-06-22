import path from "node:path";
import {
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { ORPCError } from "@orpc/server";
import { Data, Effect } from "effect";
import { module } from "./module.js";

class GraphJsonParseFailed extends Data.TaggedError("GraphJsonParseFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

class GraphJsonShapeInvalid extends Data.TaggedError("GraphJsonShapeInvalid")<{
  readonly path: string;
  readonly reason: string;
}> {}

export const graphRouter = {
  run: module.run.effect(function* ({ context, input = {} }) {
    return yield* Effect.scoped(
      Effect.gen(function* () {
        const tempDir = yield* context
          .acquireTempDirectory("habitat-graph-")
          .pipe(Effect.mapError(graphServiceInternalError));
        const graphPath = path.join(tempDir, "graph.json");
        const spawnResult = yield* context.nx.graph({ outputPath: graphPath }).pipe(
          Effect.match({
            onFailure: spawnResultFromCommandProviderError,
            onSuccess: spawnResultFromCommandResult,
          })
        );
        if (spawnResult.exitCode !== 0) return spawnResult;

        const graphText = yield* context.readText(graphPath).pipe(
          // TODO: I dont think we need to do errors like this. we should be throwing errors directly, especially the ones listed onthe contract
          Effect.mapError(graphServiceInternalError)
        );
        const graphPayload = yield* parseGraphJson(graphPath, graphText).pipe(
          // TODO: I dont think we need to do errors like this. we should be throwing errors directly, especially the ones listed onthe contract
          // TODO: Fix this issue categorically; make it a pattern -- a positive enforcement pattern (allowlist), not a deny-list
          // TODO: check the effect-orpc docs and the orpc docs
          Effect.mapError(graphServiceInternalError)
        );
        const selectedPayload = yield* selectGraphPayload(graphPath, graphPayload).pipe(
          Effect.mapError(graphServiceInternalError)
        );
        return {
          exitCode: 0,
          stdout: `${JSON.stringify(selectedPayload, null, input.json ? 0 : 2)}\n`,
          stderr: "",
        };
      })
    );
  }),
};

export const router = graphRouter;

function parseGraphJson(graphPath: string, graphText: string) {
  return Effect.try({
    try: () => JSON.parse(graphText) as unknown,
    catch: (cause) =>
      new GraphJsonParseFailed({
        path: graphPath,
        cause: cause instanceof Error ? cause.message : String(cause),
      }),
  });
}

function selectGraphPayload(
  graphPath: string,
  payload: unknown
): Effect.Effect<unknown, GraphJsonShapeInvalid> {
  if (payload && typeof payload === "object" && "graph" in payload) {
    const graph = (payload as { readonly graph: unknown }).graph;
    if (!graph || typeof graph !== "object") {
      return Effect.fail(
        new GraphJsonShapeInvalid({
          path: graphPath,
          reason: "Nx graph payload must contain a non-null graph object.",
        })
      );
    }
    return Effect.succeed(graph);
  }
  return Effect.succeed(payload);
}

function graphServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat graph service failed.",
  });
}
