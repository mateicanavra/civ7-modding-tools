## Why

The deployed Swooper Earthlike map can show dry basin and cliff/shore artifacts after a clean MapGeneration run. Current code builds engine elevation before projected lakes are stamped, then tries to restore water classification drift after `TerrainBuilder.buildElevation()`. That order diverges from Firaxis' standard map scripts, where lakes exist before elevation is built and rivers are modeled after elevation.

This is a materialization-order bug, not a lake-density-only tuning problem. The engine elevation pass must see the final static water surface it is shaping.

## What Changes

- Make the standard recipe encode the engine terrain materialization sequence categorically:
  terrain/coasts/mountains/volcanoes -> lakes/static water -> elevation -> rivers.
- Keep Hydrology lake truth upstream; map projection only stamps and records readback.
- Keep engine elevation projection with its rightful map projection owner, but do not let it run before static water projection.
- Add a guard that fails if future stage/step ordering puts `buildElevation` before lake projection or river modeling before elevation.
- Update shipped map configs, docs, and implementation evidence to match the new stage/step surface.

## Non-Goals

- Do not reintroduce `adapter.generateLakes(...)`.
- Do not add compatibility aliases or fallback stage keys.
- Do not move Hydrology truth planning into map projection stages.
- Do not hand-edit generated mod output.
