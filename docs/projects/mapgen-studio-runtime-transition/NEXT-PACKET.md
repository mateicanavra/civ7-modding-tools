# Next Packet: Admit Runtime Closeout Stage 0

Status: planning closure only; Stage 0 remains locked

Normative frame:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

Live state:
`docs/projects/mapgen-studio-runtime-transition/verification-ledger.md`

## Resume Objective

Admit Stage 0 only after the planning Graphite layer is committed, the current
Git/Graphite lane is clean, execution is explicitly resumed, and one continuous
Stage 0 Supervisor/Enforcer DRA accepts the live ledger. Do not implement an
OpenSpec packet merely because an old packet status says it was ready.

## Safe Assumptions

These assumptions become executable only after the live ledger records the
planning branch, fresh semantic-review digest, static gates, and clean ending
census. Historical supervisor results do not satisfy that admission gate.

- The workstream method, Stage 0-9 DAG, semantic backflow, Graphite lease,
  recovery, review, gate, cleanup, runtime-checkpoint, and terminal-record
  contracts, including the Planning Closure Loop, have passed the semantic
  supervisor review identified in the live ledger.
- Refreshed `main` contains the exact five-PR environment, Foundry, Habitat
  harness, semantic fixture, and token checkpoint recorded in the ledger. That
  code is trunk substrate rather than Studio recut source.
- The current Studio runtime is transitional behavioral stabilization, not the
  future service/API/host topology.
- Exact stable-row and P19/P20 ownership representations remain proposed Stage
  1 amendments until controlling packet authority accepts them.
- Later Habitat blueprint realization, behavior decomposition, target
  construction, and exclusive cutover are parked initiatives, not Stage 0 work.

## First Commands And Reads

1. Read `WORKSTREAM.md`, `stack-recut-manifest.md`,
   `obligation-corpus-contract.md`, and this packet.
2. Read the live ledger; do not infer current state from this packet.
3. Run `git status --short --branch`, `git rev-parse HEAD main`, `gt ls`,
   `git worktree list --porcelain`, and the remote/PR/operation census required
   by the Graphite mutation-lease contract.
4. Confirm the planning branch is committed and no pending Graphite mutation or
   unexplained dirty path exists in this worktree.
5. Confirm all five final merged prerequisite identities and the environment
   handoff digest match the ledger, the opening-chain Foundry duplicate remains
   reference-only, the audited Foundry filesystem residue is absent, and the
   readiness stack remains untouched at
   `codex/readiness-final-aggregate-proof-green@92cc1513cc5c43795f7b800fddc2325849869f5e`.
6. Assign and record the Stage 0 Supervisor/Enforcer DRA before changing a
   source ref, recovery artifact, corpus, or branch topology.

## Stage 0 Entry

Follow the Stage 0 entry and prework in `WORKSTREAM.md` exactly. Begin with the
revalidated census and selected recovery bundle. Materialize and close the
TypeBox obligation-corpus validator and Effect report collector fixtures before
populating corpus rows. Import each inherited environment-CI Studio/Habitat red
as its own evidence row. Keep every packet under execution hold until Stage 1
amends, validates, and explicitly admits its authority.

## Protected And Excluded State

- Do not globally restack, undo, clean, stash, or adopt sibling worktrees.
- The detached DesignSync-noise/restart-runner and other dirty sibling state in
  the manifest is Stage 0 safety-census input only; it is not owned source
  material and is not a Planning Closure prerequisite.
- Keep opening source refs and the recovery bundle until their recorded
  retirement trigger.
- Do not restack, fold, reparent, or delete an opening Studio source ref before
  the recovery bundle and disposable restore comparison are green.
- Keep the readiness PR stack parked until the Studio baseline and closeout are
  merged; its target-restack/reconciliation belongs to the post-closeout Habitat
  return.
- Runtime mutation remains serialized through the admitted Studio/direct-
  control owner; no whole-Civ application restart is an ordinary Run in Game
  path.
- Treat the private Codex helper, shared developer lifecycle, Studio daemon,
  Civ7 game soft restart, and whole-Civ application restart as separate owners.

If any entry fact differs, update only the live ledger and enter the appropriate
investigation/repair loop. Do not silently reinterpret this packet.
