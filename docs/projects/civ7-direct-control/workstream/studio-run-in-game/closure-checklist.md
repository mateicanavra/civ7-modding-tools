# Closure Checklist

## Phase

- Project: Civ7 Direct Control
- Phase: studio-run-in-game
- Phase state: closed for existing repo-backed rows and disposable
  `studio-current` rows
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
  - Full macOS process restart is not part of the proven path; direct-control
    shell/App UI reload was sufficient for disposable `studio-current`.

## Verification

- Repo/package gates run:
  - `bun run verify:studio-run-in-game`
  - `bun run openspec:validate`
  - `bun run openspec -- validate workspace-build-pipeline --strict`
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 3000`
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 10.211.55.2 --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 127.0.0.1 --timeout-ms 10000`
  - `bun run verify:studio-run-in-game:live -- --mutate --map-script '{swooper-maps}/maps/swooper-earthlike.js' --map-size MAPSIZE_STANDARD --seed 753190005 --game-seed 753190000 --from-running-game exit-to-shell --timeout-ms 10000 --wait-timeout-ms 180000 --poll-interval-ms 2000`
  - Studio endpoint probes for `/api/civ7/live/status`,
    `/api/civ7/live/snapshot`, `/api/civ7/live/entities`,
    `/api/civ7/live/gameinfo`, and durable `/api/civ7/run-in-game`.
  - Studio disposable `/api/civ7/run-in-game` proof with request id
    `studio-run-in-game-mpuegkpw-1x6o`.
  - `git diff --check`
- Results:
  - Source/mock Studio lane verifier passed.
  - All OpenSpec changes passed strict validation.
  - Earlier live proof commands failed at direct-control health with `LSQ:`
    timeout; after Civ process restart, read-only health passed.
  - Mutating setup/start proof passed from a running game through
    exit-to-shell, setup row verification, host/start, and Tuner seed/dimension
    readback.
  - Studio live sync endpoints passed and durable Studio Run in Game returned
    fresh Swooper request/config/envelope hash log proof.
  - Disposable Studio Run in Game passed after shell/App UI reload made
    `studio-current` visible, with fresh request/config/envelope hash log
    proof.
- Skipped gates and rationale:
  - Broad Swooper test suite was not used as a lane gate because unrelated
    morphology/ecology failures are already known.
- Evidence boundary:
  - Direct-control setup/start contracts are implemented, mock-tested, and
    live-proven for existing setup-visible and disposable shell-reloaded rows.
  - Studio Run in Game and live sync are source/test/live verified.
  - Process restart support remains outside this slice because shell/App UI
    reload solved the disposable row boundary.

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
  - Evergreen docs promotion after product wording accepts the project-scoped
    proof as stable.

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
  - live-proof repair commit pending at checklist update

## Handoff

- Next Packet written: `next-packet.md`
- Exact next action:
  - Commit the live-proof repairs/docs and restack descendants.
- Stop condition:
  - Verification finds a regression in direct-control setup/start or Studio Run
    in Game.
