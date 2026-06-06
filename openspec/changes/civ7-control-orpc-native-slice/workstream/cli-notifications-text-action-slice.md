# CLI Notifications Text Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play notifications` text output aligned with the semantic
player-agent output rule. The non-JSON HUD renderer should describe the current
decision/action semantically without printing exact command recipes. Command
help remains responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/notifications.ts`
- `packages/cli/test/commands/game/play/notification/hud.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-notifications-text-action-slice.md`

## Boundary

- Text-mode Decision HUD rows now print `action: <category>` and operation
  labels instead of `shortcut: <cli>`.
- Text-mode notification rows now print `action: <category>` instead of
  `cli: <command>`.
- Text-mode common action rows omit command suffixes and keep only label and
  timing guidance.
- JSON output remains the raw direct-control notification view for diagnostic
  fidelity; this slice does not remove upstream `cli` fields from JSON.
- This slice does not change direct-control notification materialization, parser
  flags, runtime behavior, controller bridge, generated bundles, play-thread
  state, deployed Civ7 proof, relationship authority, or parent Task
  5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game/play/notification/hud.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Notifications text command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change notification materialization, or prove controller bridge
behavior. JSON output still exposes the direct-control diagnostic view by
design.
