# Morphology Terrain Authorship Phase Record

## Frame

- Objective: create a systematic Civ7 terrain morphology authorship workstream
  for Swooper Earthlike flatness.
- Future state: terrain classes, relief structure, volcanoes,
  engine elevation/cliff readback, and downstream feature/resource implications
  are owned, measured, and proved.
- Hard core: Foundation/Morphology own terrain truth; map stages project and
  read back; hydrology terrain mutation is separate; engine elevation/cliffs
  are readback-only.
- Falsifier: hills/rough land remain below the predeclared band, flats remain
  above budget, or elevation/cliffs are claimed without runtime readback.

## Status

- Last updated: 2026-05-31.
- Current gate: Gate 10, review/closure audit after the workstream,
  stats/readback, rough-land owner, runtime-boundary, and live-readback slices.
- Next gate: peer-agent P1/P2 review disposition and final local validation.
- Remaining proof boundary: live direct-control/Studio readback works, including
  bounded terrain/elevation/cliff reads, but the current live map was not
  produced by a controlled restart/begin of this morphology branch. Product
  proof therefore remains open for the target Swooper map.
- Stop condition: do not retune Earthlike terrain config to mask relief
  authorship. Terrain relief changes must stay rooted in Morphology ownership
  and downstream ecology/resource failures must remain separate.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`
- Branch: `codex/morphology-live-readback-boundary`
- Local head at this audit: `d42f35fe5`
  `docs(morphology): record live readback retry`.
- Parent branch: `codex/agent-dra-morphology-direct-control-objective`
- Parent morphology stack: `83e130ead`, `24a17988f`, `6e4721791`,
  `f6bef3685`.
- Downstack direct-control implementation commit: `cd1e87fa3`.
- Downstack Studio/direct-control commits in this stack: `3bf9b9d62`,
  `dfa03ab01`, `fec2f4c07`.
- Dirty files and owner: none at the start of this audit; any new edits in this
  branch are proof/closure record repairs only.
- Protected paths: generated `mod/**`, `dist/**`, lockfiles, active external
  direct-control worktrees, and Studio setup/live-sync implementation paths.

## Diagnosis Evidence

- Scout/current stats:
  - seed `1018`, `106x66`: final mountains `6.535%`, planned hills `0.075%`,
    final hills `0.037%`, final flats `88.798%`.
  - `80x50` seeds `[1,2,3,42,99,1234,7777]`: final hills `0-2.188%`.
- Candidate diagnosis for seed `1018`: hill target raw `482`, accepted
  candidates `2`, driver-nonzero share `5.519%`, score-above-threshold share
  `0.081%`.
- Source diagnosis:
  - `plotMountains` stamps `morphology.mountains.mountainMask` and
    `hillMask`, so near-zero planned hills are upstream of projection.
  - `plan-foothills` only admits ridge-skirt or strong-boundary-deformation
    candidates.
  - `plotVolcanoes` stamps `TERRAIN_MOUNTAIN` and `FEATURE_VOLCANO`
    separately from ridge truth.
- Test diagnosis:
  - low-level mountain tests can pass without meaningful hills.
  - `world-balance-stats` already collects key terrain metrics but current
    balance tests do not enforce rough-land bands.

## Current Local Checks

- `bun test test/pipeline/terrain-relief-diagnostics.test.ts test/pipeline/terrain-relief-balance.test.ts`:
  passed after the rough-land owner slice.
- `bun test test/morphology/m11-mountains-physics-anchored.test.ts test/morphology/m12-mountains-present.test.ts`:
  passed after the rough-land owner slice.
- `bun test test/pipeline/world-balance-stats.test.ts`: still fails due to
  `FEATURE_SAGEBRUSH_STEPPE` habitat mismatch and Rainforest seed-presence
  gates. This is downstream ecology/features proof, not terrain-relief proof.
- `bun test test/pipeline/mountains-nonzero-probe.test.ts`: failed before this
  branch because a stale helper passes the canonical map envelope to the
  recipe compiler.
- `packages/cli/bin/run.js game catalog --static --json`: passed and confirmed
  committed direct-control wrappers and CLI routes.
- `packages/cli/bin/run.js game status --json --timeout-ms 5000`,
  `map --summary`, `gameinfo`, `visibility`, hidden bounded `map`, runtime
  `catalog`, `inspect`, and read-only `exec` passed through
  `@civ7/direct-control`.
- Studio endpoints `/api/civ7/status`, `/api/civ7/map-summary`, and
  `/api/civ7/gameinfo?table=Terrains&limit=10` returned live package-backed
  payloads.

## Proof Labels

- Local commit complete: yes through `d42f35fe5`; this closure-audit repair
  branch will add another proof-record commit if needed.
- Graphite submitted: no.
- PR created/updated: no.
- Local stats proof: terrain-relief diagnostics pass; broad ecology/features
  world-balance remains failing and separately tracked.
- Runtime proof: live direct-control/Studio readback surface proved; target-map
  product proof remains unresolved.
- Product proof: unresolved.
