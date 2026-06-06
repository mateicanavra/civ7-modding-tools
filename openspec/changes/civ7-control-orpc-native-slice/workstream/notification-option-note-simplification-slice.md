# Notification Option Note Simplification Slice

## Status

Implemented local source/OpenSpec proof slice.

## Purpose

Keep notification chooser notes aligned with the semantic action-guidance rule.
Diplomacy, technology, and culture option details should explain the next play
decision, not instruct callers to use `cli` or `validateCli` fields.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-option-note-simplification-slice.md`

## Boundary

- Diplomacy, technology, and culture chooser notes no longer mention option
  `cli` or `validateCli` fields.
- Option data, validation evidence, and legacy compatibility fields are
  unchanged in this slice.
- This does not change CLI parser behavior, oRPC contracts/routers, controller
  bridge behavior, generated bundles, deployed Civ7 proof, play-thread state,
  relationship authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Notification note command-field wording scan over changed files.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior or remove the legacy compatibility fields themselves.
