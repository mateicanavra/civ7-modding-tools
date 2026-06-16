# Runtime Effect Recovery Changeset Design

Status: design reviewed and approved for sequential implementation.

## Design Rule

No runtime implementation slice is currently selected. The first-order evidence
indicates the remaining work is docs/OpenSpec realignment after the runtime
stack landed on `origin/main`. That can change only if read-only source residue
review finds accepted P1/P2 production defects. The source-residue review found
no P1/P2/P3 residue, so R0-R4 remain docs/OpenSpec realignment slices.

## Approved Sequence Draft

### R0 - D12 Drain Reconciliation

- Objective: update D12 closeout records so they reflect that runtime PRs
  `#1729` through `#1748` are already on `origin/main`.
- Exterior: live Civ7 rerun, code changes, PR submission, merge/drain commands.
- Owners: D12 OpenSpec workstream records and project packet train status.
- Forbidden owners: runtime packages, app code, generated outputs, lockfiles.
- Write set:
  - `openspec/changes/mapgen-studio-game-door-invariant/tasks.md`
  - `openspec/changes/mapgen-studio-game-door-invariant/workstream/phase-record.md`
  - `openspec/changes/mapgen-studio-game-door-invariant/workstream/closure-checklist.md`
  - `openspec/changes/mapgen-studio-game-door-invariant/workstream/final-proof-ledger.md`
  - `openspec/changes/mapgen-studio-game-door-invariant/workstream/testing-ledger.md`
  - `openspec/changes/mapgen-studio-game-door-invariant/workstream/next-packet.md`
  - `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- User-scenario expectation: a future agent reading D12 should not reopen final
  drain or live proof when current main already contains the stack.
- Proof classes:
  - Git proof: first-parent `origin/main` includes `#1729`-`#1748`.
  - Worktree proof: old runtime worktree is detached at `654f58d8f`; no old
    runtime branch is checked out.
  - OpenSpec proof: strict D12 validation and full `openspec:validate`.
  - Runtime proof: existing D12 live proof only; no new live proof claimed.
- Review lanes: D12 drain reconciliation, proof label audit.
- Stop conditions: any old runtime branch is still active/checked out; current
  main no longer contains `#1748`; reviewer finds D12 proof insufficient for
  the closure language.

### R1 - Consumed Live-Proof Handoff Realignment

- Objective: repair D10/D11 and related handoff records so they no longer read
  as active missing live proof when D12 consumed the gap, while preserving any
  subclaim D12 did not cover.
- Exterior: rerunning live Civ7, changing watcher/dev-runner code, claiming
  D10 or D11 independently ran live proof.
- Owners: D10/D11 workstream `next-packet.md`, task/status rows, and narrow D5
  live-proof handoff wording if it is active-looking.
- Forbidden owners: runtime source, generated outputs.
- Write set candidates:
  - `openspec/changes/mapgen-studio-live-game-watch/tasks.md`
  - `openspec/changes/mapgen-studio-live-game-watch/workstream/next-packet.md`
  - `openspec/changes/mapgen-studio-live-game-watch/workstream/phase-record.md`
  - `openspec/changes/mapgen-studio-nx-dev-runner/tasks.md`
  - `openspec/changes/mapgen-studio-nx-dev-runner/workstream/next-packet.md`
  - `openspec/changes/mapgen-studio-nx-dev-runner/workstream/phase-record.md`
  - `openspec/changes/mapgen-studio-pipeline-effect-services/tasks.md`
- User-scenario expectation: a future agent sees that D12 is the live-product
  proof source for Play, Save&Deploy, events, status, and current projection,
  and does not silently inflate D10/D11 source tests into live proof.
- Proof classes:
  - D12 live proof: cited from `testing-ledger.md` and `final-proof-ledger.md`.
  - D10/D11 local proof: left as local/package/process proof.
  - New live proof: not run.
