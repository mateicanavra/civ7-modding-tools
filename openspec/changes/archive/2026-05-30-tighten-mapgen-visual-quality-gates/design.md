# Design: Tighten MapGen Visual Quality Gates

## Frame

The failure is not "too many lake tiles" alone. It is visual distribution:
many isolated engine-accepted lakes read as artifacts even when total lake
share stays below a coarse threshold. The right test oracle is therefore
connected-component shape over the engine lake projection mask.

## Decisions

### Lake Policy

Hydrology still owns lake truth. `lakeiness` remains a semantic Hydrology knob,
but each level now admits only a small high-discharge terminal-basin set and
expands one upstream hop. This keeps the visible feature connected to drainage
structure without calling Civ7 lake generation.

### Visual Metrics

The world-balance helper reads:

- Hydrology lake plan for truth count/share.
- Map-hydrology engine projection readback for visible lake components.
- Adapter water state for water-fill drift.

The helper uses odd-row hex adjacency because stage visualizations and player
map tiles are hexes; square-grid component math would misclassify diagonal-ish
hex neighbors.

### Strategy Selection

Not every `default` strategy is old. Several current advanced implementations
are registered as `default`. This slice changes only selections where a named
current strategy is available and better matches the map identity:

- Earthlike pedology uses `coastal-shelf`.
- Desert mountains uses `earthlike` ocean coupling and `mixed` resource basins.
- Shattered ring uses `mixed` resource basins and `continentality` ice planning.
- Sundered archipelago uses `continentality` ice planning.

### Sea Level

The suspicious Earthlike `boundaryShareTarget` value was tested and retained.
Raising it to normal-looking values moved the sample from Earthlike water
coverage to archipelago-level water coverage, so it is not changed in this
slice. If sea-level target semantics need cleanup, that is a dedicated slice.

## Review Lanes

- Product: rejects the screenshot class of circular lake scatter.
- Architecture: no shared buckets, no adapter shortcuts, no step bypass.
- DX/testing: tests name the observable geography properties they guard.
- Runtime: FireTuner and bounded Civ7 logs can prove a deployed map restarts and
  completes MapGeneration, but they do not replace source tests or world-balance
  metrics.
