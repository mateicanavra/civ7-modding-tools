# Downstream Realignment Ledger: D11 Local Feedback

## Status

D11 is accepted for design/specification only after final rereview and remains
not implementation-complete. Source work remains blocked behind concrete D0
rows, D1 output-family/non-claim handling, live D3/D6/D7/D9/D10 projections
where consumed, conditional D8 projection where consumed, and G-HOST only
through accepted D9/D10 projections unless D11 touches host-owned surfaces.
This ledger records downstream assumptions that must stay aligned during later
implementation.

| Surface | D11 relationship | Required downstream state |
| --- | --- | --- |
| D0 command/public surface inventory | D11 source work can touch hook commands, help, output, trace, exports, Husky delegators, docs/examples, and script surfaces only with concrete D0 rows. | D11 remains source-blocked wherever those rows are absent. Later implementation must cite row ids for every touched surface. |
| D1 output/non-claim boundary | D11 consumes local feedback trace, command record, and non-claim vocabulary; legacy hook wording is compatibility handling only. | Hook output and trace changes must preserve or version D1 output-family handling; target product terms stay local-feedback-oriented. |
| D3 workspace graph boundary | D11 pre-push local feedback consumes graph/target/base availability and graph-refusal states. | D11 cannot report affected-target pass when required D3 graph/target facts are refused or unavailable. D12 may not treat D11 pass as graph verification. |
| D6 diagnostic pattern catalog | D11 consumes staged diagnostic projections for Grit/native local feedback. | D11 must not parse raw Grit output or collapse diagnostic ownership into D7. D6 remains owner of diagnostic identity, adapter failure, projection miss, and D15 trigger conditions. |
| D7 structural enforcement pipeline | D11 consumes `LocalFeedbackCheckProjection` for structural check outcomes and may receive D6/D10-origin labels through D7. | D7 remains owner of check/report construction. D11 renders local feedback and sequencing only. |
| D8 Pattern Governance | D11 consumes D8 only if hook eligibility, pattern admission, hook scope, or local-feedback admission becomes part of the D11 source slice. | If consumed, D8 projection field and prohibited inference must be named. Otherwise D8 remains a conditional downstream relation, not a direct source blocker. |
| D9 transformation transaction | D11 consumes D9 local-feedback-safe transaction projection only when hook output references apply/fix or transaction recovery. | D11 cannot infer apply safety, rollback correctness, or transaction readiness from diagnostics, changed paths, dry-run text, or formatter output. |
| D10 protected/generated-zone authority | D11 consumes D10 protected/generated/forbidden mutation refusals directly or through D7. | D11 must stop local hook stages on D10 refusal and must not own path policy or generated/protected-zone semantics. |
| G-HOST | D11 consumes host-owned policy only through D9/D10 projections unless it directly touches host declarations or hook policy. | G-HOST remains transitive for this packet unless direct host surfaces are introduced by a later D11 implementation decision with accepted D0/D1 rows. |
| D12 verification handoff | D12 may observe D11 local feedback non-claims and trace boundaries. | D12 must not cite hook pass as verification completion, CI, graph authority, or product/runtime readiness. |
| D15 trigger | D11 can trigger D15 only when a concrete local command/state observation cannot be represented by D1, D3, D6, D7, D9, or D10 projections. | No D15 trigger is accepted by this packet without a named impossible local state and final review disposition. |
| `.husky/pre-commit` and `.husky/pre-push` | D11 owns hook workflow semantics but Husky delegators are public durable surfaces. | Any delegator change requires D0 row citation. No implementation claim until source changes and hook tests pass. |
| Hook tests and fixtures | D11 later implementation must expand hook tests around the target state matrix. | `hooks.test.ts` current pass is current-behavior grounding only. Later behavior gates must cover D6/D7/D9/D10/D3 projections and false-green refusals. |
| Docs/examples/process guidance | D11 may need to realign docs that describe hook semantics, resource behavior, Graphite/pre-push, or local feedback. | Docs should update only after D0/D1 public guidance rows authorize the behavior; no brittle host-local paths should be introduced. |
| Packet index | D11 row reflects D6 and D3 dependency repair, conditional D8/G-HOST handling, and accepted design/specification state. | Keep D11 not implementation-complete; source implementation remains blocked by concrete D0 rows, D1 output-family/non-claim handling, live D3/D6/D7/D9/D10 projections where consumed, conditional D8 projection where consumed, and G-HOST only through accepted D9/D10 projections unless D11 touches host-owned surfaces. |
