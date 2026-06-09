# Live Play Settlement Reference

Status: `preparation-reference`.
Captured: 2026-06-01.
Position: clean repo root on `main` at `98dca3892`.
Active source worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`.

This document prepares the next integration pass. It does not claim replay,
validation, submit, merge, or closure. It exists because the full dependent
stack is not settled while the live-play/gameplay CLI work remains outside the
merged direct-control/Studio baseline.

## Evidence Base

This preparation used three read-only semantic agents plus local inspection:

- Intent lane: `codex/live-play-online-context` is a live-play support branch,
  not more Studio baseline work. It adds `game play ...` CLI helpers, live HUD
  reads, bounded validation/send paths, and project-scoped reference artifacts.
- Direct-control lane: `main` already owns the canonical direct-control
  transport and Studio baseline. Live-play needs a play-specific layer on top,
  not another control stack.
- Contamination lane: both live-play branches are stale relative to current
  `main`; neither should be replayed wholesale.
- Thread evidence: `019e8225-4572-75f0-81b7-93ccc368bfd3` started as a watcher
  objective: observe the active Civ play agent, feed evidence, and convert
  useful discoveries into references and CLI shortcuts.

Current active state matters. During preparation the watcher worktree first
moved through dirty `codex/local-catalog-enrichment` notification HUD WIP, then
was last observed dirty on `codex/disaster-notification-closeout` with local
catalog/data work in `docs/projects/civ7-live-play-support/**`,
`packages/cli/package.json`, `packages/cli/src/commands/game/local-data/**`,
`packages/cli/src/utils/civ7LocalData.ts`, and
`packages/cli/test/utils/civ7LocalData.test.ts`. Do not take over until the
user pauses it and that WIP is committed, parked, or explicitly excluded.

## Frame

Live-play belongs in the integrated dependent stack because it builds on the
direct-control/Studio work that just merged through PR `#1413`. The failure mode
is treating Graphite's stale local branch shape as authority. The accepted frame
is intent reconstruction: use the live-play branches and thread as evidence,
then synthesize a fresh Graphite stack over current `main`.

## Accepted Intent

Keep the live-play surface:

- `packages/civ7-direct-control/src/index.ts` live-play APIs and matching tests.
- `packages/cli/src/commands/game/play/**`.
- `packages/cli/src/utils/game-play-shared.ts`.
- `packages/cli/test/commands/game.play.test.ts`.
- `packages/cli/package.json` command registration.
- `docs/projects/civ7-live-play-support/**`, with date-sensitive play context
  labeled as advisory evidence, not evergreen product authority.

Main already supplies the direct-control base: socket/session transport, App
UI/Tuner selection, health/readiness, restart/begin, map/entity/GameInfo reads,
autoplay, turn-complete, and generic unit/city/player operation wrappers.

Live-play adds these new direct-control primitives:

- `getCiv7PlayNotificationView`
- `getCiv7NotificationDismissal`
- `requestCiv7NotificationDismissal`
- `getCiv7UnitTargetAction`
- `requestCiv7UnitTargetAction`
- `getCiv7ReadyUnitView`
- `getCiv7ReadyCityView`

`game play expand-city` is CLI-only over existing `city-command EXPAND`, not a
new direct-control primitive. `codex/local-catalog-enrichment` and the later
local-data/catalog WIP add the current SQLite/static-catalog authority split and
should be included if committed cleanly.

## Exterior

Do not carry forward:

- `.github/workflows/ci.yml` drift.
- Any `mods/mod-swooper-maps/**` mapgen/resource/morphology/config/generated
  drift, including `swooper-earthlike.config.json` and generated Earthlike output.
- `packages/mapgen-core/**` or `packages/sdk/src/nodes/ModifierRequirementNode.ts`
  drift from stale ancestry.
- `apps/mapgen-studio/**`, `docs/projects/civ7-direct-control/workstream/studio-*`,
  `openspec/changes/studio-*`, or duplicate Studio/direct-control commits already
  merged into `main`.
- `openspec/changes/resource-*` or unrelated morphology OpenSpec cleanup.
- `packages/civ7-direct-control/README.md` regression from the older reference
  branch.

## Source Branches

Use `codex/live-play-online-context` as the fuller committed source through
`b3013fe5e` because it includes `expand-city`, current online context, and
first-meet HUD enrichment. Treat `agent-watch-civ7-live-play-reference-assembly`
as supporting evidence, not replay source of truth. Treat `codex/local-catalog-enrichment`
and any dirty top WIP as active source only after the user pauses and the
worktree is clean.

## Proposed Fresh Stack

Build a new Graphite stack from current `main`; do not restack or submit the
existing live-play branch as-is.

1. Direct-control notification HUD, end-turn fallback, and tests.
2. CLI `game play notifications`, `end-turn`, shared helpers, and tests.
3. CLI operation shortcuts over existing generic primitives: tech/culture,
   diplomacy, narrative, attributes, traditions, worker/town/production.
4. Direct-control tactical/ready views plus `unit-target`, `ready-unit`, and
   `ready-city`.
5. Guarded notification dismissal.
6. Recent extras: `expand-city`, first-meet HUD enrichment, local-catalog
   authority split, and any committed volcano/notification classification fix.
7. Project docs/evidence assembly last, after code shape is stable.

Fold slices if replay proves small; keep them separate when review ownership is
different or a test/proof lane differs.

## Review Fix Loop

Run a deliberate review train before submit:

- Direct-control API boundary: no alternate transports; App UI/runtime stays
  live-state authority.
- CLI contract: validate-first, `--send` requires `--reason`, no speculative
  operation schemas.
- Contamination review: no mapgen/resource/morphology/Studio/CI drift.
- Proof review: local tests, runtime reads, live sends, online strategy, and
  static SQLite evidence are labeled separately.
- UX/agent review: outputs should help the play agent choose the next safe
  action without becoming an autoplayer.

Accepted P1/P2 findings block dependent closure until fixed or rejected with
evidence.

## Validation Lanes

Minimum replay validation:

- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/cli test -- game.play.test.ts`
- `bun run --cwd packages/cli check`
- `bun run --cwd packages/cli build`
- `bun run verify:studio-run-in-game` or focused Studio run-in-game regression
  checks, because Studio consumes `@civ7/direct-control`
- `git diff --check`
- Narsil circular import scan

Live validation is optional unless claimed. If claimed, use read-only
`game play notifications`, `ready-unit`, and `ready-city` first. Use
`--send --reason` only with before/after proof and exact branch/commit evidence.

## Takeover Objective

The following objective is intentionally under 4000 characters including
whitespace.

```text
/goal Settle the live-play/gameplay CLI work into the full Civ7 Graphite stack above current main.

Frame: this is dependency settlement, not branch cleanup. main already contains the merged mapgen/Studio/direct-control baseline through #1413 at 98dca3892. Live-play depends on that baseline, so it remains in scope, but current live-play branches are stale evidence sources, not branches to submit wholesale.

Before mutation, re-check:
- git status --short --branch in repo root and /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly
- git worktree list --porcelain
- gt log --stack --reverse
- thread 019e8225-4572-75f0-81b7-93ccc368bfd3 latest state
- docs/projects/graphite-stack-integration/live-play-settlement-reference.md

Hard core:
- Authority follows live-play intent plus current main, not stale Graphite ancestry.
- Do not replay either live-play branch wholesale.
- Preserve accepted live-play direct-control APIs, CLI commands/tests, and project-scoped docs.
- Exclude mapgen/resource/morphology/config/generated/CI/Studio drift and duplicate already-merged baseline commits.
- Direct-control runtime/App UI remains live-state authority; local SQLite/resources are static enrichment only.
- Do not mutate the active live-play worktree until the user has paused it and its dirty WIP is committed, parked, or explicitly excluded.

Execution:
1. Freeze or ingest the paused live-play WIP. Classify final deltas from codex/live-play-online-context, codex/local-catalog-enrichment, and the watcher worktree as intended live-play code/docs/tests or stale drift.
2. Create a fresh Graphite stack from current main.
3. Replay/reconstruct small slices:
   a. direct-control notification HUD/end-turn fallback/tests
   b. CLI notifications/end-turn/shared helpers/tests
   c. CLI operation shortcuts
   d. ready/unit-target/ready-city surfaces
   e. guarded notification dismissal
   f. expand-city, first-meet HUD enrichment, local-catalog authority split, and committed volcano/notification fix
   g. project docs/evidence cleanup
4. Run review-fix loop: direct-control API boundary, CLI contract, contamination, proof labels, and agent UX. Accepted P1/P2 findings block closure.
5. Validate with direct-control test/check/build, CLI game.play tests/check/build, Studio run-in-game regression, git diff --check, and Narsil circular import scan.
6. Submit via Graphite with --ai, monitor CI, repair in the owning branch, restack, resubmit, and drain only when green.

Exit: main contains the settled live-play stack, open PRs are expected/green or merged, active repo is clean/synced, stale branches/worktrees are removed only when clean, and final report names included intent, discarded drift, validation, CI, and remaining side work.
```
