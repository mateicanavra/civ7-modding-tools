<toc>
  <item id="purpose" title="Purpose"/>
  <item id="when" title="When to use"/>
  <item id="checklist" title="Checklist"/>
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

## Checklist

### 1) Turn on tracing with a real sink

Trace events are emitted only when:
- tracing is enabled, and
- a sink is configured (otherwise it’s a noop session).

Start with a sink that writes `trace.jsonl` and a viz manifest for deck.gl consumption.

### 2) Set verbose level on the steps you care about

Trace supports per-step levels:
- `basic`: step start/finish
- `verbose`: includes `step.event` payloads (structured debug data)

### 3) Attach a `VizDumper` to the context

Steps emit layers by calling `context.viz?.dumpGrid(context.trace, { ... })` (and related methods).

### 4) Run the recipe and locate the run output

The `runId` is derived from the plan fingerprint (current implementation uses the same value) and deterministically maps to a dump folder.

## Verification

- Confirm `trace.jsonl` exists under the run folder and contains `run.start`, `step.start`, `step.finish`, `run.finish`.
- Confirm `manifest.json` exists and contains at least one `layers[]` entry when viz is enabled and a step emits layers.
- Open the deck.gl viewer workflow documented here:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Footguns

- **Tracing “enabled” but no sink**: tracing becomes a noop (you won’t see events).
- **Verbose events are gated**: `TraceScope.event()` emits only when the step is configured as `verbose`.
- **Viz without trace**: viz emissions ride on trace `step.event` payloads; if you disable tracing, you suppress viz dumps.

## Ground truth anchors

- Trace session + sinks (console): `packages/mapgen-core/src/trace/index.ts`
- Pipeline executor wiring (trace scoping per step): `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Viz dumper interface + artifact notes: `packages/mapgen-core/src/core/types.ts`
- Local trace+viz dump harness (writes `trace.jsonl` + `manifest.json`): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Example run harness producing dumps: `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts`
