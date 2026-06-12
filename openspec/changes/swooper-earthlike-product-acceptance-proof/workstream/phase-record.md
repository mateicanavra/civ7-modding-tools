# Phase Record

## Phase

- Project: Swooper recovery
- Phase: Earthlike product acceptance planning
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/mapgen-physical-rivers`
- Started: 2026-06-06
- Status: active; river/floodplain rows have bounded proof, full product
  acceptance remains open

## Objective

- Target movement: prove the visible Swooper Earthlike product over exact,
  classified runs.
- Non-goals: no acceptance from screenshots alone, no acceptance from tests
  alone, no broad tuning before proof input.
- Done condition: acceptance rows pass or create targeted repair rows with
  source-backed evidence.

## Authority

- Root/subtree `AGENTS.md`: proof and Graphite hygiene.
- Product refs: `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`.
- Architecture refs: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Project refs: Earthlike diagnostic gates and world-balance recovery changes.
- Excluded/stale inputs: old screenshots as closure proof.

## Current State

- Repo/Graphite state: branch `codex/mapgen-physical-rivers` carries the
  river/config proof slice ahead of `origin/main`; recheck clean status before
  any Graphite operation.
- Dirty files and owner: none after the river/config amendment. Earthlike
  config ordering now follows standard recipe stage order for the projection
  stages, with `map-rivers` before `ecology-features` and `map-ecology`.
- Current code evidence: diagnostic gates exist; product proof unresolved.
  Current river/floodplain row dispositions are recorded in
  `workstream/acceptance-row-ledger.md`; river/floodplain seed inputs are
  recorded in `workstream/acceptance-seed-matrix.md`.
- Generated outputs affected: only through source scripts if repairs follow.
- Tests/guards affected: acceptance diagnostics and focused repaired rows.

## Scope

- Write set: this OpenSpec change, affected MapGen owners only from failing
  rows, Studio visualization if implicated.
- Protected files: generated-output hand edits, unrelated worktrees.
- Owners: product acceptance proof.
- Forbidden owners: identity/parity proof, unless missing inputs force returning
  to prerequisite slices.
- Consumer impact: user-visible acceptance becomes auditable.
- Downstream assumptions: failing rows become targeted repair workstreams.

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`.
- Tasks: `tasks.md`.
- Validation status: focused MapGen tests/check, river OpenSpec validation,
  full OpenSpec validation, and diff hygiene passed on 2026-06-09 for the
  river/config proof slice; re-run if any proof or config input changes.

## Review

- Review lanes: product/visual, MapGen domain, Studio visualization,
  proof-boundary.
- Blocking findings: none yet.
- Accepted findings repaired: stale verification wording, stale clean-state
  wording, missing durable resource-search evidence, overbroad river/lake proof
  wording, and product-row proof-class overclaiming were repaired in the river
  workstream records.
- Rejected/invalidated/waived/deferred findings: product/visual review remains
  open because no screenshot/Studio visible-state acceptance was captured in
  this slice; this is a deliberate open product gate, not evidence for or
  against terrain/floodplain materialization.

## Agent Fleet State

- Active agents: none.
- Completed agents: OpenSpec planner informed this slice.
- Assigned write sets: N/A.
- Latest evidence by agent: acceptance must follow proof, not precede it.
- Open findings by agent: none.
- Running/stale status: none.
- Integration owner: Product/Development DRA.

## Implementation

- Completed tasks: planning record created; river/floodplain rows dispositioned
  against exact river proof `studio-run-in-game-mq6c38rf-n2p` and exact
  floodplain proof `studio-run-in-game-mq6dx234-1wx4`; focused
  floodplain-producing diagnostic fixture added for local intent/apply plumbing;
  floodplain-producing Earthlike seed `1018`/`84x54` selected, guarded, and
  proven for live floodplain feature visibility.
- Repaired final-surface local replay latitude orientation to mirror Civ SDK
  runtime (`topLatitude=MapInfo.MaxLatitude`,
  `bottomLatitude=MapInfo.MinLatitude`). This removes the false climate,
  hydrology, river, floodplain, biome, and natural-wonder input divergence from
  the `1018` proof.
- Remaining tasks: full acceptance seed/size matrix, all non-river/floodplain
  rows, and deterministic full-surface Studio/Civ parity. Floodplain live
  visibility is proven, but the `1018` proof is not a full-surface parity pass.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run --cwd mods/mod-swooper-maps test -- test/diagnostics/live-parity.test.ts`
  - `bun scripts/civ7-direct-control/verify-final-surface-parity.ts --proof-file /tmp/civ7-river-parity/studio-run-in-game-mq6dx234-1wx4-final-surface.json --timeout-ms 120000 --max-plots-per-read 512 --output /tmp/civ7-river-parity/studio-run-in-game-mq6dx234-1wx4-final-surface-latitude-fixed.json`
  - `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-knobs.test.ts test/standard-compile-errors.test.ts test/config/maps-schema-valid.test.ts`
  - `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-physical-benchmarks.test.ts test/diagnostics/live-parity.test.ts`
  - `bun run --cwd mods/mod-swooper-maps check`
  - `bun run openspec -- validate earthlike-visible-river-acceptance --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Results: exact-authorship `complete`, verifier `proofHash`
  `8289a63388373198982a7b6ef400569951eaa27bd163950b60dd26de50273917`,
  local/exact/live floodplain-family feature readback `11`, river terrain
  projection/live mismatch count `0`, natural-wonder coordinate proof `match`,
  full-surface parity `unresolved`.
- Skipped gates and rationale: no screenshot acceptance was captured in this
  slice; row evidence is exact-authorship plus live grid readback. Residual
  risk: visual styling, layer legibility, and Studio-vs-player-visible
  presentation can still fail despite correct runtime grid materialization.
  Owner/trigger: product/visual review must capture Studio visible-state
  evidence before full product acceptance is closed.
- Evidence boundary: proves live floodplain feature visibility and local replay
  alignment for hydrology/rivers/floodplain counts on seed `1018`; does not
  prove deterministic full-surface Studio/Civ parity.

## Realignment

- Downstream docs/specs/issues updated: current river/floodplain proof rows are
  reflected in `tasks.md`, `workstream/acceptance-row-ledger.md`, and
  `workstream/acceptance-seed-matrix.md`. The acceptance row ledger now also
  classifies the remaining full-surface residuals as non-river/lake owner
  drift: terrain/materialization, climate/biome, ecology feature, resource,
  natural-wonder planning, and placement proof boundaries.
- Tests/guards updated: `test/diagnostics/live-parity.test.ts`,
  `test/ecology/floodplain-feature-product-row.test.ts`, and
  `test/pipeline/world-balance-stats.test.ts` guard the repaired proof surface.
- Deferrals/triage updated: minor-river metadata remains explicitly unsupported
  in the river acceptance workstream unless a stable writer surface is
  discovered and proven.
- Downstream realignment ledger: no separate ledger yet; current downstream
  realignment is recorded inline in this phase record and acceptance ledgers.
- Current river workstream audit: proof-ledger audit found no overclaim that
  minor rivers are stamped or that full product parity is closed; accepted
  findings were stale clean-state wording, stale verification wording, and
  missing durable resource-search evidence.

## Next Action

- Exact next step: complete the broader acceptance seed/size matrix and isolate
  the remaining non-river final-surface parity residuals into targeted repair
  rows.
- First files to inspect: Earthlike diagnostic gates, world-balance recovery
  tests, Studio visualization layer config.
- Stop condition: exact-authorship or final-surface parity is stale or missing.
