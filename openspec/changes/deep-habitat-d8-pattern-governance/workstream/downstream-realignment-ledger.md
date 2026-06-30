# Downstream Realignment Ledger: D8 Pattern Governance

## Status

D8 downstream realignment now reflects the implemented Pattern Governance
source slice. No downstream source implementation is authorized by this ledger.

| Surface | Disposition | Required Action | Owner / Non-Claim |
| --- | --- | --- | --- |
| D0 public-surface matrix | source-blocking prerequisite | Concrete D0 rows must cover touched generator options/output, manifest JSON, validation reasons, package exports, `rules.json`, command messages, docs/examples, and generated/help surfaces. | D8 does not decide compatibility handling. |
| D1 output/refusal families | source-blocking prerequisite | D8 command-facing refusals must cite D1 output-family terms before source implementation changes messages or JSON. | D8 does not create a new output family locally. |
| D2 registry metadata | source-blocking prerequisite | D8 consumes `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`; later source work must not read whole registry rows as admission authority. | D2 owns registry projections. |
| D5 baseline authority | source-blocking prerequisite | D8 consumes `BaselineAuthorityProjection` or baseline refusal result for registered admission. | D5 owns baseline truth, growth, shrink-only integrity, and external exception projection. |
| D6 diagnostic catalog | source-blocking prerequisite | D8 consumes diagnostic capability, identity, fixture/sample result, injected probe result, limitation, and non-claims. | D6 owns diagnostic acquisition/projection and Grit adapter behavior. |
| D7 structural enforcement | conditional source prerequisite and downstream consumer | D8 consumes D7 current-tree/check outcome only when admission requires that input; D7 consumes D8 diagnostic/local-feedback eligibility through projections. | D7 owns report construction, rendering, and exit semantics. |
| D10/G-HOST protected and host policy | conditional source prerequisite | D8 consumes protected/generated-zone and host-policy decisions for scan roots, probes, apply paths, or host gates. | D8 must not encode host-specific policy. |
| D9 transformation transaction | downstream may consume D8 projection types after D8 source submission | D9 consumes only `ApplyAdmissionProjection` or explicit apply refusal from D8. | D9 may not promote diagnostic admission to write authority; D9 owns transaction execution. |
| D11 local feedback | downstream/indirect consumer | D11 consumes local-feedback eligibility only through D8/D7/D10 projections. | D11 owns hook sequencing, staged-file behavior, local output, and local-feedback non-claims. |
| D13 generator and refusal | downstream may consume D8 candidate/refusal projections after D8 source submission | D13 may create candidate drafts and hand registration to D8 through `CandidateHandoffProjection`. | D13 must not write active Grit patterns, rule rows, baseline state, hook eligibility, or apply admission by implication. |
| Recovery ledgers | source slice publishes recovery projection type and builder | Refused and retired patterns publish `PatternRecoveryProjection` with owner, reason, next action, and non-claims. | Recovery records do not create admission. |
| Docs/examples | update only for public guidance changes | Capability docs and examples may need D0-approved updates after source implementation. | Stale current counts are not D8 topology authority. |
| Tests/fixtures | implementation validation input | Focused D8 manifest/projection tests cover state separation; native Grit samples validate vendor pattern behavior, not D8 admission. | Generator CJS boundary remains D13-owned. |
| Packet index | update after source submission | Packet index may mark D8 source submitted after final validation and Graphite submission. | D8 source submission does not complete D9/D11/D13 behavior. |

## Downstream Acceptance Language

After final validation/submission, the packet index row may say:

`source implementation submitted as draft PR; TypeBox-first Pattern Governance state, validation, refusal, admission-state constructors, and consumer projections are live behind the existing Pattern Authority facade; focused TypeScript/manifest/projection/OpenSpec gates pass; D9/D11/D13/D10/G-HOST behavior remains owned by those packets`.
