import path from "node:path";
import {
  type CommandProviderError,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import { service, type HabitatModule } from "@habitat/cli/service/impl";
import { Effect } from "effect";
import {
  GraphServiceBadRequestError,
  GraphServiceInternalError,
} from "./model/errors/graph.errors.js";

export interface GraphModuleContext {
  readonly parseWorkspaceGraphJson: (
    graphPath: string,
    graphText: string,
    badRequest: GraphBadRequest
  ) => Effect.Effect<unknown, GraphServiceBadRequestError>;
  readonly readWorkspaceGraphText: (
    graphPath: string
  ) => Effect.Effect<string, GraphServiceInternalError, any>;
  readonly runNxWorkspaceGraph: (
    input: GraphNxGraphRequest
  ) => Effect.Effect<SpawnResult, never, any>;
  readonly selectWorkspaceGraphPayload: (
    graphPath: string,
    payload: unknown,
    badRequest: GraphBadRequest
  ) => Effect.Effect<unknown, GraphServiceBadRequestError>;
  readonly withWorkspaceGraphFile: <A>(
    body: (graphPath: string) => Generator<any, A, any>
  ) => Effect.Effect<A, GraphServiceBadRequestError | GraphServiceInternalError, any>;
}

export const module: HabitatModule<"graph", GraphModuleContext> = service.graph.use(
  ({ context, next }) => {
    return next({
      context: {
        parseWorkspaceGraphJson: (graphPath, graphText, badRequest) =>
          parseGraphJson(graphPath, graphText).pipe(
            Effect.mapError((failure) => badRequest({ message: failure.message }))
          ),
        readWorkspaceGraphText: (graphPath) =>
          context.deps.platform
            .readText(graphPath)
            .pipe(Effect.mapError(graphServiceInternalError)),
        runNxWorkspaceGraph: (request) =>
          context.deps.nx.graph(request).pipe(
            Effect.match({
              onFailure: spawnResultFromCommandProviderError,
              onSuccess: spawnResultFromCommandResult,
            })
          ),
        selectWorkspaceGraphPayload: (graphPath, payload, badRequest) =>
          selectGraphPayload(graphPath, payload).pipe(
            Effect.mapError((failure) => badRequest({ message: failure.message }))
          ),
        withWorkspaceGraphFile: (body) =>
          withWorkspaceGraphFile(context.deps.platform.acquireTempDirectory, body),
      } satisfies GraphModuleContext,
    });
  }
);

interface GraphJsonFailure {
  readonly message: string;
}

type GraphBadRequest = (input: { readonly message: string }) => GraphServiceBadRequestError;
type GraphScopedBody<A> = (graphPath: string) => Generator<any, A, any>;

export interface GraphNxGraphRequest {
  readonly outputPath: string;
}

function withWorkspaceGraphFile<A>(
  acquireTempDirectory: (prefix: string) => Effect.Effect<string, unknown, any>,
  body: GraphScopedBody<A>
): Effect.Effect<A, GraphServiceBadRequestError | GraphServiceInternalError, any> {
  return Effect.scoped(
    Effect.gen(function* () {
      const tempDir = yield* acquireTempDirectory("habitat-graph-").pipe(
        Effect.mapError(graphServiceInternalError)
      );
      return yield* body(path.join(tempDir, "graph.json"));
    })
  ) as Effect.Effect<A, GraphServiceBadRequestError | GraphServiceInternalError, any>;
}

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
