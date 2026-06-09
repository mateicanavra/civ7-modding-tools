# CLI Town-Focus oRPC Send Slice

## Scope

Route `civ7 game play set-town-focus --send` and
`civ7 game play consider-town-project --send` through native in-process city
town-focus procedures:

- `city.townFocus.change.request`
- `city.townFocus.review.request`

The CLI remains the shell-facing command owner. `packages/civ7-control-orpc`
owns the semantic city town-focus service behavior: readiness, semantic output
projection, raw-output exclusion, and no-repeat next steps.
`@civ7/direct-control` remains the low-level runtime/proof port for
city-command/city-operation validation, send execution, command serialization,
and pending-runtime/no-repeat proof facts.

Town-focus is a city-domain capability. Low-level operation names such as
`CHANGE_GROWTH_MODE` and `CONSIDER_TOWN_PROJECT` remain direct-control runtime
details and are not caller-facing service roots or normal output facts.

## Write Set

- `packages/civ7-direct-control/src/play/city/town-focus-request.ts`
- `packages/civ7-direct-control/src/proof/town-focus-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/test/town-focus-request.test.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/modules/city/router.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/town-focus-request.ts`
- `packages/civ7-control-orpc/test/city-town-focus-procedure.test.ts`
- `packages/cli/src/commands/game/play/set-town-focus.ts`
- `packages/cli/src/commands/game/play/consider-town-project.ts`
- `packages/cli/test/commands/game.play.town-focus.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, game-UI town-focus runtime
  port, or transport work.
- No direct-control procedure-core scaffolding.
- No approval/reason mechanic.
- No `operations`, `actions`, or generic operation root; town-focus
  procedures stay under the owning `city` domain.
- No raw command/session/state/Tuner payloads, generic operation type/args,
  direct-control operation envelopes, or legacy `verified` in normal send
  output.
- No caller utility export of the new per-leaf input/result schemas or
  Standard Schema adapters; those schemas stay private to the contract module,
  and callers use the aggregate contract/router/server client.
- No public package-root export of raw direct-control result aliases or
  procedure implementations.
- No city read service or town-project review-clearance postcondition owner in
  this slice.
- No play-thread wake and no live-game/runtime proof claim.
- No controller ingress or parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused direct-control town-focus request proof covers change/review
  operation mapping, validator-blocked `not-sent`, invalid integer rejection
  before operation construction, and pending-runtime/no-repeat proof
  classification.
- Focused control-oRPC city town-focus procedure proof covers native city
  domain leaves, raw input rejection, safe tagged error projection, semantic
  output closure, no `operations`/`actions` compatibility root, and sent
  town-focus requests staying no-repeat guarded.
- Focused CLI town-focus tests cover both migrated send commands through the
  in-process service client path, `--closeout` workflow composition through
  native leaves, raw runtime/detail omission, and removal of raw
  `sendPlayOperation` fallback branches.
- Closure proof collected: focused direct-control request test,
  direct-control full package test/check/build, focused and full
  control-oRPC package tests, control-oRPC check/build, focused CLI
  town-focus tests, `check:cli`, `test:cli:play`, strict OpenSpec validates
  for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`, approval/reason and
  package-root schema export scans, and `git diff --check`.
