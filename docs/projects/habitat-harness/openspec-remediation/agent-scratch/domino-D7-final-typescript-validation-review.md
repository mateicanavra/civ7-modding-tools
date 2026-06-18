Status: ACCEPTED

# D7 Final TypeScript/Validation Review

No unresolved P1/P2 remain for D7 design/specification acceptance from a TypeScript state-space and validation standpoint.

This acceptance is design/specification-only. It does not approve source implementation. D7 source work remains blocked behind the prerequisites already stated in the packet: concrete D0 public-surface rows, D1-compatible output-family handling, live D2/D3/D5/D6 projections where consumed, and accepted D10 protected-zone guard/refusal contracts where protected-zone outcomes are implemented.

## Acceptance Basis

The repaired packet now gives implementation agents enough closed state and validation structure to collapse the current `createCheckReport` option/result/status soup without deciding product/domain policy while coding.

- `$D7_CHANGE/design.md` section `Target State Model` defines discriminated state families for `StructuralCheckRequest`, `RuleSelectionOutcome`, `RuleExecutionDisposition`, `DiagnosticConsumptionOutcome`, `BaselineApplicationOutcome`, `StructuralRuleOutcome`, and `CheckOutcome`.
- `$D7_CHANGE/design.md` section `Target State Model` uses `NonEmptyReadonlyArray<T>` for selected rule sets, findings, advisory findings, refusals, failing reports, and refusal reports where emptiness would create false-green ambiguity.
- `$D7_CHANGE/design.md` section `Construction rules` explicitly forbids free internal `CheckReport.ok`, derives public `ok` from `CheckOutcome`, preserves covered diagnostics, and gives nonzero exit semantics for selector/dependency/enforced-failure outcomes.
- `$D7_CHANGE/specs/habitat-harness/spec.md` requirements `Selector Outcomes Are Closed Before Execution`, `Execution Dispositions Cannot Disappear`, `Diagnostic Failures Cannot Become Pass`, `Baseline Application Preserves Diagnostics`, `Lane And Status Derivation Is Centralized`, and `CheckReport Is Derived Or Semantically Rejected` provide normative scenarios for the key illegal states.
- `$D7_CHANGE/design.md` section `Public Surface Compatibility Inventory` and `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Public Surface Changes Wait For D0 Rows` correctly name public DTO/export/command/hook/verify/Nx/docs compatibility traps behind D0/D1 blockers instead of treating them as internal-only refactors.

## False-Green Coverage

The validation matrix is now falsifying enough for design/spec acceptance.

- Selector refusal: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Selector Outcomes Are Closed Before Execution` and `$D7_CHANGE/design.md` gate `D7-SELECTOR`.
- Dependency unavailable / graph false green: covered by `$D7_CHANGE/design.md` sections `Consumed Contract Matrix`, `False-Green Invariant Matrix`, and validation gate `D7-COMMAND-CURRENT`/D3 dependency notes.
- Adapter failure: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Diagnostic Failures Cannot Become Pass` and `$D7_CHANGE/design.md` gate `D7-DIAGNOSTIC`.
- Baseline covered/uncovered/refused: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Baseline Application Preserves Diagnostics` and `$D7_CHANGE/design.md` gate `D7-BASELINE`.
- Advisory lane: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Lane And Status Derivation Is Centralized` and `$D7_CHANGE/design.md` gate `D7-LANE`.
- Staged not-applicable: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Execution Dispositions Cannot Disappear`.
- Protected-zone refusal: covered as D10-owned consumption in `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Structural Enforcement Consumes Upstream Projections Only`, `$D7_CHANGE/design.md` consumed contract matrix, and validation gate `D7-PROTECTED`.
- Rendering and exit semantics: covered by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `Rendering Preserves Structured Truth`, `$D7_CHANGE/design.md` pipeline stages 7-9, and validation gate `D7-RENDER`.

## Negative-Control Findings Disposition

The first-wave TypeScript and validation scratch records remain useful as negative controls, but their design/spec blockers are repaired on disk.

- The previous missing concrete state families are addressed by `$D7_CHANGE/design.md` section `Target State Model`.
- The previous missing semantic report constructor/validator oracle is addressed by `$D7_CHANGE/specs/habitat-harness/spec.md` requirement `CheckReport Is Derived Or Semantically Rejected` and `$D7_CHANGE/design.md` gate `D7-REPORT-SEMANTIC`.
- The previous invalid `--rule baseline-integrity` proof is corrected in `$D7_CHANGE/proposal.md` section `Verification Gates`, `$D7_CHANGE/design.md` section `Validation Matrix`, and `$D7_CHANGE/specs/habitat-harness/spec.md` scenario `Built-in baseline integrity is reported`.
- The previous generic public compatibility blocker is now a concrete placeholder inventory in `$D7_CHANGE/design.md` section `Public Surface Compatibility Inventory`; source implementation remains blocked while rows are `blocked-pending-d0-row`.

## Validation Run

- `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict`: passed.
- `bun run openspec:validate`: passed, 249 items passed and 0 failed.
- `git diff --check`: passed.

## P3 Polish

- `$D7_CHANGE/design.md` validation gate `D7-COMMAND-CURRENT` is necessarily broad because exact command cases depend on later implementation slices. This is acceptable for design/spec acceptance because the focused falsifying gates above name the actual state families, but implementation should split that gate into concrete per-surface tests as soon as the first source slice exists.
- `$D7_CHANGE/workstream/closure-checklist.md` still shows final rereview lanes and packet-index update as pending. That is process state, not a D7 TypeScript/validation design blocker; update it only after all final lanes complete.

Skills used: domain-design, information-design, solution-design, testing-design, typescript-refactoring.
