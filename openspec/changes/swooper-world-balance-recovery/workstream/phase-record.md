# Phase Record

## Phase

- Project: Swooper world-balance recovery
- Phase: semantic recovery, verification, and clean Graphite closure
- Owner: Codex workstream owner
- Branch/Graphite stack: `06-05-fix_studio_validate_civ7_setup_seeds`
- Started: 2026-06-05
- Status: closed locally

## Objective

- Target movement: restore previously working resource distribution, natural
  wonders, mountain-region morphology, rivers, and floodplains without
  duplicating stale branches or moving authority into Civ readback.
- Non-goals: no hand-authored official data, no engine-readback-as-authority,
  no dual migration/legacy paths, no artificial mountain walls.
- Done condition: source/config behavior is restored, generated artifacts and
  fixtures are current, focused behavior gates pass, OpenSpec validates, and
  Graphite has a clean committed branch.

## Authority

- Root/subtree `AGENTS.md`: root repo hygiene, Graphite closure, generated
  artifact policy; `mods/mod-swooper-maps/AGENTS.md` ecology/placement owner
  boundary.
- Product refs: direct product direction for physically grounded mountain
  regions, sensible resources/wonders, and pipeline authoring authority.
- Architecture refs:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`,
  `docs/system/libs/mapgen/MAPGEN.md`.
- Project refs: `openspec/changes/swooper-world-balance-recovery/**`.
- Excluded/stale inputs: whole stale branch replay, generated-output hand edits,
  and Civ readback as a domain input.

## Current State

- Repo/Graphite state: dirty recovery branch with earlier staged morphology
  files and unstaged ecology/river/resource/wonder/test updates.
- Dirty files and owner: owned by this recovery workstream; final closure must
  stage and commit the coherent recovery set.
- Current code evidence: ecology feature scoring now runs after map-rivers;
  projected navigable-river truth is published before Civ readback; source scan
  confirms ecology consumes `projectedNavigableRivers` while
  `engineProjectionRivers` remains readback/diagnostic-only; mountain stats now
  summarize regions and internal mix.
- Generated outputs affected: shipped map generated entrypoints and legacy
  compiled config fixtures. Both were regenerated from source/config after the
  recovery edits.
- Tests/guards affected: config schema/identity, ecology ops, map-rivers,
  topology locks, mountain-region balance, resource policy, natural wonders.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - Kierkegaard: nearby worktree/branch recovery audit; recommended semantic
    transfer only and staging untracked river policy/tile-area files.
  - Boole: mountain-region audit; recommended region-first metrics for area,
    diameter, internal shares, flat pockets, and anti-wall behavior.
- Integration owner: Codex workstream owner.

## Implementation

- Completed tasks:
  - Removed the stale `navigableRiverClass` ecology control and replaced it
    with required authored navigable-river-mask input.
  - Moved `ecology-features` after `map-rivers` and before downstream ecology
    application.
  - Split `projectedNavigableRivers` from `engineProjectionRivers`; downstream
    ecology consumes the former.
  - Added core tile-area helpers and mountain-family tests from semantic prior
    work.
  - Added mountain-region metrics for region footprint, component diameter,
    peak/foothill/rough/non-mountain/flat shares, and flat pockets.
- Remaining tasks: none for this local recovery slice.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run --cwd mods/mod-swooper-maps gen:maps`: regenerated four shipped map artifacts.
  - `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts`: 66 pass, 0 fail.
  - `bun test packages/mapgen-core/test/lib/grid/tile-area.test.ts mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts mods/mod-swooper-maps/test/pipeline/mountain-range-length.test.ts mods/mod-swooper-maps/test/pipeline/terrain-relief-balance.test.ts mods/mod-swooper-maps/test/ecology/op-contracts.test.ts mods/mod-swooper-maps/test/map-rivers/navigable-river-materialization.test.ts mods/mod-swooper-maps/test/map-rivers/plot-rivers-post-refresh.test.ts mods/mod-swooper-maps/test/standard-recipe.test.ts mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`: 52 pass, 0 fail.
  - `bun test packages/civ7-map-policy/test/map-policy.test.ts mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts mods/mod-swooper-maps/test/resources/resource-corpus-artifact.test.ts mods/mod-swooper-maps/test/resources/resource-corpus-contract.test.ts mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts mods/mod-swooper-maps/test/resources/resource-aquatic-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-cultivated-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-geological-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-terrestrial-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-group-rollup-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-initial-map-authoring-policy.test.ts mods/mod-swooper-maps/test/placement/plan-ops.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts mods/mod-swooper-maps/test/placement/resources-landmass-region-restamp.test.ts mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts`: 87 pass, 0 fail.
  - `bun run openspec -- validate swooper-world-balance-recovery --strict`: passed.
  - `bun run openspec:validate`: 60 passed, 0 failed.
  - `git diff --check`: passed.
  - `bun run --cwd packages/mapgen-core build`: passed.
  - `bun run --cwd packages/civ7-map-policy build`: passed.
  - `bun run --cwd packages/civ7-map-policy check`: passed.
  - `bun run --cwd mods/mod-swooper-maps check`: passed.
  - `bun test packages/civ7-map-policy/test/map-policy.test.ts mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts mods/mod-swooper-maps/test/resources/resource-initial-map-authoring-policy.test.ts mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts mods/mod-swooper-maps/test/pipeline/mountain-range-length.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`: 30 pass, 0 fail after type-boundary repairs.
- Results: source/config, behavior, and generated fixture gates are green.
- Skipped gates and rationale: runtime deploy proof is not yet claimed for this
  slice; current closure target is local behavior recovery unless later launch
  failures require runtime logs.
- Evidence boundary: Civ readback remains diagnostic evidence only.

## Realignment

- Downstream docs/specs/issues updated:
  `openspec/changes/swooper-world-balance-recovery/**`.
- Tests/guards updated: recipe ordering, topology lock, map stamping,
  river materialization, ecology contract, mountain-family controls, terrain
  relief, and world-balance stats.
- Downstream assumptions: future ecology/resource work must call policy-valid
  authored artifacts; readback can prove drift but cannot become the planner
  input.

## Next Action

- Exact next step: regenerate shipped maps, rebaseline fixtures, and run the
  focused gates on any future behavioral change that touches these domains.
- First files to inspect: generated config tests and fixture helpers if
  rebaseline fails.
- Stop condition: do not commit with stale generated outputs, stale fixtures,
  failed focused gates, or dirty residue.
