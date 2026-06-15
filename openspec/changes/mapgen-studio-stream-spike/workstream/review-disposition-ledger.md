# D7 Review Disposition Ledger

Status: packet accepted; implementation-diff review findings repaired and committed at current branch tip
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D7-R1 | Testing/proof adequacy | Cleanup scenario combined client abort/disconnect and watch-fiber interruption, allowing one proof path to satisfy both. | P2 | accepted | Spec/tasks/testing now split client abort/disconnect and runtime/fiber interruption into separate cleanup proof cases with observable baseline-return criteria. |
| D7-R2 | Testing/proof adequacy | Vite `/rpc` passthrough criterion only required first chunk before upstream close and did not falsify later-event drop. | P2 | accepted | Spec/design/proposal/tasks/testing now require at least two ordered chunks before upstream close; findings record the current first-chunk guard as needing strengthening or equal successor proof. |
| D7-R3 | Implementation proof review (Sartre) | Interruption cleanup was initially claimed from EventHub shutdown subscriber-count cleanup only, without proving a pending watch read settled. | P2 | accepted/repaired | `packages/studio-server/test/handler.test.ts` now opens a subscription, consumes `hello`, starts a pending `iterator.next()`, calls `eventHub.shutdown()`, asserts the pending read settles as an interruption/fiber-shutdown rejection, and then proves subscriber count returns to baseline. |
| D7-R4 | Implementation proof review (Sartre) | Actual watch-path retry proof only checked helper configuration/query key shape, not that the live query function invoked `studio.events.watch` with the nonzero retry context. | P2 | accepted/repaired | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` exposes `studioEventsWatchLiveOptionsFor(...)` for injection, and `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` uses real `createTanstackQueryUtils` live options against a fake watch client to assert `queryFn` calls watch with `{ retry: Number.POSITIVE_INFINITY }`. |
| D7-R5 | Implementation proof review (Sartre) | Vite two-chunk test could wait for a second read if the first read already contained both chunks, and failure paths could leave the upstream response unreleased. | P3 | accepted/repaired | `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts` now accumulates/coalesces stream text safely and releases upstream plus cancels the reader in `finally`. |

## Required Fresh Reviews

- Transport/API decision review: accepted by Curie.
- Effect resource cleanup review: accepted by Nietzsche after repair.
- Client retry/live-options review: accepted by Curie.
- Testing/proof adequacy review: accepted by Nietzsche after repair.
- Downstream D8/D9/D10 realignment review: accepted by Darwin.
- Hardening/prework philosophy review: accepted by Darwin.
- Black-ice disambiguation review: accepted by Darwin.

## Review Acceptance

| Lane | Reviewer | Result | Evidence |
| --- | --- | --- | --- |
| Transport/API and client retry | Curie | accepted | Selected `.effect()` + `eventIterator(...)`, TypeBox/Standard Schema, one `/rpc`, `experimental_liveOptions`, and actual watch-path nonzero retry have no remaining P1/P2. |
| Effect cleanup and testing proof | Nietzsche | accepted after repair | Separate abort/disconnect and interruption proof cases plus two-ordered-chunk Vite passthrough oracle repaired prior P2 findings. |
| Hardening/black-ice/downstream | Darwin | accepted | Gate 1/2 frame, prework/testing/downstream ledgers, fixture disposition, and downstream stale-vocabulary repair scope have no remaining P1/P2. |

## Implementation Review Acceptance - 2026-06-15

| Lane | Reviewer | Result | Evidence |
| --- | --- | --- | --- |
| D7 implementation-diff proof boundary | Sartre | accepted after repair | Initial P2 findings for pending-read interruption proof and live query retry invocation proof were repaired; P3 Vite coalesced-read/finally cleanup was repaired. No unresolved P1/P2 remain before Graphite commit. |
