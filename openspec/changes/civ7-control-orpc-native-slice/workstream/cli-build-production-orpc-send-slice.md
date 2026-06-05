# CLI Build Production oRPC Send Slice

## Scope

Route `civ7 game play build-production --send` through the native in-process
`city.production.choice.request` server-side client under the `city` router.
The CLI remains the shell-facing command owner; `packages/civ7-control-orpc`
owns the semantic production choice send procedure; `@civ7/direct-control`
remains the low-level runtime/proof port for production validation, closeout
execution, post-read evidence, and production postcondition classification.

The read-only `game play build-production` path remains direct-control
operation validation. `game play build-unit` remains outside this slice because
it is a separate convenience command over the older generic operation wrapper.

## Write Set

- `packages/cli/src/commands/game/play/build-production.ts`
- `packages/cli/test/commands/game.play.production.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, UI-closeout payloads, send
  results, before/after runtime probes, production postcondition envelopes, or
  legacy `verified` in normal send output.
- No `game play build-unit` migration, production read procedure, or broad city
  production catalog in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI production tests prove the accepted `build-production --send`
  path reaches the existing direct-control production runtime command through
  the in-process service client path, emits semantic
  `city.production.choice.request` output, and keeps raw command/session/state,
  UI-closeout payloads, runtime probes, direct-control production envelopes,
  and legacy `verified` out of normal JSON.
- Existing cleared and blocker-still-live fixtures continue to prove confirmed
  and no-repeat guarded production outcomes in the CLI surface.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
