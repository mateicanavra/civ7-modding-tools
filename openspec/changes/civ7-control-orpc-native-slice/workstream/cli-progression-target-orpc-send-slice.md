# CLI Progression Target oRPC Send Slice

## Scope

Route `civ7 game play set-tech-target --send` and
`civ7 game play set-culture-target --send` through the native in-process
`progression.technology.target.request` and
`progression.culture.target.request` server-side clients under the
`progression` router. The CLI remains the shell-facing command owner;
`packages/civ7-control-orpc` owns the semantic progression target service
procedures; `@civ7/direct-control` remains the low-level runtime/proof port for
player-operation target sends, validation, command serialization, and
pending-runtime/no-repeat proof facts.

Target-setting is distinct from progression choice closeout. Local tests can
prove the operation mapping, local-player substitution, and output projection,
but they do not prove the live technology or culture target changed. Sent
target results therefore remain `sent-unverified` with do-not-repeat next steps
until a future source-owned progression read/postcondition owner proves target
state changes.

## Write Set

- `packages/civ7-direct-control/src/play/progression/target-request.ts`
- `packages/civ7-direct-control/src/proof/progression-target-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/test/progression-target-request.test.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/progression/contract.ts`
- `packages/civ7-control-orpc/src/modules/progression/router.ts`
- `packages/civ7-control-orpc/src/modules/progression/procedures/target-request.ts`
- `packages/civ7-control-orpc/test/progression-target-procedure.test.ts`
- `packages/cli/src/commands/game/play/set-tech-target.ts`
- `packages/cli/src/commands/game/play/set-culture-target.ts`
- `packages/cli/test/commands/game.play.technology.test.ts`
- `packages/cli/test/commands/game.play.culture.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, game-UI runtime target port,
  or transport work.
- No direct-control procedure-core scaffolding.
- No approval/reason mechanic.
- No `operations`, `decisions`, `choice`, or `action` root; target-setting
  procedures stay under the owning `progression` domain.
- No raw command/session/state/Tuner payloads, generic operation type/args,
  direct-control operation envelopes, or legacy `verified` in normal send
  output.
- No progression read service or target-state postcondition owner in this
  slice.
- No play-thread wake and no live-game/runtime proof claim.
- No controller ingress or parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control target request proof covers technology/culture
  operation mapping, validator-blocked `not-sent`, and pending-runtime/no-repeat
  proof classification.
- Focused control-oRPC target procedure proof covers native progression domain
  leaves, fresh local-player evidence before send, caller `playerId` not
  becoming send authority, raw input rejection, safe tagged error projection,
  semantic output closure, and sent target results staying no-repeat guarded.
- Focused CLI technology/culture tests cover `set-tech-target --send` and
  `set-culture-target --send` through the in-process service client path,
  semantic output, local-player substitution, and raw runtime/detail omission.
- Closure proof collected: focused direct-control request test,
  direct-control check/build, focused and full control-oRPC package tests,
  control-oRPC check/build, focused CLI technology/culture tests,
  `check:cli`, `test:cli:play`, strict OpenSpec validates for
  `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`, and `git diff --check`.
