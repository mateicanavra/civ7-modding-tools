# Downstream Realignment Ledger: D13 Scaffolding And Refusal Contracts

| Surface | Status | D13 relation | Required action |
| --- | --- | --- | --- |
| `$REMEDIATION_DIR/packet-index.md` | accepted-design updated | D13 row records accepted design/specification status after final rereview. | Preserve not-implementation-complete and source-blocker language. |
| D0 compatibility matrix | source-blocker | D13 public generator/schema/help/output/docs/export changes require concrete D0 rows. | Later implementation must cite rows for every touched public surface before source edits. |
| D2 registry metadata | source-blocker | D13 may consume `ruleGovernanceFacts` and `ruleGeneratedZoneFacts`; it may not infer registry truth. | Keep source blocked wherever live D2 projections are absent. |
| D8 Pattern Governance | source-blocker | D13 candidate drafts are non-active; registered promotion is D8-owned. | Later implementation must consume live D8 candidate/admission/refusal projections before touching registered behavior. |
| G-HOST Host Policy Boundary | blocking for host-specific behavior | D13 defines generic `host-policy-missing` refusal shape but does not own host declarations. | Keep host-specific source closure blocked until G-HOST is accepted/live and D13 consumes named projections. |
| D10 Generated/Protected Zone Authority | source-blocker where paths require it | D13 may not write protected/generated paths through scaffold shortcuts. | Later implementation must consume D10 path/zone decisions where scaffold output touches protected zones. |
| D14 Authoring Topology Fence | split dependency | D13 owns generic refusal shape; D14 owns authoring-specific blocked action/future criteria. | Keep Authoring Topology source behavior blocked until D14 early-fence language is accepted and cited. |
| Habitat docs/examples | later implementation realignment | D13 may need to clarify supported generators, candidate-only output, unsupported kinds, and no authoring topology. | Update only after implementation facts or D0-compatible public guidance changes. |
| Generator tests and fixtures | later implementation realignment | D13 implementation must add no-write/refusal/scaffold receipt/candidate separation coverage. | Run gates named in `tasks.md` and phase record. |
| Pattern Authority manifest tests | protected unless D8 boundary requires | D13 may add fixtures that prove Nx options are not authority without weakening D8 validation. | Coordinate with D8 source blockers. |

## Source Implementation Blockers Preserved

D13 design/specification acceptance does not make source implementation
complete. Source work remains blocked behind concrete D0 rows, live D2/D8
projections, G-HOST host declarations where consumed, D10 path/zone decisions
where touched, and D14 early-fence language for authoring-specific refusals.
