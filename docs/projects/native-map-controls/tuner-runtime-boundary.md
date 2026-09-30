# Tuner Runtime Boundary

**Date:** 2026-09-30
**Scope:** Bounded audit evidence, not controller architecture or migration.

## Findings

The successful 6,996-plot observation used the public
`getCiv7MapSurfaceObservation` diagnostic with `maxPlotsPerRead: 512`.
Its 106-column grid produced sixteen 424-plot chunks and one 212-plot chunk,
read sequentially with stable identity and zero omissions. Static AST
accounting reconstructed a representative command at 6,129 bytes. Compact
plot JSON reconstructed from the saved result was approximately 267-269 KB
per full chunk, excluding envelopes. The 8.86 MB saved artifact duplicates
plots in two host projections; it was not one equally large Tuner response.

Each chunk synchronously calls native getters and serializes its result.
The selected fields imply roughly 7,200 intended native calls per full chunk,
before fallbacks. There is no in-command yield or time budget. Host timeouts
remove pending responses but do not cancel engine execution. Keep the explicit
cap: the full-grid default is 10,000, which permits a single Huge-map read.

Map observation selects the Tuner realm; setup reconciliation selects App UI.
Neither source nor the captured stacks establishes their normal native
execution thread. Host `async`/`await` is not evidence of engine offloading.
The earlier build-1306154 hang sampled AppHost waiting on a Metal command
buffer, not executing a large JavaScript loop. Explore's approximately
741-byte command nevertheless grants visibility across the entire map,
potentially triggering substantial downstream rendering. This is a workload
distinction, not a proven crash cause.

The later build-1311346 MainWorker5 null-access crash remains separate:
the launch failed during target-mod reconciliation, before generation.
The native stack does not identify the responsible mod API call.

A second socket-close crash at the same reconciliation step followed the
normal-map restoration request. Current source first admits/returns to the
shell, loads saved configuration, verifies shell, then reconciles mods; do
not describe this as refreshing before the requested exit. Both failure
reports omit intermediate admission snapshots, so neither proves the native
teardown had completed. The command always rewrites metadata and refreshes
enabled mods even when the selection is already correct. Its shell classifier
also prioritizes `inShell` over contradictory/unavailable game flags. These
are concrete review candidates, not proof of either crash's cause. Preserve
complete saved-configuration mod selection and uncertain/no-repeat behavior
in any repair; inspect the frozen migration owner before changing that path.

Returning to the main menu retires the in-game scripting scope. Loss of that
Tuner realm is expected; menu work belongs to the existing App Shell path.
The earlier scope-loss report is not a lifecycle regression or failed water
experiment. Menu responsiveness would require a separate witness through the
appropriate shell owner; the retained in-game-realm failures do not provide
that proof. Do not spend further work on this expected transition unless a
previously working CLI/Studio/shell path demonstrably regresses. Neither a
menu transition nor reconciliation is part of the successful bounded full-grid
read evidence.

## Destination And Discriminator

The accepted resident controller destination is already specified in
[SYSTEM-MODEL.md](../civ7-capability-realization/SYSTEM-MODEL.md).
Its service, Play service, controller definition, and realization directories
were absent at audit time. Do not introduce a redundant controller mod.
Residency reduces repeated source transfer/parsing; it does not inherently
reduce native work, response bytes, or rendering consequences. Realm lifetime
and asynchronous completion still require the destination's existing proof.

The smallest useful later discriminator uses the existing reader at two
bounded chunk sizes on one stable, unrevealed game, recording latency, result
bytes, and external stacks. Exclude explore and lifecycle transitions.
Only add a same-source-size no-op if transfer/parsing remains suspect.
That chunk-size experiment has not been run.
Such a game-scope reader is not a menu health check; do not use it to infer a
menu failure after the game scope has ended.

The subsequent attempt on the freshly restored normal Huge1018 map failed at
its first `LSQ` state discovery, before an observation command was dispatched.
It produces no result for either cap. Independent read-only health also failed;
Escape/menu inputs did not advance the displayed game. A completed three-second
sample of build1311346 recorded all 2,029 AppHost samples waiting for a Metal
command buffer to complete. MainWorker1-8 were in condition-variable waits;
the macOS main thread was predominantly in the AppKit event loop. Other native
thread activity remains, so this is not a claim that the whole process was idle.
No explore was requested by the experiment. The persistent native progress
stall is not attributable to its undispatched large read, and explore is not
established as a necessary trigger. Unsymbolicated game frames leave the
submitted rendering operation and underlying engine/GPU cause unknown.

Generation completion at 15:44:25Z established generation then, not continuing
responsiveness. Steam's computer-use recovery surface timed out. The authorized
TERM route stopped the confirmed Civ PID79497 without KILL; Steam launch and
two startup clicks returned the application to its observed main menu. This
recovery does not qualify either chunk cap or justify a resident controller
as a rendering-stall fix.

## Recovery Rule

For ordinary same-name JavaScript changes, use the established in-game
restart and require fresh script identity evidence. New database ActionGroup
registration is different: cutoff40 restart and fresh setup both retained
cutoff10 and were correctly refused. After the recorded graceful application
reload, live verification passed at `2026-09-30T15:15:40.929Z` on build
1311346. Verify measured registration activation before admitting treatment;
do not generalize this exception into mandatory application restarts.
Retain mutation-uncertain/no-repeat handling for reconciliation failures.

## Evidence

Source: `packages/civ7-direct-control/src/play/map/{surface-observation,full-grid,reads,visibility}.ts`,
`packages/civ7-direct-control/src/session/session.ts`,
`packages/civ7-direct-control/src/setup/prepare.ts`, and
`services/civ7-control/src/service/modules/lifecycle/router/single-player-start.ts`.

Exact machine-local roots:

```text
E=/Users/mateicanavra/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration
B=/Users/mateicanavra/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/bounded-lake-cutoff-20260930
```

- `E/earthlike-forest-after-20260930/huge1018-native-surface.json`
- `E/hung-after-explore-20260930-sample.txt`
- `B/stock10-huge42-live.log`
- `B/target-mod-reconcile-crash.ips`
- `B/normal-earthlike-restore-live.log`
- `B/normal-restore-reconcile-crash.ips`
- `B/cutoff40-huge1018-live.log`
- `B/cutoff40-huge1018-menu-session-unavailable-scripting.log`
- `B/menu-tuner-unavailable-sample.txt`
- `B/cutoff40-huge42-restart-stale-setup-scripting.log`
- `B/cutoff40-huge42-fresh-setup-stale-registration-scripting.log`
- `B/cutoff40-huge42-fresh-setup-live.log`
- `B/cutoff40-huge42-live.log`
- `B/normal-earthlike-restored-fresh-live.log`
- `B/read-cap-pair/live.log`
- `B/normal-readonly-health-after-cap-attempt.log`
- `B/normal-restored-unresponsive-sample.txt`
