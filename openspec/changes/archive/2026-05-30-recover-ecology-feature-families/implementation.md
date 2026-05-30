## Implementation Record

Vegetation family recovery is implemented at the owning Ecology boundaries:

- taiga and sagebrush score rules now treat cold and dry conditions as habitat
  identity signals instead of applying the same stress twice;
- the vegetation planner exposes per-feature admission thresholds for forest,
  rainforest, taiga, savanna woodland, and sagebrush steppe;
- shipped map configs and presets use the current feature-family planner
  contract with map-identity-specific values;
- score-to-intent behavior remains deterministic and owner-local, with no
  generic feature router, fallback lane, or shared policy bucket.

The quality-gate slice then extended public recipe/runtime stats to prove the
feature families remain visible across shipped maps and seeds. That gate found
one upstream eligibility issue: Ecology feature scoring was using Morphology's
pre-lake land mask, allowing land vegetation to be planned on tiles later
materialized as lakes. `ecology-features/score-layers` now derives its land
eligibility from Morphology land minus Hydrology lake truth while reefs keep
using the water/coast surface they actually inhabit.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/vegetation-atomic-op.test.ts test/ecology/feature-planner-policies.test.ts test/ecology/feature-habitat-eligibility.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/placement/placement-lake-readback.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts test/config/shipped-map-identity.test.ts test/ecology/earthlike-balance-smoke.test.ts test/pipeline/earth-metrics.test.ts test/pipeline/seed-matrix-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate recover-ecology-feature-families --strict`
- `bun run openspec:validate`
- `bun run build`
- `bun run --cwd mods/mod-swooper-maps deploy`
- `git diff --check`

## Runtime Proof

Deployed map file:

- `2026-05-30 14:34:51 -0400 /Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`

Fresh Civ7 map roll after the deploy:

- `Scripting.log` mtime: `2026-05-30 14:48:08 -0400`.
- MapGeneration context created at `2026-05-30 14:48:06`.
- The run reached `[26/50] ok mod-swooper-maps.standard.ecology-features.score-layers`.
- The run reached `[30/50] ok mod-swooper-maps.standard.ecology-features.plan-vegetation`.
- The run reached `[40/50] ok mod-swooper-maps.standard.map-ecology.features-apply`.
- The run reached `[50/50] ok mod-swooper-maps.standard.placement.placement`.
- The run ended with `Destroying Context -  MapGeneration`.

Bounded sibling-log review after the deploy found no Swooper MapGeneration
failure, `TextEncoder`, uncaught exception, or ecology-feature runtime
exception. The remaining log noise in the same window is base/DLC/UI/online
service noise outside this mod path, including another mod's UI import error.
