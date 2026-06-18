# Tasks

## 1. Packet Readiness

- [ ] 1.1 Read `$D8_SOURCE_PACKET`, `$D8_CHANGE/**`,
  `$REMEDIATION_DIR/context.md`, and accepted D0-D7 packets before source
  edits.
- [ ] 1.2 Confirm active branch/worktree with `git status --short --branch` and
  `gt status`.
- [ ] 1.3 Confirm concrete D0 rows exist for every public/durable surface the
  implementation touches; stop where rows are missing.
- [ ] 1.4 Confirm D1 output-family citations for any user-facing D8 command
  outcome, refusal message, or JSON field changed by implementation.
- [ ] 1.5 Confirm live D2 `ruleGovernanceFacts`, `ruleGritFacts`, and
  `ruleBaselineFacts` projections exist where D8 source reads registry
  relations.
- [ ] 1.6 Confirm live D5 `BaselineAuthorityProjection` or baseline refusal
  result exists where D8 admission depends on baseline state.
- [ ] 1.7 Confirm live D6 diagnostic capability/projection inputs exist where
  D8 admits diagnostic patterns.
- [ ] 1.8 Confirm D7/D10/G-HOST/D11/D9 prerequisites for any current-tree,
  protected-zone, host-policy, local-feedback, or apply-admission behavior the
  implementation touches.

## 2. Current Behavior Characterization

- [ ] 2.1 Characterize current Pattern Authority manifest validation behavior in
  `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`.
- [ ] 2.2 Characterize current candidate generation behavior in
  `tools/habitat-harness/src/generators/pattern/generator.cjs`.
- [ ] 2.3 Characterize current registered promotion behavior in
  `tools/habitat-harness/src/generators/pattern/registration.cjs`.
- [ ] 2.4 Characterize current active rule registry and Grit catalog state,
  including legacy rows without `manifestPath`.
- [ ] 2.5 Record characterization output in the implementation phase record
  before semantic migration.

## 3. Pattern Authority State Model

- [ ] 3.1 Add a closed D8 state model for `candidate-draft`,
  `candidate-under-review`, `manifest-invalid-candidate`,
  `diagnostic-admitted`, `local-feedback-admitted`, `apply-admitted`,
  `refused`, and `retired`.
- [ ] 3.2 Add lifecycle-specific constructors or equivalent typed functions so
  registered admission without manifest path, local-feedback admission without
  hook decision, and apply admission without D9 inputs are not representable in
  target internals.
- [ ] 3.3 Keep existing manifest JSON and generator CLI behavior as
  compatibility projections until D0 rows authorize public changes.
- [ ] 3.4 Replace internal `authorityAccepted: boolean` decisions with state
  narrowing, while preserving boundary compatibility if required.

## 4. Candidate And Manifest Admission

- [ ] 4.1 Preserve candidate generation as candidate-only output: candidate
  files, no active rule row, no baseline, no hook eligibility, no apply
  projection.
- [ ] 4.2 Convert candidate invalidity into `manifest-invalid-candidate` or
  `refused` state before active writes.
- [ ] 4.3 Preserve missing, malformed, placeholder, contradicted, orphan,
  Grit-metadata-only, and Nx-options-only manifest refusals as typed D8
  refusal outcomes.
- [ ] 4.4 Ensure manifest validation success still waits for required D2/D5/D6
  and applicable D7/D10/D9/D13 inputs.

## 5. Diagnostic And Local-Feedback Admission

- [ ] 5.1 Consume D2 governance/Grit facts and D6 diagnostic projections instead
  of whole registry rows or raw Grit output.
- [ ] 5.2 Consume D5 baseline authority projection or refusal result instead of
  loading baseline truth locally.
- [ ] 5.3 Build `DiagnosticAdmissionProjection` for admitted diagnostic
  patterns.
- [ ] 5.4 Build `LocalFeedbackAdmissionProjection` only after explicit
  local-feedback admission and applicable D7/D10/D11 inputs.
- [ ] 5.5 Preserve hook-scope mismatch and advisory-pre-commit refusals before
  writes.

## 6. Apply Admission Handoff

- [ ] 6.1 Keep diagnostic admission and apply admission as separate states.
- [ ] 6.2 Refuse diagnostic patterns that claim apply-ready state.
- [ ] 6.3 Refuse apply admission without D9-owned transaction inputs,
  protected-path references, and applicable D10/G-HOST decisions.
- [ ] 6.4 Publish `ApplyAdmissionProjection` only for `apply-admitted` state.
- [ ] 6.5 Do not edit `tools/habitat-harness/src/lib/grit-apply.ts` or apply
  patterns unless D9 owns that implementation slice.

## 7. Consumer Projections

- [ ] 7.1 Add projection builders so rule registry, diagnostic catalog,
  baseline relation, local feedback, apply transaction, and recovery consumers
  cannot consume whole Pattern Authority manifests as their target API.
- [ ] 7.2 Add tests proving diagnostic consumers receive no apply fields.
- [ ] 7.3 Add tests proving D9 receives only apply-admission projection.
- [ ] 7.4 Add tests proving D13 receives candidate handoff/refusal projection
  and cannot register active state by implication.
- [ ] 7.5 Add tests proving retired patterns cannot be consumed as active
  without a new admission decision.

## 8. Validation

- [ ] 8.1 Run `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts`.
- [ ] 8.2 Run focused D8 type-state/projection tests added by the implementation.
- [ ] 8.3 Run `bun run habitat check --rule baseline-integrity --json` where
  registered pattern admission touches baseline state.
- [ ] 8.4 Run native Grit pattern sample tests only for pattern files touched by
  implementation, recording that this validates vendor pattern behavior, not
  D8 admission.
- [ ] 8.5 Run `bun run habitat classify tools/habitat-harness/src/rules/rules.json`
  and
  `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  as routing observations with non-claims.
- [ ] 8.6 Run `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`.
- [ ] 8.7 Run `bun run openspec:validate`.
- [ ] 8.8 Run `git diff --check`.
- [ ] 8.9 Run `git status --short --branch` and `gt status`.

## 9. Downstream Realignment

- [ ] 9.1 Update D9 handoff records so D9 consumes only
  `ApplyAdmissionProjection` or explicit D8 apply refusal.
- [ ] 9.2 Update D13 handoff records so candidate generation remains
  candidate-only and registration requests are handed to D8.
- [ ] 9.3 Update D11/D7 handoff records where local-feedback admission is
  consumed.
- [ ] 9.4 Update recovery docs/ledgers where refusal or retirement states are
  user-visible.
- [ ] 9.5 Update public docs/examples only for D0-approved compatibility
  changes.

## 10. Design/Specification Closure

- [ ] 10.1 Import D8 first-wave investigation findings into
  `$D8_REVIEW_LEDGER`.
- [ ] 10.2 Repair all accepted P1/P2 findings in packet artifacts.
- [ ] 10.3 Run complete-standard wording audit over `$D8_CHANGE/**` and
  `$AGENT_SCRATCH/domino-D8-*.md`.
- [ ] 10.4 Run fresh final D8 domain/ontology, TypeScript/validation,
  OpenSpec/information, code/topology, and cross-domino rereviews against the
  repaired disk state.
- [ ] 10.5 Update `$D8_PHASE_RECORD`, `$D8_REVIEW_LEDGER`,
  `$D8_DOWNSTREAM_LEDGER`, `$D8_CLOSURE_CHECKLIST`, and packet index only after
  final rereviews record no unresolved P1/P2.
- [ ] 10.6 Mark D8 accepted for design/specification only, not
  implementation-complete.
