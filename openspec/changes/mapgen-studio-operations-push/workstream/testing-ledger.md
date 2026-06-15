# D9 Testing Ledger - Studio Operations Push

Status: implementation evidence recorded in the current D9 Graphite branch tip;
live Civ7 Play/SaveDeploy proof is not run or claimed.
Date: 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Publisher seam | focused server/store tests | removing the EventHub publisher bridge fails for Run in Game and Save&Deploy |
| Payload parity | server/store tests | published event status matches canonical operation DTO for each family |
| Publisher failure | server/store test | rejected publish records diagnostics and does not reverse transition or start polling |
| Client Run in Game event | app hook/path test | pushed event through `useStudioEvents` updates Run in Game state |
| Client Save&Deploy event | app hook/path test | pushed event through `useStudioEvents` updates Save&Deploy state |
| Terminal toast parity | app state/effect test | adopted terminal operation is marked handled; live pushed terminal operation reaches terminal toast effect |
| Polling deletion | negative search + focused tests | deleted hook/callback/loop/watchdog symbols are absent from app source/tests |
| Identity authority | negative search + event hook tests | client identity adoption flows through event `hello`, not `studio.serverInfo` polling |
| D10 boundary | negative search/review | live-game cadence symbols remain untouched for D10 |

## Future Implementation Commands

```bash
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run openspec -- validate mapgen-studio-operations-push --strict
```

## Implementation Evidence - 2026-06-15

Focused commands run on `codex/runtime-effect-operations-push` before Graphite
commit:

```bash
bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/runInGame/GameConsole.test.tsx test/runInGame/status.test.ts test/server/oneMount.test.ts
bun run --cwd packages/studio-server test -- test/handler.test.ts test/operationRuntime.test.ts
bun run openspec -- validate mapgen-studio-operations-push --strict
bun run openspec:validate
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
git diff --check
```

Results:

- `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` proves boot
  adoption reads `studio.operations.current`, applies pushed Run in Game and
  Save&Deploy operation events, suppresses adopted terminal Run in Game toasts,
  and leaves live pushed terminal events unhandled for the terminal-toast effect.
- The same test now source-falsifies the real `useStudioEvents` operation
  effect: it must call `applyStudioOperationEvent(event)` for `operation`
  events and wire both `setRunInGameOperation` and `setSaveDeployOperation`.
  This is the accepted equivalent to a hook-render test in this package because
  the app does not currently carry a React hook test harness.
- `packages/studio-server/test/handler.test.ts` proves the actual
  `createStudioRpcHandler` + `studio.events.watch` bridge: a subscribed watch
  client receives operation events produced by real RPC `mapConfigs.saveDeploy`
  and `runInGame.start` mutations through the same handler context.
- `packages/studio-server/test/operationRuntime.test.ts` proves Run in Game
  accepted/transition publication, Save&Deploy accepted/terminal publication,
  and diagnostics-only publish failure for both operation families with registry
  truth still reaching terminal `complete`.
- `apps/mapgen-studio/test/server/oneMount.test.ts` source-falsifies production
  daemon composition: the daemon creates one `StudioEventHub`, passes it into
  `createStudioServerContext`, then builds the one `createStudioRpcHandler`
  over that context; no direct daemon hub shutdown owner remains.
- `apps/mapgen-studio/src/app/StudioShell.tsx` no longer imports or calls
  `fetchRunInGameStatus`, and `apps/mapgen-studio/src/features/runInGame/api.ts`
  no longer exports browser status readback. The GameConsole status refresh
  affordance was removed; diagnostics copy and retry-run remain.
- `bun run openspec -- validate mapgen-studio-operations-push --strict` and
  `bun run openspec:validate` passed after the implementation doc updates.
- `bun run nx run @civ7/studio-server:check --outputStyle=static`,
  `bun run nx run mapgen-studio:check --outputStyle=static`,
  `bun run nx run @civ7/studio-server:test --outputStyle=static`, and
  `bun run nx run mapgen-studio:test --outputStyle=static` passed before
  Graphite commit. A discarded parallel run of
  `@civ7/studio-server:test` failed while another Nx command was cleaning or
  materializing `@civ7/control-orpc` outputs; the sequential rerun passed with
  `packages/civ7-control-orpc/dist/contract.js` present and no generated
  artifact diff.

`waitForSaveDeployTerminalEvent` remains in `StudioShell` only as event-wait
plumbing after the Save&Deploy start response. It waits on
`saveDeployWaitersRef`, has a timeout for user feedback, and the source guard
proves the waiter does not call `orpcClient`, `mapConfigs.status`, or
`fetchSaveDeployStatus`. `args.onStatus?.(status)` in
`features/mapConfigSave/api.ts` only applies the immediate `saveDeploy` start
response status; the source guard proves that start-response path has no sleep,
interval, polling loop, or status readback.

## Negative Search Gates

```bash
rg -n "useOperationStatusPolls|useDaemonInstanceWatchdog|fetchMapConfigSaveDeployStatus|operation-status-missing|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/test -S
rg -n "studio\\.serverInfo\\(\\{|serverInfo\\(\\{|serverInfo" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "EventSource|text/event-stream|/events|/sse|operation.*stream" apps/mapgen-studio/src packages/studio-server/src -S
```

Hits block D9 implementation closure unless classified as protected D10
live-game cadence, public/manual diagnostic status contract, or deletion-proof
test text.

Current classified scan results before Graphite commit:

- `rg -n "useOperationStatusPolls|useDaemonInstanceWatchdog|fetchMapConfigSaveDeployStatus|fetchSaveDeployStatus|fetchRunInGameStatus|operation-status-missing|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/test -S`
  returns only deletion-proof literals in
  `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`.
- `rg -n "studio\\.serverInfo\\(\\{|serverInfo\\(\\{|serverInfo" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S`
  returns no hits.
- `rg -n "runInGame\\.status|mapConfigs\\.status|setInterval|setTimeout|sleep|poll" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -g '*.{ts,tsx}' -S`
  returns no status API, interval, sleep, or poll hits. Remaining `setTimeout`
  hits are the Save&Deploy event waiter timeout, browser authoring auto-run
  debounce, and viz/render backstops outside D9 operation freshness.
- `rg -n "EventSource|text/event-stream|/events|/sse|operation.*stream" apps/mapgen-studio/src packages/studio-server/src -S`
  returns no alternate operation stream route.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Publisher tests prove daemon operation transition publication.
- App tests prove pushed operation event application and terminal toast parity.
- Negative searches prove deleted polling/watchdog authority is gone.
- Live Civ7 proof is not required for D9 because this packet claims operation
  state propagation, not game live-state behavior.
