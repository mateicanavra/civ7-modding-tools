# Downstream Realignment Ledger: D9 Transformation Transaction

## Status

D9 is accepted for design/specification after final rereview. These rows
describe the accepted design/specification contract; they do not authorize
source implementation or downstream packet acceptance.

| Surface | Current D9 disposition | Downstream action |
| --- | --- | --- |
| D0 Public Surface Compatibility | D9 requires D0 rows for `habitat fix`, `habitat fix --dry-run`, any JSON output, package exports, command DTOs, and docs/examples before source changes. | D0 rows must exist before implementation touches those surfaces. D9 remains source-blocked for public changes without citations. |
| D1 Receipt/Command Record Boundary | D9 uses `ApplyTransactionRecord`, D1 non-claim ids, refusal relationships, and compatibility wrapper rules. | Legacy `GritApplyTransactionProof` and `GritApplyTransactionResult` may only project from D9 target state through D0/D1 handling. |
| D6 Diagnostic Pattern Catalog | D9 consumes diagnostic identity/limitations only as context. Diagnostics do not authorize writes. | D6 must not expose apply safety; D9 must not convert diagnostic adapter failures into transaction states without an apply request. |
| D7 Structural Enforcement Pipeline | D7 check pass/fail does not approve writes. | D9 requires D8 admission, D10/G-HOST authority, and D9 transaction approval regardless of D7 check state. |
| D8 Pattern Governance | D9 consumes only D8 `ApplyAdmissionProjection` or explicit D8 apply refusal. | D8 may cite D9 transaction-input requirements, but D8 does not execute writes or own rollback. |
| D10 Protected Zone Authority | D9 requires D10 path/generated/protected-zone decisions before approving touched paths. D10 is not implementation-ready yet. | D9 source implementation remains blocked for protected/generated paths until accepted live D10 projections exist. |
| G-HOST Host Policy Boundary Gate | D9 requires G-HOST declarations for host-specific apply gates, including current MapGen public-ops validation. G-HOST is not implementation-ready yet. | D9 may design the handoff but must not encode Civ7/MapGen policy as generic transaction logic. |
| D11 Local Feedback | D9 publishes local-feedback-safe states: unavailable, refused, dry-run, applied, rolled-back, rollback-failed, and recovery-required. | D11 may render D9 projection and recovery instructions; D11 must not recompute apply safety, rollback status, path approval, or gate semantics. |
| D13 Candidate Generation | D9 publishes transaction prerequisites for apply-capable candidates. | D13 may describe candidate requirements; candidate generation remains separate from D8 admission and D9 write safety. |
| D15 Command Provenance Substrate | D9 does not trigger D15 by default. | Trigger D15 only if D9 final design records a concrete contradiction that D9-local transaction records cannot represent. |
| Packet index | D9 is accepted for design/specification only after final rereviews. | Packet index now records D9 accepted for design/specification, not implementation-complete, with source work still blocked by concrete D0 rows, live D8 apply-admission projections, D10 path/zone decisions, and G-HOST host-gate declarations where touched. |
| Tests and fixtures | D9 later implementation should reduce the current single-file apply test burden by moving state/write-set/handoff cases into owned test files where practical. | Do not keep adding all transaction behavior to the large `grit-apply.test.ts` file when an owned test split is available. |
