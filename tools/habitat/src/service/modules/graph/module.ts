import path from "node:path";
import type { FileSystem } from "@effect/platform";
import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import type { HabitatPlatformService } from "@habitat/cli/resources/platform/index";
import type {
  HabitatServiceDeps,
  HabitatServiceRequirements,
} from "@habitat/cli/service/base";
import { type HabitatModule, service } from "@habitat/cli/service/impl";
import { Effect, Match, Schema, type Scope } from "effect";
import { Type } from "typebox";
import { Value } from "typebox/value";
import {
  GraphServiceBadRequestError,
  GraphServiceInternalError,
} from "./model/errors/graph.errors.js";

const GraphEnvelopeSchema = Type.Object({ graph: Type.Unknown() }, { additionalProperties: true });

const decodeGraphJson = Schema.decodeUnknown(Schema.parseJson());

export type GraphModuleContext = ReturnType<typeof makeGraphModuleContext>;

export const module: HabitatModule<"graph", GraphModuleContext> = service.graph.use(
  ({ context, next }) => next({ context: makeGraphModuleContext(context.deps) })
);

interface GraphJsonFailure {
  readonly message: string;
}

type GraphBadRequest = (input: { readonly message: string }) => GraphServiceBadRequestError;
type GraphScopedBody<A> = (graphPath: string) => Effect.fn.Return<
  A,
  GraphServiceBadRequestError | GraphServiceInternalError,
  HabitatServiceRequirements
>;

export interface GraphNxGraphRequest {
  readonly outputPath: string;
}

function makeGraphModuleContext(deps: HabitatServiceDeps) {
  return {
    parseWorkspaceGraphJson: (graphPath: string, graphText: string, badRequest: GraphBadRequest) =>
      parseGraphJsonEffect(graphPath, graphText).pipe(
        Effect.mapError((failure) => badRequest({ message: failure.message }))
      ),
    readWorkspaceGraphText: (graphPath: string) =>
      deps.platform.readText(graphPath).pipe(Effect.mapError(graphServiceInternalError)),
    runNxWorkspaceGraph: (request: GraphNxGraphRequest) =>
      deps.nx.graph(request).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      ),
    selectWorkspaceGraphPayload: (
      graphPath: string,
      payload: unknown,
      badRequest: GraphBadRequest
    ) =>
      selectGraphPayloadEffect(graphPath, payload).pipe(
        Effect.mapError((failure) => badRequest({ message: failure.message }))
      ),
    withWorkspaceGraphFile: <A>(body: GraphScopedBody<A>) =>
      withWorkspaceGraphFileScopedEffect(deps.platform.acquireTempDirectory, body).pipe(
        Effect.scoped
      ),
  };
}

const withWorkspaceGraphFileScopedEffect = Effect.fn("habitat.graph.withWorkspaceGraphFile")(
  function* <A>(
    acquireTempDirectory: HabitatPlatformService["acquireTempDirectory"],
    body: GraphScopedBody<A>
  ): Effect.fn.Return<
    A,
    GraphServiceBadRequestError | GraphServiceInternalError,
    HabitatServiceRequirements | FileSystem.FileSystem | Scope.Scope
  > {
    const tempDir = yield* acquireTempDirectory("habitat-graph-").pipe(
      Effect.mapError(graphServiceInternalError)
    );
    return yield* body(path.join(tempDir, "graph.json"));
  }
);

const parseGraphJsonEffect = Effect.fn("habitat.graph.parseJson")(function* (
  graphPath: string,
  graphText: string
) {
  return yield* decodeGraphJson(graphText).pipe(
    Effect.mapError(
      (cause): GraphJsonFailure => ({
        message: `Habitat graph service could not parse Nx graph JSON at ${graphPath}: ${String(cause)}`,
      })
    )
  );
});

const selectGraphPayloadEffect = Effect.fn("habitat.graph.selectPayload")(function* (
  graphPath: string,
  payload: unknown
) {
  return yield* Match.value(Value.Check(GraphEnvelopeSchema, payload)).pipe(
    Match.when(true, () => selectEnvelopeGraphEffect(graphPath, payload)),
    Match.when(false, () => Effect.succeed(payload)),
    Match.exhaustive
  );
});

const selectEnvelopeGraphEffect = Effect.fn("habitat.graph.selectEnvelope")(function* (
  graphPath: string,
  payload: unknown
) {
  const graph = Value.Parse(GraphEnvelopeSchema, payload).graph;
  return yield* Effect.if(isNonNullObject(graph), {
    onTrue: () => Effect.succeed(graph),
    onFalse: () =>
      Effect.fail({
        message: `Habitat graph service read invalid Nx graph JSON at ${graphPath}: graph must be a non-null object.`,
      } satisfies GraphJsonFailure),
  });
});

function isNonNullObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

function graphServiceInternalError() {
  return new GraphServiceInternalError({
    message: "Habitat graph service failed.",
  });
}
