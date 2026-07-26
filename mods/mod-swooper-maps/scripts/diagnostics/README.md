# Diagnostics toolkit (dump-first)

This folder contains Swooper's **data-first** commands, Standard runner, and product reports for
diagnosing pipeline behavior from execution-owned step visualization projections. Reusable
path-backed capture, evidence reads, inventory, and neutral diffing live in
`@swooper/mapgen-diagnostics`.

The goal is to make it easy to answer questions like:

- “Does this config change actually propagate into the runtime plan?”
- “Does this upstream change move the landmask?”
- “Are we producing coherent continents or salt‑and‑pepper land?”

## Key scripts

- `run-standard-dump.ts` — run the full standard pipeline deterministically and write dumps under `dist/visualization/<label>/<runId>/...`.
- `list-layers.ts` — enumerate layers + paths from a run's `manifest.json`.
- `diff-layers.ts` — compute binary diffs for `u8`/`i16`/`f32` grid layers between two runs.
- `extract-trace.ts` — extract trace summary events from `trace.jsonl`.

## Recommended deterministic probe

Use one official Civ7 map-size preset and a fixed seed so diffs are meaningful. The runner defaults
to `MAPSIZE_STANDARD` and seed `1337`; custom dimensions are intentionally not part of this command.

Example:

```bash
# baseline
nx run mod-swooper-maps:diag:dump -- --map-size MAPSIZE_STANDARD --seed 1337 --label probe-baseline

# variant
nx run mod-swooper-maps:diag:dump -- --map-size MAPSIZE_STANDARD --seed 1337 --label probe-platecount6 --override '{\"foundation\":{\"knobs\":{\"plateCount\":6}}}'

# inspect / diff
nx run mod-swooper-maps:diag:list -- dist/visualization/probe-baseline/<runId>
nx run mod-swooper-maps:diag:diff -- dist/visualization/probe-baseline/<runId> dist/visualization/probe-platecount6/<runId>
```

## Notes

- These scripts are intended to be **observability tooling**; they should not modify recipe behavior.
- Dumps are written under `dist/`, which is ignored by git.
- The selected Civ7 preset owns dimensions, engine map info, and player count; the admitted map
  configuration owns the recipe's north-to-south latitude bounds.
- Product thresholds and cohort expectations belong to the Standard recipe metric study bank and
  run through `nx run mod-swooper-maps:metrics:report`, not through a second dump analyzer.
