# Downstream Realignment Ledger: D9 Transformation Transaction

## Status

D9 has begun source implementation with explicit-input dry-run execution and a
fail-closed live-write transaction boundary. These rows describe the current
source contract and remaining downstream blockers; they do not authorize
downstream packet acceptance.

| Surface | Current D9 disposition | Downstream action |
| --- | --- | --- |
| D0 Public Surface Compatibility | D9 requires D0 rows for `habitat fix`, `habitat fix --dry-run`, any JSON output, package exports, command DTOs, and docs/examples before source changes. | D0 rows must exist before implementation touches those surfaces. D9 remains source-blocked for public changes without citations. |
| D1 Receipt/Command Record Boundary | D9 uses a `TransformationTransactionRecord` for explicit-input dry-run completion and live-write refusals, and removes `GritApplyTransaction*` package exports. | Any future public receipt/record projection must cite D0/D1 rows and use D1 output-family/non-claim semantics. |
| D6 Diagnostic Pattern Catalog | D9 consumes diagnostic identity/limitations only as context. Diagnostics do not authorize writes. | D6 must not expose apply safety; D9 must not convert diagnostic adapter failures into transaction states without an apply request. |
| D7 Structural Enforcement Pipeline | D7 check pass/fail does not approve writes. | D9 requires D8 admission, D10/G-HOST authority, and D9 transaction approval regardless of D7 check state. |
| D8 Pattern Governance | D9 consumes explicit D8 `ApplyAdmissionProjection` and D8 `ApplyTransactionInputProjection`; missing admission refuses before transaction request construction, and mismatched input identity refuses before native dry-run. | D8 may cite D9 transaction-input requirements, but D8 does not execute writes or own rollback. |
| D10 Protected Zone Authority | D9 requires D10 path/generated/protected-zone decisions before approving touched paths. D10 is not implementation-ready yet. | D9 source implementation remains blocked for protected/generated paths until accepted live D10 projections exist. |
| G-HOST Host Policy Boundary Gate | G-HOST projections are live downstack, and D9 still requires G-HOST declarations before host-specific live apply gates. The current D9 slice uses registry-derived dry-run transaction inputs and does not yet consume a host apply-gate projection for live write approval. | Future D9 write-set and gate-handoff work must consume G-HOST projections; D9 must not encode Civ7/MapGen policy as generic transaction logic. |
| D11 Local Feedback | D9 has not yet published the D11-safe projection; only internal refusal records exist in the current slice. | D11 may later render D9 projection and recovery instructions; D11 must not recompute apply safety, rollback status, path approval, or gate semantics. |
| D13 Candidate Generation | D9 has a TypeBox `TransactionInputResolution` state for unresolved transaction input, but no D13-safe projection yet. | D13 may later describe candidate requirements; candidate generation remains separate from D8 admission and D9 write safety. |
| D15 Command Provenance Substrate | D9 does not trigger D15 by default. | Trigger D15 only if D9 final design records a concrete contradiction that D9-local transaction records cannot represent. |
| Packet index | D9 source implementation is partial: explicit-input dry-run execution and fail-closed live-write boundary are live; live writes remain blocked by D10/G-HOST where touched. | Packet index records source-slice state, not implementation-complete status. |
| Tests and fixtures | D9 removed the old `grit-apply.test.ts` surface and introduced `test/lib/transformation-transaction.test.ts`. | Add future inventory/write-set/handoff/rollback tests in D9-owned split files, not a revived transaction monolith. |
