# Tasks

## 1. Pre-Implementation Grounding

- [x] 1.1 Read `$D9_SOURCE_PACKET`, `$D9_CHANGE/proposal.md`,
  `$D9_CHANGE/design.md`, `$D9_CHANGE/specs/habitat-harness/spec.md`, and D9
  workstream ledgers.
- [x] 1.2 Confirm implementation starts on the accepted stack, not this
  design-only layer unless the stack has been merged according to Graphite.
- [x] 1.3 Confirm concrete D0 rows exist for every touched `habitat fix`,
  package export, command output, docs example, and DTO surface.
- [x] 1.4 Confirm live D8 `ApplyAdmissionProjection` exists for every apply
  pattern D9 consumes.
- [x] 1.5 Confirm live D10/G-HOST path and host-gate projections exist for every
  protected/generated or host-specific surface touched.
- [x] 1.6 If any dependency fact is absent, keep source implementation blocked
  for the affected surface and record the exact blocker in the implementation
  phase record.

## 2. State Model Construction

- [ ] 2.1 Introduce the complete D9 target state family:
  `TransformationRequest`, `DryRunIntent`, `LiveWriteIntent`,
  `LiveWriteAttempt`, `TransactionAdmissionDecision`,
  `DryRunInventoryOutcome`, `WriteSetApproval`, `LiveWriteOutcome`,
  `FormatterHandoffOutcome`, `GateHandoffOutcome`, `RollbackOutcome`,
  `TransactionOutcome`, and `RecoveryInstruction`.
- [ ] 2.2 Add branded identifiers for pattern ids, Grit pattern paths,
  repo-relative paths, approved write paths, write-set ids, command ids,
  SHA-256 digests, D0 surface ids, D1 non-claim ids, D8 admission ids, and D10
  decision ids.
- [ ] 2.3 Add non-empty collection types for approved writes, blocked writes,
  rollback paths, recovery instructions, gate command records, and D0 citations.
- [x] 2.4 Add exhaustive command rendering for implemented terminal outcomes.
- [ ] 2.5 Add type-level or compile-time tests that reject: `ok` plus failure,
  dry-run plus rollback-after-apply, live write without D8 admission, live write
  without D10/G-HOST path decision where touched, rollback command outside
  rollback state, and formatter/gate success inside failed outcomes.

## 3. Request And Admission

- [x] 3.1 Make `fix` command parsing construct explicit dry-run or live-write
  intent variants before entering D9. The command parser must not construct
  `LiveWriteAttempt`.
- [x] 3.2 Replace optional mode flags with intent/attempt constructors and
  internal test seams that cannot be used as product request authority.
- [x] 3.3 Consume D8 `ApplyAdmissionProjection` before any dry-run or live-write
  invocation.
- [ ] 3.4 Refuse diagnostic-only, candidate-only, retired, refused, or missing
  apply-admission patterns before native Grit invocation.
- [x] 3.5 Keep `habitat fix --json` out of implementation unless D0 authorizes a
  JSON contract and D9 adds the matching schema/tests.

## 4. Dry-Run And Write-Set Approval

- [ ] 4.1 Parse native Grit dry-run output into observations: zero-match,
  structured inventory, ambiguous output, command failure, and interruption.
- [ ] 4.2 Treat isolated-copy checks as explicit transaction observations, not
  implicit alternate authority paths. Use them only when the pattern inventory
  mode declares that path.
- [ ] 4.3 Compose `ApprovedWriteSet` only from D8 admission, D9 inventory/copy
  observation, D10 path decision, and G-HOST host policy where touched.
- [ ] 4.4 Refuse outside-root paths, protected/generated-zone paths without D10
  approval, host-specific paths without G-HOST declaration, and create/delete
  effects without explicit create/delete capability plus cleanup contract.
- [ ] 4.5 Preserve docs and source apply lanes as distinct pattern lanes with
  distinct roots, observations, and handoff records.

## 5. Live Write, Handoffs, And Rollback

- [x] 5.1 Refuse dirty live worktrees before native Grit invocation; allow dirty
  dry-runs only as non-writing requests.
- [ ] 5.2 Construct `LiveWriteAttempt` and run live native Grit apply only after
  D9 has produced approved dry-run/copy write-set approval.
- [ ] 5.3 Verify changed paths immediately after live apply and after every
  write-capable handoff.
- [ ] 5.4 Model Biome as formatter handoff; on formatter failure or formatter
  path drift, run rollback and report formatter failure as cause.
- [ ] 5.5 Model declared gates as owner-tagged handoffs; on gate failure, run
  rollback and report failed gate identity and owner.
- [x] 5.6 Replace inline MapGen public-ops validation with a G-HOST/D10-declared
  host gate, or keep the source implementation blocked for that behavior until
  the gate declaration exists.
- [ ] 5.7 Model rollback success and rollback failure as distinct terminal
  outcomes with residual paths and recovery instructions.

## 6. Public Compatibility And Projection

- [x] 6.1 Remove `GritApplyTransaction*` exports from the D9 implementation
  surface.
- [x] 6.2 Preserve existing `habitat fix` human output and exit behavior unless
  D0 rows authorize a changed public contract.
- [ ] 6.3 If D9 adds JSON output, implement schema/version, terminal `kind`,
  recovery instructions, non-claim ids, and bad-case JSON tests in the same
  D0-controlled public contract slice.
- [ ] 6.4 Publish a D11-safe local feedback projection and a D13-safe
  transaction-prerequisite projection; do not expose raw process artifacts as
  downstream authority.

## 7. Tests And Validation

- [ ] 7.1 Run type-level/compile-time tests for invalid state construction and
  exhaustive rendering/projection.
- [ ] 7.2 Run transaction unit tests for dirty live refusal, dirty dry-run,
  zero-match dry-run, approved dry-run, ambiguous dry-run, dry-run/copy
  mismatch, unapproved inventory, outside-root refusal, create/delete refusal,
  protected-zone refusal, missing host gate, unexpected live path, formatter
  failure, gate failure, rollback success, and rollback failure.
- [x] 7.3 Run focused command tests for `habitat fix --help` and
  `habitat fix --dry-run`; do not run `habitat fix --dry-run --json` unless D0
  authorized and D9 implemented that surface.
- [ ] 7.4 Run native Grit pattern tests for every apply pattern whose
  transaction invocation or inventory contract changed.
- [ ] 7.5 Run `git status --short --branch` before and after any live-write or
  rollback fixture/probe command.
- [x] 7.6 Run D9-owned split tests introduced during implementation.
- [x] 7.7 Run `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`,
  `bun run openspec:validate`, and `git diff --check`.

## 8. Closure State

- [x] 8.1 D9 final domain/ontology, TypeScript/validation,
  OpenSpec/information, code/vendor-topology, and cross-domino/product
  rereviews recorded no unresolved P1/P2 findings against current disk.
- [x] 8.2 `$D9_REVIEW_LEDGER`, `$D9_PHASE_RECORD`,
  `$D9_DOWNSTREAM_LEDGER`, `$D9_CLOSURE_CHECKLIST`, and packet index record the
  current fail-closed source slice and the remaining D9 implementation blockers.
- [x] 8.3 Commit D9 as a partial source layer only. Do not claim
  implementation-complete status where dry-run inventory, write-set approval,
  live write, handoffs, rollback, D10, and downstream projection work remain.
