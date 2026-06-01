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
- Current gate: Gate 11, closure audit after controlled target-map runtime
  proof on the current morphology branch artifact.
- Next gate: Graphite submission/PR delivery or downstream resource-quality
  realignment.
- Remaining proof boundary: target-map product proof is captured for Swooper
  Earthlike standard map seed `1018` after fresh deploy. First-class aggregate
  cliff fields and richer terrain-linked resource quality gates remain
  downstream; cliffs/elevation are proved by package-routed runtime readback,
  not by Morphology truth artifacts.
- Stop condition: do not retune Earthlike terrain config to mask relief
  authorship. Terrain relief changes must stay rooted in Morphology ownership
  and downstream ecology/resource failures must remain separate.

### Integration Replay Note

- Last integration replay update: 2026-06-01.
- Replay branch: `codex/integrate-morphology-peer-repairs` above
  `codex/integrate-morphology-live-readback`.
- Source branch: `codex/morphology-peer-review-repairs`.
- Accepted behavior replayed here: broad vegetation habitat admission,
  rough-land contract repair coverage, and Swooper Earthlike feature thresholds
  translated into the current semantic public config surface.
- Public-surface translation: the old internal
  `plan-reefs.planReefs.config.minConfidence01` and
  `plan-vegetation.planVegetation.config.rainforestMinConfidence01` deltas are
  represented as `ecology-features.reefPlanning.minConfidence01 = 0.62` and
  `ecology-features.vegetationPlanning.rainforestMinConfidence01 = 0.28`.
- Generated artifact boundary: `swooper-earthlike.ts` was regenerated from the
  resolved source config. The integration generated hashes are
  `configHash:"7e3b100b867fc1f07b549d1373a60ebca61645cac0ea762becfcb1dd691c0381"`
  and
  `envelopeHash:"1c0bfa88c7fe8e3dc917e7eb84986d399a1c72022423add91646f2eb51caf2f5"`.
- Proof-class boundary: runtime/product proof entries below are historical
  source-branch evidence for `codex/morphology-peer-review-repairs`, not fresh
  runtime proof for this integration branch until a new deploy/readback run is
  captured.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`
- Branch: `codex/morphology-peer-review-repairs`
- Local head before the downstream ecology repair: `8b2f452d8`
  `docs(morphology): record fresh readback retry`.
- Parent branch: `codex/agent-dra-morphology-direct-control-objective`
- Parent morphology stack: `be0491cff`, `e3f17e758`, `87d075cc2`,
  `b4ecc21a1`.
- Downstack direct-control implementation commit: `cd1e87fa3`.
- Downstack Studio/direct-control commits in this stack: `3bf9b9d62`,
  `dfa03ab01`, `fec2f4c07`.
- Dirty files and owner: none at the start of this audit; the current repair
  edits are limited to ecology feature planning, adjacent ecology fixtures,
  Swooper Earthlike feature thresholds, regenerated target-map hash metadata
  produced by the deploy script, and proof/closure records.
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
- `bun test test/pipeline/world-balance-stats.test.ts`: passed after the
  downstream ecology-feature repair. The repair added broad vegetation habitat
  admission, realigned Swooper Earthlike reef/rainforest thresholds, and updated
  the stale atoll fixture.
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
- Fresh readback retry on `codex/morphology-peer-review-repairs@a8ab28cfe`
  again passed through the current package surface after an initial
  shared-session transition. Parsed live payloads included status/map summary
  for map `84x54`, seed `753190008`, bounded hidden map facts, visibility,
  `GameInfo` rows, targeted Tuner API inspection, Studio endpoints, and
  all-map elevation/cliff readback with terrain counts
  `{0:53,1:29,2:1549,3:879,4:1977,5:49}`, elevation min `0`, max `2053`, mean
  `319.921`, `cliffCrossings:1000`, and `cliffErrors:0`.
- The initial `Autoplay is not defined`/missing-`Tuner` result from that retry
  is classified as shared-session transition only; it is not counted as
  evidence that runtime readback is broken.
- Controlled target-map proof on
  `codex/morphology-peer-review-repairs@2528bd75994a` succeeded after
  redeploying the generated Swooper map bundle. Verifier proof
  `studio-run-in-game-live-proof-mpufnk77-239f` started the Swooper Earthlike
  standard map at seed `1018`; status/map/GameInfo/visibility/inspect reads
  succeeded through `@civ7/direct-control`; the aggregate engine readback
  reported terrain counts `{0:98,1:278,2:1234,3:1083,4:1815,5:28}`, land hill
  share `16.97%`, land flat share `75.34%`, elevation min `0`, max `1420`,
  mean `200.498`, `cliffCrossings:994`, and `cliffErrors:0`.
- The earlier controlled seed `1018` result with only `5` hills is classified
  as stale deployed output: the deployed map bundle did not yet contain
  `morphology/plan-rough-lands`, while the freshly deployed bundle did.

## Proof Labels

- Local commit complete: yes through the current top commit on
  `codex/morphology-peer-review-repairs`. The exact hash is intentionally read
  from `git log -1 --oneline` because this record is amended into that commit.
- Graphite submitted: no. `gt submit --stack --dry-run --no-edit` passed in
  non-interactive dry-run mode without pushing branches or opening/updating PRs.
- PR created/updated: no.
- Local stats proof: terrain-relief diagnostics pass; broad ecology/features
  world-balance passes; richer resource quality gates remain downstream.
- Runtime proof: live direct-control/Studio readback surface proved; controlled
  target-map proof captured for Swooper Earthlike seed `1018`.
- Product proof: captured for the target seed and current deployed branch
  artifact; broader seed-matrix runtime proof remains downstream.
