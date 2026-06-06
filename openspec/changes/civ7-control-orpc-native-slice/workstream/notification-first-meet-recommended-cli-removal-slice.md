# Notification First-Meet Recommended CLI Removal Slice

## Status

Implemented local source/CLI/OpenSpec proof slice.

## Purpose

Remove the remaining first-meet `recommendedCli` command recipe from
direct-control notification details. First-meet guidance should remain semantic
through `recommendedResponse`, while command help and the named response
procedure own exact invocation details.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `packages/cli/src/utils/game-play-shared.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-first-meet-recommended-cli-removal-slice.md`

## Boundary

- First-meet notification details no longer include `recommendedCli`.
- `recommendedResponse: "neutral"` and first-meet response validation evidence
  remain unchanged.
- The unused CLI helper for reading `recommendedCli` from decision details is
  removed.
- This does not change CLI parser behavior, oRPC contracts/routers, controller
  bridge behavior, generated bundles, deployed Civ7 proof, play-thread state,
  relationship authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- First-meet notification-details `recommendedCli` absence scan over changed
  source/test and direct-control dist.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/CLI/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior or remove other legacy compatibility fields.
