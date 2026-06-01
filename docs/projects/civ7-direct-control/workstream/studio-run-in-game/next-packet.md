# Next Packet

## Workstream State

- Project: Civ7 Direct Control
- Phase: studio-run-in-game
- Branch/Graphite stack: `codex/studio-run-in-game-workstream`
- Last implementation commit:
  live-proof repair commit pending
- Repo state: live-proof repairs/docs pending commit at packet update.

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
  - Read-only live gate passed after Civ process restart.
  - Mutating live setup/start proof passed from a running game using
    `{swooper-maps}/maps/swooper-earthlike.js`, `MAPSIZE_STANDARD`, and seed
    `753190005`.
  - Studio live status/snapshot/entities/GameInfo endpoints passed.
  - Studio durable Run in Game passed with request id
    `studio-run-in-game-mpudxem8-1jz5`, seed `753190006`, setup row count `2`,
    and fresh Swooper request/config/envelope hash markers.
  - Studio disposable Run in Game passed with request id
    `studio-run-in-game-mpuegkpw-1x6o`, seed `753190008`, setup row count `2`,
    and fresh Swooper request/config/envelope hash markers after shell/App UI
    reload made `studio-current` visible.
- Closed findings:
  - All accepted source/spec/build findings listed in
    `review-disposition-ledger.md` are repaired except the live runtime proof
    blocker, which is external-state gated.

## What Is Open

- Remaining tasks:
  - Commit this proof repair/docs slice and restack descendants.
  - Promote evergreen docs after product wording accepts the project-scoped
    direct-control proof as stable behavior.
- Open findings:
  - None for Studio Run in Game direct-control paths.
- Blockers:
  - None for existing repo-backed rows or disposable `studio-current`.
- Dirty/uncommitted files:
  - Closure/handoff artifacts pending commit at packet creation.
- Failing gates:
  - None for the proven paths. Earlier LSQ failures remain recorded as runtime
    freeze evidence.
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
- Open findings: none for this phase.
- Running/stale status: no active agents.
- Integration owner: Codex.
- Continue/stop instruction:
  - Continue with commit/restack.

## Downstream State

- Changes enabled:
  - Studio can call the canonical direct-control boundary for Run in Game.
  - Studio can read live runtime summaries observationally.
  - Developers can run a one-command source/mock verifier.
  - Developers can run a repeatable live proof command.
  - Disposable Studio current-config launch can run through `studio-current`
    after direct-control shell/App UI reload.
- Changes blocked:
  - None for this project-scoped phase.
- Artifacts realigned:
  - OpenSpec, workstream docs, package scripts, Turbo graph.
- Artifacts still needing realignment:
  - Evergreen docs after this project-scoped proof is accepted as stable
    product behavior.
- Downstream realignment ledger: `downstream-realignment-ledger.md`

## Resume Instructions

1. First inspect:
   - `git status --short --branch`
   - `gt ls --stack`
   - `lsof -nP -iTCP:4318 -sTCP:LISTEN`
   - `docs/projects/civ7-direct-control/workstream/studio-run-in-game/live-proof-ledger.md`
2. Then run verification:
   - `bun run verify:studio-run-in-game`
   - `bun run openspec:validate`
   - `git diff --check`
3. Then do:
   - Commit this slice through Graphite.
   - Restack descendants with `gt restack --upstack`.
4. Stop if:
   - Verification finds a regression in the durable-row path.
