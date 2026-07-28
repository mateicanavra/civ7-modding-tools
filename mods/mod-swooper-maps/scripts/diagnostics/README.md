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

Use one official Civ7 map-size preset and fixed map/game seeds so diffs are meaningful. The runner
defaults only the map size to `MAPSIZE_STANDARD`; map seed, game seed, and the ordered alive-player
ids are required evidence inputs. Custom dimensions are intentionally not part of this command.

Example:

```bash
# baseline
nx run mod-swooper-maps:diag:dump -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed 7331 --players 0,1,2,3,4,5,6,7 --label probe-baseline

# variant
nx run mod-swooper-maps:diag:dump -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed 7331 --players 0,1,2,3,4,5,6,7 --label probe-platecount6 --override '{"foundation-lithosphere":{"plate-graph":{"computePlateGraph":{"config":{"plateCount":6}}}}}'

# inspect / diff
nx run mod-swooper-maps:diag:list -- dist/visualization/probe-baseline/<runId>
nx run mod-swooper-maps:diag:diff -- dist/visualization/probe-baseline/<runId> dist/visualization/probe-platecount6/<runId>
```

## Notes

- These scripts are intended to be **observability tooling**; they should not modify recipe behavior.
- Dumps are written under `dist/`, which is ignored by git.
- The selected Civ7 preset owns dimensions, engine map info, and start-slot capacity;
  `--players` supplies the exact ordered alive-major player ids. The admitted map configuration
  owns the recipe's north-to-south latitude bounds.
- Negative seeds use Node's unambiguous inline form, such as `--game-seed=-1337`. An alternate
  base configuration uses `--config-file`; inline `--override` remains the only override input.
- Layer and trace filters are `--data-type-key`, `--event-kind`, and `--event-prefix`.
- Product thresholds and cohort expectations belong to the Standard recipe metric study bank and
  run through `nx run mod-swooper-maps:metrics:report`, not through a second dump analyzer.
