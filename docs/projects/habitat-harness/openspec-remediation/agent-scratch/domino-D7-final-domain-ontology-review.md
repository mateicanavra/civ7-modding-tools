Status: ACCEPTED

# D7 Final Domain/Ontology Review

Final rereview scope: design/specification acceptance only for
`$D7_CHANGE` after the repaired disk state. I treated the first-wave D7
domain/ontology and cross-domino scratch files as negative-control inputs only,
not authority.

## Acceptance Finding

No unresolved P1/P2 domain or ontology blockers remain for D7
design/specification acceptance.

D7 now has a coherent bounded-context role: Structural Enforcement owns the
composition of accepted upstream projections into a finalized `habitat check`
outcome, public `CheckReport`, rendering, and exit decision. It explicitly does
not own public-surface classification, receipt semantics, rule registry
metadata, graph truth, baseline authority, diagnostic acquisition, protected
zone policy, hook sequencing, or verify handoff receipt schema
(`proposal.md` lines 5-13, 55-69; `design.md` lines 5-15, 33-45).

The repaired ontology is complete enough to prevent implementation agents from
inventing the core domain while editing source code. `design.md` defines the
accepted D7 terms for request normalization, selector outcomes, dependency
availability, execution disposition, diagnostic consumption, baseline
application, structural rule outcome, report construction, check outcome, and
D11/D12 projections (`design.md` lines 47-68). The closed state sketch and
construction rules make the important false-green states explicit: selector
refusal cannot enter execution planning, selected rules cannot disappear without
not-applicable/refused disposition, findings variants are non-empty,
`CheckReport.ok` is derived, and covered diagnostics remain visible
(`design.md` lines 97-155).

The rejected language is strong enough for design/specification acceptance.
It blocks generic "result" language where it conflates process exit,
diagnostic projection, adapter failure, report status, and baseline result;
blocks whole mutable `HarnessRule` rows as selected-rule meaning; blocks raw
`Grit result`; blocks unqualified `graph facts`; blocks D7-owned generated-zone
policy; blocks silent skip; and blocks free settable `CheckReport.ok`
(`design.md` lines 70-85). This directly repairs the first-wave naming failure.

The adjacent-domain contracts are now consumed as projections/refusals rather
than recomputed locally. The consumed-contract matrix says D7 consumes D2
selector/report/execution/baseline/Grit/generated-zone facts, D3 availability
and `GraphRefusal`, D5 baseline application/integrity results, D6 diagnostic
outcomes/projections, and D10 guard accepted/refused states, while forbidding
whole registry authority, local graph truth, local baseline policy, raw Grit
parsing, and local protected-zone policy (`design.md` lines 87-95). The same
boundary is repeated normatively in the spec (`specs/habitat-harness/spec.md`
lines 3-31).

D11 and D12 output contracts are precise enough and do not overclaim. D11 gets
`LocalFeedbackCheckProjection` with local-feedback-only non-claims and is barred
from parsing human output for semantics (`design.md` lines 214-228;
`specs/habitat-harness/spec.md` lines 175-187). D12 gets
`VerifyCheckSummaryProjection` with requested selectors, selected real/built-in
ids, status/refusal/not-applicable counts, an `allowsAffectedExecution` signal
derived from `CheckOutcome`, skipped-affected reason, and bounded non-claims
(`design.md` lines 230-244; `specs/habitat-harness/spec.md` lines 189-201).
The downstream ledger preserves the same ownership split for D11/D12 and
prevents them from inferring check semantics from current raw JSON or human
output (`workstream/downstream-realignment-ledger.md` lines 17-18).

Implementation remains correctly blocked behind concrete D0 rows, D1
output-family handling, live D2/D3/D5/D6 projections, and accepted D10 guard
contracts where those surfaces are touched (`proposal.md` lines 71-81;
`tasks.md` lines 17-33; `workstream/phase-record.md` lines 40-50). Those are
source implementation prerequisites, not unresolved design/ontology blockers
for this acceptance lane.

## P3 Polish

- Align refusal naming between the core `CheckOutcome` model and downstream
  projection prose before implementation. `CheckOutcome` currently groups
  owner-specific refusals under `dependency-refused` (`design.md` lines
  135-141), while D11/D12 projection text names `diagnostic-unavailable`,
  `baseline-refused`, `protected-zone-refused`, and `diagnostic-refused`
  separately (`design.md` lines 216-220; `specs/habitat-harness/spec.md` lines
  198-200). This is not blocking because the design already carries owner and
  refusal reason through dependency/refusal states, but tightening the naming
  would reduce translation ambiguity for implementation.

## Validation Notes

- `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` passed.
- `git diff --check` passed.
