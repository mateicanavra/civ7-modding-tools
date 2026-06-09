# Strategy/Ready Action Label Cleanup Slice

## Purpose

Remove the remaining send-oriented wording from strategy and ready-action
planning output. These labels should describe the semantic validation/action
boundary, not the send mechanics or concrete CLI command syntax.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-strategy-front.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/civilian-route-triage.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/formation-snapshot.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/front-summary.ts`
- `packages/civ7-control-orpc/src/modules/strategy/procedures/tactical-reads.ts`
- `packages/civ7-direct-control/src/play/ready/unit.ts`
- `packages/civ7-direct-control/test/ready-unit-procedure.test.ts`
- `packages/civ7-direct-control/test/ready-unit-view.test.ts`
- `packages/cli/src/commands/game/play/ready-city.ts`
- `packages/cli/test/commands/game.play.promotion-readiness.test.ts`
- `packages/cli/test/commands/game.play.rehydrate.test.ts`
- `packages/cli/test/commands/game.play.tactical-read.test.ts`
- `packages/cli/test/commands/game.play.watch.test.ts`
- `packages/cli/test/commands/game/play/ready-city.test.ts`
- `packages/cli/test/commands/game/play/ready-unit.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/strategy-ready-action-label-cleanup-slice.md`

## Behavior

- Strategy next-step labels now say unit action validation is needed before
  moving or targeting.
- Formation next-step labels now say to validate the relevant unit action,
  without repeating send mechanics.
- Ready-city compact invalid production rows now say to review validation before
  treating the candidate as actionable.
- Ready-unit notes no longer include `game play unit-target` command syntax;
  they refer to the unit-target action path and official right-click order.

## Boundaries

- No procedure contract, router, parser flag, runtime read, mutation behavior,
  controller bridge, transport, deployed Civ7 proof, play-thread state, or
  relationship policy change.
- Caller-provided approval remains retired; no approval/reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test -- strategy-front-summary-procedure.test.ts strategy-civilian-route-triage-procedure.test.ts strategy-formation-snapshot-procedure.test.ts strategy-tactical-reads-procedure.test.ts game-ui-controller.test.ts`
- `bun run --cwd packages/civ7-direct-control test -- ready-unit-procedure.test.ts ready-unit-view.test.ts`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game.play.tactical-read.test.ts game/play/ready-city.test.ts game/play/ready-unit.test.ts game.play.rehydrate.test.ts game.play.watch.test.ts game.play.promotion-readiness.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run check:cli`
- `bun run openspec validate civ7-control-orpc-native-slice --strict`
- `bun run openspec validate civ7-support-direct-control-modularization --strict`
- Public-output phrase scan for the retired send-oriented/action-command
  wording returned no source/dist/test hits outside the new negative regex
  assertions.
- Active approval/caller-permission scan found only existing negative tests and
  retired/absent-mechanic OpenSpec boundary language.
- Relationship-label safety scan found existing neutral policy/negative-test
  wording and no new relationship labels.
- `git diff --check`
