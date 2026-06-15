# D6 Downstream Realignment Ledger

Status: draft
Date: 2026-06-14

| Downstream surface | D6 impact | Required disposition |
| --- | --- | --- |
| D7 stream spike | Current operation truth is runtime-owned and adoption-ready before event transport is evaluated. | D7 uses D6 projections as the read model when evaluating stream payloads; it does not restore browser recovery. |
| D8 EventHub | Operation transition events must align with D6 current projections. | EventHub payloads reuse D2.5/D3/D4/D6 public DTOs and keep current/status agreement. |
| D8/D9 `useStudioEvents.ts` | Existing event hook owns event-stream hello/adoption behavior, including a hello-current read. | D6 protects `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` except explicit deletion-target notes; event/push semantics and hello adoption remain D8/D9-owned. |
| D9 operations push | Push adoption replaces active status polling. | D9 deletes D6-retained polling without reintroducing localStorage recovery or browser request-id replay. |
| D10 live-game watch | Live-game truth remains separate from operation current truth. | D10 must not use live watcher state as operation recovery. |
| D11 dev runner | No direct dependency beyond standard packet gates. | Dev process simplification cannot change operation recovery ownership. |
| D12 game-door invariant | Operation current must not expose raw control/game-door state. | D12 final guard preserves D6 public DTO privacy and raw-field exclusions. |
| Existing S2.1 implementation history | Old merged S2.1 notes are superseded as implementation history. | Implementation teams use this D6 packet as normative authority on future runtime stack bases. |
| `operationAdoption.ts` | Current boot adoption helper is D6-owned. | Implementation keeps shell boot adoption on `studio.operations.current` without request-id/status replay and preserves D8/D9 event hook ownership. |
