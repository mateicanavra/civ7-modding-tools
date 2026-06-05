# CLI Diplomacy Response oRPC Send Slice

## Scope

Route `civ7 game play respond-diplomacy --send` through the native in-process
`diplomacy.response.request` server-side client under the
`diplomacy` router. The CLI remains the shell-facing command owner;
`packages/civ7-control-orpc` owns the semantic diplomacy response send
procedure; `@civ7/direct-control` remains the low-level runtime/proof port for
official UI closeout behavior, validation, post-read evidence, and diplomacy
postcondition classification.

The read-only `game play respond-diplomacy` path remains direct-control
player-operation validation. `game play respond-first-meet` remains outside
this slice because first-meet handling is a separate diplomacy capability.

## Write Set

- `packages/civ7-direct-control/src/play/operations/diplomacy-request.ts`
- `packages/civ7-direct-control/test/diplomacy-response.test.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/procedures/response-request.ts`
- `packages/civ7-control-orpc/test/diplomacy-response-procedure.test.ts`
- `packages/cli/src/commands/game/play/respond-diplomacy.ts`
- `packages/cli/test/commands/game.play.diplomacy-response.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- Send output uses direct-control source evidence for the acted/local player.
  The caller `--player-id` remains validation input and is not send authority
  when official UI closeout uses `GameContext.localPlayerID`.
- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, UI closeout payloads, activation
  internals, diplomacy state internals, direct-control runtime payloads, or
  legacy `verified` in normal send output.
- No `game play respond-first-meet` migration, broad diplomacy catalog, or
  hotseat/non-local send-player claim in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control diplomacy response tests prove the source-owned
  request result carries top-level acted/local-player evidence from official
  UI runtime reads: caller validation player `2` still returns and acts as
  local player `0`.
- Focused control-oRPC diplomacy response tests prove the service projection
  reports source-owned acted-player evidence from the direct-control result
  rather than echoing caller validation identity.
- Focused CLI diplomacy response tests prove the accepted
  `respond-diplomacy --send` path reaches the existing direct-control official
  UI closeout runtime command through the in-process service client path,
  emits semantic `diplomacy.response.request` output, and keeps raw
  command/session/state, UI closeout payloads, runtime payloads, diplomacy
  internals, and legacy `verified` out of normal JSON.
- Closure still requires relevant control-oRPC checks, `check:cli`,
  `test:cli:play`, relevant strict OpenSpec validates, diff hygiene, and a
  durable Graphite commit.
