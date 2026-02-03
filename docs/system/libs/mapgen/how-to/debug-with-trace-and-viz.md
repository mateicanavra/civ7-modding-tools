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
- artifact/projection drift,
- scalar field correctness (via dumped layers + deck.gl viewer).

Routes to:
- Observability reference: `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- Visualization reference: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Canonical viz doc (deck.gl): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

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
bun run --cwd mods/mod-swooper-maps viz:foundation
```

or:

```bash
bun run --cwd mods/mod-swooper-maps viz:standard
```

Notes:
- Canonical deploy-equivalent builds use Turbo from repo root (see `bun run dev:mapgen-studio` / `bunx turbo run build --filter=mapgen-studio`).
- The `viz:*` scripts run a small preflight to build dist-exported workspace deps (adapter/core/viz) when needed in a fresh checkout.

Both scripts accept optional CLI args: `width height seed` (see code in the anchors).

### 2) Find the output folder

The harness prints the run folder:

```
[viz] wrote dump under: <repo>/mods/mod-swooper-maps/dist/visualization/<runId>
```

Notes:
- Current implementation: `runId === planFingerprint` (see `packages/mapgen-core/src/engine/observability.ts`).
- The folder you select in Studio must be the directory that contains `manifest.json` (not its parent).

### 3) Why layers may not appear

Visualization layers in this repo are emitted via trace `step.event` payloads:
- `TraceScope.event(...)` is gated by `verbose`.
- The node dumper (`createVizDumper`) returns early unless `trace.isVerbose` and `trace.runId` are set.

So:
- You can get `trace.jsonl` without layers (basic trace only),
- but you cannot get visualization layers unless the relevant steps are `verbose`.

## Verification

- Confirm `trace.jsonl` exists under the run folder and contains `run.start`, `step.start`, `step.finish`, `run.finish`.
- Confirm `manifest.json` exists and contains at least one `layers[]` entry when viz is enabled and a step emits layers.

## Workflow: replay a dump in Studio

### 1) Start Studio

From the repo root:

```bash
bun run dev:mapgen-studio
```

### 2) Switch to Dump mode and open the folder

In the header (“World” panel), set:
- `Mode: Dump`

Then click **Run** and pick the dump folder (the folder containing `manifest.json`), or drag-and-drop the folder into the page.

### 3) Inspect layers

Use the Explore panel to:
- choose a stage + step (from the manifest),
- choose a `spaceId` (coordinate space),
- choose a layer and render variant.

For the full system explanation (streaming vs replay, schema, layer taxonomy), see:
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Workflow: live streaming in Studio (optional)

If you’re iterating on worker-side visualization behavior (Transferables, upsert semantics), prefer the live Studio run and inspect `viz.layer.upsert` events.

Routing:
- Studio integration seam reference: `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`

## Footguns

- **Tracing “enabled” but no sink**: tracing becomes a noop (you won’t see events).
- **Verbose events are gated**: `TraceScope.event()` emits only when the step is configured as `verbose`.
- **Viz without verbose trace**: the canonical dumpers are gated behind `trace.isVerbose`; if you don’t mark steps verbose, you’ll see no `manifest.layers`.

## Ground truth anchors

- Trace session + sinks (console): `packages/mapgen-core/src/trace/index.ts`
- Pipeline executor wiring (trace scoping per step): `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Run identity + fingerprint (`runId === planFingerprint` current): `packages/mapgen-core/src/engine/observability.ts`
- Viz dumper interface + artifact notes: `packages/mapgen-core/src/core/types.ts`
- Local trace+viz dump harness (writes `trace.jsonl` + `manifest.json`): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Example run harness producing dumps: `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts`
- Example standard run harness producing dumps: `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
- Studio “Dump mode” UI + folder picker entrypoint: `apps/mapgen-studio/src/App.tsx`
- Studio mode selector (“World” → “Mode: Dump”): `apps/mapgen-studio/src/ui/components/AppHeader.tsx`
