# Closure Checklist

## Phase

- Project: Civ7 Direct Control
- Phase: studio-run-in-game
- Phase state: paused-handoff
- Artifact path:
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game/`

## Review

- Review lanes completed: setup API, Studio materialization, live sync,
  proof/test, build pipeline, OpenSpec validation, owner review.
- P1/P2 accepted findings repaired:
  - Setup state/readback contracts.
  - Reload semantics captured as a proof gate.
  - No-replay tests for setup/start mutation failures.
  - Swooper config identity proof metadata.
  - Studio raw setup JS and bridge fallback prohibition.
  - Observational-only live sync.
  - Turbo-backed build/test ordering.
  - Repeatable live runtime proof gate.
- Rejected/invalidated/waived/deferred findings recorded:
  - Broad `mod-swooper-maps#test` failures are unrelated morphology/ecology
    failures and are deferred outside this lane.
- Remaining review risk:
  - Live setup/start and reload semantics are source/mock verified but not
    live-proven because Civ does not currently answer `LSQ:`.

## Verification

- Repo/package gates run:
  - `bun run verify:studio-run-in-game`
  - `bun run openspec:validate`
  - `bun run openspec -- validate workspace-build-pipeline --strict`
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 3000`
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 10.211.55.2 --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 127.0.0.1 --timeout-ms 10000`
  - `git diff --check`
- Results:
  - Source/mock Studio lane verifier passed.
  - All OpenSpec changes passed strict validation.
  - Live proof command ran but failed at direct-control health with `LSQ:`
    timeout; no mutation was attempted in the repeatable gate.
- Skipped gates and rationale:
  - Mutating setup/start proof was skipped because read-only `LSQ:` health
    failed.
  - Broad Swooper test suite was not used as a lane gate because unrelated
    morphology/ecology failures are already known.
- Evidence boundary:
  - Direct-control setup/start contracts are implemented and mock-tested.
  - Studio Run in Game and live sync are source/test verified.
  - Live setup/start parity and reload semantics remain unproven.

## Downstream Realignment

- Downstream realignment ledger: `downstream-realignment-ledger.md`
- Downstream artifacts updated:
  - OpenSpec changes.
  - Workstream phase, proof, review, closure, and next-packet artifacts.
  - Package scripts and Turbo graph.
- Deferrals/triage updated:
  - Live proof blocker in `live-proof-ledger.md`.
  - Broad Swooper suite deferral in `phase-record.md` and
    `downstream-realignment-ledger.md`.
- Deferred inventory:
  - Mutating live proof.
  - Reload semantics proof.
  - Evergreen docs promotion after live proof.

## Agent Fleet State

- Active agents: none.
- Completed agents: setup API, Studio materialization, live sync, proof/test,
  build pipeline.
- Stale/running agents closed or handed off: all reports landed; no active
  agent state required.
- Assigned write sets reconciled: yes, reports and owner implementation are in
  this branch.
- Integration owner: Codex.

## Repo State

- Branch/Graphite stack: `codex/studio-run-in-game-workstream`, restacked with
  descendants.
- Dirty files: closure/handoff artifacts pending commit at checklist creation;
  final handoff should be clean.
- Untracked files: closure/handoff artifacts pending commit at checklist
  creation; final handoff should be clean.
- Commit made:
  - `3bf9b9d62 feat(civ7): add Studio run-in-game control lane`
  - `dfa03ab01 test(civ7): add live Studio run-in-game proof gate`

## Handoff

- Next Packet written: `next-packet.md`
- Exact next action:
  - Recover or restart Civ so `LSQ:` responds, then run:
    `bun run verify:studio-run-in-game:live -- --mutate --map-script <file> --map-size <size> --seed <seed> --from-running-game exit-to-shell`
- Stop condition:
  - Direct control cannot set setup parameters/start from shell, or Civ
    requires full process restart/reload for changed map rows.
