# UI State Peer Report

## Findings

### P1: Some mutating controls remain visibly available during conflicting operations

`AppFooter` disables the primary Browser Run and Run in Game buttons when Save/Deploy or Run in Game is active, but the footer seed input, reroll button, and auto-run toggle remain visually enabled. The reroll handler blocks Save/Deploy and Run in Game, and auto-run effects avoid starting while those operations are active, but the user-visible controls still invite changes while another operation owns the current filesystem/Civ payload.

- Evidence: `apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 263-290 keep seed, reroll, and auto-run editable/active except for `isRunning`.
- Evidence: `apps/mapgen-studio/src/App.tsx` lines 1285-1305 guard reroll/run in handlers, and lines 891-938 suppress auto-run execution while Save/Deploy or Run in Game is active.
- Expected user state: while Save/Deploy or Run in Game is running, config-changing controls should either be disabled or explicitly marked as edits for the next operation, not the in-flight one.

### P1: Save/Deploy state is not resumable or server-authoritative

Run in Game has a request store and status endpoint; Save/Deploy is represented only in React state. If the tab reloads, Vite HMR refreshes, the fetch is aborted, or another worktree/server path is involved, the Studio UI can lose the Save/Deploy operation state while the server queue is still running. This is the biggest remaining state-machine mismatch.

- Evidence: `apps/mapgen-studio/src/App.tsx` lines 569 and 962-1004 create a client-local `saveDeployOperation`.
- Evidence: `apps/mapgen-studio/vite.config.ts` lines 49, 695-748 queue Save/Deploy on the server, but expose no Save/Deploy request status endpoint.
- Expected user state: filesystem/deploy work should have request identity, queued/running/terminal phases, and reload-safe status, same as Run in Game.

### P2: Save/Deploy phases are too coarse for the user-visible contract

The model has `saving`, `deploying`, `complete`, and `failed`, but the client flips from `saving` to `deploying` immediately before the HTTP request. The UI cannot distinguish queued, writing config, running deploy, restored-after-failed-deploy, deployed-but-not-loaded, or complete-but-hidden. The footer hides Save/Deploy once complete, so the only durable visible completion signal is a toast.

- Evidence: `apps/mapgen-studio/src/features/mapConfigSave/status.ts` lines 1-24 define the coarse phases.
- Evidence: `apps/mapgen-studio/src/App.tsx` lines 983-1001 immediately advances to `deploying` before awaiting `/api/map-configs`.
- Evidence: `apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 299-307 render Save/Deploy only when status is not `complete`.
- Expected user state: Save/Deploy should communicate queued, saving, deploying, saved, failed with restore details, and completed output path until superseded by the next operation.

### P2: The Save menu still hides materialization/deploy semantics

The Recipe panel labels the actions as `Save`, `Save As...`, `Export...`, and `Import...`, but repo-backed `Save` and `Save As...` also deploy the mod. This is better than restarting Civ from Save, but still ambiguous for a user trying to understand whether they authored a config, deployed it, launched it, or only changed the browser preview.

- Evidence: `apps/mapgen-studio/src/ui/components/RecipePanel.tsx` lines 450-469 show `Save` and `Save As...` labels.
- Evidence: `apps/mapgen-studio/src/App.tsx` lines 1048, 1101, and 1163 toast `saved and deployed`.
- Expected user state: Save menu labels should distinguish `Save & Deploy Config` from pure export/import and from `Run in Game`.

### P2: Stale/current Run in Game recovery is useful but action labels are still ambiguous

The fingerprint-based stale/current relation is a good contract, but it is only shown after a non-running operation exists. A running operation can become stale if the user changes seed/config mid-flight, and the action label does not always say whether it will launch the current authored state or retry a previous request. `Restart Civ & Run` is especially ambiguous when the prior blocked operation is stale.

- Evidence: `apps/mapgen-studio/src/features/runInGame/clientState.ts` lines 19-67 define current/stale by fingerprint.
- Evidence: `apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 132-151 show the relation only when the operation is not running and derive the primary action label.
- Evidence: `apps/mapgen-studio/src/features/runInGame/status.ts` lines 139-148 return `Restart Civ & Run`, `Run Current`, `Retry Run`, or `Run in Game`.
- Expected user state: every Run in Game action should clearly mean one of `Run Current`, `Restart Civ & Run Current`, or `Check Previous Status`; there should be no implication that an old payload will be replayed unless that is actually supported.

### P2: The footer's main `Ready/Modified/Last` panel is still Browser Run-centric

The first footer panel derives `Modified` from the last Browser Run snapshot, and `Last` displays the last Browser Run settings. That is useful for preview, but it is not the same as Save freshness, deploy freshness, or Run in Game freshness. After a save/deploy or Run in Game operation, the top-level footer can still tell the user a different story than the operation chips.

- Evidence: `apps/mapgen-studio/src/App.tsx` lines 1307-1316 derive generation status and dirty state from browser-run/error state and `lastRunSnapshot`.
- Evidence: `apps/mapgen-studio/src/App.tsx` lines 2041-2042 pass Browser Run snapshots as footer `Last` state.
- Evidence: `apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 103-121 and 206-233 render `Ready/Modified` and `Last`.
- Expected user state: the footer should label browser-preview freshness separately from save/deploy and Civ launch freshness.

## Risks

- A user can edit seed/config during Run in Game and only learn the launch is stale after terminal status. That makes fatal map-generation or load failures harder to correlate to the payload that was actually deployed.
- Reload/HMR/fetch abort during Save/Deploy can drop visible operation status while the server-side queue continues, making duplicate user actions likely.
- Save/Deploy and Run in Game share a server queue, but the UI does not show queued Save/Deploy or queued Run in Game as one backbone. That hides the true order of filesystem and Civ mutations.
- Current tests cover helper classification and static footer rendering, but they do not prove the full visible UI contract for seed/reroll/auto-run disabling, Save menu semantics, tab reload during Save/Deploy, or stale-running-to-terminal transitions.
- The fatal map-generation report cannot be attributed from this UI review alone; the visible-state risk is that Browser Run errors, Save/Deploy errors, and Civ load/proof failures can still feel like one undifferentiated failure path.

## Verdict

The slice is moving in the correct direction: Save no longer owns Civ lifecycle, Run in Game owns Civ restart/start, and the primary Browser Run/Run in Game buttons are guarded. It is not yet a complete Studio operation state machine.

Recommended UI contract for the next iteration:

1. Use one Studio operation backbone for all mutating operations: Browser Generation, Save/Deploy, and Run in Game.
2. Make filesystem/deploy operations server-authoritative with request IDs, status endpoint, queued/running/terminal phases, and reload recovery.
3. Freeze or clearly partition editable state while an operation is in flight: edits are either disabled or labeled as "next run" changes.
4. Rename Save menu actions so users can distinguish authoring, deploy, export/import, and Civ launch.
5. Keep footer chips role-specific: Browser Preview freshness, Save/Deploy freshness, Run in Game freshness, and Live Civ status should not collapse into one `Ready/Modified/Last` concept.
6. Treat `Current/Stale/Previous` as a first-class relation on both running and terminal Run in Game operations, and make action labels say exactly which payload will be used.

Verdict: accept the direction, but require another implementation pass before claiming that Save, Generate/Preview/Browser Run, Deploy, and Run in Game are situationally unambiguous.
