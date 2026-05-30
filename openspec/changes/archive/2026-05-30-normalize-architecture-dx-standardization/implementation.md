## Implementation Record

### Packet Train Audit

The original architecture-normalization packet train is archived on the top
normalization stack. `bun run openspec:validate`, `bun run build`, and the
normalization guardrail lint passed before this follow-on change was created.

### Residual Repairs

- Hydrology projection evidence moved to `map-hydrology` artifact ownership and
  false map-hydrology dependencies were removed from projection contracts.
- `map-morphology` now uses flat step-id config and rejects old alias/config
  posture. Mountain/foothill strategy config moved to
  `morphology-features.mountains`.
- Mountain/foothill planning moved into Morphology truth. `map-morphology`
  consumes `artifact:morphology.mountains` and only stamps engine terrain.
- The retired combined `plan-ridges-and-foothills` op was deleted.
- The mountain shared config surface is retained as a named mountain-family
  invariant. `assertSameMountainFamilySelection` enforces identical ridge and
  foothill selections so the shared surface is one terrain-classification
  policy, not a mixed-owner tuning bucket.
- Narrative config was split to owner-local surfaces:
  `narrative/tagging/config.ts`, `narrative/orogeny/config.ts`, and
  `narrative/corridors/config.ts`. Root `narrative/config.ts` is now a
  recipe-facing aggregate facade.
- Placement product/effect work is split into explicit steps:
  natural wonders, surface preparation, resources, starts, discoveries,
  advanced starts, and final summary/evidence. The final `placement` step
  consumes product artifacts and no longer materializes product work itself.
  Shared product runtime and diagnostics live in named placement-stage helpers,
  while placement input shaping lives with the input-derivation owner and
  step-specific materialization lives with the owning product step.
- Start assignment now reports a deterministic regional/open-pool tier policy
  instead of fallback/recovery telemetry.

### Shared Surface Disposition

- Recipe-root `tags.ts` remains the named effect/tag registry because effect
  owners are cross-stage scheduling contracts.
- Recipe-root `map-artifacts.ts` remains the named map/projection artifact
  registry for cross-stage projection evidence consumed by multiple owners.
- `stages/morphology/artifacts.ts` and `stages/ecology/artifacts.ts` remain
  named domain truth contract surfaces because several stages in each domain
  publish and consume the same artifact ids; strategy schemas remain owner-local
  or in named op-family surfaces.

### Guard Evidence

- Config tests reject old `map-morphology` alias keys and reject truth-planning
  config under `map-morphology.plot-mountains`.
- Config layering tests reject divergent ridge/foothill mountain-family configs.
- Placement contract tests verify the product step sequence and final summary
  dependency.
- Placement contract tests reject sibling product-step imports from terminal
  `placement/apply.ts` and `placement/inputs.ts` owners and reject fallback telemetry in
  start-assignment source/artifacts.
- Recipe-level mountain probe now reads the produced Morphology artifact instead
  of manually calling ridge/foothill ops.

### Verification

- `bun run --cwd mods/mod-swooper-maps check` passed.
- Focused changed-area tests passed: 54 tests across config, morphology,
  placement, map-hydrology, standard-run, and story suites.
- `bun run check` passed across the repo. `lint:mapgen-docs` still reports the
  existing `@mapgen/*` documentation warnings, but the command exits cleanly.
- `bun run lint:normalization-guardrails -- --self-test` passed.
- `bun run lint:normalization-guardrails` passed.
- `bun run openspec -- validate normalize-architecture-dx-standardization --strict` passed.
- `bun run openspec:validate` passed.
- `bun run build` passed across the repo.
- `bun run deploy:mods` passed and deployed `mod-swooper-maps` to the local Civ VII Mods folder.
- `git diff --check` passed.
