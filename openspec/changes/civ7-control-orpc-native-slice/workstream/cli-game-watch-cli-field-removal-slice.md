# CLI Game Watch CLI Field Removal Slice

## Intent

Remove the reconstructed `cli` command recipe from `civ7 game watch`
JSON/JSONL observer records. Passive watch output should carry semantic read
evidence, stale-risk metadata, and optional ready-unit/ready-city summaries;
command help owns exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/watch.ts`
- `packages/cli/test/commands/game.play.watch.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-game-watch-cli-field-removal-slice.md`

## Boundary

- No parser flag change.
- No direct-control read/runtime behavior change.
- No control-oRPC contract/router/controller bridge change.
- No deployed Civ7 runtime proof or play-thread action.
- No relationship-label authority change.
- Caller-provided approval remains retired; no approval or approval-reason
  mechanic is introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.watch.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Targeted scans verified no watch observer `cli` builder/output remains, no
  active approval/caller-permission wording was introduced by this slice, and
  no relationship-label vocabulary was introduced. Remaining `game watch`
  command strings are static CLI help examples, not observer-record output.
- `git diff --check`
