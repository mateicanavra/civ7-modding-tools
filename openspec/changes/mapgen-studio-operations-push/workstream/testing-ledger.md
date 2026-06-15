# D9 Testing Ledger - Studio Operations Push

Status: draft pending review
Date: 2026-06-14

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
bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts
bun run --cwd apps/mapgen-studio check
bun run openspec -- validate mapgen-studio-operations-push --strict
```

Implementation should add or run the focused server/store tests that own the
publisher seam. If those tests land in a new file, record the exact command in
this ledger before D9 implementation closure.

Helper-only tests are insufficient for implementation closure when the behavior
is owned by a hook, bridge, or Effect/event path. D9 implementation must either
exercise the real path or record a stronger source-backed reason why the helper
test is an equivalent falsifier.

## Negative Search Gates

```bash
rg -n "useOperationStatusPolls|useDaemonInstanceWatchdog|fetchMapConfigSaveDeployStatus|operation-status-missing|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/test -S
rg -n "studio\\.serverInfo\\(\\{|serverInfo\\(\\{|serverInfo" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "EventSource|text/event-stream|/events|/sse|operation.*stream" apps/mapgen-studio/src packages/studio-server/src -S
```

Hits block D9 implementation closure unless classified as protected D10
live-game cadence, public/manual diagnostic status contract, or deletion-proof
test text.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Publisher tests prove daemon operation transition publication.
- App tests prove pushed operation event application and terminal toast parity.
- Negative searches prove deleted polling/watchdog authority is gone.
- Live Civ7 proof is not required for D9 because this packet claims operation
  state propagation, not game live-state behavior.
