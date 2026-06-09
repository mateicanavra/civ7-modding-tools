# Progression Player Send Hint Cleanup Slice

## Status

Implemented local source, test, and OpenSpec proof slice.

## Purpose

Remove stale caller `--player-id` guidance and repeated flag variants from
progression player-choice notification send recommendations. Native
progression player-choice send surfaces already derive local-player evidence
inside the `progression.attribute.*` and `progression.tradition.*` service
procedures. Notification action hints should describe the semantic next move
with minimal differentiating context, not restate every validation and closeout
command combination.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/progression-player-send-hint-cleanup-slice.md`

## Boundary

- Progression tradition/attribute notification action hints are playerless for
  mutation sends.
- Action directions avoid separate entries for dry-run validation variants and
  closeout flag variants.
- Dry-run validation remains available through CLI command help and existing
  direct-control validation paths.
- No oRPC contract, router, middleware, bridge, CLI parser, generated bundle,
  direct-control runtime behavior, approval/reason mechanic, play-thread
  action, runtime/live proof claim, or parent Task 5.x/6.x/7.x acceptance is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Stale progression send hint scan for `change-tradition --player-id ... --send`
  and `buy-attribute --player-id ... --send`; remaining hits are focused
  negative assertions.
- Active approval/caller-permission scan over changed files; hits are only
  negative boundary wording.
- `git diff --check`

## Residual Risk

This is local source/test proof only. It does not prove deployed Civ7 runtime
behavior or close broader progression/runtime acceptance.
