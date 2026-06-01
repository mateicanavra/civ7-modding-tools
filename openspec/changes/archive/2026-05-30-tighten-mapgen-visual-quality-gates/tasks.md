# Tasks

## 1. Lake Policy

- [x] Tighten Hydrology lakeiness budgets so `normal` and `few` do not produce singleton lake scatter.
- [x] Preserve Hydrology ownership of lake truth and map-hydrology ownership of engine projection readback.
- [x] Update hydrology knob tests for the new policy semantics.

## 2. Visual Quality Proofs

- [x] Add lake connected-component metrics to shipped-map world-balance stats.
- [x] Add engine lake water-drift and projection-mismatch metrics.
- [x] Assert shipped maps do not regress into single-tile lake scatter.

## 3. Config Strategy Alignment

- [x] Audit shipped configs for older/simple selections where named current strategies exist.
- [x] Update Earthlike, desert mountains, shattered ring, and sundered archipelago configs/presets where appropriate.
- [x] Preserve Earthlike sea-level target behavior after proving the suspicious boundary target is load-bearing.

## 4. Verification

- [x] Run focused hydrology/config/world-balance gates.
- [x] Run full focused world/stat bundle.
- [x] Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] Run OpenSpec validation.
- [x] Run `git diff --check`.
- [x] Run repo build and deploy mod.
- [x] Inspect fresh post-deploy Civ7 `Scripting.log` MapGeneration run.
