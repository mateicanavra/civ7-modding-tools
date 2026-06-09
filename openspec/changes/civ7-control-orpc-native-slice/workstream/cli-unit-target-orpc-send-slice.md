# CLI Unit Target oRPC Send Slice

## Scope

Route `civ7 game play unit-target --send` through the native in-process
`unit.target.action.request` server-side client under the `unit` router. The
CLI remains the shell-facing command owner; `packages/civ7-control-orpc` owns
the semantic unit target action send procedure; `@civ7/direct-control` remains
the low-level runtime/proof port for target-action planning, validator
selection, send execution, bounded post-read, and unit-target postcondition
evidence.

The read-only `game play unit-target` path remains the existing direct-control
unit target action planning read. This slice does not add a facade-only unit
target read procedure.

## Write Set

- `packages/cli/src/commands/game/play/unit-target.ts`
- `packages/cli/test/commands/game.play.unit-target.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, send results, before/after
  runtime probes, direct-control verification envelopes, or legacy `verified`
  in normal send output.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI test proves the approved send path reaches the existing
  direct-control unit target runtime command through the in-process service
  client path, emits semantic `unit.target.action.request` output, and keeps
  raw command/session/state, send results, runtime probes, direct-control
  verification envelopes, and legacy `verified` out of normal JSON.
- Existing no-op, delayed postcondition, and path-shortfall fixtures continue
  to prove unverified and no-repeat guarded unit target outcomes in the CLI
  surface.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
