<toc>
  <item id="purpose" title="Purpose"/>
  <item id="when" title="When to use this pattern"/>
  <item id="shape" title="Minimal shape of the integration"/>
  <item id="protocol" title="Use the protocol boundary"/>
  <item id="trace-viz" title="Wire trace + viz correctly"/>
  <item id="cancellation" title="Cancellation posture"/>
  <item id="verification" title="Verification"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: integrate the MapGen Studio worker runner

## Purpose

Use MapGen Studio’s **browser worker runner** as the canonical integration posture for:
- running recipes without blocking the UI,
- getting step-level progress,
- and enabling the canonical deck.gl visualization pipeline.

This is a how-to: it focuses on “what to do” and “what to copy”.
For contracts and invariants, see:
- [`docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`](/system/libs/mapgen/reference/STUDIO-INTEGRATION.md)

## When to use this pattern

Use this pattern if you are:
- adding a new Studio-like app that runs MapGen in the browser,
- refactoring the existing runner,
- or adding worker-side observability features.

Do not use this pattern for:
- Node/headless runs (use a Node runner harness; see standard recipe tooling).

## Minimal shape of the integration

Studio’s working shape (today) is:

1) UI selects `recipeId`, one complete recipe config, and run inputs
   (seed/dimensions/latitude bounds).
2) UI creates a dedicated worker (module worker) and posts a `run.start`.
3) Worker:
   - clones the config through the portable JSON boundary,
   - validates that clone unchanged against the selected recipe schema,
   - compiles plan,
   - translates the executor's `run.start` evidence into the worker protocol identity,
   - runs the recipe with a progress trace sink and visualization facet sink,
   - posts progress and viz upsert events.
4) UI renders:
   - step progress from `run.progress` events,
   - deck.gl visualization from `viz.layer.upsert` events.

Concrete worker skeleton (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/pipeline.worker.ts
const configResult = admitPipelineConfig({
  schema: recipeEntry.configSchema,
  config: request.pipelineConfig,
  label: "browser-run",
});
if (!configResult.ok) throw new Error(formatConfigErrors(configResult.errors));

const config = configResult.value;
const setup = admitMapSetup({ mapSeed: seed, dimensions, latitudeBounds });
const plan = recipeEntry.recipe.compile(setup, config);
const verboseSteps = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));

const context = createMapContext({ setup, adapter });
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

`runId` is an execution-attempt identity owned by the active `MapContext`. The
worker must not allocate or predict it from the plan; it learns both identities
from the executor's first trace event.

## Use the protocol boundary

Keep the boundary narrow and stable:
- `BrowserRunRequest` (`run.start` / `run.cancel`)
- `BrowserRunEvent` (`run.started`, `run.progress`, `viz.layer.upsert`, `run.finished`, `run.canceled`, `run.error`)

Avoid coupling UI engine code to any specific recipe config type:
- carry `pipelineConfig` as `unknown` at the recipe-agnostic transport boundary,
  then admit it with the selected recipe's executable schema.

Concrete protocol shape (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/protocol.ts
export type BrowserRunRequest =
  | { type: "run.start"; runToken: string; generation: number; recipeId: string; seed: number; pipelineConfig: unknown; /* ... */ }
  | { type: "run.cancel"; runToken: string; generation: number };

export type BrowserRunEvent =
  | { type: "run.started"; runToken: string; generation: number; runId: string; planFingerprint: string }
  | { type: "run.progress"; runToken: string; generation: number; kind: "step.start" | "step.finish"; stageId: string; stepId: string; stepIndex: number; /* ... */ }
  | { type: "viz.layer.upsert"; runToken: string; generation: number; layer: VizLayerEntryV2 }
  | { type: "run.finished"; runToken: string; generation: number }
  | { type: "run.canceled"; runToken: string; generation: number }
  | { type: "run.error"; runToken: string; generation: number; message: string; /* ... */ };
```

The worker does not default, merge, clean, migrate, or reconstruct config. A
missing or unknown property is an admission error. Recipe-owned default
construction happens when the recipe publishes its complete default artifact,
not when a browser run starts.

## Wire trace + viz correctly

Key posture:
- Trace and visualization are separate execution outputs.
- The worker should enable trace and choose a verbosity strategy for progress and structured debug
  events.
- The worker should supply a visualization facet sink when it wants portable step projections.

To align with current canon:
- Worker installs a `TraceSink` that forwards `step.start` / `step.finish` to `run.progress`.
- Worker installs `createWorkerVizFacetSink(...)` under `facets.viz`.
- A step's pure `viz` projector runs only after `run` succeeds and its providers are admitted.
- The facet sink attaches Core-owned identity, copies each exact typed-array view, materializes an
  inline layer, and posts `viz.layer.upsert` with Transferables.
- Recipe-owned style choices arrive as resolved portable colors. The worker and Studio renderer do
  not maintain a recipe palette registry.

Concrete forwarding logic (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts
if (event.kind === "step.start") post({ type: "run.progress", runToken, generation, kind: "step.start", stageId: event.stageId, stepId: event.stepId, stepIndex });
if (event.kind === "step.finish") post({ type: "run.progress", runToken, generation, kind: "step.finish", stageId: event.stageId, stepId: event.stepId, stepIndex, durationMs: event.durationMs });

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
- Canonical deck.gl visualization doc: [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Cancellation posture

Cancellation must be:
- cooperative,
- scoped to a stable token/generation identity,
- and guaranteed not to leak partial UI state updates after abort.

Current canon:
- Worker uses `AbortController`, suppresses events after abort, and emits a single `run.canceled` when unwound.
- UI should cancel stale runs when starting a new run.

## Verification

You’re wired correctly if:
- you can run `mod-swooper-maps/standard` in Studio (`nx run mapgen-studio:dev`),
- step progress updates show start/finish ordering,
- viz layers appear for steps with a `viz` projector,
- canceling a run does not “spam” progress events after cancel.

## Ground truth anchors

Use these as the “copy from / verify against” sources:

- Worker entrypoint: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Protocol types: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Worker client creation: `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`
- Worker trace sink: `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- Worker visualization facet sink: `apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts`
- Worker recipe runtime registry: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- UI bundled recipe artifacts: `apps/mapgen-studio/src/recipes/catalog.ts`
