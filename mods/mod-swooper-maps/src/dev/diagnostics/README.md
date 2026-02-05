# Diagnostics toolkit (dump‑first)

This folder contains **data‑first** scripts for diagnosing pipeline behavior using **VizDumper** dumps (manifest + trace + binary layers).

The goal is to make it easy to answer questions like:

- “Does this config change actually propagate into the runtime plan?”
- “Does this upstream change move the landmask?”
- “Are we producing coherent continents or salt‑and‑pepper land?”

## Key scripts

- `run-standard-dump.ts` — run the full standard pipeline deterministically and write dumps under `dist/visualization/<label>/<runId>/...`.
- `analyze-dump.ts` — compute land coherence metrics (components + largest component fraction) for all emitted `morphology.topography.landMask` layers, plus optional A/B diffs.
- `list-layers.ts` — enumerate layers + paths from a run’s `manifest.json`.
- `diff-layers.ts` — compute binary diffs for `u8`/`i16` grid layers between two runs.
- `extract-trace.ts` — extract trace “summary” events from `trace.jsonl`.

## Recommended deterministic probe

Use a fixed map size + seed so diffs are meaningful:

- width `106`, height `66`, seed `1337`

Example:

```bash
# baseline
bun run diag:dump -- 106 66 1337 --label probe-baseline

# variant
bun run diag:dump -- 106 66 1337 --label probe-platecount6 --override '{\"foundation\":{\"knobs\":{\"plateCount\":6}}}'

# analyze / diff
bun run diag:analyze -- dist/visualization/probe-baseline/<runId> dist/visualization/probe-platecount6/<runId>
```

## Notes

- These scripts are intended to be **observability tooling**; they should not modify recipe behavior.
- Dumps are written under `dist/`, which is ignored by git.

