# Downstream Realignment Ledger: D2 Rule Registry Metadata Contract

## Status

D2 downstream handoffs are accepted for design/specification after final D2 rereview and focused code/topology recheck. Downstream packet design may consume accepted D2 projections; source implementation that depends on live projections waits for D2 implementation, concrete D0 matrix rows, and D1 malformed-metadata output-family citations.

## Direct Consumers

| Downstream | D2 projection consumed | Design status after D2 acceptance | Source implementation gate |
| --- | --- | --- | --- |
| D3 Workspace Graph Boundary | `ruleGraphFacts` | May design graph ownership, target availability, and Nx graph behavior against structured D2 graph declarations. | Blocked until D2 implementation provides live graph projections and D0 rows cover Nx target metadata. |
| D4 Orientation And Routing | `ruleRoutingFacts` plus D3 graph results | May design classify/orientation scenarios against D2 path coverage states. | Blocked until D2 removes prose-scope routing authority and D3 graph truth exists where needed. |
| D5 Baseline Authority | `ruleBaselineFacts` | May define baseline load/shrink/growth/debt states against D2 baseline relations. | Blocked until D2 implementation removes permissive whole-row baseline parsing. |
| D6 Diagnostic Pattern Catalog | `ruleGritFacts`, diagnostic identifiers, execution adapter ids | May define diagnostic catalog and adapter failure taxonomy against D2 Grit facts. | Blocked until D2 implementation provides Grit projections and removes pattern-id fallback. |
| D7 Structural Enforcement Pipeline | `ruleSelectorFacts`, `ruleReportFacts`, `ruleExecutionFacts`, `ruleRoutingFacts`, `ruleBaselineFacts`, `ruleGritFacts`, `ruleFileLayerFacts` | May design enforcement aggregation against named projections and D1 output families. | Blocked until D2 implementation provides live projections and D5/D6/D10 owner packets close their own source behavior. |
| D8 Pattern Governance | `ruleGovernanceFacts`, `ruleGritFacts`, `ruleBaselineFacts` | May design Pattern Authority lifecycle/admission against D2 registry references. | Blocked until D2 implementation projects governance facts and D5 baseline relation behavior is available. |
| D10 Protected Zone Authority | `ruleFileLayerFacts` plus G-HOST declarations and D1 refusals | May design guard/refusal behavior against D2 generated-zone references. | Blocked until D2 implementation provides generated-zone projections and G-HOST accepts host-policy boundary. |
| D13 Scaffolding And Refusal Contracts | `ruleGovernanceFacts`, `ruleFileLayerFacts`, scaffold relation metadata | May design generator/refusal scenarios against D2 registry references and D8/G-HOST decisions. | Blocked until D2/D8/G-HOST implementation facts exist. |

## Indirect Consumers

| Downstream | D2 relation | Disposition |
| --- | --- | --- |
| G-HOST Host Policy Boundary Gate | Not a D2 consumer; parallel host-policy prerequisite for D10/D13 | Packet-index/G-HOST metadata now records G-HOST as requiring D0 and D1, not D2. D2 final cross-domino review confirmed this narrow alignment. |
| D9 Transformation Transaction | Consumes D2 only through D6/D8/D10 | D9 must not cite D2 as direct authority unless a later accepted D9 review adds a specific projection dependency. |
| D11 Local Feedback | Consumes D2 through D7/D10 and `ruleLocalFeedbackFacts` after D2 implementation | D11 owns hook behavior and local-output semantics; D2 owns eligibility metadata only. |
| D12 Verify Handoff Receipt | Consumes D2 only through D3/D7 | D12 must not read registry metadata directly. |
| D14 Authoring Topology Fence | Consumes D2 only through D4/D12/D13 | D14 must not treat D2 registry metadata as authoring topology authority. |
| D15 Execution Provenance Trigger | Not a D2 consumer | D2 malformed metadata does not trigger a shared provenance substrate. |

## Public Compatibility Dependencies

| Public/durable surface | D2 impact | Required before implementation |
| --- | --- | --- |
| `habitat check -- --json` | selector failures, report facts, malformed metadata output | D0 rows and D1 command/report family citation. |
| `habitat classify` | routing facts and scoped rule output | D0 rows and D1 malformed routing output family citation. |
| `tools/habitat-harness/src/index.ts` exports | `HarnessRule`, `rules`, `ruleById`, `executeRule` compatibility facade or versioning | D0 rows before public export changes. |
| Nx inferred project targets | `habitat:rule:*` target metadata, dependency targets, alias policy | D0 rows before graph metadata changes. |
| Pattern generator output | canonical registry row shape and Pattern Authority reference fields | D0 rows before generator public behavior changes. |
| Hook/local feedback output | staged eligibility and malformed metadata wording | D0 rows and D1/D11 boundary before behavior changes. |
| Docs/examples | guidance for supported registry metadata and legacy compatibility | D0 docs-example rows if public examples change. |

## Required Index Alignment

- Keep D2 status as `accepted for design/specification; final review and code/topology recheck found no unresolved P1/P2 blockers; implementation active; not implementation-complete`.
- D2 source implementation requires concrete D0 matrix rows and D1 malformed-metadata citations; those implementation-start citations now live in `workstream/implementation-start-inventory.md`.
- G-HOST is not listed as D2-enabled. G-HOST is parallel host-policy work requiring D0 and D1; D10 consumes both D2 and G-HOST.
- D10 remains the packet where D2 generated-zone facts and G-HOST host-policy declarations meet.

## Non-Claims

- This ledger accepts only D2 design/specification handoffs.
- This ledger does not implement projections.
- This ledger does not accept, repair, or close any downstream packet.
- This ledger does not authorize source implementation from D2 design alone; implementation proceeds through the implementation-start inventory and TypeBox-first registry boundary.
