<toc>
  <item id="purpose" title="Purpose"/>
  <item id="seam" title="The Studio seam (what it is)"/>
  <item id="protocol" title="Worker protocol"/>
  <item id="config" title="Config overrides + validation"/>
  <item id="execution" title="Plan compile + execution"/>
  <item id="observability" title="Trace + visualization in Studio"/>
  <item id="cancellation" title="Cancellation + concurrency"/>
  <item id="determinism" title="Determinism posture"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Studio integration seam (reference)

## Purpose

Define the **canonical seam** between MapGen’s core runtime (pipeline / recipe / executor) and **MapGen Studio’s browser worker runner**.

This page is:
- contract-oriented (stable boundaries and invariants),
- target-architecture-first,
- and anchored to current code.

For “how do I build this in my app?”, see:
- [`docs/system/libs/mapgen/how-to/integrate-mapgen-studio-worker.md`](/system/libs/mapgen/how-to/integrate-mapgen-studio-worker.md)

## The Studio seam (what it is)

Studio’s runtime posture is:

- **UI/main thread** owns: recipe selection, UI schema, portable initial-setup inputs, run requests,
  and rendering.
- **Web Worker** owns: config validation, plan compilation, pipeline execution, and emitting progress/trace/viz events back to the UI.

This seam exists to keep:
- the core pipeline runtime environment-agnostic (no browser coupling),
- and the UI responsive (no long synchronous work on the main thread).

## Worker protocol

Studio’s worker runner uses a small message protocol:
- `run.start` (begin a new run with inputs and one complete recipe config)
- `run.cancel` (cooperative cancellation by token/generation)
- `run.started`, `run.progress`, `viz.layer.upsert`, `run.finished`, `run.canceled`, `run.error`

The protocol is recipe-agnostic but semantically strict at the config boundary:
- `pipelineConfig: unknown`

The transport does not know a recipe-specific TypeScript type. The selected
recipe's executable schema still requires one complete config value.

Concrete shapes (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/protocol.ts
export type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  generation: number;
  recipeId: string;
  initialSetup: {
    mapSeed: number;
    gameSeed: number;
    mapSizeId: string;
    dimensions: { width: number; height: number };
    latitudeBounds: { topLatitude: number; bottomLatitude: number };
    aliveMajorPlayerIds: readonly number[];
    options: {
      map: Readonly<Record<string, string | number | boolean | readonly string[]>>;
      game: Readonly<Record<string, string | number | boolean | readonly string[]>>;
      player: readonly {
        playerId: number;
        options: Readonly<Record<string, string | number | boolean | readonly string[]>>;
      }[];
    };
  };
  pipelineConfig: unknown;
};

export type BrowserVizLayerUpsertEvent = {
  type: "viz.layer.upsert";
  runToken: string;
  generation: number;
  layer: VizLayerEntryV2;
};
```

## Complete config admission

The worker treats the protocol boundary as untrusted/unknown input and:

1) clones the supplied value through the portable JSON boundary,
2) validates the clone unchanged with the selected recipe's executable schema,
3) fails the run with a structured `run.error` if the value is incomplete,
   contains unknown properties, or otherwise fails the schema.

The worker never merges defaults, cleans keys, migrates properties, or repairs
config. Recipe defaults are already complete artifacts, and editing replaces
values inside a complete editor config before the worker request is created.

Initial setup follows a parallel but recipe-owned boundary. The transport carries portable setup
axes without claiming they are Core `MapSetup` or Standard initial setup. The selected runtime
recipe projects those axes into its exact initial-setup schema, and recipe compilation owns final
admission and snapshotting.

## Plan compile + execution

The worker does not construct a physical setup independently. It:

- projects the portable request through the selected runtime recipe and compiles one authentic plan,
- derives the mock adapter's map metadata, dimensions, map seed, and exact alive-major player ids
  from that retained plan,
- receives the executor-owned `runId` and stable `planFingerprint` from the
  emitted `run.start` trace event,
- enables step tracing for Studio's progress posture,
- constructs the browser mock adapter from plan-derived setup,
- constructs one map context from `plan.setup`,
- creates a browser visualization facet sink,
- and calls `recipe.executeAsync(context, plan, { trace: { config, sink }, facets, abortSignal,
  yieldToEventLoop: true })`.

For Standard, the runtime projector resolves the official map preset and constructs complete map,
game, player, and option evidence. `standardRecipe.inspectPlan(plan)` is then the only source used to
project adapter setup. The raw browser request is not consulted again after compilation, so Studio
cannot execute one setup while attributing the run to another.

Concrete execution posture (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/pipeline.worker.ts
const plan = recipeEntry.recipe.compile(initialSetup, configResult.value);
const adapterSetup = recipeEntry.recipe.projectAdapterSetup(plan);
const verboseSteps: Record<string, "verbose"> = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));

const adapter = createMockAdapter({
  width: adapterSetup.dimensions.width,
  height: adapterSetup.dimensions.height,
  mapSizeId: adapterSetup.mapSizeId,
  mapInfo: adapterSetup.mapInfo,
  aliveMajorPlayerIds: adapterSetup.aliveMajorPlayerIds,
  rng: createLabelRng(adapterSetup.mapSeed),
  // Civ7 browser tables omitted.
});
const context = createMapContext({ setup: plan.setup, adapter });
const workerTraceSink = createWorkerTraceSink({ runToken, generation, post, abortSignal });
const traceSink = {
  emit(event: TraceEvent) {
    if (event.kind === "run.start") {
      post({
        type: "run.started",
        runToken,
        generation,
        runId: event.runId,
        planFingerprint: event.planFingerprint,
      });
    }
    workerTraceSink.emit(event);
  },
};

await recipeEntry.recipe.executeAsync(context, plan, {
  trace: {
    config: { steps: verboseSteps },
    sink: traceSink,
  },
  facets: {
    viz: createWorkerVizFacetSink({ runToken, generation, post, abortSignal }),
  },
  abortSignal,
  yieldToEventLoop: true,
});
```

