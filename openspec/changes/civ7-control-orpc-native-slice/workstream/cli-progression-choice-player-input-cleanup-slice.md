# CLI Progression Choice Player Input Cleanup Slice

## Scope

Remove caller player identity from the public progression choice send surface:

- `progression.technology.choice.request`
- `progression.culture.choice.request`
- `civ7 game play choose-tech --send`
- `civ7 game play choose-culture --send`

The service procedures already read current notification evidence and bind
runtime closeout requests to that local-player source. This slice aligns the
public contract, controller bridge ingress, CLI send path, generated
notification option templates, and durable guidance with that ownership.

## Write Set

- `packages/civ7-control-orpc/src/modules/progression/contract.ts`
- `packages/civ7-control-orpc/src/modules/progression/procedures/choice-request.ts`
- `packages/civ7-control-orpc/test/progression-choice-procedure.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/test/commands/game.play.technology.test.ts`
- `packages/cli/test/commands/game.play.culture.test.ts`
- `packages/cli/test/commands/game/play/notification/hud.test.ts`
- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `docs/projects/civ7-live-play-support/topics/caller-level-closeout-workflows.md`
- `docs/projects/civ7-live-play-support/topics/progression-tree-targets.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-progression-choice-ingress-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/progression-choice-local-player-evidence-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/game-ui-progression-choice-runtime-slice.md`
- this workstream record

## Boundary

- Send-mode progression choice inputs admit `node` plus optional
  `notificationId`; caller `playerId` is rejected before readiness or
  direct-control ports run.
- The CLI send path does not require or pass `--player-id`; dry-run validation
  remains direct-control/player-scoped and still requires `--player-id`.
- Direct-control notification `cli` send templates are playerless and no
  longer advertise the hidden culture `--closeout` compatibility no-op;
  `validateCli` remains player-scoped.
- Controller bridge request schemas continue to come from the aggregate
  `Civ7ControlOrpcContract`; no per-procedure input/result schema exports are
  added.
- No approval/reason mechanic, transport expansion, play-thread action,
  runtime/live proof claim, or parent task acceptance is introduced.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/progression-choice-procedure.test.ts test/controller-bridge-ingress.test.ts test/game-ui-controller.test.ts`
- `bun run --cwd packages/cli test -- game.play.technology.test.ts game.play.culture.test.ts game/play/notification/hud.test.ts`
- `bun run --cwd packages/civ7-direct-control test -- play-notification-view.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run build:cli`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- stale send-mode `--player-id` scan over `packages`, `docs`, and `openspec`
- changed-file scan for exported progression choice input/result schemas or
  public progression choice `playerId` call patterns
- active approval/caller-permission scan; hits are limited to negative
  exclusion and approval-removal retirement language in OpenSpec
- `git diff --check`

These are local package, CLI, and OpenSpec proofs only. Deployed Civ7 runtime
proof, play-thread action, transport expansion, broad progression catalog
support, and parent Task 5.x/6.x/7.x acceptance remain pending.
