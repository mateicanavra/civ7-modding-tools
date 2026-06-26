# Tasks

## 1. Packet Readiness

- [x] 1.1 Read `$D8_SOURCE_PACKET`, `$D8_CHANGE/**`,
  `$REMEDIATION_DIR/context.md`, and accepted D0-D7 packets before source
  edits.
- [x] 1.2 Confirm active branch/worktree with `git status --short --branch` and
  `gt status`.
- [x] 1.3 Confirm concrete D0 rows exist for every public/durable surface the
  implementation touches; stop where rows are missing.
- [x] 1.4 Confirm D1 output-family citations for any user-facing D8 command
  outcome, refusal message, or JSON field changed by implementation. This
  source slice changes no command output family.
- [x] 1.5 Confirm live D2 `ruleGovernanceFacts`, `ruleGritFacts`, and
  `ruleBaselineFacts` projections exist where D8 source reads registry
  relations.
- [x] 1.6 Confirm live D5 `BaselineAuthorityProjection` or baseline refusal
  result exists where D8 admission depends on baseline state.
- [x] 1.7 Confirm live D6 diagnostic capability/projection inputs exist where
  D8 admits diagnostic patterns.
- [x] 1.8 Confirm D7/D10/G-HOST/D11/D9 prerequisites for any current-tree,
  protected-zone, host-policy, local-feedback, or apply-admission behavior the
  implementation touches. This source slice publishes D8 states/projections
  only; it does not implement D9 transactions, D11 hook behavior, D10 protected
  zones, or G-HOST host policy.

## 2. Current Behavior Characterization

- [x] 2.1 Characterize current Pattern Authority manifest validation behavior in
  `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`.
- [x] 2.2 Characterize current candidate generation behavior in
  `tools/habitat-harness/src/generators/pattern/generator.cjs`.
- [x] 2.3 Characterize current registered promotion behavior in
  `tools/habitat-harness/src/generators/pattern/registration.cjs`.
- [x] 2.4 Characterize current active rule registry and Grit catalog state,
  including rows without `manifestPath`.
- [x] 2.5 Record characterization output in the implementation phase record
  before semantic migration.

## 3. Pattern Authority State Model

- [x] 3.1 Add a closed D8 state model for `candidate-draft`,
  `candidate-under-review`, `manifest-invalid-candidate`,
  `diagnostic-admitted`, `local-feedback-admitted`, `apply-admitted`,
  `refused`, and `retired`.
- [x] 3.2 Add lifecycle-specific constructors or equivalent typed functions so
  registered admission without manifest path, local-feedback admission without
  hook decision, and apply admission without D9 inputs are not representable in
  target internals.
- [x] 3.3 Keep existing manifest JSON and generator CLI behavior stable while
  moving Pattern Authority internals behind D8 state/projection modules.
- [x] 3.4 Replace internal `authorityAccepted: boolean` decisions with state
  narrowing; the boundary result keeps the field only as a non-admission value.

## 4. Candidate And Manifest Admission

- [x] 4.1 Preserve candidate generation as candidate-only output: candidate
  files, no active rule row, no baseline, no hook eligibility, no apply
  projection.
- [x] 4.2 Convert candidate invalidity into `manifest-invalid-candidate` or
  `refused` state before active writes.
- [x] 4.3 Preserve missing, malformed, placeholder, contradicted, orphan,
  Grit-metadata-only, and Nx-options-only manifest refusals as typed D8
  refusal outcomes.
- [x] 4.4 Ensure manifest validation success still waits for required D2/D5/D6
  and applicable D7/D10/D9/D13 inputs before admission; manifest validation no
  longer reports lifecycle-derived admission.

## 5. Diagnostic And Local-Feedback Admission

- [x] 5.1 Consume D2 governance/Grit facts and D6 diagnostic projections instead
  of whole registry rows or raw Grit output. Current source adds the D8
  projection boundary and does not implement current-registry admission.
- [x] 5.2 Consume D5 baseline authority projection or refusal result instead of
  loading baseline truth locally. Current source adds the D8 projection boundary
  and does not load baseline files.
