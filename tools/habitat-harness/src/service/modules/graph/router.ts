import path from "node:path";
import {
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { Effect } from "effect";
import { GraphServiceInternalError } from "./model/errors/graph.errors.js";
import { module } from "./module.js";

interface GraphJsonFailure {
  readonly message: string;
}

export const graphRouter = {
  run: module.run.effect(function* ({ context, errors, input = {} }) {
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

        const graphText = yield* context
          .readText(graphPath)
          .pipe(Effect.mapError(graphServiceInternalError));
        const graphPayload = yield* parseGraphJson(graphPath, graphText).pipe(
          Effect.mapError((failure) => errors.BAD_REQUEST({ message: failure.message }))
        );
        const selectedPayload = yield* selectGraphPayload(graphPath, graphPayload).pipe(
          Effect.mapError((failure) => errors.BAD_REQUEST({ message: failure.message }))
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
    catch: (cause): GraphJsonFailure => ({
      message: `Habitat graph service could not parse Nx graph JSON at ${graphPath}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    }),
  });
}

function selectGraphPayload(
  graphPath: string,
  payload: unknown
): Effect.Effect<unknown, GraphJsonFailure> {
  if (payload && typeof payload === "object" && "graph" in payload) {
    const graph = (payload as { readonly graph: unknown }).graph;
    if (!graph || typeof graph !== "object") {
      return Effect.fail({
        message: `Habitat graph service read invalid Nx graph JSON at ${graphPath}: graph must be a non-null object.`,
      });
    }
    return Effect.succeed(graph);
  }
  return Effect.succeed(payload);
}

function graphServiceInternalError() {
  return new GraphServiceInternalError({
    message: "Habitat graph service failed.",
  });
}
