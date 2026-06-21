import path from "node:path";
import {
  NxProvider,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/substrate/providers/nx/index";
import {
  acquireTempDirectory,
  readText,
} from "@internal/habitat-harness/substrate/resources/index";
import { ORPCError } from "@orpc/server";
import { Data, Effect } from "effect";
import { implementer } from "./context.js";
import type { GraphServiceRunInput } from "./contract.js";

class GraphJsonParseFailed extends Data.TaggedError("GraphJsonParseFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

class GraphJsonShapeInvalid extends Data.TaggedError("GraphJsonShapeInvalid")<{
  readonly path: string;
  readonly reason: string;
}> {}

export const graphRouter = {
  run: implementer.run.effect(({ input }) => runGraphService(input)),
};

export const router = graphRouter;

function runGraphService(input: GraphServiceRunInput = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const tempDir = yield* acquireTempDirectory("habitat-graph-").pipe(
        Effect.mapError(graphServiceInternalError)
      );
      const graphPath = path.join(tempDir, "graph.json");
      const nx = yield* NxProvider;
      const spawnResult = yield* nx.graph({ outputPath: graphPath }).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      );
      if (spawnResult.exitCode !== 0) return spawnResult;

      const graphText = yield* readText(graphPath).pipe(Effect.mapError(graphServiceInternalError));
      const graphPayload = yield* parseGraphJson(graphPath, graphText).pipe(
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
}

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
