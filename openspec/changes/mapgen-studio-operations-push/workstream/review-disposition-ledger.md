# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| S3.2-W1 | P1 | watcher `019ec130-bde5-7133-be61-282814556152` | Hidden Save&Deploy polling loop in `features/mapConfigSave/api.ts` would survive if only `useOperationStatusPolls` is deleted. | orphaned polling fallback | accepted-repaired | Delete the private sleep/status loop or replace it with a non-polling handoff owned by operation events/reconnect adoption. | `fetchMapConfigSaveDeployStatus` and the private sleep/status loop were deleted from `apps/mapgen-studio/src/features/mapConfigSave/api.ts`; `StudioShell` waits for terminal Save&Deploy status through operation events instead of polling. Negative `rg "fetchMapConfigSaveDeployStatus|status-poll"` returned no matches in app/package source/tests. | No |
| S3.2-W2 | P1 | watcher `019ec130-bde5-7133-be61-282814556152` | Operation registries have no publisher seam into the S3.1 EventHub. | push path disconnected | accepted-repaired | Inject/wrap one audited publisher path so Run in Game and Save&Deploy transitions publish `operation` events. | `apps/mapgen-studio/src/server/daemon/daemon.ts` creates EventHub before engines; `apps/mapgen-studio/src/server/studio/engines.ts` injects EventHub and publishes `operation` events from both store `onChange` callbacks; store tests assert create/update/complete/fail transition callbacks. | No |
| S3.2-W3 | P2 | watcher `019ec130-bde5-7133-be61-282814556152` | Client event hook only handles `hello`; operation events would be inert. | client subscriber incomplete | accepted-repaired | Add explicit `operation` handling for both operation kinds and preserve terminal toast behavior. | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` handles `operation` events through `applyStudioOperationEvent`; `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` asserts Run in Game and Save&Deploy event application and terminal Run in Game toasts not pre-marked. | No |
| S3.2-W4 | P2 | watcher `019ec130-bde5-7133-be61-282814556152` | 404 status-miss stop logic remains embedded in polling callbacks/API helpers. | deleted fallback still authoritative | accepted-repaired | Remove polling-only status refresh callbacks and synthetic 404 recovery loops from background operation flow. | `useOperationStatusPolls` deleted; Save&Deploy status helper deleted; Run in Game manual retry now surfaces errors through `setLocalError`/toast without synthesizing `operation-status-missing`; negative `rg "operation-status-missing|status-poll"` returned no matches. | No |
| S3.2-W5 | P2 | watcher `019ec130-bde5-7133-be61-282814556152` | Daemon identity watchdog still polls `studio.serverInfo`. | identity authority split | accepted-repaired | Delete `useDaemonInstanceWatchdog` and its call site; keep `hello` as identity authority. | `apps/mapgen-studio/src/app/hooks/useDaemonInstanceWatchdog.ts` deleted; `StudioShell` no longer imports/calls it; negative `rg "studio\\.serverInfo|serverInfo" apps/mapgen-studio/src` returned no matches. | No |
| S3.2-W6 | P3 | watcher `019ec130-bde5-7133-be61-282814556152` | S3.2 OpenSpec is only a skeleton. | process gap | accepted-repaired | Add full proposal/design/tasks/spec and phase/review records before implementation. | This OpenSpec scaffold plus strict validation: `bun run openspec -- validate mapgen-studio-operations-push --strict`. | No |

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
