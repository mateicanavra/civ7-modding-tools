import path from "node:path";
import { ORPCError } from "@orpc/server";
import { Effect } from "effect";
import { JsonParseFailed } from "../../../errors/index.js";
import {
  NxProvider,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "../../../providers/nx/index.js";
import { acquireTempDirectory, HabitatFileSystem } from "../../../resources/index.js";
import type { GraphServiceRunInput } from "./contract.js";

/**
 * Owns `habitat graph` orchestration while leaving Nx execution and file access
 * in provider/resource layers. The CLI remains a thin caller of this service.
 */
export function runGraphService(input: GraphServiceRunInput = {}) {
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

      const fs = yield* HabitatFileSystem;
      const graphText = yield* fs
        .readText(graphPath)
        .pipe(Effect.mapError(graphServiceInternalError));
      const graphPayload = yield* parseGraphJson(graphPath, graphText).pipe(
        Effect.mapError(graphServiceInternalError)
      );
      return {
        exitCode: 0,
        stdout: `${JSON.stringify(selectGraphPayload(graphPayload), null, input.json ? 0 : 2)}\n`,
        stderr: "",
      };
    })
  );
}

function parseGraphJson(graphPath: string, graphText: string) {
  return Effect.try({
    try: () => JSON.parse(graphText) as unknown,
    catch: (cause) =>
      new JsonParseFailed({
        path: graphPath,
        cause: cause instanceof Error ? cause.message : String(cause),
      }),
  });
}

function selectGraphPayload(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "graph" in payload) {
    return (payload as { readonly graph: unknown }).graph ?? payload;
  }
  return payload;
}

function graphServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat graph service failed.",
  });
}
