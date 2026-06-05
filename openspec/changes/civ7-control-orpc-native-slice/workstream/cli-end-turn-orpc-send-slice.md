# CLI End-Turn oRPC Send Slice

## Scope

Route `civ7 game play end-turn --send` through the native in-process
`turn.complete.request` server-side client. The CLI remains the shell-facing
command owner; `packages/civ7-control-orpc` owns the semantic send procedure;
`@civ7/direct-control` remains the low-level runtime/proof port for the
turn-completion guard, send command, and postcondition evidence.

The check-only `game play end-turn` path remains the existing direct-control
turn-completion status read. This slice does not invent a same-shaped read
procedure only to wrap that status atom.

## Write Set

- `packages/cli/src/commands/game/play/end-turn.ts`
- `packages/cli/test/commands/game.play.end-turn.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads or legacy `verified` in normal
  send output.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI test proves the send path reaches the real
  `GameContext.sendTurnComplete()` runtime command only through the in-process
  service client path, emits semantic `turn.complete.request` output, and keeps
  raw command/session/state fields out of normal JSON.
- Direct-control request-result and CLI blocked fixtures prove expected
  pre-send guard blocks return semantic `not-sent` output with
  inspect/do-not-repeat next steps while preventing sends for live blockers,
  stale command-units with enabled closeouts, and still-front unit-loss
  reports.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
