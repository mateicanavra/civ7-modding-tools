# CLI Build Unit Intent Folded Into Build Production

## Scope

The older `civ7 game play build-unit --send` intent is represented by the
current `civ7 game play build-production --unit-type --send` command. Do not
reintroduce a separate `build-unit` wrapper: `build-production` is the CLI
owner for unit, constructible, and project production choices, while
`packages/civ7-control-orpc` owns the semantic production choice send
procedure and `@civ7/direct-control` remains the low-level runtime/proof port.

The read-only unit-production path remains
`game play build-production --unit-type ...` direct-control operation
validation. The send path uses the same `city.production.choice.request`
service procedure as other production choices.

## Write Set

- `packages/cli/src/commands/game/play/build-production.ts`
- `packages/cli/test/commands/game.play.production.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No generic operations root, broad production catalog, or production read
  service in this slice.
- No raw command/session/state/Tuner payloads, UI-closeout payloads, send
  results, before/after runtime probes, production postcondition envelopes, or
  legacy `verified` in normal send output.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI production tests prove the accepted
  `build-production --unit-type --send` path reaches the existing
  direct-control production runtime command through the in-process service
  client path, emits semantic `city.production.choice.request` output for
  `UnitType`, and keeps raw command/session/state, UI-closeout payloads,
  runtime probes, direct-control production envelopes, and legacy `verified`
  out of normal JSON.
- The fixture also proves the legacy generic `sendOperation("city-operation")`
  path is not used for `build-production --unit-type --send`.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
