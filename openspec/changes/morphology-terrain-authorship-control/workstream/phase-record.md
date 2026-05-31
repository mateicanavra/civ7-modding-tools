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
- Current gate: Gate 8, implementation slice opened after Gates 1-7 were
  completed for state isolation, diagnosis, corpus, expectations, grouping,
  and architecture translation.
- Next gate: Gate 9, local validation for OpenSpec and any stats/proof slice
  added above this record.
- Blocked by: runtime proof is not available until a Civ7 tuner session is
  reachable and cliff-crossing readback is first-class or bounded by an
  approved read-only probe.
- Stop condition: do not retune Earthlike terrain config before adding a
  dedicated rough-land authoring surface or explicit stats gates.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`
- Branch: `codex/morphology-terrain-authorship-workstream`
- Local commit: complete after the closure amend for this record; exact branch
  head is reported from `git rev-parse HEAD` in the final closure message.
- Parent branch: `codex/agent-dra-morphology-direct-control-objective`
- Parent commit: `63a077781`
- Downstack direct-control implementation commit: `cd1e87fa3`
- Downstack Studio design branch commit: `692a04081`
- Dirty files and owner: this branch owns only the OpenSpec/workstream files
  listed in the proposal and the adjacent normalization-workstream spec update.
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

- `bun test test/pipeline/world-balance-stats.test.ts`: failed before this
  branch due to `FEATURE_SAGEBRUSH_STEPPE` habitat mismatch, not due to new
  work.
- `bun test test/pipeline/mountains-nonzero-probe.test.ts`: failed before this
  branch because a stale helper passes the canonical map envelope to the
  recipe compiler.
- `bun test test/morphology/m11-mountains-physics-anchored.test.ts test/morphology/m12-mountains-present.test.ts`:
  passed before this branch.
- `packages/cli/bin/run.js game status --json --timeout-ms 3000`: failed with
  `response-timeout`, indicating no reachable/ready Civ7 tuner session.
- `packages/cli/bin/run.js game catalog --static --json`: passed and confirmed
  committed direct-control wrappers and CLI routes.

## Proof Labels

- Local commit complete: yes after closure amend; exact branch head is reported
  outside this self-referential record.
- Graphite submitted: no.
- PR created/updated: no.
- Local stats proof: partial diagnostic evidence only; expected bands are now
  predeclared but not satisfied.
- Runtime proof: unresolved.
- Product proof: unresolved.
