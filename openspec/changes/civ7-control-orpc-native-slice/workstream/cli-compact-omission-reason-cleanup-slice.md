# CLI Compact Omission Reason Cleanup Slice

## Intent

Simplify compact `omitted[].reason` text so it describes the semantic evidence
boundary instead of instructing callers which JSON/compact flags or tactical
commands to use. Compact output should explain what was omitted and why it
matters, not repeat interface mechanics.

## Write Set

- `packages/cli/src/commands/game/play/ready-city.ts`
- `packages/cli/src/commands/game/play/unit-move-preview.ts`
- `packages/cli/src/commands/game/play/priorities.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-compact-omission-reason-cleanup-slice.md`

## Boundary

- No parser flag change.
- No direct-control runtime behavior change.
- No control-oRPC service contract/router change.
- No action descriptor or omitted-path shape change.
- No deployed Civ7 runtime proof or play-thread action.
- Caller-provided approval remains retired; no approval or approval-reason
  mechanic is introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game/play/ready-city.test.ts`
- `bun run --cwd packages/cli test -- game/play/unit-move-preview.test.ts`
- `bun run --cwd packages/cli test -- game/play/priorities.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Targeted scans verified affected compact omission reasons no longer include
  interface-instruction phrasing and this slice did not introduce active
  approval/caller-permission or relationship-label wording.
