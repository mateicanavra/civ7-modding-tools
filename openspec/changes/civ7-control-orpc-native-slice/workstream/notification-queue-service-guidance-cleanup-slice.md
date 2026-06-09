# Notification Queue Service Guidance Cleanup Slice

## Status

Implemented local control-oRPC/CLI/OpenSpec proof slice.

## Purpose

Keep `notifications.queue.current` service output caller-neutral. The service
should describe current-domain evidence, item-scoped dismissal, and validation
boundaries without referring to specialized commands or procedural "before
sending" command-surface wording.

## Write Set

- `packages/civ7-control-orpc/src/modules/notifications/procedures/queue.ts`
- `packages/civ7-control-orpc/test/notification-queue-procedure.test.ts`
- `packages/cli/test/commands/game/play/notification/queue.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-queue-service-guidance-cleanup-slice.md`

## Boundary

- Notification queue notes, guardrails, and next-step labels now use semantic
  validation/current-surface wording.
- Procedure contracts, route keys, next-step kinds, parser flags, runtime reads,
  dismissal send behavior, controller bridge, generated bundles, deployed Civ7
  proof, relationship authority, and parent Task 5.x/6.x/7.x acceptance are
  unchanged.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test -- notification-queue-procedure.test.ts`
- `bun run --cwd packages/cli test -- game/play/notification/queue.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Service guidance phrase scan over changed notification queue source, with
  focused tests asserting emitted queue output omits the retired phrases.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local package/CLI/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior, change controller bridge behavior, or accept parent Task
5.x/6.x/7.x scope.
