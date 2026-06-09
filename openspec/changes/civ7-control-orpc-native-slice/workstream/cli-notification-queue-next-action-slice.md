# CLI Notification Queue Next-Action Slice

## Status

Implemented local CLI/test/OpenSpec proof slice.

## Purpose

Keep `civ7 game play notification-queue` follow-up suggestions semantic instead
of turning service `nextStep` objects back into literal CLI command recipes.
The native service already owns queue disposition and next-step meaning; the
CLI adapter should display that concise semantic guidance and leave exhaustive
flag/interface detail to command help.

## Write Set

- `packages/cli/src/commands/game/play/notification-queue.ts`
- `packages/cli/test/commands/game/play/notification/queue.test.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/queue.ts`
- `packages/civ7-control-orpc/test/notification-queue-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-notification-queue-next-action-slice.md`

## Boundary

- JSON output preserves the service-owned `nextStep` objects and no longer adds
  an adapter-only `command` field to queue rows.
- Human-readable output prints the semantic next-step label, not a generated
  command string.
- Notification queue service classification uses semantic decision fields such
  as `operationFamily`, not legacy direct-control `cli` hints.
- The service contract, CLI parser flags, runtime direct-control reads,
  controller bridge, generated bundles, approval/reason mechanics, play-thread
  state, deployed Civ7 proof, and parent Task 5.x/6.x/7.x acceptance are
  unchanged.

## Proof Collected

- `bun run test:cli:play -- game/play/notification/queue.test.ts`
- `bun run --cwd packages/civ7-control-orpc test test/notification-queue-procedure.test.ts`
- `bun run check:cli`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Queue command-recipe output scan over the changed CLI source/test.
- Active approval/caller-permission scan over changed files; hits are only
  negative boundary wording.
- `git diff --check`

## Residual Risk

This is local package/CLI proof only. It does not prove deployed Civ7 runtime
behavior, change the notification queue service contract, or prove controller
bridge behavior.
