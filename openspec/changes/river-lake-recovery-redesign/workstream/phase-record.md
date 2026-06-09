# Phase Record

## Phase

- Project: river/lake recovery redesign
- Phase: objective framing and execution-workstream redesign
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/river-trunk-coherence`
- Started: 2026-06-09
- Status: in progress

## Objective

- Target movement: replace the stale/narrow execution frame with an
  authority-grounded redesign that can drive the remaining work to actual
  visible-river/lake product closure.
- Non-goals: no more behavior implementation in this phase beyond planning and
  authority recording.
- Done condition: the redesign change is validated, the execution change train
  is explicit, and the superseding goal is recorded durably enough to govern the
  follow-on execution goal.

## Authority

- Root/subtree `AGENTS.md`: root repo rules only; no deeper router under
  `openspec/`
- Product refs:
  `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`,
  `openspec/changes/swooper-earthlike-product-acceptance-proof/**`,
  `openspec/changes/civ7-map-policy-final-surface-parity/**`,
  `openspec/changes/earthlike-visible-river-acceptance/**`
- Architecture refs:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- Project refs: `openspec/changes/river-lake-recovery-redesign/**`
- Excluded/stale inputs: the active tool goal references a non-existent file
  path inside `river-lake-adversarial-workstream-design`; that stale path must
  not drive further planning

## Current State

- Repo/Graphite state: clean worktree on top of the current river recovery stack
- Dirty files and owner: this phase owns only the redesign change files
- Current code evidence: upstream river-routing and navigable-trunk recovery
  slices have landed, but same-run rendered river acceptance is still open
- Generated outputs affected: none
- Tests/guards affected: OpenSpec validation only in this phase

## Scope

- Write set: `openspec/changes/river-lake-recovery-redesign/**`
- Protected files: existing runtime proof artifacts, code outside the redesign
  slice, generated outputs, official resources
- Owners: OpenSpec redesign/workstream planning records
- Forbidden owners: runtime/materialization code, Hydrology algorithm changes,
  Studio UI changes during this planning phase
- Consumer impact: this phase resets the controlling objective and the execution
  sequence for the remaining river/lake recovery work
- Downstream assumptions: later execution slices must derive from this redesign

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`
- Tasks: `tasks.md`
- Validation status: `bun run openspec -- validate river-lake-recovery-redesign --strict`
  and `bun run openspec:validate` passed on 2026-06-09

## Review

- Review lanes: product authority, architecture authority, systematic workstream,
  and OpenSpec coherence
- Blocking findings: none yet in this planning phase
- Accepted findings repaired: stale goal path is replaced by local durable goal
  recording in this slice
- Rejected/invalidated/waived/deferred findings: none

## Agent Fleet State

- Active agents: N/A - solo phase
- Completed agents: N/A - solo phase
- Assigned write sets: N/A - solo phase
- Latest evidence by agent: N/A - solo phase
- Open findings by agent: N/A - solo phase
- Running/stale status: N/A - solo phase
- Integration owner: Product/Development DRA

## Implementation

- Completed tasks: new redesign change scaffolded; superseding goal recorded;
  hard core, exterior, falsifier, proof classes, and planned change train
  captured; installed river/lake change inventory reconciled into the new
  change train; redesign change validated cleanly
- Remaining tasks: open the follow-on execution goal
- Stop conditions triggered: none

## Verification

- Commands run: repo/worktree state inspection, Graphite stack inspection,
  authority-doc inspection, `bun run openspec -- validate
  river-lake-recovery-redesign --strict`, `bun run openspec:validate`, `git
  diff --check`
- Results: current stack is clean; the redesign is grounded in current authority
  rather than the stale execution-goal path; change validation and repo-wide
  OpenSpec validation both passed
- Skipped gates and rationale: no package tests or runtime proofs in this phase
  because it is planning-only
- Evidence boundary: planning and authority-record proof only

## Realignment

- Downstream docs/specs/issues updated: new redesign change only
- Tests/guards updated: none
- Deferrals/triage updated: none
- Downstream realignment ledger: N/A in this phase

## Next Action

- Exact next step: create the follow-on execution goal from this new authority
  record
- First files to inspect: this redesign change plus the acceptance/parity
  workstream artifacts it references
- Stop condition: if validation or authority review exposes a conflicting owner
  model, revise the redesign before opening the execution goal
