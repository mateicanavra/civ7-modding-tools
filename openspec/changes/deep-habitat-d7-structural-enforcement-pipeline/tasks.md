# Tasks

## 1. Packet Readiness Before Source Implementation

- [x] 1.1 Import fresh D7 domain/ontology, TypeScript state-space, code/topology,
  OpenSpec/information, testing/validation, and cross-domino investigation
  findings into the review ledger.
- [x] 1.2 Replace the incomplete proposal/design/spec/tasks with a complete D7
  Structural Enforcement design/specification packet.
- [x] 1.3 Record D7 write set, protected paths, upstream blockers, downstream
  contracts, and validation matrix in workstream records.
- [x] 1.4 Run fresh final D7 rereview lanes against the repaired disk state.
- [x] 1.5 Repair accepted P1/P2 final-rereview findings.
- [x] 1.6 Update packet index only after final rereviews record no unresolved
  P1/P2 findings.

## 2. Source Implementation Prerequisites

- [x] 2.1 Cite concrete D0 rows for every touched command JSON, human output,
  command behavior, package export, hook, verify, docs-example, script/Nx output,
  and generated/help surface.
- [x] 2.2 Confirm D1 output-family handling for check report, diagnostics,
  refusals, local feedback, verify summary, and non-claims.
- [x] 2.3 Confirm live D2 selector/report/execution/baseline/Grit/file-layer
  projections exist; do not migrate from whole registry rows until they do.
- [x] 2.4 Confirm live D3 graph invocation availability/refusal projections exist
  for check-related Nx surfaces before removing wrapper false-green paths.
- [x] 2.5 Confirm live D5 baseline application/integrity results exist before
  deleting local baseline loading/application in D7 code.
- [x] 2.6 Confirm live D6 diagnostic consumer projections exist before deleting
  local Grit/native diagnostic coupling.
- [x] 2.7 Confirm D10 accepted protected-zone guard/refusal contract is not live;
  protected-zone report authority is out of scope for this D7 source slice.

## 3. Characterization And State Model

- [x] 3.1 Characterize current public command behavior for invalid selectors,
  JSON/human rendering, `--output`, `--staged`, `--expand-baseline`, current
  built-in `baseline-integrity` row behavior, and current non-selectability of
  `--rule baseline-integrity`.
- [x] 3.2 Add semantic report-construction tests that reject or prevent
  contradictory `CheckReport.ok` and rule status combinations.
- [ ] 3.3 Introduce internal D7 closed states for `StructuralCheckRequest`,
  `RuleSelectionOutcome`, `RuleExecutionPlan`, `RuleExecutionDisposition`,
  `DiagnosticConsumptionOutcome`, `BaselineApplicationOutcome`,
  `StructuralRuleOutcome`, and `CheckOutcome`.
- [x] 3.4 Preserve public `CheckReport`/`RuleReport` compatibility through
  D0/D1-approved facades while the internal state model becomes authoritative.
- [x] 3.5 Replace manual `CheckReport.command` string construction
  (`buildHabitatCommand` or equivalent command/argv joins) with Oclif-derived
  command context in `StructuralCheckRequest`, preserving D0/D1-compatible
  serialized command output.

## 4. Pipeline Migration

- [x] 4.1 Migrate selector resolution to consume D2 selector facts and project
  selector refusals before execution planning.
- [ ] 4.2 Migrate execution planning to consume D2 execution facts and D3 graph
  availability/refusal facts.
- [ ] 4.3 Migrate diagnostic consumption to consume D6 diagnostic projections and
  preserve adapter/projection/cache refusal states.
- [x] 4.4 Migrate baseline application and baseline-integrity reporting to
  consume D5 results without mutating diagnostics in the D7 stage.
- [x] 4.5 Preserve current file-layer behavior without claiming D10
  protected-zone authority; migrate protected-zone outcomes only after D10
  acceptance.
- [x] 4.6 Centralize rule status, check outcome, public report, rendering, and
  exit derivation in D7-owned constructors.
- [ ] 4.7 Delete local recomputation paths after each owning upstream projection
  is live and covered by tests.

## 5. Consumer Projections

- [ ] 5.1 Publish `LocalFeedbackCheckProjection` for D11 and migrate hook
  compatibility code only through D0/D1-approved handling.
- [ ] 5.2 Publish `VerifyCheckSummaryProjection` for D12 and replace current
  verify summary inference once D12 accepts the contract.
- [ ] 5.3 Preserve D7 non-claims in both projections: no CI, runtime/product,
  apply safety, Graphite readiness, OpenSpec acceptance, or graph execution
  authority.

## 6. Validation

- [x] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts`.
- [x] 6.2 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`.
- [ ] 6.3 Run `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts`
  and disposition the current generated-output freshness failure.
- [ ] 6.4 Run focused D7 report-construction, lane/status, rendering, baseline
  consumption, diagnostic-refusal, staged protected-zone, D11 projection, and D12
  projection tests added by implementation.
- [ ] 6.5 Run focused command proofs for implemented current-tree/staged
  scenarios and record expected exit/status/non-claims.
- [x] 6.6 Run `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict`.
- [x] 6.7 Run `bun run openspec:validate`.
- [x] 6.8 Run `git diff --check`.

Validation note: the focused D7 command/report suite passes. The broader
`test/lib/enforcement-surface.test.ts` gate was run and currently fails on the
pre-existing direct wrapped-test generated-output freshness assertion
(`exitCode` 130 instead of 0); this D7 source slice records that residual rather
than changing the test or broad wrapped-test behavior.

## 7. Downstream Realignment And Closure

- [ ] 7.1 Update D11 and D12 packet assumptions only after D7 acceptance records
  the final projection contracts.
- [ ] 7.2 Update D8/D9/D13/D14/D15 downstream assumptions where D7 check outcome
  non-claims or trigger decisions affect them.
- [ ] 7.3 Keep D7 accepted for design/specification only until source
  implementation completes in a later layer.
- [ ] 7.4 Commit the D7 design/specification layer through Graphite with a clean
  subject/body commit message.
