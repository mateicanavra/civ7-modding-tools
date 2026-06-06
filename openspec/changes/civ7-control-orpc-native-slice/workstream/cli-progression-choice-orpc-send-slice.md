# CLI Progression Choice oRPC Send Slice

## Scope

Route `civ7 game play choose-tech --send` and
`civ7 game play choose-culture --send` through the native in-process
`progression.technology.choice.request` and
`progression.culture.choice.request` server-side clients under the
`progression` router. The CLI remains the shell-facing command owner;
`packages/civ7-control-orpc` owns the semantic progression choice send
procedures; `@civ7/direct-control` remains the low-level runtime/proof port for
notification reads, App UI closeout execution, and progression postcondition
classification.

The `--options` paths remain direct-control notification option reads, and the
read-only validation paths remain direct-control player-operation validation.
Send mode uses the native service closeout workflow; caller-visible `--closeout`
guidance is retired as a compatibility no-op.

## Write Set

- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/test/commands/game.play.technology.test.ts`
- `packages/cli/test/commands/game.play.culture.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, App UI closeout payloads,
  before/after notification views, direct-control runtime envelopes, or legacy
  `verified` in normal send output.
- No progression read service, broad choice catalog, target-node command
  migration, or generic operation tunnel in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI technology/culture tests prove accepted send paths reach the
  existing direct-control progression closeout runtime ports through the
  in-process service client path, emit semantic progression choice output, and
  keep raw command/session/state, runtime envelopes, App UI closeout payloads,
  before/after notification views, and legacy `verified` out of normal JSON.
- Focused CLI tests also prove no-repeat guarded sticky/live-blocker
  postconditions remain semantic `sent-unverified` outputs with do-not-repeat
  next steps, and that culture option output no longer advertises `--closeout`.
- Closure still requires focused control-oRPC progression procedure proof,
  `check:cli`, `test:cli:play`, relevant strict OpenSpec validates, diff
  hygiene, and a durable Graphite commit.
