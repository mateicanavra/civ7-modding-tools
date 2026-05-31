# Next Packet

## Workstream State

- Project: Civ7 Direct Control
- Phase: studio-run-in-game
- Branch/Graphite stack: `codex/studio-run-in-game-workstream`
- Last implementation commit:
  `dfa03ab01 test(civ7): add live Studio run-in-game proof gate`
- Repo state: closure/handoff artifacts pending commit at packet creation;
  stack linear and restacked.

## Authority

- Product refs:
  - User goal: prove and implement Studio-driven Civ7 game launch plus live
    runtime sync on top of `@civ7/direct-control`.
  - Latest acceptance: Run in Game is separate from preview/browser run; seed
    is setup/runtime state; direct-control owns wrappers; exact config proof
    requires map row, seed, post-start map seed, and Swooper log/hash evidence.
- Architecture refs:
  - `civ7-open-spec-workstream`
  - `civ7-operational-debugging`
  - `civ7-architecture-authority`
  - `civ7-product-authority`
- Project refs:
  - `phase-record.md`
  - `live-proof-ledger.md`
  - `review-disposition-ledger.md`
  - `downstream-realignment-ledger.md`
  - OpenSpec changes under `openspec/changes/`
- Excluded/stale inputs:
  - Windows/FireTuner bridge fallback.
  - Studio raw setup JavaScript.
  - Automatic runtime-to-authored-config writes.

## What Is Done

- Completed tasks:
  - Direct-control setup snapshot, map row, prepare, start, and composed run
    wrappers.
  - Studio Run in Game endpoint/action and read-only live status/snapshot
    endpoints.
  - Swooper map proof metadata and SDK `[mapgen-proof]` logging.
  - Turbo-backed build/check/test verifier for the Studio direct-control lane.
  - Repeatable live proof command with read-only default and explicit mutation
    flags.
  - OpenSpec changes for setup/start, Studio run, live sync, and build pipeline.
- Verified evidence:
  - `bun run verify:studio-run-in-game` passed.
  - `bun run openspec:validate` passed.
  - `git diff --check` passed.
  - Read-only live gate reproduced the `LSQ:` blocker without mutation.
- Closed findings:
  - All accepted source/spec/build findings listed in
    `review-disposition-ledger.md` are repaired except the live runtime proof
    blocker, which is external-state gated.

## What Is Open

- Remaining tasks:
  - Run mutating live setup/start proof.
  - Record setup snapshot, map row proof, setup readback, Tuner health, map
    seed/dimension proof, Swooper log/hash proof, and reload semantics.
  - Promote evergreen docs only after live proof succeeds.
- Open findings:
  - Live setup/start parity not proven.
  - Reload semantics not proven.
- Blockers:
  - Civ listens on port `4318` but does not answer `LSQ:`.
  - Visual inspection shows the game is alive in a running match, so the issue
    is the tuner listener/API path, not a fully frozen game.
- Dirty/uncommitted files:
  - Closure/handoff artifacts pending commit at packet creation.
- Failing gates:
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000` fails at
    health with `Timed out waiting for Civ7 tuner response to LSQ:`.
- Deferred items:
  - Broad Swooper morphology/ecology suite failures, owned by separate stacks.

## Agent Fleet State

- Active agents: none.
- Completed agents: setup API, Studio materialization, live sync, proof/test,
  build pipeline.
- Assigned write sets: reports under this directory; implementation in owner
  commits.
- Latest evidence: this packet, closure checklist, downstream ledger, live
  proof ledger.
- Open findings: live proof blocker only.
- Running/stale status: no active agents.
- Integration owner: Codex.
- Continue/stop instruction:
  - Continue only when Civ `LSQ:` health recovers, or after a deliberate Civ
    process restart/reload intended to recover the tuner listener.

## Downstream State

- Changes enabled:
  - Studio can call the canonical direct-control boundary for Run in Game.
  - Studio can read live runtime summaries observationally.
  - Developers can run a one-command source/mock verifier.
  - Developers can run a repeatable live proof command.
- Changes blocked:
  - Claiming end-to-end live setup/start parity.
  - Claiming hot deploy/shell reload/process restart semantics.
  - Promoting user-facing evergreen docs as fully live-proven.
- Artifacts realigned:
  - OpenSpec, workstream docs, package scripts, Turbo graph.
- Artifacts still needing realignment:
  - Evergreen docs after live proof.
- Downstream realignment ledger: `downstream-realignment-ledger.md`

## Resume Instructions

1. First inspect:
   - `git status --short --branch`
   - `gt ls --stack`
   - `lsof -nP -iTCP:4318 -sTCP:LISTEN`
   - `docs/projects/civ7-direct-control/workstream/studio-run-in-game/live-proof-ledger.md`
2. Then run:
   - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000`
3. Then do:
   - If health passes, run the mutating proof with concrete map inputs:
     `bun run verify:studio-run-in-game:live -- --mutate --map-script <file> --map-size <size> --seed <seed> --from-running-game exit-to-shell`
   - Update `live-proof-ledger.md`, `phase-record.md`, and this packet with
     the result.
4. Stop if:
   - `LSQ:` still times out after a deliberate Civ listener recovery attempt,
     or the mutating proof reaches a source-contract failure that requires code
     changes.
