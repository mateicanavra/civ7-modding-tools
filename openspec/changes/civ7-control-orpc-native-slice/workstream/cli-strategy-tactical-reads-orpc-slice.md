# CLI Strategy Tactical Reads oRPC Slice

## Status

Local control-oRPC, CLI, and OpenSpec closure proof collected.

## Purpose

Route `civ7 game play battlefield-scan`, `civ7 game play target-candidates`, and
`civ7 game play destination-analysis` through native in-process strategy
service procedures instead of letting the CLI expose direct-control tactical
read envelopes.

The control-oRPC service owns caller-facing tactical-read input, bounded target
and destination planning summaries, relationship-safe wording, omitted-detail
policy, and semantic next-step descriptors. `@civ7/direct-control` remains the
low-level App UI tactical runtime evidence source.

## Write Set

- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/strategy/contract.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/tactical-reads.ts`
- `packages/civ7-control-orpc/src/modules/strategy/router.ts`
- `packages/civ7-control-orpc/test/strategy-tactical-reads-procedure.test.ts`
- `packages/cli/src/commands/game/play/battlefield-scan.ts`
- `packages/cli/src/commands/game/play/destination-analysis.ts`
- `packages/cli/src/commands/game/play/target-candidates.ts`
- `packages/cli/test/commands/game.play.tactical-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-strategy-tactical-reads-orpc-slice.md`

## Boundary

- `strategy.battlefieldScan`, `strategy.targetCandidates`, and
  `strategy.destinationAnalysis` are strategy-domain read-only planning
  services, not a broad tactical catalog or operation/send surface.
- The service result projects bounded counts, locations, route hints,
  relationship-unproven owner evidence, omitted-detail records, and semantic
  next-step descriptors. Raw direct-control city/unit/plot samples remain out
  of normal output.
- Normal service and CLI JSON omit raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, approval/reason mechanics, and
  transport details.
- Normal output does not infer official diplomatic labels from owner mismatch,
  proximity, contact, ranking, or action legality.
- Controller bridge support, game-UI allowlisting, deployed Civ7 runtime proof,
  action-send authority, and parent Task 5.x/6.x/7.x acceptance remain pending.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/strategy-tactical-reads-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game.play.tactical-read.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan: target/destination input/result
  schemas remain contract-local constants; no procedure schema bag is
  exported.
- Active approval/caller-permission scan: hits are limited to negative
  boundary wording and the focused bad-input assertion.
- Service-output CLI-string scan: strategy tactical-read procedure source and
  focused procedure output contain no literal `game play ...` command strings.
- Raw runtime output scan: normal service/CLI surfaces omit raw direct-control
  runtime envelopes; endpoint/session/command fields stay context-owned.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, game-UI/controller bridge support, transport expansion,
action-send authority, relationship labels beyond official evidence, a broad
strategy catalog, approval/reason mechanics, or parent Task 5.x/6.x/7.x
acceptance.
