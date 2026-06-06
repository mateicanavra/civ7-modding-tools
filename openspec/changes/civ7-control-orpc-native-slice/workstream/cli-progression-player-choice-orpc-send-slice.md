# CLI Progression Player-Choice oRPC Send Slice

## Scope

Route `civ7 game play buy-attribute --send`,
`civ7 game play consider-attributes --send`,
`civ7 game play change-tradition --send`, and
`civ7 game play consider-traditions --send` through native in-process
progression player-choice procedures:

- `progression.attribute.purchase.request`
- `progression.attribute.review.request`
- `progression.tradition.change.request`
- `progression.tradition.review.request`

The CLI remains the shell-facing command owner. `packages/civ7-control-orpc`
owns the semantic progression player-choice service behavior: readiness,
current local-player evidence, semantic output projection, raw-output
exclusion, and no-repeat next steps. `@civ7/direct-control` remains the
low-level runtime/proof port for player-operation validation, send execution,
command serialization, and pending-runtime/no-repeat proof facts.

Send-mode public inputs intentionally omit caller `playerId`; the procedures
read live local-player evidence before invoking the direct-control runtime
port. Read-only validation paths still require `--player-id` and remain
direct-control validation until separate service-owned progression reads exist.

## Write Set

- `packages/civ7-direct-control/src/play/progression/player-choice-request.ts`
- `packages/civ7-direct-control/src/proof/progression-player-choice-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/test/progression-player-choice-request.test.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/progression/contract.ts`
- `packages/civ7-control-orpc/src/modules/progression/router.ts`
- `packages/civ7-control-orpc/src/modules/progression/procedures/player-choice-request.ts`
- `packages/civ7-control-orpc/test/progression-player-choice-procedure.test.ts`
- `packages/cli/src/commands/game/play/buy-attribute.ts`
- `packages/cli/src/commands/game/play/consider-attributes.ts`
- `packages/cli/src/commands/game/play/change-tradition.ts`
- `packages/cli/src/commands/game/play/consider-traditions.ts`
- `packages/cli/test/commands/game.play.attribute-tradition.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, game-UI runtime
  attribute/tradition port, or transport work.
- No direct-control procedure-core scaffolding.
- No approval/reason mechanic.
- No `operations`, `decisions`, `choice`, or `action` root; player-choice
  procedures stay under the owning `progression` domain.
- No caller `playerId` in the new attribute/tradition send procedure inputs.
- No raw command/session/state/Tuner payloads, generic operation type/args,
  direct-control operation envelopes, or legacy `verified` in normal send
  output.
- No caller utility export of the new per-leaf input/result schemas or
  Standard Schema adapters; those schemas stay private to the contract module,
  and callers use the aggregate contract/router/server client.
- No public package-root export of raw direct-control result aliases or
  procedure implementations.
- No progression read service or blocker/review-clearance postcondition owner
  in this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No controller ingress or parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control progression player-choice request proof covers
  attribute purchase/review and tradition change/review operation mapping,
  validator-blocked `not-sent`, invalid integer rejection before send, and
  pending-runtime/no-repeat proof classification.
- Focused control-oRPC progression player-choice procedure proof covers native
  progression domain leaves, fresh local-player evidence before send, caller
  `playerId` rejection in the new public inputs, raw input rejection, safe
  tagged error projection, semantic output closure, and sent player-choice
  requests staying no-repeat guarded.
- Focused CLI attribute/tradition tests cover all four migrated send commands
  through the in-process service client path, `--closeout` workflows composed
  through native leaves, local-player substitution, raw runtime/detail
  omission, and removal of dead raw `sendPlayOperation` fallback branches.
- Closure proof collected: focused direct-control request test,
  direct-control check/build, focused and full control-oRPC package tests,
  control-oRPC check/build, focused CLI attribute/tradition tests,
  `check:cli`, `test:cli:play`, strict OpenSpec validates for
  `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`, approval/reason and
  package-root schema export scans, and `git diff --check`.
