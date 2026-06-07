# Phase Record

## Phase

- Project: Swooper recovery
- Phase: exact Studio-to-Civ authorship proof
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-studio-parity-proof-drain`
- Started: 2026-06-06
- Status: integrated; current-stack validation passed

## Objective

- Target movement: bind one visible Studio config/setup to the exact Civ map
  and runtime proof it starts.
- Non-goals: no map tuning, no setup feature expansion beyond proof needs, no
  generated-output hand edits.
- Done condition: exact-authorship proof packet is complete, downstream proof
  tasks are realigned, and closure claims remain proof-class-specific.

## Authority

- Root/subtree `AGENTS.md`: Graphite and generated-output policy.
- Product refs: `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`.
- Architecture refs: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Project refs: `openspec/changes/studio-run-current-map-config/**`.
- Excluded/stale inputs: launch/log proof without visible Studio identity.

## Current State

- Repo/Graphite state: integrated into `codex/swooper-studio-parity-proof-drain`
  above `codex/swooper-mapgen-recovery-drain`.
- Dirty files and owner: no separate dirty side-worktree state is part of this
  record. This slice owns Studio Run in Game source, proof helper/test files,
  and the matching OpenSpec records.
- Current code evidence: Run in Game now sends a server-visible Studio source
  snapshot, records file identities, parses `[mapgen-proof]` and
  `[mapgen-complete]` payloads, and emits `exactAuthorshipProof` on completed
  operation status. The proof builder keeps status unresolved for missing or
  mismatched links. The public source snapshot proof carries
  `recipeSettings`, `worldSettings`, `pipelineConfig`, `setupConfig`,
  materialization mode, and selected config; hash-only source snapshot packets
  remain unresolved with named missing-body links.
- Generated outputs affected: no generated map artifacts are authored by this
  category. Runtime deploy/regeneration may produce evidence, but generated
  dirt is not source authority.
- Tests/guards affected: Studio Run in Game proof identity tests and package
  check.

## Scope

- Write set: `apps/mapgen-studio/**`, `mods/mod-swooper-maps/**`,
  `packages/civ7-direct-control/**` if readback wrappers are missing, and this
  OpenSpec change.
- Protected files: generated output hand edits, unrelated dirty worktrees.
- Owners: Studio launch proof, Swooper generated map proof, direct-control
  setup/readback.
- Forbidden owners: map tuning and broad setup redesign.
- Consumer impact: Run in Game proof becomes identity-grade for later slices.
- Downstream assumptions: final-surface parity must use this proof chain.

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`.
- Tasks: `tasks.md`.
- Validation status: pending for this category.

## Review

- Review lanes: Studio proof assembly, direct-control readback, Swooper log
  marker, product proof-boundary.
- Blocking findings: supervisor noted that planned proof chain omitted the
  predecessor live runtime snapshot identity and that content-hash links for
  source/materialized/deployed scripts are not first-class proof fields.
- Accepted findings repaired: design now explicitly requires
  `RunInGameSourceSnapshot`/visible-state identity, content hashes/mtimes for
  source/materialized/deployed script links, and live runtime snapshot identity
  including Civ `Game.getHash()` when present. Implementation now carries those
  fields into `exactAuthorshipProof` and keeps proof unresolved on required
  equality mismatches. The source snapshot transparency finding is repaired by
  exposing `pipelineConfig` on `RunInGameSourceSnapshotProof` and testing that
  pipeline changes alter the identity hash. The later hash-only completion
  finding is repaired by requiring the visible snapshot body fields for
  completion and testing that a hash-only source snapshot remains unresolved.
- Rejected/invalidated/waived/deferred findings: none yet.

## Review State

- Historical planner/supervisor notes were treated as evidence only.
- Current integration owner: Product/Development DRA on the recovery drain.
- Open findings: no exact-authorship packet-contract findings remain in this
  slice; live proof execution and final-surface deltas remain downstream.

## Implementation

- Completed tasks: planning record created; proof-chain control surface updated
  for predecessor runtime identity and content-hash links; Studio client sends
  a visible-state source snapshot; server proof helper records source snapshot
  identity, file identities, setup/readback, parsed log proof, runtime summary,
  and live runtime snapshot identity; mismatch links keep exact proof
  unresolved; parsed log proof requires proof and completion payload dimensions
  to agree; hash-only source snapshot proof remains unresolved.
- Remaining tasks: current-stack validation and Graphite commit. Downstream live
  proof tasks remain open in `studio-run-current-map-config` until a fresh
  Studio Run in Game exact proof packet is produced.
- Stop conditions triggered: none in this integrated branch.

## Verification

- Commands run:
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio test -- runInGame/proofIdentity`
  - `bun run --cwd apps/mapgen-studio test -- runInGame`
  - `bun run --cwd apps/mapgen-studio test`
  - `bun run openspec -- validate studio-civ7-exact-authorship-proof --strict`
  - `bun run openspec -- validate studio-run-current-map-config --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `lsof -nP -iTCP:5174 -sTCP:LISTEN`
  - `bun run --cwd apps/mapgen-studio dev`
  - `curl -I http://127.0.0.1:5174/`
- Results: package typecheck passed; focused proof identity tests passed; Run in
  Game test suite passed (46 tests after adding hash-only source snapshot
  regression); exact-authorship strict OpenSpec passed; downstream
  `studio-run-current-map-config` strict OpenSpec passed; full OpenSpec
  validation passed; diff whitespace passed. Full
  `bun run --cwd apps/mapgen-studio test` failed in
  `test/config/defaultConfigSchema.test.ts` on then-current
  floodplain/Earthlike/schema expectations (`floodplainPlanning`,
  `placement.floodplains`, `plan-floodplains`) in the source worktree. This
  integrated branch must rely on the current validation section for closure.
  Studio dev server started on `http://127.0.0.1:5174/`; HTTP probe returned
  `200 OK`.
- Commit/staging result: Graphite amend produced
  `fix(studio): prove exact run authorship`; staged files were only the Studio
  Run in Game proof/status/route/test files and exact-authorship / downstream
  OpenSpec records.
- Skipped gates and rationale: live Civ proof has not run in this record yet;
  local tests prove packet assembly and mismatch guards only.
- Evidence boundary: this record proves exact-proof packet implementation and
  guard coverage. It does not prove Earthlike acceptance, final-surface parity,
  or a completed live Civ proof run. Closure cannot use or stage the unrelated
  Earthlike dirt or the red full Studio test state as exact-authorship proof.

## Realignment

- Downstream docs/specs/issues updated:
  `openspec/changes/studio-run-current-map-config/tasks.md` records that proof
  packet/test coverage exists while live proof tasks remain unchecked until a
  fresh Studio Run in Game exact proof packet is produced.
- Tests/guards updated: `apps/mapgen-studio/test/runInGame/proofIdentity.test.ts`
  added.
- Deferrals/triage updated: not required; live proof remains an open task in
  downstream OpenSpec, not a silent deferral.
- Downstream realignment ledger: recorded inline in downstream task file.

## Next Action

- Exact next step: validate this integrated branch and continue with the next
  recovery category only after this slice commits cleanly.
- First files to inspect: current `git status`, downstream live proof tasks,
  and supervisor thread.
- Stop condition: proof chain cannot identify the same visible Studio config in
  generated source, deployed mod, setup row, logs, and readback; Earthlike
  tuning dirt is treated as category proof.
