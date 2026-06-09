# Unit Upgrade and Resettle Native Slice

## Scope

Add semantic `unit.upgrade.request` and `unit.resettle.request` procedure
leaves under the existing `unit` router, then route
`civ7 game play upgrade-unit --send` and `civ7 game play resettle-unit --send`
through their in-process server-side clients.

`packages/civ7-control-orpc` owns the caller-facing contracts, native oRPC
procedures, semantic output projection, tagged error shape, and server-side
client surface. `@civ7/direct-control` remains the low-level runtime/proof port
for `UNITCOMMAND_UPGRADE` / `UNITCOMMAND_RESETTLE` validation, send execution,
unit postcondition snapshots, and source postcondition classification.

Read-only CLI validation remains direct-control `unit-command` validation. The
new service leaves are not a generic operations root and do not expose
`unit.command.request` as a public procedure.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/unit/contract.ts`
- `packages/civ7-control-orpc/src/modules/unit/router.ts`
- `packages/civ7-control-orpc/src/modules/unit/procedures/command-request.ts`
- `packages/civ7-control-orpc/test/unit-command-procedure.test.ts`
- `packages/cli/src/commands/game/play/upgrade-unit.ts`
- `packages/cli/src/commands/game/play/resettle-unit.ts`
- `packages/cli/test/commands/game.play.operation-wrappers.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No generic `operations` router, `unit.command` public root, broad unit command
  catalog, ready-unit read rewrite, or controller bridge allowlist in this
  slice.
- No direct-control procedure-core scaffolding or caller-local runtime control.
- No raw command/session/state/Tuner payloads, low-level operation enum fields,
  before/after direct-control envelopes, send results, or legacy `verified` in
  normal procedure or CLI output.
- No approval/reason mechanic.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused control-oRPC unit procedure tests prove semantic input closure,
  in-process procedure calls, server-side client calls, tagged error projection,
  raw output omission, confirmed paths, guarded validation-only/no-state-change
  paths, missing postconditions, and validator-blocked not-sent output.
- Focused CLI operation-wrapper tests prove `upgrade-unit --send` and
  `resettle-unit --send` emit semantic unit request output through the native
  service clients while read-only validation remains direct-control.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
