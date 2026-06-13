# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| S3.1-W1 | P1 | watcher `019ec0b9-a018-7c40-b9eb-cca19a890555` | `ClientRetryPlugin` was installed with default retry behavior; default retry is `0`, so reconnect would be inert if no call context owned retry. | reconnect guarantee false-positive | accepted-repaired | Keep nonzero retry policy on the actual `studio.events.watch` subscription path and test that policy. | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` uses `orpc.studio.events.watch.experimental_liveOptions(...)` with `context: studioEventsWatchClientContext()` returning `retry: Number.POSITIVE_INFINITY`; `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` asserts the actual watch live options carry a live query key/queryFn and the retry helper is infinite; `openspec/changes/mapgen-studio-event-hub/NOTE-TO-DRA.md`; `workstream/dra-watcher-corrections.md`. | No |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.
- `accepted-repaired`: accepted material finding repaired inside this slice with
  evidence and no remaining closure block.

No material finding may remain undispositioned at phase closure.
