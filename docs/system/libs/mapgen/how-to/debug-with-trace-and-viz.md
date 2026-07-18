<toc>
  <item id="purpose" title="Purpose"/>
  <item id="when" title="When to use"/>
  <item id="workflow-dump" title="Workflow: produce a dump (node/dev)"/>
  <item id="workflow-replay" title="Workflow: replay a dump in Studio"/>
  <item id="workflow-live" title="Workflow: live streaming in Studio (optional)"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: debug with trace and visualization (deck.gl)

## Purpose

Enable trace + viz emissions for a run so you can debug:
- step ordering and gating,
- invariants and validation failures,
- artifact/projection drift (map projection, not UI render mode),
- scalar field correctness (via dumped layers + deck.gl viewer).

Routes to:
- Observability reference: [`docs/system/libs/mapgen/reference/OBSERVABILITY.md`](/system/libs/mapgen/reference/OBSERVABILITY.md)
- Visualization reference: [`docs/system/libs/mapgen/reference/VISUALIZATION.md`](/system/libs/mapgen/reference/VISUALIZATION.md)
- Canonical viz doc (deck.gl): [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)
- Dump-first diagnosis: [`docs/system/libs/mapgen/how-to/diagnose-with-viz-dumps.md`](/system/libs/mapgen/how-to/diagnose-with-viz-dumps.md)

## When to use

- You’re adding/modifying a step/op and want proof that the pipeline is doing what you think.
- You want a persistent artifact+layer dump for review (rather than transient console logs).

## Workflow: produce a dump (node/dev)

This workflow produces a replayable folder containing:
- `trace.jsonl` (all trace events), and
- `manifest.json` + `data/*.bin` (visualization payloads).

### 1) Run a dump harness

From the repo root:

```bash
nx run mod-swooper-maps:viz:standard
```

Notes:
- Canonical deploy-equivalent builds use Nx from repo root (see `nx run mapgen-studio:dev` / `nx run mapgen-studio:build`).
- The `viz:*` scripts run a small preflight to build dist-exported workspace deps (adapter/core/viz) when needed in a fresh checkout.

The script accepts optional CLI args: `width height seed` (see code in the anchors).

### 2) Find the output folder

The harness prints the run folder:

```
[viz] wrote dump under: <repo>/mods/mod-swooper-maps/dist/visualization/<runId>
```

Notes:
- Each attempt receives a unique `runId`; the stable `planFingerprint` groups attempts of the same compiled plan.
- The folder you select in Studio must be the directory that contains `manifest.json` (not its parent).

### 3) Why layers may not appear

Trace and visualization are separate optional channels. A layer appears only when:

- the completed step owns a `viz` projector,
- the run supplies a visualization facet sink,
- and projection plus materialization succeed.

Trace verbosity affects structured trace events, not visualization. The filesystem harness supplies
both the trace sink and visualization facet sink and reports facet failures on stderr.

## Verification

- Confirm `trace.jsonl` exists under the run folder and contains `run.start`, `step.start`, `step.finish`, `run.finish`.
- Confirm `manifest.json` exists and contains at least one `layers[]` entry when viz is enabled and a step emits layers.

## Workflow: replay a dump in Studio

### 1) Start Studio

From the repo root:

```bash
nx run mapgen-studio:dev
```

### 2) Switch to Dump mode and open the folder

In the header (“World” panel), set:
- `Mode: Dump`

Then click **Run** and pick the dump folder (the folder containing `manifest.json`), or drag-and-drop the folder into the page.

### 3) Inspect layers

Use the Explore panel to:
- choose a stage + step (from the manifest),
- choose a `spaceId` (coordinate space),
- choose a data type (`dataTypeKey`), render mode (`kind[:role]`), and variant (`variantKey`) as needed.

For the full system explanation (streaming vs replay, schema, layer taxonomy), see:
- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Workflow: live streaming in Studio (optional)

If you’re iterating on worker-side visualization behavior (Transferables, upsert semantics), prefer the live Studio run and inspect `viz.layer.upsert` events.

Routing:
- Studio integration seam reference: [`docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`](/system/libs/mapgen/reference/STUDIO-INTEGRATION.md)

## Footguns

- **Disabled trace**: omit the trace capability entirely. An enabled session always requires both
  its config and sink, so partial trace wiring is not representable.
- **Verbose events are gated**: `TraceScope.event()` emits only when the step is configured as `verbose`.
- **Missing facet half**: a `viz` projector without an environment sink, or a sink without a step
  projector, intentionally produces no layer.
- **Facet failures are non-fatal**: projection and materialization errors are reported but cannot
  alter generation success; inspect stderr if a completed run is missing a layer.

## Ground truth anchors

- Trace session + sinks (console): `packages/mapgen-core/src/trace/index.ts`
- Pipeline executor wiring (trace scoping per step): `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Execution identity + stable plan fingerprint: `packages/mapgen-core/src/engine/observability.ts`
- Step facet dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Portable visualization contracts: `packages/mapgen-viz/src/index.ts`
- Local trace+viz dump harness (writes `trace.jsonl` + `manifest.json`): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Standard run harness producing dumps: `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
- Studio “Dump mode” UI + folder picker entrypoint: `apps/mapgen-studio/src/App.tsx`
- Studio mode selector (“World” → “Mode: Dump”): `packages/mapgen-studio-ui/src/components/composites/AppHeader.tsx`
