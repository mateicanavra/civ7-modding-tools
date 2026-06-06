# CLI Population Placement oRPC Send Slice

## Scope

Route `civ7 game play assign-worker --send` and
`civ7 game play expand-city --send` through the native in-process
`city.population.place.request` server-side client under the `city` router.
The CLI remains the shell-facing command owner; `packages/civ7-control-orpc`
owns the semantic population placement send procedure; `@civ7/direct-control`
remains the low-level runtime/proof port for assign-worker and expand-city
validation, execution, post-read evidence, and population postcondition
classification.

The read-only `game play assign-worker` and `game play expand-city` paths remain
direct-control operation validation. `assign-worker --send` is bounded to the
source-owned one-worker placement atom rather than treating `--amount` as
repeated-send authority, and send mode omits caller `--player-id` while the
service reads live local-player notification evidence.

## Write Set

- `packages/cli/src/commands/game/play/assign-worker.ts`
- `packages/cli/src/commands/game/play/expand-city.ts`
- `packages/cli/test/commands/game.play.population-placement.test.ts`
- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/src/play/ready/city.ts`
- `packages/civ7-direct-control/test/ready-city-view.test.ts`
- `packages/civ7-direct-control/test/ready-city-procedure.test.ts`
- `packages/cli/test/commands/game/play/ready-city.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, send results, before/after
  population postcondition envelopes, direct-control operation envelopes, or
  legacy `verified` in normal send output.
- No population read procedure, repeated-worker send loop, broad city operation
  catalog, or generic operation tunnel in this slice.
- No caller `--player-id` send authority for assign-worker; dry-run validation
  may remain player-scoped because it intentionally calls direct-control
  validation.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI population placement tests prove the accepted `assign-worker
  --send` and `expand-city --send` paths reach the existing direct-control
  runtime ports through the in-process service client path, emit semantic
  `city.population.place.request` output, and keep raw command/session/state,
  runtime operation envelopes, population postcondition envelopes, and legacy
  `verified` out of normal JSON.
- The focused CLI proof also rejects `assign-worker --send --amount` values
  outside the source-owned one-worker atom instead of silently ignoring or
  repeating the requested worker count.
- Focused procedure and CLI proof rejects caller `playerId` on assign-worker
  service input, reads local-player evidence for send mode, and keeps ready-city
  and notification send hints playerless.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
