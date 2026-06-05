# Systematic Workstream Record: Studio And Civ7 Map Parity

## Frame

- Objective: make the Swooper Earthlike pipeline produce the exact map surfaces
  Civ7 loads for the same seed, map size, config hash, deployed branch, and
  runtime setup, then make MapGen Studio preview those surfaces mechanically.
- Future state: Studio can show local predicted output, live Civ7 readback, and
  a categorical parity delta for terrain/elevation/water, rivers, biomes,
  features, resources, starts, and coordinate projection. Deltas are either
  burned down in source or explicitly labeled as engine-controlled blockers with
  a named control strategy.
- Non-goals: do not retune landmasses, mountains, ecology, or resources as a
  substitute for parity proof. Do not hand-edit generated or deployed output.
  Do not silently make Studio display a prettier but less truthful surface.
- Hard core: pipeline truth and engine projection are separate. Domain stages
  author deterministic truth artifacts; `map-*`/placement stages materialize
  those artifacts into Civ7 state and record readback. Studio must not invent a
  separate coordinate space or adapter behavior.
- Exterior: broad UX redesign, map-balance tuning, unrelated mod UI errors,
  and non-Swooper maps unless a shared adapter/core contract is touched.
- Falsifier: if two bounded runs with the same seed/size/config/deployed commit
  show unexplained tile deltas after local artifact, generated bundle, deployed
  script, live readback, and Studio projection are all bound to one request id,
  the current diagnosis is incomplete and must return to Gate 3.
- Redesign trigger: if exact parity requires predicting hidden Firaxis engine
  mutation that cannot be observed or configured, redesign the boundary so our
  pipeline owns that final surface and the engine becomes a materializer plus
  legality checker, not a generator.

## Status

- Last updated: 2026-06-05
- Current gate: Gate 8, implement first parity-control slice.
- Next gate: Gate 9/10, rerun local stats and fresh runtime proof after deploy.
- Blocked by: no fundamental blocker known; current known gaps are mostly
  adapter/mock parity and engine materialization side effects. The first
  diagnosed categorical bug is authored pipeline RNG flowing through
  `EngineAdapter.getRandomNumber` via `ctxRandom`.
- Stop condition: runtime generation fails on the deployed Swooper script after
  a fresh bounded CLI restart and the failure is not attributable from logs.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`
- Branch: `06-05-fix_studio_validate_civ7_setup_seeds`
- Parent branch: existing Graphite stack branch for Studio/Civ setup hardening.
- Stack position: local continuation with staged upstream/foundation work
  preserved.
- Dirty files and owner: this workstream owns `.agents/skills/civ7-systematic-workstream/`
  and `openspec/changes/studio-live-civ7-map-sync/workstream/`.
- Protected paths: `mods/mod-swooper-maps/dist/`, `mods/mod-swooper-maps/mod/`,
  deployed Civ7 Mods, `.civ7/outputs/resources/**`, and Civ7 logs.
- Generated/read-only paths: generated bundles, visualization dumps, deployed
  mods, official resources, and log files are evidence only.

## Corpus Gate

- Corpus sources:
  - repo adapter boundary: `packages/civ7-adapter/src/civ7-adapter.ts`,
    `packages/civ7-adapter/src/mock-adapter.ts`, and
    `packages/civ7-adapter/src/types.ts`;
  - standard recipe stages under
    `mods/mod-swooper-maps/src/recipes/standard/stages/**`;
  - official resources under `.civ7/outputs/resources/Base/modules/base-standard/**`;
  - live readback through `@civ7/direct-control` and `civ7 game map`.
- Corpus shape: mixed materialization targets and action surfaces.
- Coverage ledger: `parity-corpus-ledger.md`.
- Open uncertainty:
  - exact hidden behavior of `TerrainBuilder.buildElevation()`,
    `TerrainBuilder.modelRivers()`, `TerrainBuilder.validateAndFixTerrain()`,
    `AreaBuilder.recalculateAreas()`, and `ResourceBuilder.canHaveResource()`;
  - whether those behaviors can be faithfully ported from official JS resources
    or should be eliminated as generators by making pipeline truth final.

## Proof Gates

- Local stats: compare generated final placement engine layers to local mock
  predicted layers for Standard 84x54 seed 2147483647 and at least two additional
  stable seeds after the first repair.
- Generated/deploy proof: build/deploy Swooper, verify deployed bundle hash or
  mtime, and do not claim runtime proof from deploy alone.
- Runtime proof: fresh CLI run through the Swooper map script, bounded
  `Scripting.log`/`output.log`, and full-map or tiled readback for terrain,
  biome, feature, resource, and visibility-independent fields.
- Product proof: Studio and Civ7 show the same map surfaces for the same run
  binding, or Studio marks residual engine-only uncertainty explicitly.
- Closure boundary: branch clean, Graphite submitted, Studio server running once,
  tests and runtime proof recorded separately.

## Team

- Owner: Codex in this worktree.
- Evidence agents:
  - terrain/elevation/coasts/rivers ownership explorer;
  - ecology/features/resources ownership explorer.
- Review agents: to be spawned after first implementation slice, focused on
  architecture boundary and proof-ledger completeness.
- Open findings:
  - current measured local-vs-live deltas point away from odd-q/odd-r and toward
    MockAdapter/live adapter divergence: terrain 180/4536, feature 67/4536,
    resource 167/4536, biome 0/4536 on Standard seed 2147483647.
  - `ctxRandom` was adapter-backed, so the same seed/config could select
    different foundation mesh, plate graph, mantle, base topography, sea level,
    climate, and narrative seeds in Studio vs Civ runtime. This is a pipeline
    authority bug, not a Civ policy to adopt.