- Review lanes: proof/test design, live-proof coverage audit.
- Stop conditions: D12 proof lacks a D10 live-game watcher subclaim or D11
  stable-dev-runner subclaim needed by the old handoff; in that case retain a
  narrowed next-packet instead of marking complete.

### R2 - Historical Packet Accounting Realignment

- Objective: clean or quarantine older unchecked rows/status lines that make
  completed runtime packets look active despite current main evidence.
- Exterior: changing historical evidence meaning, rewriting embarrassment out
  of records, code changes.
- Owners: packet task/phase rows that OpenSpec list still reports incomplete
  only because of stale/historical accounting.
- Candidate rows:
  - D0 artifact classification rows that still call D1-D12 implementation
    pending or pending closeout.
  - D1 unchecked review/live rows.
  - D5 review-disposition status that still says Graphite commit pending.
  - D6 unchecked packet-authoring install/build/check rows.
  - D8 status line saying implementation pending despite later addendum.
  - Any D3/D4 accepted-only phase line that reviewers classify as misleading.
- User-scenario expectation: `openspec list` should not advertise runtime
  implementation work as incomplete unless a real current obligation remains.
- Proof classes:
  - OpenSpec list before/after.
  - Current main merge history.
  - Packet-specific proof pointers.
- Review lanes: packet accounting audit, proof label audit.
- Stop conditions: a row represents a genuine unproven claim rather than stale
  accounting; preserve it with a narrowed owner and re-entry trigger.

### R3 - Active Project Doc Drift Cleanup

- Objective: banner, update, or archive active-looking non-packet docs that
  still describe deleted runtime/browser/dev paths as current.
- Exterior: evergreen architecture redesign, runtime source edits.
- Owners:
  - `docs/projects/mapgen-studio-redesign/audit/03-component-architecture.md`
  - narrow status/addendum area in
    `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
    if review confirms it is active-looking drift.
- User-scenario expectation: a future agent does not use old redesign audit
  language to reintroduce browser polling, recovery loops, or stale packet
  sequence.
- Proof classes:
  - Textual search/classification only.
  - No runtime proof.
- Review lanes: authority/spec review, stale-doc drift review.
- Stop conditions: doc is clearly archived or historical already; do not churn.

### R4 - Final Recovery Closeout Audit

- Objective: after R0-R3, prove records agree and decide whether the active
  goal can move from docs realignment to final closeout.
- Exterior: runtime code, live proof unless R1 retained a live-proof gap.
- Owners: recovery workstream ledgers and final closure checklist.
- Write set:
  - `docs/projects/studio-runtime-simplification/workstream/runtime-effect-recovery-design/*`
  - optional follow-up closeout ledger under
    `docs/projects/studio-runtime-simplification/workstream/runtime-effect-recovery-closeout/`
- Required checks:
  - `bun run openspec:validate`
  - `bun run habitat classify <changed-doc-scope>` and returned checks
  - `git diff --check`
  - `git status --short --branch`
  - `gt log --no-interactive --stack`
- Stop conditions: accepted unresolved P1/P2 review finding, non-green check
  caused by this write set, or remaining active next-packet that says live proof
  or drain is missing without a narrowed owner.

## Parallelism Policy

The implementation phase may not run R1/R2/R3 in parallel until R0 is complete,
because D12 drain status is the authority that decides whether later not-green
handoffs are stale. After R0, R1 and R3 can run in parallel if their write sets
remain disjoint. R2 should run after R1 so it can distinguish consumed proof
from real remaining proof gaps.

## Review Approval

The read-only review wave found no current code implementation blocker. The
accepted P1/P2 findings are design inputs for R0-R2 rather than blockers to the
design itself:

- R0 must run first because old D12 next-packet text is stale relative to
  current main.
- R1 must preserve proof-class separation while superseding consumed live-proof
  handoffs.
- R2 must distinguish historical corpus/accounting rows from current open work.
- R3 is P3/stale-doc cleanup and may be skipped if scoped inspection proves the
  candidate docs are already archived or sufficiently bannered.
