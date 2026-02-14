<toc>
  <item id="purpose" title="Purpose"/>
  <item id="what-is-a-dump" title="What a dump contains"/>
  <item id="quickstart" title="Quickstart (deterministic probes)"/>
  <item id="metrics" title="Canonical metrics"/>
  <item id="ab-diff" title="A/B diff workflow"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="notes" title="Notes + footguns"/>
</toc>

# How-to: diagnose pipeline behavior with VizDumper dumps

## Purpose

Use **VizDumper dumps** (manifest + trace + binary layers) as the canonical, deterministic observability surface to answer questions like:

- “Did my config change reach the compiled plan and step configs?”
- “Did an upstream change move the landmask (or is this lever dead)?”
- “Is land coherent (continents) or speckled (salt-and-pepper)?”

This workflow is intentionally **data-first**:
- trust dump outputs first,
- treat Studio as a viewer for those outputs.

See also:
- `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`

## What a dump contains

A dump run directory contains:
- `manifest.json` — the list of emitted layers (`dataTypeKey`, stepId, format, stats, file path)
- `trace.jsonl` — step trace events (including summary events emitted by steps)
- `data/*.bin` — raw grid binaries referenced from `manifest.json`

In this repo, dumps are written under `mods/mod-swooper-maps/dist/visualization/...`.

## Quickstart (deterministic probes)

Use a fixed map size and seed so diffs are meaningful:
- width `106`, height `66`, seed `1337`

From repo root:

```bash
# baseline
bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-baseline

# variant (example: change plateCount)
bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-platecount6 --override '{"foundation":{"knobs":{"plateCount":6}}}'
```

Each run prints:

```json
{"runId":"...","outputDir":"..."}
```

## Canonical metrics

These are the first metrics to compute for landmass realism and responsiveness:

- `landComponents` (lower is more coherent land)
- `largestLandFrac` (higher is more coherent land)
- `landmaskHammingPct` (A/B sensitivity signal; detects dead knobs / non-propagation)

Compute them from the dump(s):

```bash
# analyze a single run
bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDirA>

# analyze + diff between two runs
bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDirA> <runDirB>
```

## A/B diff workflow

Use diffs to localize where the causal chain breaks:

1) Confirm the upstream layers changed (Foundation)
```bash
bun run --cwd mods/mod-swooper-maps diag:diff -- <runDirA> <runDirB> --prefix foundation.
```

2) Confirm Morphology fields changed (elevation, landmask)
```bash
bun run --cwd mods/mod-swooper-maps diag:diff -- <runDirA> <runDirB> --dataTypeKey morphology.topography.elevation
bun run --cwd mods/mod-swooper-maps diag:diff -- <runDirA> <runDirB> --dataTypeKey morphology.topography.landMask
```

3) Extract step summaries from trace (landmask, sea level, etc.)
```bash
bun run --cwd mods/mod-swooper-maps diag:trace -- <runDirA> --eventPrefix morphology.
```

If Foundation layers change but landmask doesn’t, the problem is usually one of:
- “Foundation output isn’t consumed by Morphology” (contract/wiring gap),
- “Morphology normalizes/thresholds away the difference” (algorithmic trap),
- “the knob is dead / normalized away upstream.”

## Ground truth anchors

- Dump writer / pipeline entry:
  - `mods/mod-swooper-maps/src/dev/diagnostics/run-standard-dump.ts`
- Dump analyzers:
  - `mods/mod-swooper-maps/src/dev/diagnostics/analyze-dump.ts`
  - `mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts`
  - `mods/mod-swooper-maps/src/dev/diagnostics/list-layers.ts`
  - `mods/mod-swooper-maps/src/dev/diagnostics/extract-trace.ts`
- Shared dump readers and helpers:
  - `mods/mod-swooper-maps/src/dev/diagnostics/shared.ts`
- Trace + viz observer wiring:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts`

## Notes + footguns

- Dumps include per-layer `field.stats` in `manifest.json`. These are often enough to detect degeneracy (e.g. `min == max`) without parsing the binaries.
- Use `diag:list` to enumerate layers for a run:

```bash
bun run --cwd mods/mod-swooper-maps diag:list -- <runDirA> --prefix foundation.
```

- Keep comparisons deterministic: fixed `{width,height,seed}` and one change at a time.
