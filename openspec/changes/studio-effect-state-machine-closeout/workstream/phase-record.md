# Phase Record: Studio Effect State-Machine Closeout

Status: resumed proof pass recorded; the priority Run in Game
`studio-current` path is product-proven on the current top, while broad
state-machine product proof and Graphite submission remain unclaimed.

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

## 2026-06-17 Resume Proof Pass

Current branch is `codex/studio-effect-state-machine-closeout` at
`baa9d7f8e docs(studio): reconcile state-machine closeout`.

The resumed objective is to prove, or explicitly keep unresolved, the remaining
product-facing labels without changing Graphite topology:

- keep using the original Studio stack; do not create a parallel replacement
  stack;
- use isolated dev ports because other worktrees currently have
  `mapgen-studio`/Nx processes running;
- treat Civ7 tuner availability on `127.0.0.1:4318` as live-runtime
  opportunity, not proof by itself;
- re-run source/build/dev gates before another live Run in Game proof;
- if a new branch must be inserted later, use Graphite insert from the current
  stack rather than a separate stack.

Current excluded dirt remains unrelated to this closeout pass:

- `.agents/skills/README.md`
- `.agents/skills/civ7-mapgen-workstream/`
- `docs/projects/mapgen-workstream-skill/`

The next proof pass must update `workstream/reconciliation-ledger.md` and
`openspec/changes/studio-live-civ7-proof-gates/workstream/live-proof-ledger.md`
with the fresh request id, commands, ports, generated/deployed hashes, bounded
logs, and any unresolved browser/product conditions.

Resume pass outcome:

- browser Run in Game proof succeeded for request
  `studio-run-in-game-mqhqd5ic-jrj-5`;
- Civ7 selected and loaded `{swooper-maps}/maps/studio-current.js`;
- direct tuner/readback observed the started game at turn `1`, seed `123`, and
  map dimensions `84x54`;
- bounded `Scripting.log` and `Modding.log` contain the Swooper
  `studio-current` proof/load signals for the same request;
- bounded `Database.log` and `UI.log` contain no Swooper/studio-current
  matches, while `UI.log` still has unrelated local third-party UI noise;
- after the proof, the daemon restarted under a new server identity and
  `runInGame.status` no longer had the old request, so operation-history
  durability across daemon restarts remains outside the current product-proof
  claim.
