# D3 Downstream Realignment Ledger

Status: draft
Date: 2026-06-14

| Downstream surface | D3 impact | Required disposition |
| --- | --- | --- |
| D2.5 `mapgen-studio-contract-typebox-spine` | D2.5 names permissive expected-error details as D3-bound bridge residue. | D3 implementation deletes or narrows the bridge and records proof; if implementation cannot, D3 is not closed. |
| D4 `mapgen-studio-engine-runtime-services` | D4 must use D3 failure ADTs as Effect typed failures. | D4 packet consumes D3 module names and failure tag vocabulary, including operation lifecycle variants; no new expected-failure taxonomy. Defect containment remains router-edge only. |
| D6 `mapgen-studio-operations-current` | Current-operation public projections include failure status/details. | D6 consumes D3 typed failure projection and recovery-action vocabulary; if D3 implementation already updates operation-state projections, D6 treats that as baseline instead of reintroducing a second taxonomy. |
| D8/D9 event/push packets | Operation events may carry terminal failure payloads. | Events reuse D3 typed public failure data, not app-local details. |
| Existing `mapgen-studio-server-orpc` docs | Older parity/error wording may describe old S1.2 behavior. | D3 implementation updates or explicitly dispositions any live conflicting text. |
| Package/app comments | Current comments mention raw `ORPCError`, permissive details, legacy Zod allowance, or host bridge behavior. | D3 implementation deletes/corrects stale target language while preserving historical audit notes only when labeled as provenance. |
