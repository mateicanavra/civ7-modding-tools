# CLI Unit Move Preview Next-Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play unit-move-preview --compact` action guidance semantic.
The compact movement preview should help the player-agent decide the next
movement validation target without expanding that into literal
command-and-flag recipes. Command help remains responsible for exhaustive
interface detail.

## Write Set

- `packages/cli/src/commands/game/play/unit-move-preview.ts`
- `packages/cli/test/commands/game/play/unit-move-preview.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-unit-move-preview-next-action-slice.md`

## Boundary

- Compact JSON now exposes semantic `nextAction` descriptors for the requested
  destination and candidate plot rows.
- The compact output no longer emits `game play unit-target ...` recipes or a
  CLI command string as the output surface identifier.
- This slice does not change runtime direct-control reads, parser flags,
  service contracts, controller bridge, generated bundles, play-thread state,
  deployed Civ7 proof, relationship authority, or parent Task 5.x/6.x/7.x
  acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run test:cli:play -- game/play/unit-move-preview.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Unit-move-preview command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files; no active hits.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change movement-preview runtime evidence, or prove controller bridge
behavior.
