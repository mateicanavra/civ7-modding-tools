# Downstream Realignment Ledger: D8 Pattern Governance

## Status

D8 downstream realignment is accepted for design/specification only after final
rereview. No downstream source implementation is authorized by this ledger.

| Surface | Disposition | Required Action | Owner / Non-Claim |
| --- | --- | --- | --- |
| D0 public-surface matrix | source-blocking prerequisite | Concrete D0 rows must cover touched generator options/output, manifest JSON, validation reasons, package exports, `rules.json`, command messages, docs/examples, and generated/help surfaces. | D8 does not decide compatibility handling. |
| D1 output/refusal families | source-blocking prerequisite | D8 command-facing refusals must cite D1 output-family terms before source implementation changes messages or JSON. | D8 does not create a new output family locally. |
| D2 registry metadata | source-blocking prerequisite | D8 consumes `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`; later source work must not read whole registry rows as admission authority. | D2 owns registry projections. |
| D5 baseline authority | source-blocking prerequisite | D8 consumes `BaselineAuthorityProjection` or baseline refusal result for registered admission. | D5 owns baseline truth, growth, shrink-only integrity, and external exception projection. |
| D6 diagnostic catalog | source-blocking prerequisite | D8 consumes diagnostic capability, identity, fixture/sample result, injected probe result, limitation, and non-claims. | D6 owns diagnostic acquisition/projection and Grit adapter behavior. |
| D7 structural enforcement | conditional source prerequisite and downstream consumer | D8 consumes D7 current-tree/check outcome only when admission requires that input; D7 consumes D8 diagnostic/local-feedback eligibility through projections. | D7 owns report construction, rendering, and exit semantics. |
| D10/G-HOST protected and host policy | conditional source prerequisite | D8 consumes protected/generated-zone and host-policy decisions for scan roots, probes, apply paths, or host gates. | D8 must not encode host-specific policy. |
| D9 transformation transaction | downstream design may consume accepted D8 projections; source remains blocked behind live D8 facts | D9 consumes only `ApplyAdmissionProjection` or explicit apply refusal from D8. | D9 may not promote diagnostic admission to write authority; D9 owns transaction execution. |
| D11 local feedback | downstream/indirect consumer | D11 consumes local-feedback eligibility only through D8/D7/D10 projections. | D11 owns hook sequencing, staged-file behavior, local output, and local-feedback non-claims. |
| D13 generator and refusal | downstream design may consume accepted D8 projections; source remains blocked behind live D8 facts | D13 may create candidate drafts and hand registration to D8 through `CandidateHandoffProjection`. | D13 must not write active Grit patterns, rule rows, baseline state, hook eligibility, or apply admission by implication. |
| Recovery ledgers | downstream update after implementation facts | Refused and retired patterns publish `PatternRecoveryProjection` with owner, reason, next action, and non-claims. | Recovery records do not create admission. |
| Docs/examples | update only for public guidance changes | Capability docs and examples may need D0-approved updates after source implementation. | Stale current counts are not D8 topology authority. |
| Tests/fixtures | implementation validation input | Add focused D8 state/projection tests and update existing manifest/generator tests during implementation. | Native Grit samples validate vendor pattern behavior, not D8 admission. |
| Packet index | accepted for design/specification only | Packet index may mark D8 accepted for design/specification after final rereviews and validation passed. | D8 remains not implementation-complete. |

## Downstream Acceptance Language

If final rereviews pass, the packet index row may say:

`accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/topology, and cross-domino rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation remains blocked behind concrete D0 rows, D1 output-family citations, live D2 ruleGovernanceFacts/ruleGritFacts/ruleBaselineFacts, D5 BaselineAuthorityProjection, D6 diagnostic projections, accepted D7 check outcome projections where consumed, and D10/G-HOST protected-zone or host-policy contracts where touched`.
