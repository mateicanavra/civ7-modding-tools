# Direct-Control Action Guidance Cleanup Slice

## Purpose

Remove the remaining send-oriented recipe wording from direct-control guidance
strings and active live-play support docs. Action guidance should name the
minimal semantic difference the player/agent needs: live option evidence,
validator evidence, mutation boundary, or postcondition proof. Command help and
dedicated command docs own exact flag combinations.

## Write Set

- `packages/civ7-direct-control/src/play/notifications/view.ts`
- `packages/civ7-direct-control/src/play/progression/traditions.ts`
- `packages/civ7-direct-control/src/proof/turn-completion-proof-policy.ts`
- `packages/civ7-direct-control/test/progression-reads.test.ts`
- `packages/civ7-direct-control/test/traditions-view-procedure.test.ts`
- `packages/cli/test/commands/game.play.first-meet.test.ts`
- `packages/cli/test/commands/game/play/notification/queue.test.ts`
- `packages/cli/test/commands/game/play/priorities.test.ts`
- `docs/projects/civ7-live-play-support/SKILL-ASSET-ASSEMBLY.md`
- `docs/projects/civ7-live-play-support/topics/civilian-route-triage.md`
- `docs/projects/civ7-live-play-support/topics/command-surface-design.md`
- `docs/projects/civ7-live-play-support/topics/end-turn-blockers.md`
- `docs/projects/civ7-live-play-support/topics/first-meet-diplomacy.md`
- `docs/projects/civ7-live-play-support/topics/informational-notification-closeout.md`
- `docs/projects/civ7-live-play-support/topics/local-catalog-enrichment.md`
- `docs/projects/civ7-live-play-support/topics/notification-decision-hud.md`
- `docs/projects/civ7-live-play-support/topics/notification-queue-scheduling.md`
- `docs/projects/civ7-live-play-support/topics/official-runtime-affordance-inventory.md`
- `docs/projects/civ7-live-play-support/topics/production-build-placement.md`
- `docs/projects/civ7-live-play-support/topics/progression-tree-targets.md`
- `docs/projects/civ7-live-play-support/topics/ready-unit-commander-actions.md`
- `docs/projects/civ7-live-play-support/topics/runtime-state-sources.md`
- `docs/projects/civ7-live-play-support/topics/strategic-planning-snapshot.md`
- `docs/projects/civ7-live-play-support/topics/unit-destination-queue.md`
- `docs/projects/civ7-live-play-support/topics/unit-command-resettle-upgrade.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/direct-control-action-guidance-cleanup-slice.md`

## Behavior

- Direct-control notification and tradition notes no longer say "before
  sending" when the useful distinction is live evidence or validation.
- Turn-completion postcondition text now points to fresh turn evidence before
  another mutation, not repeated send mechanics.
- Active live-play support docs no longer teach removed recipe fields
  (`recommendedCli`, `chooseCli`, `sendCloseoutCli`) as the action surface.
- First-meet CLI test fixtures model the current semantic detail shape instead
  of preserving a deprecated CLI recipe field.

## Boundaries

- No procedure contract, parser flag, runtime read, mutation behavior,
  controller bridge, transport, deployed Civ7 proof, play-thread state, or
  relationship policy change.
- Caller-provided approval remains retired; no approval/reason mechanic is
  introduced.
- Historical workstream records may still mention removed fields as deletion
  history; they are not active action guidance.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test -- progression-reads.test.ts traditions-view-procedure.test.ts play-notification-view.test.ts`
- `bun run --cwd packages/cli test -- game.play.first-meet.test.ts game/play/priorities.test.ts game/play/notification/queue.test.ts game.play.progression-read.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec validate civ7-control-orpc-native-slice --strict`
- `bun run openspec validate civ7-support-direct-control-modularization --strict`
- Current-file scan over changed active source/docs/tests found no remaining
  `before sending`, `before any send`, `before send`, `before sends`,
  `send-ready`, `send path`, `send mode`, `recommendedCli`, `chooseCli`,
  `sendCloseoutCli`, `ready-to-send`, or `--send templates` guidance outside
  negative regex assertions.
- Added-line approval/caller-permission scan found no new active approval or
  approval-reason mechanic outside OpenSpec retirement/proof-scan wording.
- Added-line relationship-label safety scan found no new relationship labels.
- `git diff --check`
