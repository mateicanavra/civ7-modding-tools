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
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`

## When to use this pattern

Use this pattern if you are:
- adding a new Studio-like app that runs MapGen in the browser,
- refactoring the existing runner,
- or adding worker-side observability features.

Do not use this pattern for:
- Node/headless runs (use a Node runner harness; see standard recipe tooling).

## Minimal shape of the integration

Studio’s working shape (today) is:

1) UI selects `recipeId` + run inputs (seed/dims/lat bounds) and collects `configOverrides`.
2) UI creates a dedicated worker (module worker) and posts a `run.start`.
3) Worker:
   - merges + validates overrides against schema,
   - compiles plan,
   - derives `runId` (and `planFingerprint`; current implementation uses the same value),
   - runs the recipe with trace + viz enabled,
   - posts progress and viz upsert events.
4) UI renders:
   - step progress from `run.progress` events,
   - deck.gl visualization from `viz.layer.upsert` events.

Concrete worker skeleton (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/pipeline.worker.ts
const plan = recipeEntry.recipe.compile(envBase, config);
const runId = deriveRunId(plan);
const verboseSteps = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));

const env = {
  ...envBase,
  trace: { enabled: true, steps: verboseSteps },
};

const context = createExtendedMapContext(dimensions, adapter, env);
context.viz = createWorkerVizDumper();

const traceSink = createWorkerTraceSink({ runToken, generation, post, abortSignal });
post({ type: "run.started", runToken, generation, runId, planFingerprint: runId });

await recipeEntry.recipe.runAsync(context, env, config, { traceSink, abortSignal, yieldToEventLoop: true });
```

## Use the protocol boundary

Keep the boundary narrow and stable:
- `BrowserRunRequest` (`run.start` / `run.cancel`)
- `BrowserRunEvent` (`run.started`, `run.progress`, `viz.layer.upsert`, `run.finished`, `run.canceled`, `run.error`)

Avoid coupling UI engine code to any specific recipe config type:
- treat `configOverrides` as `unknown` at the boundary.

Concrete protocol shape (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/protocol.ts
export type BrowserRunRequest =
  | { type: "run.start"; runToken: string; generation: number; recipeId: string; seed: number; configOverrides?: unknown; /* ... */ }
  | { type: "run.cancel"; runToken: string; generation: number };

export type BrowserRunEvent =
  | { type: "run.started"; runToken: string; generation: number; runId: string; planFingerprint: string }
  | { type: "run.progress"; runToken: string; generation: number; kind: "step.start" | "step.finish"; stepId: string; stepIndex: number; /* ... */ }
  | { type: "viz.layer.upsert"; runToken: string; generation: number; layer: VizLayerEntryV1 }
  | { type: "run.finished"; runToken: string; generation: number }
  | { type: "run.canceled"; runToken: string; generation: number }
  | { type: "run.error"; runToken: string; generation: number; message: string; /* ... */ };
```

## Wire trace + viz correctly

Key posture:
- Visualization in Studio is emitted via `context.viz` and forwarded as a trace “step event”.
- The worker should set trace **enabled** and choose a verbosity strategy (Studio currently forces all steps verbose).

To align with current canon:
- Worker installs `context.viz = createWorkerVizDumper()`.
- Worker installs a `TraceSink` that forwards:
  - `step.start` / `step.finish` → `run.progress`
  - `viz.layer.emit.v1` → `viz.layer.upsert` (with Transferables).

Concrete forwarding logic (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts
if (event.kind === "step.start" && event.stepId) post({ type: "run.progress", runToken, generation, kind: "step.start", stepId: event.stepId, phase: event.phase, stepIndex });
if (event.kind === "step.finish" && event.stepId) post({ type: "run.progress", runToken, generation, kind: "step.finish", stepId: event.stepId, phase: event.phase, stepIndex, durationMs: event.durationMs });

// Viz layers: trace step.event payload → UI upsert (Transferables)
if (event.kind === "step.event" && isPlainObject(event.data) && event.data.type === "viz.layer.emit.v1") {
  const layer: VizLayerEntryV1 = { ...(event.data as any).layer, stepIndex };
  post({ type: "viz.layer.upsert", runToken, generation, layer }, collectTransferables(layer));
}
```

Concrete emission logic (excerpt):

```ts
// apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts
const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
  if (!trace.isVerbose) return;
  trace.event(() => ({
    type: "viz.layer.emit.v1",
    layer: {
      kind: "grid",
      layerKey: createVizLayerKey({ stepId: trace.stepId, dataTypeKey: layer.dataTypeKey, spaceId: layer.spaceId, kind: "grid", role: layer.meta?.role, variantKey: layer.variantKey }),
      field: { /* inline buffer */ },
      /* ... */
    },
  }));
};
```

Routing:
- Canonical deck.gl visualization doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

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
- you can run `mod-swooper-maps/standard` in Studio (`bun run dev:mapgen-studio`),
- step progress updates show start/finish ordering,
- viz layers appear when steps emit `context.viz?.dumpGrid(...)` (or other viz methods),
- canceling a run does not “spam” progress events after cancel.

## Ground truth anchors

Use these as the “copy from / verify against” sources:

- Worker entrypoint: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Protocol types: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Worker client creation: `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`
- Worker trace sink: `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- Worker viz dumper: `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- Worker recipe runtime registry: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- UI bundled recipe artifacts: `apps/mapgen-studio/src/recipes/catalog.ts`
