## Implementation Evidence

Implemented on active Graphite branch `codex/restore-mapgen-world-balance`.

Hydrology lake intent now uses terminal-basin admission:

- `plan-lakes` input includes `discharge`.
- Default strategy admits positive land sinks by discharge percentile and a
  lakeiness-owned maximum lake-land fraction.
- Lakeiness compiles to `HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY`.
- `hydrology-hydrography/lakes` passes Hydrography discharge to the op.

Ecology feature density now uses family-local policy config:

- Reef, wetland, vegetation, and ice planner contracts expose
  `minConfidence01`.
- Reef planners also expose deterministic `stride` for sparse patch/bank
  features.
- Policy functions remain in each planner family `policies/` directory.
- No generic `features-plan-shared`, `score-shared` admission, fallback, or
  router machinery was introduced.

Cold reefs are repaired against current world tensors:

- Cold reef depth defaults now target the deeper available offshore bathymetry
  proxy.
- The scorer uses distance-to-coast bounds rather than depending only on the
  shallow projection shelf mask.
- Comments document the proxy tradeoff so future changes do not mistake the
  numbers for literal ocean meters.

Configs were updated:

- `swooper-earthlike.config.json`
- `presets/standard/earthlike.json`
- `realism/earthlike.config.ts`
- `shattered-ring.config.ts`
- `sundered-archipelago.config.ts`
- `swooper-desert-mountains.config.ts`

Hydrology artifact validation disposition:

- The live source TODO was removed.
- Validation was not deleted: artifact publication still benefits from runtime
  typed-array/size checks.
- Validators now live with the producing steps:
  `hydrology-climate-baseline/steps/climateBaseline.validation.ts` and
  `hydrology-hydrography/steps/rivers.validation.ts`.
- The stage `artifacts.ts` files remain the current schema/contract registries.
  This branch does not introduce a new generic artifact architecture; a future
  `artifacts/<name>.artifact.ts` model would need its own categorical OpenSpec
  slice across all in-kind stage artifacts.
- The broad `stages/hydrology/artifact-validation.ts` helper was removed because
  it inverted the desired ownership model.

Source comment disposition:

- The vegetation policy TODO/review note was removed.
- The remaining policy comment explains product behavior: weak vegetation
  scores can mean grassland/climate potential and should not create visible
  forest-like cover.

Sea-level disposition:

- Read-only scout found official schema/UI text for sea level, but no active
  setup parameter, official map-script usage, or adapter sea-level API.
- Fractal/Continents still use script water-percent constants and terrain/water
  refresh flows.
- No dedicated engine-sea-level OpenSpec change is warranted on current
  evidence.

## Current Test Evidence

Fresh evidence after the step-local validation-owner correction:

- Focused world/stat/config bundle passed from the active worktree:
  `bun run --cwd mods/mod-swooper-maps test -- test/hydrology/plan-lakes.test.ts test/hydrology-knobs.test.ts test/ecology/feature-planner-policies.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/ecology/earthlike-balance-smoke.test.ts test/pipeline/seed-matrix-stats.test.ts test/pipeline/earth-metrics.test.ts test/pipeline/world-balance-stats.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/lakes-store-water-data.test.ts`
  passed: 25 tests, 128 assertions.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run openspec -- validate restore-mapgen-world-balance-proofs --strict`
  passed.
- `bun run openspec:validate` passed: 7 passed, 0 failed.
- `git diff --check` passed.
- `bun run build` passed across the full Turbo workspace: 16 successful tasks.
- `bun run --cwd mods/mod-swooper-maps deploy` passed and deployed the mod to
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps`.

Current deploy/log status:

- Deployed map output:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`
  mtime `2026-05-30 02:52:08`.
- Fresh `Scripting.log` mtime is `2026-05-30 02:52:33`, after the latest deploy.
- The fresh in-game run reached
  `[50/50] ok mod-swooper-maps.standard.placement.placement` at
  `2026-05-30 02:52:33`, followed by `Destroying Context - MapGeneration`.
- No TextEncoder/encoder-shim failure is present in the observed fresh run.

## Closure Disposition

All planned verification gates for this change have current-tree evidence. The
remaining submit requirement is source-control hygiene: do not commit watcher
control notes, and keep the active worktree/root checkout clean after Graphite
commit/submit.
