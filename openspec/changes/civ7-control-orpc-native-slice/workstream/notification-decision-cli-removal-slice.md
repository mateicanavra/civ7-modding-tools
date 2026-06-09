# Notification Decision CLI Removal Slice

## Status

Implemented local source/CLI/oRPC/OpenSpec proof slice.

## Purpose

Remove the top-level direct-control notification `decision.cli` command summary.
Decision hints should describe the semantic category, operation family/type,
required inputs, common actions, notes, and confidence. Exact command syntax
belongs to CLI help and caller-specific adapters, not the direct-control
notification read contract.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/cli/src/commands/game/watch.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-decision-cli-removal-slice.md`

## Boundary

- Direct-control notification `decision` and HUD queue items no longer include
  or schema-admit the top-level `cli` command summary.
- `game watch` no longer re-emits that removed summary field.
- Detail-level option compatibility fields, direct-control notification
  materialization, semantic category/family/type fields, required inputs,
  common actions, parser flags, control-oRPC contracts/routers, controller
  bridge, generated bundles, play-thread state, deployed Civ7 proof,
  relationship authority, and parent Task 5.x/6.x/7.x acceptance remain
  unchanged.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts test/play-notification-view-procedure.test.ts`
- `bun run --cwd packages/cli test -- game/play/notification/hud.test.ts game/play/priorities.test.ts`
- `bun run --cwd packages/civ7-control-orpc test -- notification-queue-procedure.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Top-level notification decision `cli` source/test scan.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/CLI/oRPC/OpenSpec proof only. It does not prove deployed
Civ7 runtime behavior and does not remove detail-level compatibility fields.
