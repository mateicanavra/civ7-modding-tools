# CLI Government-Domain Choice oRPC Send Slice

## Scope

Route `civ7 game play choose-government --send` and
`civ7 game play choose-celebration --send` through the native in-process
`government.choice.request` and `government.celebration.choice.request`
server-side clients under the `government` router. The CLI remains the
shell-facing command owner; `packages/civ7-control-orpc` owns the semantic
government-domain service procedures; `@civ7/direct-control` remains the
low-level runtime/proof port for player-operation sends, validation, command
serialization, and pending-runtime/no-repeat proof facts.

Government and celebration choices are distinct from progression closeouts.
Local tests can prove operation mapping, local-player substitution, and output
projection, but they do not prove the live government or celebration blocker
cleared. Sent results therefore remain `sent-unverified` with do-not-repeat
next steps until a future source-owned government-domain read/postcondition
owner proves blocker clearance.

## Write Set

- `packages/civ7-direct-control/src/play/government/choice-request.ts`
- `packages/civ7-direct-control/src/proof/government-choice-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/test/government-choice-request.test.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/metadata.ts`
- `packages/civ7-control-orpc/src/modules/government/contract.ts`
- `packages/civ7-control-orpc/src/modules/government/router.ts`
- `packages/civ7-control-orpc/src/modules/government/procedures/choice-request.ts`
- `packages/civ7-control-orpc/src/contract.ts`
- `packages/civ7-control-orpc/src/router.ts`
- `packages/civ7-control-orpc/test/government-choice-procedure.test.ts`
- `packages/cli/src/commands/game/play/choose-government.ts`
- `packages/cli/src/commands/game/play/choose-celebration.ts`
- `packages/cli/test/commands/game.play.celebration-government.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, game-UI runtime
  government-choice port, or transport work.
- No direct-control procedure-core scaffolding.
- No approval/reason mechanic.
- No `operations`, `decisions`, `choice`, or `action` root; government-domain
  choice procedures stay under the owning `government` domain.
- No raw command/session/state/Tuner payloads, generic operation type/args,
  direct-control operation envelopes, or legacy `verified` in normal send
  output.
- No government-domain read service or blocker-clearance postcondition owner
  in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No controller ingress or parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control government-domain request proof covers
  government/celebration operation mapping, validator-blocked `not-sent`,
  source-owned default government action evidence, and pending-runtime/no-repeat
  proof classification.
- Focused control-oRPC government procedure proof covers native government
  domain leaves, fresh local-player evidence before send, caller `playerId` not
  becoming send authority, raw input rejection, safe tagged error projection,
  semantic output closure, and sent choices staying no-repeat guarded.
- Focused CLI celebration/government tests cover `choose-celebration --send`
  and `choose-government --send` through the in-process service client path,
  semantic output, local-player substitution, and raw runtime/detail omission.
- Closure proof collected: focused direct-control request test,
  direct-control check/build, focused and full control-oRPC package tests,
  control-oRPC check/build, focused CLI celebration/government tests,
  `check:cli`, `test:cli:play`, strict OpenSpec validates for
  `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`, and `git diff --check`.
