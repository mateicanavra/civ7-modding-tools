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

- **UI/main thread** owns: recipe selection, UI schema, run requests, and rendering.
- **Web Worker** owns: config validation, plan compilation, pipeline execution, and emitting progress/trace/viz events back to the UI.

This seam exists to keep:
- the core pipeline runtime environment-agnostic (no browser coupling),
- and the UI responsive (no long synchronous work on the main thread).

## Worker protocol

Studio’s worker runner uses a small message protocol:
- `run.start` (begin a new run with inputs and optional config overrides)
- `run.cancel` (cooperative cancellation by token/generation)
- `run.started`, `run.progress`, `viz.layer.upsert`, `run.finished`, `run.canceled`, `run.error`

The protocol is **intentionally loose** at the recipe config boundary:
- `configOverrides?: unknown`

This prevents Studio’s engine code from being coupled to any specific recipe config type.

Concrete shapes (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/protocol.ts
export type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  generation: number;
  recipeId: string;
  seed: number;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: unknown;
};

export type BrowserVizLayerUpsertEvent = {
  type: "viz.layer.upsert";
  runToken: string;
  generation: number;
  layer: VizLayerEntryV1;
};
```

## Config overrides + validation

The worker treats the protocol boundary as untrusted/unknown input and:

1) merges recipe default config with overrides **deterministically** (and proto-safe),
2) validates the merged payload using the recipe-provided schema via `normalizeStrict(...)`,
3) fails the run with a structured `run.error` if validation fails.

## Plan compile + execution

The worker composes an `envBase` from run inputs (seed/dimensions/latitudes) and then:

- compiles a plan using the runtime recipe (`recipe.compile(envBase, config)`),
- derives stable run identity from the plan:
  - `runId` via `deriveRunId(plan)`
  - `planFingerprint` via `computePlanFingerprint(plan)` (current code uses the same value as `runId`)
- forces all steps to trace `verbose` for Studio’s execution posture,
- constructs an adapter (mock civ7 adapter in browser),
- constructs an extended map context,
- installs `context.viz` to enable visualization emission,
- and calls `recipe.runAsync(context, env, config, { traceSink, abortSignal, yieldToEventLoop: true })`.

Concrete execution posture (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/pipeline.worker.ts
const plan = recipeEntry.recipe.compile(envBase, config);
const runId = deriveRunId(plan);
const verboseSteps: Record<string, "verbose"> = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));

const env = { ...envBase, trace: { enabled: true, steps: verboseSteps } };
const context = createExtendedMapContext(dimensions, adapter, env);
context.viz = createWorkerVizDumper();

post({ type: "run.started", runToken, generation, runId, planFingerprint: runId });
await recipeEntry.recipe.runAsync(context, env, config, { traceSink, abortSignal, yieldToEventLoop: true });
```

## Trace + visualization in Studio

Studio surfaces two observability channels from the worker:

- **Progress events**: step start/finish + duration for UI progress bars and logs.
- **Visualization events**: `viz.layer.upsert` events that carry `VizLayerEntryV1` payloads to be rendered by Studio’s deck.gl visualization pipeline.

Key posture:
- Visualization emission is gated by **trace verbosity** in the worker’s `VizDumper` implementation.
- The worker uses Transferables to avoid copying large buffers across the worker boundary.

Concrete Transferables posture (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts
const transfer = collectTransferables(layer); // collects ArrayBuffers from inline refs
post({ type: "viz.layer.upsert", runToken, generation, layer }, transfer);
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
- deriving a label-based RNG from the seed (stable per label),
- ensuring config merging is deterministic,
- deriving run identity from the compiled plan.

This does not mean “bitwise identical” across engines/platforms; it is a **developer-facing determinism posture** suitable for iteration and debugging.

## Ground truth anchors

Worker seam + protocol:
- Worker entrypoint: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Message protocol types: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Worker trace sink (progress + viz event forwarding): `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- Worker viz dumper (viz emission + Transferables posture): `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`

Recipe selection + artifacts boundary:
- Runtime recipes (worker-side): `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Bundled recipe artifacts (UI schema + defaults + ui meta): `apps/mapgen-studio/src/recipes/catalog.ts`
- Worker creation boundary: `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`

Core SDK contracts this seam depends on:
- `VizDumper` interface: `packages/mapgen-core/src/core/types.ts`
- Derive stable run id: `packages/mapgen-core/src/engine/index.ts`
- Trace session + sinks: `packages/mapgen-core/src/trace/index.ts`
