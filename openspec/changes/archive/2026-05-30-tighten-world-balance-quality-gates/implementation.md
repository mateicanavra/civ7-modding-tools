## Implementation Record

The shared world-balance stats collector now reports:

- final lake water/classification drift from placement surface preparation;
- invalid feature-surface counts for land vegetation/wetlands and water reef features;
- vegetation-family tile share and feature-family presence;
- broad feature habitat mismatch counts from published biome classification fields.

The first use of the invalid-surface metric found a real upstream issue: Ecology feature scoring consumed Morphology's pre-lake land mask, so vegetation could be planned on tiles later materialized as Hydrology lakes. The score-layers step now derives an Ecology land mask from Morphology land minus Hydrology lake truth. This keeps lake ownership in Hydrology while giving Ecology the correct post-lake eligibility surface for land features.

Shipped map tests now cover map identities at the public standard recipe/runtime boundary, including lake drift, feature-surface validity, habitat mismatch counts, vegetation-family visibility, and broad density budgets. A config identity test also rejects stale single-threshold vegetation planner config and verifies shipped explicit map configs use current feature-family planner strategies.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts test/config/shipped-map-identity.test.ts test/ecology/earthlike-balance-smoke.test.ts test/pipeline/earth-metrics.test.ts test/pipeline/seed-matrix-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/vegetation-atomic-op.test.ts test/ecology/feature-planner-policies.test.ts test/ecology/feature-habitat-eligibility.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/placement/placement-lake-readback.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate tighten-world-balance-quality-gates --strict`
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
failure, `TextEncoder`, uncaught exception, or world-balance runtime exception.
The remaining log noise in the same window is base/DLC/UI/online-service noise
outside this mod path, including another mod's UI import error.
