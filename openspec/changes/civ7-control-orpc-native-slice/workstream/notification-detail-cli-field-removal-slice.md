# Notification Detail CLI Field Removal Slice

## Purpose

Finish the notification command-recipe burn-down for direct-control
notification details. The play notification read should expose semantic
decision/category, operation family/type, required inputs, option data,
validation probes, enabled/disabled classification, and notes. It should not
emit literal `game play ...` command strings or adapter-owned command fields
inside detail rows.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-detail-cli-field-removal-slice.md`

## Behavior

- Diplomacy response detail options no longer include `cli`.
- Technology/culture option rows no longer include `cli`, `validateCli`, or
  `targetCli`.
- Celebration/government option rows no longer include `cli` or `validateCli`.
- Narrative option rows no longer include `cli`, `validateCli`,
  `dismissalDiagnosticCli`, or `unprovenDismissalCli`.
- Unit-command reconciliation rows no longer include closeout/watch/end-turn
  command recipes.
- Semantic option data, validation probes, enabled/disabled classification,
  notification identifiers, target evidence, and notes remain available for
  service/CLI adapters to project caller-appropriate next actions.

## Boundaries

- No parser flag, CLI command behavior, control-oRPC contract/router,
  controller bridge, transport, deployed Civ7 runtime behavior, or play-thread
  state changes.
- No runtime/live proof claim. This is local source/CLI/oRPC/OpenSpec proof.
- No caller-provided approval or approval-reason mechanic is introduced;
  approval remains retired.
- Relationship authority is unchanged; this slice does not add relationship
  labels.
- Parent Task 5.x/6.x/7.x acceptance remains pending by implication.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts test/play-notification-view-procedure.test.ts`
- `bun run --cwd packages/cli test -- game/play/notification/hud.test.ts game/play/notification/queue.test.ts game/play/priorities.test.ts`
- `bun run --cwd packages/civ7-control-orpc test -- notification-queue-procedure.test.ts attention-priorities-procedure.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Notification detail command-recipe source/test scan.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`