- [x] 5.3 Build `DiagnosticAdmissionProjection` for admitted diagnostic
  patterns.
- [x] 5.4 Build `LocalFeedbackAdmissionProjection` only after explicit
  local-feedback admission and applicable D7/D10/D11 inputs.
- [x] 5.5 Preserve hook-scope mismatch and advisory-pre-commit refusals before
  writes.

## 6. Apply Admission Handoff

- [x] 6.1 Keep diagnostic admission and apply admission as separate states.
- [x] 6.2 Refuse diagnostic patterns that claim apply-ready state.
- [x] 6.3 Refuse apply admission without D9-owned transaction inputs,
  protected-path references, and applicable D10/G-HOST decisions.
- [x] 6.4 Publish `ApplyAdmissionProjection` only for `apply-admitted` state.
- [x] 6.5 Do not edit `tools/habitat-harness/src/lib/grit-apply.ts` or apply
  patterns unless D9 owns that implementation slice.

## 7. Consumer Projections

- [x] 7.1 Add projection builders so rule registry, diagnostic catalog,
  baseline relation, local feedback, apply transaction, and recovery consumers
  cannot consume whole Pattern Authority manifests as their target API.
- [x] 7.2 Add tests proving diagnostic consumers receive no apply fields.
- [x] 7.3 Add tests proving apply consumers receive only apply-admission
  projection from `apply-admitted` state.
- [x] 7.4 Add tests proving candidate handoff/refusal projection does not
  register active state by implication.
- [x] 7.5 Add tests proving retired patterns cannot be consumed as active
  without a new admission decision.

## 8. Validation

- [x] 8.1 Run focused manifest validation test:
  `bun run --cwd tools/habitat-harness test test/rules/pattern-authority-manifest.test.ts test/rules/pattern-governance-projections.test.ts`.
- [x] 8.2 Run focused D8 type-state/projection tests added by the implementation.
- [x] 8.3 Run `bun run habitat check --rule baseline-integrity --json` where
  registered pattern admission touches baseline state. Not run for this slice:
  no registered baseline admission source was touched.
- [x] 8.4 Run native Grit pattern sample tests only for pattern files touched by
  implementation, recording that this validates vendor pattern behavior, not
  D8 admission. Not run for this slice: no Grit pattern files were touched.
- [x] 8.5 Run `bun run habitat classify tools/habitat-harness/src/rules/rules.json`
  and
  `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  as routing observations with non-claims.
- [x] 8.6 Run `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`.
- [x] 8.7 Run `bun run openspec:validate`.
- [x] 8.8 Run `git diff --check`.
- [x] 8.9 Run `git status --short --branch` and `gt status`.

## 9. Downstream Realignment

- [x] 9.1 Update D9 handoff records so D9 consumes only
  `ApplyAdmissionProjection` or explicit D8 apply refusal.
- [x] 9.2 Update D13 handoff records so candidate generation remains
  candidate-only and registration requests are handed to D8.
- [x] 9.3 Update D11/D7 handoff records where local-feedback admission is
  consumed.
- [x] 9.4 Update recovery docs/ledgers where refusal or retirement states are
  user-visible.
- [x] 9.5 Update public docs/examples only for D0-approved public-surface
  changes.

## 10. Design/Specification Closure

- [x] 10.1 Import D8 first-wave investigation findings into
  `$D8_REVIEW_LEDGER`.
- [x] 10.2 Repair all accepted P1/P2 findings in packet artifacts.
- [x] 10.3 Run complete-standard wording audit over `$D8_CHANGE/**` and
  `$AGENT_SCRATCH/domino-D8-*.md`.
- [x] 10.4 Run fresh final D8 domain/ontology, TypeScript/validation,
  OpenSpec/information, code/topology, and cross-domino rereviews against the
  repaired disk state.
- [x] 10.5 Update `$D8_PHASE_RECORD`, `$D8_REVIEW_LEDGER`,
  `$D8_DOWNSTREAM_LEDGER`, `$D8_CLOSURE_CHECKLIST`, and packet index only after
  final rereviews record no unresolved P1/P2.
- [x] 10.6 Mark D8 source slice complete without claiming D9/D11/D13 behavior.
