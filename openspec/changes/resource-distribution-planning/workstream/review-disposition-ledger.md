# Review Disposition Ledger

## Phase

- Project: resource distribution recovery
- Phase: planning and diagnosis
- Owner: Codex workstream owner
- Review wave: pre-implementation planning review

## Findings

| Finding | Severity | Disposition | Repair Evidence |
|---|---|---|---|
| Static resource ids treated as verified while runtime id order remains open | P2 | accepted | Proposal/design/phase/next packet separate static file-order corpus from runtime id verification; `resource-corpus-contract` owns runtime id status. |
| Downstream slice contracts were not durable enough | P2 | accepted | Design now includes per-slice status, write set, protected paths, review lanes, entry conditions, stop conditions, and required evidence. |
| All official resources and placeable resources were not reconciled | P2 | accepted | Design now defines corpus artifact fields for placeability and strategy-required status with rationale. |
| Review state was ambiguous for implementation handoff | P2 | accepted | Phase record and next packet now record review wave completion, accepted findings, and repair state. |
| Candidate resource group steps lacked artifact specificity | P2 | accepted | Design now requires consumed artifacts, published artifact, invariant, downstream consumer, and verification boundary before a group becomes a step candidate. |
| Handoff dirty paths and gate outputs were vague | P3 | accepted | Next packet now lists exact uncommitted files and last gate outputs. |
| Rubies hypothesis needed explicit hypothesis marker | P3 | accepted | Design and phase record label rubies as a hypothesis pending per-resource rejection telemetry. |

## Closure Gate

Planning implementation must not proceed to behavior code until all accepted P2
findings above remain repaired after OpenSpec validation.

## Repair Verification

- Architecture review: repair verified with no open P1/P2 findings.
- Spec/workstream review: substantive repairs verified; a stale handoff-state
  follow-up was accepted and repaired by removing obsolete blocker and
  remaining-task text from the phase record and next packet.
- Final planning gates passed after repair verification updates.
