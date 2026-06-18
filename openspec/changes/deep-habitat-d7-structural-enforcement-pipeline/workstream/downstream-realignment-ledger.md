# Downstream Realignment Ledger: D7 Structural Enforcement Pipeline

## Status

D7 is accepted for design/specification after fresh final rereview found no
unresolved P1/P2 blockers. Downstream rows below are design contracts, not
implementation-complete claims. Source edits remain gated by concrete D0 rows,
D1 output-family handling where touched, live D2/D3/D5/D6 projections, and an
accepted D10 protected-zone guard/refusal contract where D7 consumes protected
zone outcomes.

| Surface | D7 disposition | Required downstream action |
| --- | --- | --- |
| D0 public-surface matrix | D7 requires concrete rows for all touched check/report/export/hook/verify/Nx/docs/generated surfaces. | Do not start source edits while touched rows remain `blocked-pending-d0-row`. |
| D1 receipt/refusal/non-claim boundary | D7 inherits check report and non-claim limits; `CheckReport` remains check output, not a receipt. | D11/D12 must preserve D1 non-claims when consuming D7 projections. |
| D2 rule metadata projections | D7 consumes selector/report/execution/baseline/Grit/generated-zone facts. | D2 implementation must provide live projections before D7 deletes whole-row registry coupling. |
| D3 graph boundary | D7 consumes graph target availability/refusal for check-related Nx invocation surfaces. | D12 continues to consume D3 verify target plans separately; D7 cannot be used as graph truth. |
| D5 baseline authority | D7 consumes `BaselineApplicationResult` and `BaselineIntegrityResult`. | D5 remains the only owner of baseline state, expansion, integrity, external projection, and manifest acceptance. |
| D6 diagnostic catalog | D7 consumes `DiagnosticRunOutcome` / diagnostic consumer projection. | D6 remains owner of Grit/native diagnostic identity, adapter failures, and probe outcomes. |
| D10 protected-zone authority | D7 consumes D10 guard/refusal results. | D10 remains blocking; D7 protected-zone source work waits for D10 acceptance and live guard results. |
| D11 Local Feedback | D7 publishes `LocalFeedbackCheckProjection`. | D11 must consume this projection for hook/local feedback and cannot infer check semantics from human output or current raw JSON. |
| D12 Verify Handoff Receipt | D7 publishes `VerifyCheckSummaryProjection`. | D12 uses D7's allow/skip affected-execution signal but owns verify receipt schema and affected-target execution. |
| D8 Pattern Governance | D7 check behavior is enforcement/report output only. | D8 may cite D7 outcomes as structural enforcement context but owns pattern lifecycle/admission. |
| D9 Transformation Transaction | D7 pass does not approve writes. | D9 must require D8/D10/G-HOST/D9 transaction authority for apply safety. |
| D13/D14 docs, generators, and topology | D7 affects examples and refusal/handoff wording only after D7 public surfaces are D0-classified. | Later packets must consume the accepted D7 design/specification contract without inferring implementation readiness. |
| D15 trigger | D7 does not currently trigger D15. | D15 is triggered only if D7 implementation finds a concrete command-provenance/cache/cwd/env/output state that local D7 DTOs cannot encode. |
| Packet index | D7 row is accepted for design/specification after final rereview and validation evidence. | Keep D7 marked not implementation-complete; D8-D15/G-HOST remain blocking unless their own rows say otherwise. |
