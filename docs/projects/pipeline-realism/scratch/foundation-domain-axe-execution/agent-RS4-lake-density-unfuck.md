# Agent RS4 — Lakes density correction (too many lakes)

## Mission
Reduce excessive lake count/density in current runtime behavior while preserving hydrology consistency.

## Scope
- Worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack
- Branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
- Scratch (append-only): /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RS4-lake-density-unfuck.md

## Objective details
Address user-reported overproduction of lakes (not just crash). Focus on hydrology lake planning/config defaults/preset interaction.

## Suggested investigation points
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/**
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/presets/standard/earthlike.json
- related hydrology knobs and tests.

## Deliverable
- Root cause of over-laking
- Minimal fix (algorithm/config/threshold) with rationale
- Verification with relevant hydrology/lakes tests
- Clear note on expected impact/tradeoff

## Constraints
- No rebase/reset.
- Keep changes targeted.
- Absolute paths in notes/evidence.

## Proposed target
Lake generation looks materially less over-dense while preserving deterministic hydrology behavior.

## Changes landed
- Pending.

## Open risks
- Pending.

## Decision asks
- none

## Execution log (2026-02-15)

### Root-cause evidence
- Engine-side baseline shows `generateLakes(iWidth, iHeight, iTilesPerLake)` computes `ilakePlotRand = floor((iWidth * iHeight) / iTilesPerLake)` and adds a lake when RNG hits 0:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js:98`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js:101`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js:109`
- Implication: larger `iTilesPerLake` yields **higher** lake-seed probability (denominator shrinks), so increasing this value increases lake density.
- Current mod runtime path was doubling map frequency (`* 2`), inflating lake seeding:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts` (before patch).

### Targeted correction
- Removed the unconditional `* 2` multiplier and now uses map-provided frequency directly:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`
- Added a guard test that pins standard frequency behavior (`LakeGenerationFrequency=25 -> tilesPerLake=25`):
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/test/map-hydrology/lakes-store-water-data.test.ts`

### Measurement before/after
- Probe script using the map-hydrology lakes step + mock adapter call capture:
  - Before patch: `{ "withFreq25": 50, "missingFreq": 10 }`
  - After patch: `{ "withFreq25": 25, "missingFreq": 10 }`
- Interpretation: standard-map lake seeding parameter is halved (expected material density reduction in runtime).

### Verification run
- `bun test mods/mod-swooper-maps/test/map-hydrology/lakes-store-water-data.test.ts mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts`
- Result: `4 pass, 0 fail`.

### Scope notes
- `plan-lakes` deterministic op paths are not currently active in this branch (`plan-lakes` under mod hydrology ops only has contract stub), so the over-density regression was corrected in the active `map-hydrology/lakes` runtime projection path.