The request token identifies Studio's request lifecycle. The executor allocates
a distinct run identity only after the context enters its active execution
state, so callers never derive or supply `runId` themselves.

## Trace + visualization in Studio

Studio surfaces two observability channels from the worker:

- **Progress events**: step start/finish + duration for UI progress bars and logs.
- **Visualization events**: `viz.layer.upsert` events that carry `VizLayerEntryV2` payloads to be rendered by Studio’s deck.gl visualization pipeline.

Key posture:
- A step's optional `viz` projector runs after successful execution and provider admission, and only
  when the worker supplies a visualization facet sink.
- The projector sees only `{ observation, config, dimensions }`; it cannot observe browser state, trace,
  or the sink.
- Visualization is independent of trace verbosity. Trace owns progress; the visualization facet
  owns portable layer projections.
- The Viz kernel snapshots each exact typed-array view; the worker requests one host-owned byte copy
  from that snapshot and transfers it across the worker boundary.
- Standard recipe style choices have already resolved to portable colors before Studio receives a
  layer. Studio does not maintain a recipe palette registry.

Concrete Transferables posture (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts
const emitted = materializeVizProjection(projection, identity, materializeInline);
postWorkerVizLayer({
  post,
  runToken,
  generation,
  layer: { ...emitted, stepIndex: context.stepIndex },
});
```

Routing:
- Visualization architecture and deck.gl rendering are canonical in [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md).

## Cancellation + concurrency

Studio uses a token + generation pair to:
- cancel stale runs,
- avoid mixing events across concurrent/rapidly restarted runs.

Cancellation posture:
- the worker aborts the active run via an `AbortController`,
- suppresses user-facing trace sink events after abort,
- and emits a single `run.canceled` event when execution unwinds.

## Determinism posture

Studio’s browser runner is designed to be deterministic (given the same inputs), by:
- keeping map physics on `mapSeed` and gameplay placement on the distinct `gameSeed`,
- deriving the browser adapter RNG from the admitted plan's map seed,
- admitting the exact complete config carried by the request,
- retaining exact map selection, player identities, and option evidence in the compiled plan, and
- deriving run identity from the compiled plan.

This does not mean “bitwise identical” across engines/platforms; it is a **developer-facing determinism posture** suitable for iteration and debugging.

## Ground truth anchors

Worker seam + protocol:
- Worker entrypoint: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Message protocol types: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Runtime setup projection: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Worker trace sink (progress): `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- Worker visualization facet sink (materialization + Transferables):
  `apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts`

Recipe selection + artifacts boundary:
- Runtime recipes (worker-side): `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Bundled recipe artifacts (UI schema + defaults + ui meta): `apps/mapgen-studio/src/recipes/catalog.ts`
- Recipe artifacts source: `mod-swooper-maps` recipe source is compiled by
  `nx run mod-swooper-maps:build:studio-recipes` into package
  artifact entrypoints (`mod-swooper-maps/recipes/*-artifacts`). Studio imports
  those first-class package artifacts; generated `dist/` files are build
  outputs, not editable product policy.
- Worker creation boundary: `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`

Core SDK contracts this seam depends on:
- Step facet contracts: `packages/mapgen-core/src/engine/step-facets.ts`
- Portable visualization projection and materialization contracts: `packages/mapgen-viz/src/index.ts`
- Stable plan fingerprint + fresh run identity: `packages/mapgen-core/src/engine/observability.ts`
  and `packages/mapgen-core/src/core/map-context.ts`
- Public trace contracts and sinks: `packages/mapgen-core/src/trace/index.ts`
- Executor-owned trace session: `packages/mapgen-core/src/trace/session.ts`
