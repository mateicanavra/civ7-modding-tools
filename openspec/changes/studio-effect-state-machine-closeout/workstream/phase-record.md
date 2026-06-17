# Phase Record: Studio Effect State-Machine Closeout

Status: closeout reconciliation implemented and locally verified.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-08---state-machine-closeout`.

Priority rows: all scenario and error-boundary rows.

## Scope

SMR-08 is a documentation/control packet. Runtime implementation files and
generated/deployed artifacts are protected here. Stale implementation findings
reopen the owning packet; they are not silently folded into closeout.

## Reconciliation

Final row-by-row scenario and error-boundary disposition is recorded in
`workstream/reconciliation-ledger.md`.

The source prework ledgers remain preserved:

- `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/SCENARIO-CORPUS-LEDGER.md`
- `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/ERROR-BOUNDARY-LEDGER.md`

Those ledgers now point to this packet's reconciliation ledger for final proof
labels.

## Review Disposition

No accepted packet-design P1/P2 finding remains open. Implementation-time user
review findings were accepted and repaired:

- Disposable `studio-current` map reruns no longer default to Civ process
  restart. Normal reruns use deploy plus setup visibility; process restart is a
  fallback only after typed setup-row proof failure with
  `reloadBoundary: "process-restart-required"`.
- Production process restart no longer uses generic coordinate clicking.
  Restart readiness is passive App UI shell proof, with only direct-control
  `Cinematic` display-queue dismissal as an accelerator.
- Browser restart recovery is scoped to the current authored Studio state.
  Stale prior operation diagnostics now render `Run Current` and do not carry
  `restartCivProcess` into a changed run.

## Proof Labels

Claimed locally:

- `tested`
- `built`
- browser API projection proof
- browser state/component proof
- manual rendered browser fast-path proof
- dev startup observed
- `generated`
- `deployed`
- `tuner-exercised`
- bounded `Scripting.log` proof for request
  `studio-run-in-game-mqhog22i-13if-2`
- `in-game observed`
- OpenSpec validation
- habitat-classified lint/habitat validation

Not claimed:

- sibling `Modding.log`, `Database.log`, and `UI.log` ranges for broader
  load/product diagnostics
- Graphite submitted
- broad product proof

## Validation Record

Validation commands run:

- `bun run openspec -- validate studio-effect-state-machine-closeout --strict`
  passed on the original `codex/studio-effect-state-machine-closeout` stack.
- `bun run openspec:validate` passed: 194 items, 0 failed.
- `bun run habitat classify docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery`
  returned required target `bun run lint`.
- `bun run habitat classify openspec/changes/studio-effect-state-machine-closeout`
  returned required target `bun run lint`.
- `bun run habitat classify openspec/changes/studio-browser-scenario-proof`
  returned required target `bun run lint`.
- `bun run habitat classify openspec/changes/studio-live-civ7-proof-gates`
  returned required target `bun run lint`.
- `bun run lint` passed. Existing `doc-ambiguity` advisory remained advisory;
  no enforced lint or habitat check failed.
- `git diff --check` passed.
- `git status --short --branch` recorded current branch
  `codex/studio-effect-state-machine-closeout`, SMR-08 docs dirty, and
  unrelated pre-existing skill/mapgen-workstream dirt excluded.
- `gt status` recorded the same unstaged state through Graphite.
- `git worktree list` recorded the current worktree plus agent/habitat
  worktrees. The only extra worktree checking out a Studio-stack branch is
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-A-civ7-discoveries-live-placement`
  at `agent-A-civ7-discoveries-live-placement`.
- `gt ls` and `gt log short` recorded the Studio stack rendered below unrelated
  habitat branches marked `needs restack`; no broad restack/sync/submit was
  performed.
