# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| S3.3-W1 | P1 | watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a` | Live-game status/backoff is still browser-owned through `StudioShell`'s status timer, `civ7.live.status` + `liveControlPort.readiness.current()`, and `nextLiveRuntimePollDelayMs` coverage. | client scheduler still authoritative | accepted-repaired | Move status cadence to daemon/package runtime over the existing `Civ7TunerClient` shared session; publish through EventHub; delete client timer and poll-delay coverage. | `packages/studio-server/src/liveGame/watcher.ts` starts a daemon-enabled watcher through `createStudioRpcHandler(..., { liveGameWatch: {} })`; it reads via `readLiveGameStatusBody`/`Civ7TunerClient` in the package runtime and publishes through EventHub only when `liveGameStateKey` changes. `apps/mapgen-studio/src/app/StudioShell.tsx` no longer schedules the live status poll. Negative `rg "nextLiveRuntimePollDelayMs|liveStatusFailureCountRef|setTimeout\\(poll|civ7\\.live\\.status\\(\\{\\}|liveControlPort\\.readiness\\.current\\(" ...` returned no matches. | No |
| S3.3-W2 | P1 | watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a` | `live-game` events are inert on the client; `useStudioEvents` only handles `hello` and `operation`. | event subscriber incomplete | accepted-repaired | Add explicit `live-game` handling through the single subscription hook; no second stream, localStorage recovery, or new Zod event schema. | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` derives a `liveGameKey` and dispatches through `applyStudioLiveGameEvent`; focused app test `test/studioEvents/operationAdoption.test.ts` proves pushed live-game state is applied. The `live-game` contract uses TypeBox `liveGameStateSchema`; no `packages/studio-server/src/liveGame/**` Zod schema was added. | No |
| S3.3-W3 | P2 | watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a` | Live setup and suggestion UX is coupled to the old status poll. | UX owner hidden in deleted loop | accepted-repaired | Give setup/suggestions an event-triggered request/response owner after poll deletion, preserving stale/current and sync semantics. | `StudioShell` now refreshes setup/suggestion state from `refreshLiveSetupFromEvent(statusState)` after a pushed live-game state. The request remains request/response and is aborted on newer events/unmount; no independent setup/status cadence remains. | No |
| S3.3-W4 | P2 | watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a` | Automatic snapshot reads are still coupled to the poll loop. | snapshot follow-up tied to deleted scheduler | accepted-repaired | Preserve request-key commit gating, but trigger snapshot reads from pushed live-game state instead of background status polling/backoff. | `StudioShell` extracts `readLiveRuntimeSnapshot(request)` and calls it only from `applyLiveGameState`; `shouldCommitLiveRuntimeSnapshot` still gates stale commits, and `test/liveRuntime/model.test.ts` keeps the durable request-key pins. | No |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the
  finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and
  trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination,
  owner, and context.
- `accepted-repaired`: accepted material finding repaired inside this slice
  with evidence and no remaining closure block.

No material finding may remain undispositioned at phase closure.
