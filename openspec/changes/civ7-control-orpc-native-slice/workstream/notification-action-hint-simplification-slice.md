# Notification Action Hint Simplification Slice

## Status

Implemented local source, test, and OpenSpec proof slice.

## Purpose

Simplify notification action directions so they help the player/agent choose
the next semantic move instead of restating every dry-run and send flag
variant. The command help and typed command hierarchy own interface detail;
notification hints should carry only the differentiating context needed to
play the blocker responsibly.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/test/play-notification-view.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/notification-action-hint-simplification-slice.md`

## Boundary

- Named blocker actions are send-oriented where a semantic send surface exists:
  city expansion, town focus/review closeout, production, diplomacy,
  narrative, and advisor-warning directions no longer duplicate separate
  dry-run validation entries.
- Read actions still point to the relevant option/candidate reader when live
  evidence is needed before choosing a move.
- Generic operation validation fallbacks remain for cases without a named
  semantic shortcut.
- No CLI parser behavior, oRPC contract/router/middleware, controller bridge
  schema, generated bundle, direct-control runtime behavior, approval/reason
  mechanic, play-thread action, runtime/live proof claim, or parent
  Task 5.x/6.x/7.x acceptance is introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/play-notification-view.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Stale validation-only action hint scan for removed named blocker directions.
- Active approval/caller-permission scan over changed files; hits are only
  negative boundary wording.
- `git diff --check`

## Residual Risk

This is local source/test proof only. It does not prove deployed Civ7 runtime
behavior, controller bridge behavior, or close broader runtime/product
acceptance.
