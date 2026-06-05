# CLI Narrative Choice oRPC Send Slice

## Scope

Route `civ7 game play choose-narrative --send` through the native in-process
`narrative.choice.request` server-side client under the `narrative`
router. The CLI remains the shell-facing command owner;
`packages/civ7-control-orpc` owns the semantic narrative choice send
procedure; `@civ7/direct-control` remains the low-level runtime/proof port for
official narrative UI closeout behavior, validation, post-read evidence, and
narrative postcondition classification.

The read-only `game play choose-narrative --options` path remains a
direct-control notification/option read. The non-send validation path remains
direct-control player-operation validation.

## Write Set

- `packages/civ7-direct-control/src/play/operations/narrative-request.ts`
- `packages/civ7-direct-control/test/narrative-choice.test.ts`
- `packages/civ7-control-orpc/src/modules/narrative/procedures/choice-request.ts`
- `packages/civ7-control-orpc/test/narrative-choice-procedure.test.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/test/commands/game.play.narrative.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- Send output uses direct-control source evidence for the acted/local player.
  The caller `--player-id` remains validation input and is not send authority
  when official UI closeout uses `GameContext.localPlayerID`.
- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, App UI closeout payloads,
  panel/popup internals, direct-control runtime payloads, or legacy `verified`
  in normal send output.
- No narrative options service read, generic decisions root, or hotseat or
  non-local send-player claim in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control narrative choice tests prove the source-owned request
  result carries top-level acted/local-player evidence from official UI runtime
  reads: caller validation player `2` still returns and acts as local player
  `0`.
- Focused control-oRPC narrative choice tests prove the service projection
  reports source-owned acted-player evidence from the direct-control result
  rather than echoing caller validation identity.
- Focused CLI narrative tests prove the accepted `choose-narrative --send`
  path accepts caller validation player `2`, reports source-owned acted/local
  player `0`, reaches the existing direct-control official UI narrative
  closeout runtime command through the in-process service client path, emits
  semantic `narrative.choice.request` output, and keeps raw
  command/session/state, App UI closeout payloads, runtime payloads, panel/
  popup internals, and legacy `verified` out of normal JSON.
- Closure still requires relevant direct-control/control-oRPC checks,
  `check:cli`, `test:cli:play`, relevant strict OpenSpec validates, diff
  hygiene, and a durable Graphite commit.
