# CLI Choice Option Guidance Cleanup Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep option JSON for technology, culture, government, celebration, and
narrative choices focused on semantic play descriptors. Option rows should
differentiate chooser, target, dismissal, and validation actions without
repeating procedural send instructions or pointing callers to alternate command
surfaces for every omitted detail.

## Write Set

- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/src/commands/game/play/choose-government.ts`
- `packages/cli/src/commands/game/play/choose-celebration.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/test/commands/game.play.technology.test.ts`
- `packages/cli/test/commands/game.play.culture.test.ts`
- `packages/cli/test/commands/game.play.celebration-government.test.ts`
- `packages/cli/test/commands/game.play.narrative.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-choice-option-guidance-cleanup-slice.md`

## Boundary

- Choice option action labels are minimal semantic descriptors such as
  `Choose technology.`, `Set culture target.`, and `Validate narrative choice.`
- Omitted reasons describe the compact evidence boundary instead of directing
  callers to another JSON command surface.
- Send/read-only booleans, validation descriptors, parameters, option source
  reads, parser flags, runtime sends, service contracts/routers, controller
  bridge, generated bundles, deployed Civ7 proof, relationship authority, and
  parent Task 5.x/6.x/7.x acceptance are unchanged.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.technology.test.ts game.play.culture.test.ts game.play.celebration-government.test.ts game.play.narrative.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Option guidance absence scan for command recipes and old procedural phrases
  over changed CLI source, with focused tests asserting the emitted payloads
  omit the old phrases.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change oRPC service behavior, or prove controller bridge behavior.
