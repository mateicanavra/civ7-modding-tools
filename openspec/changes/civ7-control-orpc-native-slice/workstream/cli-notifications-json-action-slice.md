# CLI Notifications JSON Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play notifications --json` aligned with the semantic
player-agent output rule. The live notification HUD materializer may still
carry legacy command recipe hints as low-level direct-control presentation
debt, but the caller-facing CLI JSON should not publish `cli` command strings
as the normal action surface.

## Write Set

- `packages/cli/src/commands/game/play/notifications.ts`
- `packages/cli/test/commands/game/play/notification/hud.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-notifications-json-action-slice.md`

## Boundary

- `notifications --json` now projects the notification view before output and
  omits all `cli` fields from HUD decisions, decision details, option rows,
  closeout candidates, and common actions.
- The JSON output preserves semantic categories, operation families,
  operation types, required inputs, common actions, option data, validation
  evidence, notes, and blocker/notification evidence.
- This slice does not change direct-control notification materialization,
  control-oRPC service behavior, service contracts, parser flags, runtime
  reads, controller bridge, generated bundles, play-thread state, deployed
  Civ7 proof, relationship authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game/play/notification/hud.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Notifications JSON command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change the low-level direct-control notification materializer, change
oRPC service behavior, or prove controller bridge behavior.
