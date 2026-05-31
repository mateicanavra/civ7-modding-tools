# Live Proof Ledger

## Scope

Track fresh runtime evidence for Studio Run in Game and live sync claims. Use
this ledger for observations that depend on a running Civ7 instance.

## Entries

### 2026-05-31 LSQ Timeout After Return-To-Shell Probe

- Proof id: `studio-run-in-game-lsq-timeout-2026-05-31`
- Status: failed / blocker for live mutation proof.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Context: a narrow live mutation probe sent `engine.call("exitToMainMenu")`
  from App UI while trying to prove the setup/start sequence from a running
  game. The command path then timed out while waiting for the next LSQ
  response.
- Evidence:
  - `lsof -nP -iTCP:4318 -sTCP:LISTEN` still shows Civ listening on port 4318.
  - `checkCiv7DirectControlHealth({ timeoutMs: 3000 })` returns
    `all-hosts-unavailable` with `Timed out waiting for Civ7 tuner response to
    LSQ:`.
  - `getCiv7AppUiSnapshot({ timeoutMs: 3000 })` fails with
    `response-timeout` on LSQ.
  - Computer Use showed Civ still in a running game window, so the process is
    alive but the tuner socket is not responding to state queries.
- Mutation replay count: 0 after the failed probe.
- Verdict: no setup/start parity claim can be marked live-proven until a fresh
  Civ tuner socket responds to LSQ again. Source and mock tests may proceed, but
  Studio dependence remains gated by a later passing live proof entry.

## Required Proofs

- App UI setup snapshot from shell/main menu.
- Return-to-shell behavior from a running game.
- Map row existence in `GameInfo.Maps` after generation/deploy.
- Setup map script/size/map seed/game seed applied before host/start.
- Host/start single-player game from prepared setup.
- Post-start `GameplayMap.getRandomSeed()` matches Studio seed.
- Post-start map dimensions match selected map size/options.
- Swooper `Scripting.log` markers and config hash prove exact config loaded.
- Reload semantics: hot deploy, shell reload, or process restart requirement.
- Live sync: map/player/unit/city/resource/visibility snapshots refresh by turn
  without writing authored `pipelineConfig`.
