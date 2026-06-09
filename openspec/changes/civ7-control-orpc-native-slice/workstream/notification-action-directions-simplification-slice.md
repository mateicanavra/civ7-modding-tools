# Notification Action Directions Simplification Slice

## Status

Implemented local source/OpenSpec proof slice.

## Purpose

Remove literal `game play ...` command recipes from direct-control notification
`decision.commonActions`. These action directions should describe the semantic
operation/read step and the differentiating evidence needed to choose it. CLI
help owns exact flag combinations.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-action-directions-simplification-slice.md`

## Boundary

- Direct-control notification `commonActions` no longer include or schema-admit
  `cli` command recipes. They keep semantic `label`, `operationFamily`,
  `operationType`, `argsShape`, and `when` guidance.
- The legacy `decision.cli` summary field, per-option compatibility fields,
  notification details, runtime reads, parser flags, CLI renderers, control-oRPC
  contracts/routers, controller bridge, generated bundles, play-thread state,
  deployed Civ7 proof, relationship authority, and parent Task 5.x/6.x/7.x
  acceptance remain unchanged.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Notification common-action command-recipe scan over changed source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior and does not remove older compatibility fields outside
`decision.commonActions`.
