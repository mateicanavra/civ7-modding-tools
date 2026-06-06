# CLI Notification Queue oRPC Slice

## Status

Local package, CLI, and OpenSpec proof collected.

## Purpose

Route `civ7 game play notification-queue` and
`civ7 game play dismiss-notification-queue` through native in-process
notification queue service procedures.

The control-oRPC service owns queue disposition, informational dismissal
eligibility, exclusion reasons, semantic next-step descriptors, readiness-gated
aggregate dismissal, and proof/no-repeat projection. The CLI remains an edge
adapter: it builds endpoint context, parses flags, calls the server-side client,
and maps semantic next-step descriptors into command suggestions for CLI output
only.

## Write Set

- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/notifications/contract.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/dismiss-request.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/queue.ts`
- `packages/civ7-control-orpc/src/modules/notifications/router.ts`
- `packages/civ7-control-orpc/test/notification-queue-procedure.test.ts`
- `packages/cli/src/commands/game/play/notification-queue.ts`
- `packages/cli/src/commands/game/play/dismiss-notification-queue.ts`
- `packages/cli/test/commands/game/play/notification/queue.test.ts`
- `packages/cli/test/commands/game/play/notification/dismiss-queue.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-notification-queue-orpc-slice.md`

## Boundary

- `notifications.queue.current` composes the direct-control notification HUD
  queue read into semantic schedule items without exposing raw notification
  details as the service contract.
- `notifications.queue.dismiss.request` passes native mutation readiness and
  proof/no-repeat middleware, selects only eligible informational dismissal
  candidates, invokes item-scoped notification dismissal runtime ports, and
  keeps aggregate unverified sends do-not-repeat guarded.
- Service output uses semantic next-step descriptors. Literal `game play ...`
  command strings are CLI presentation only.
- Normal output omits raw host, port, state, session, command, rawCommand,
  direct-control runtime envelopes, raw App UI closeout internals, legacy
  `verified`, approval/reason mechanics, raw operation payloads, and transport
  details.
- Operation-bearing, unit-command, production, diplomacy, narrative,
  progression, population, and unclassified notifications remain excluded from
  bulk dismissal.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/notification-queue-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game/play/notification/queue.test.ts game/play/notification/dismiss-queue.test.ts`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan: queue input/result schemas remain
  contract-local constants; no procedure schema bag is exported.
- Active approval/caller-permission scan: hits are limited to negative
  boundary wording and the focused bad-input assertion.
- Service-output CLI-string scan: `notifications.queue.*` service source has
  no literal `game play ...` command strings.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, controller bridge allowlisting, live notification queue
mutation behavior, broad operation catalog support, transport expansion,
approval/reason mechanics, or parent Task 5.x/6.x/7.x acceptance.
