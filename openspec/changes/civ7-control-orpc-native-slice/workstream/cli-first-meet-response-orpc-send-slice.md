# CLI First-Meet Response oRPC Send Slice

## Scope

Route `civ7 game play respond-first-meet --send` through the native
in-process `diplomacy.firstMeet.response.request` server-side client under
the `diplomacy` router. The CLI remains the shell-facing command owner;
`packages/civ7-control-orpc` owns the semantic first-meet response service
projection; `@civ7/direct-control` owns the low-level player-operation
runtime port, notification reads, first-meet postcondition classifier, and
no-repeat proof facts.

The read-only `game play respond-first-meet` path remains direct-control
player-operation validation. First-meet remains distinct from ordinary
`diplomacy.response.request`: it sends
`RESPOND_DIPLOMATIC_FIRST_MEET` with `{ Player1, Player2, Type }` and proves
postconditions against `PLAYER_MET` notification evidence.

## Write Set

- `packages/civ7-direct-control/src/play/operations/first-meet-request.ts`
- `packages/civ7-direct-control/src/play/operations/first-meet-postconditions.ts`
- `packages/civ7-direct-control/src/proof/first-meet-response-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/test/first-meet-response.test.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/contract.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/router.ts`
- `packages/civ7-control-orpc/src/modules/diplomacy/procedures/first-meet-response-request.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/first-meet-response-procedure.test.ts`
- `packages/cli/src/commands/game/play/respond-first-meet.ts`
- `packages/cli/test/commands/game.play.first-meet.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No generic `operations` root, broad diplomacy catalog, direct-control
  procedure-core scaffolding, or facade-only service shell.
- No Studio, controller bridge, RPCLink, OpenAPI, game-UI runtime
  implementation, or transport expansion.
- No raw command/session/state/Tuner payloads, direct-control operation
  envelopes, before/after notification snapshots, or legacy `verified` in
  normal send output.
- No ordinary diplomacy-response closeout reuse; first-meet uses the
  first-meet domain path and source-owned `PLAYER_MET` blocker proof.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control first-meet tests prove source-owned first-meet
  postconditions for cleared, sticky-blocker, and validator-blocked paths.
- Focused control-oRPC first-meet procedure tests prove the
  `diplomacy.firstMeet.response.request` contract/router leaf, semantic
  projection, no-repeat guarded sticky blockers, invalid raw input rejection,
  tagged error projection, and in-process server-side client call.
- Focused CLI first-meet tests prove `respond-first-meet --send` reaches the
  native in-process service client, emits semantic first-meet response output,
  keeps raw operation/session/command/proof envelopes out of normal JSON, and
  keeps sticky first-meet blockers no-repeat guarded.
- Closure proof collected: direct-control check/build plus focused first-meet
  and diplomacy proof tests; full control-oRPC package test/check/build;
  focused CLI first-meet test, `check:cli`, and `test:cli:play`; strict
  OpenSpec validates for this change and the support modularization change;
  diff hygiene. This remains local proof only, with live Civ7 runtime proof
  pending.
