# CLI Advisor Warning oRPC Slice

## Status

Local direct-control, control-oRPC, CLI, and OpenSpec closure proof collected.

## Purpose

Route `civ7 game play advisor-warning --send` through the native in-process
`notifications.advisorWarning.viewed.request` service procedure instead of the
legacy CLI-local generic `sendPlayOperation("player-operation", ...)` path.

The control-oRPC service owns caller-facing target-only input, local-player
evidence, semantic validation and pending-runtime-proof projection, tagged
errors, and raw-output exclusion. `@civ7/direct-control` owns the low-level
`VIEWED_ADVISOR_WARNING` runtime/proof port and direct-control validation
evidence.

## Write Set

- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/play/notifications/advisor-warning-request.ts`
- `packages/civ7-direct-control/src/proof/advisor-warning-proof-policy.ts`
- `packages/civ7-direct-control/test/advisor-warning-request.test.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/notifications/contract.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/advisor-warning-request.ts`
- `packages/civ7-control-orpc/src/modules/notifications/router.ts`
- `packages/civ7-control-orpc/test/notification-advisor-warning-procedure.test.ts`
- `packages/cli/src/commands/game/play/advisor-warning.ts`
- `packages/cli/test/commands/game.play.operation-wrappers.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-advisor-warning-orpc-slice.md`

## Boundary

- `notifications.advisorWarning.viewed.request` is a notification-domain
  mutation, not an `operations` root or broad player-operation catalog.
- Send-mode public input is target-only. The procedure reads fresh
  notification view local-player evidence and does not accept caller
  `playerId` as send authority.
- Sent outcomes remain pending-runtime-proof and do-not-repeat guarded. Local
  tests do not prove the live advisor warning blocker cleared.
- Normal output omits raw host, port, state, session, command, rawCommand,
  direct-control runtime envelopes, raw `VIEWED_ADVISOR_WARNING` / `Target`
  payload details, legacy `verified`, approval/reason mechanics, and transport
  details.
- Game-UI/controller advisor-warning mutation support remains unsupported in
  this slice.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/advisor-warning-request.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test test/notification-advisor-warning-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game.play.operation-wrappers.test.ts`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan: advisor-warning input/result schemas
  remain contract-local constants; no procedure schema bag is exported.
- Active approval/caller-permission scan: hits are limited to negative
  boundary wording and the focused bad-input assertion.
- Raw operation output scan: normal service/CLI send surfaces omit raw
  player-operation envelopes; remaining `VIEWED_ADVISOR_WARNING` /
  `player-operation` source hits are dry-run validation implementation.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, game-UI/controller bridge support, transport expansion,
approval/reason mechanics, a broad operation catalog, or parent Task
5.x/6.x/7.x acceptance.
