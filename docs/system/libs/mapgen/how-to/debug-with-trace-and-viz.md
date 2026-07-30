<toc>
  <item id="purpose" title="Purpose"/>
  <item id="when" title="When to use"/>
  <item id="workflow-dump" title="Workflow: produce a dump (node/dev)"/>
  <item id="workflow-replay" title="Workflow: inspect a dump"/>
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
- scalar field correctness through live deck.gl rendering or persisted diagnostic layers.

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
nx run swooper-physics:diag:dump -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed 7331 --players 0,1,2,3,4,5,6,7
```

Notes:
- Canonical deploy-equivalent builds use Nx from repo root (see `nx run mapgen-studio:dev` / `nx run mapgen-studio:build`).
- Nx owns the runner's workspace dependency build through `diag:dump`.
- `--map-size` accepts an official Civ7 map-size id and defaults to
  `MAPSIZE_STANDARD`; `--map-seed`, `--game-seed`, and the ordered `--players`
  list are required. For a negative signed seed, use `--map-seed=-1337` or
  `--game-seed=-7331`.

### 2) Find the output folder

The harness prints the run identity and folder:

```json
{"runId":"...","outputDir":"<repo>/plugins/mod/map/swooper-physics/dist/visualization/<label>/<runId>"}
```

Notes:
- Each attempt receives a unique `runId`; the stable `planFingerprint` groups attempts of the same compiled plan.
- Pass the directory containing `manifest.json` to the diagnostic commands (not its parent).

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

## Workflow: inspect a dump

Use the Swooper commands, backed by `@swooper/mapgen-diagnostics`, against the run directory:

```bash
nx run swooper-physics:diag:list -- <runDir> --prefix hydrology.
nx run swooper-physics:diag:trace -- <runDir> --event-prefix hydrology.
```

Studio's Explore panel is the live deck.gl viewer. It consumes worker emissions and does not load
path-backed dump folders.

For the full system explanation (streaming vs replay, schema, layer taxonomy), see:
- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Workflow: live streaming in Studio (optional)

If you’re iterating on worker-side visualization behavior (Transferables, upsert semantics), prefer the live Studio run and inspect `viz.layer.upsert` events.

Routing:
- Studio integration seam reference: [`docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`](/system/libs/mapgen/reference/STUDIO-INTEGRATION.md)

## Footguns

- **Disabled trace**: omit the trace capability entirely. An enabled session always requires both
  its config and sink, so partial trace wiring is not representable.
- **Verbose events are gated**: `context.trace.event(() => data)` evaluates and emits only when the
  active step is configured as `verbose`. The executor owns step identity, selection, and lifecycle;
  a captured step trace becomes inert when that invocation ends.
- **Missing facet half**: a `viz` projector without an environment sink, or a sink without a step
  projector, intentionally produces no layer.
- **Facet failures are non-fatal**: projection and materialization errors are reported but cannot
  alter generation success; inspect stderr if a completed run is missing a layer.

## Ground truth anchors

- Public trace event contracts and sinks: `packages/mapgen-core/src/trace/index.ts`
- Executor-owned trace session lifecycle: `packages/mapgen-core/src/trace/session.ts`
- Pipeline executor wiring (trace scoping per step): `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Execution identity + stable plan fingerprint: `packages/mapgen-core/src/engine/observability.ts`
- Step facet dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Portable visualization contracts: `packages/mapgen-viz/src/index.ts`
- Local trace+viz dump capability (writes `trace.jsonl` + `manifest.json`): `packages/mapgen-diagnostics/src/dump.ts`
- Standard capture runner: `plugins/mod/map/swooper-physics/scripts/diagnostics/run-standard-dump.ts`
- Studio live visualization entrypoint: `apps/mapgen-studio/src/App.tsx`
