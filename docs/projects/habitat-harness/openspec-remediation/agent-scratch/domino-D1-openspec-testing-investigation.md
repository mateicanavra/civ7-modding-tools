# Domino D1 OpenSpec And Testing Investigation

## Scope

Objective: D1 Receipt Contract Boundary, OpenSpec/testing/validation lane only.

This investigation does not implement code and does not edit packet files. It defines the validation and spec-design requirements D1 must satisfy before it can become a production-quality OpenSpec packet for receipt, check, diagnostic, transaction, refusal, and handoff contracts.

Current verdict: D1 remains blocked. The scaffold is useful directionally, but it does not yet provide the contract-family model, D0 compatibility prerequisites, falsifying validation gates, write set, protected paths, or repair closure criteria required by the remediation frame.

## Contract Families D1 Must Specify

### 1. Cross-Cutting Surface Inventory And Compatibility Gate

D1 must add a receipt surface inventory before implementation. This is the D1 analogue of D0's accepted matrix discipline: D1 cannot ask implementation to discover which current proof-shaped surfaces are receipts, check results, traces, transactions, compatibility wrappers, or docs-only examples while coding.

Required inventory columns:

| Column | Requirement |
| --- | --- |
| `surface` | Current type, command output, function, public phrase, docs example, or handoff record. |
| `current_path` | Repo-relative current source/test/doc path. |
| `d0_surface_id` | D0 row ID once the D0 matrix implementation exists; until then, explicit `blocked-pending-d0-row`. |
| `current_public_state` | D0-derived state such as `command-only-dto`, `package-export`, `human-output`, `docs-example`, or `package-internal`. |
| `target_contract_family` | One of the D1 families below. |
| `target_name` | Chosen target term, or compatibility-retained legacy name with rationale. |
| `compatibility_decision` | Preserve, version, facade, deprecate, refuse, document-only, or generated-only, copied from D0 handling where applicable. |
| `schema_version_stance` | Preserve `schemaVersion: 1`, version rename, or not applicable. |
| `owner` | D1 accountable owner for the contract family. |
| `forbidden_owners` | Adjacent owners that may consume but not redefine the contract. |
| `required_tests` | Tests or command gates that prove this surface. |
| `bad_case` | Invalid state that must fail validation or be unrepresentable. |
| `non_claims` | Prohibited inferences carried by this contract. |
| `downstream_consumers` | Later dominoes/docs/tests that must cite the row. |

Minimum required rows:

| Current surface | Current path | Target contract family |
| --- | --- | --- |
| `CheckReport` | `tools/habitat-harness/src/lib/diagnostics.ts` and `src/lib/command-engine.ts` | Check result |
| `RuleReport` / `HabitatDiagnostic` | `tools/habitat-harness/src/lib/diagnostics.ts` | Diagnostic |
| `VerifyProof` / `createVerifyProof` | `tools/habitat-harness/src/lib/command-engine.ts` | Verify handoff receipt or D0-backed compatibility wrapper |
| `HookTrace`, `PreCommitTrace`, `PrePushTrace` | `tools/habitat-harness/src/lib/hooks.ts` | Local feedback trace |
| hook proof notice | `tools/habitat-harness/src/lib/hooks.ts`, `test/lib/hooks.test.ts` | Human output local-feedback non-claim |
| `GritApplyTransactionResult` | `tools/habitat-harness/src/lib/grit-apply.ts` | Apply command outcome |
| `GritApplyTransactionProof` | `tools/habitat-harness/src/lib/grit-apply.ts` | Apply transaction record or compatibility wrapper |
| `AdapterProofArtifact`, `ProofArtifactWriter`, `ProofArtifactWriteFailure` | `tools/habitat-harness/src/lib/proof-artifact.ts` | Adapter command-result artifact compatibility |
| `proof` fields in classify/apply/docs | `src/lib/command-engine.ts`, `src/lib/grit-apply.ts`, docs | Compatibility terms requiring keep/rename/version decision |
| Graphite state in hooks/handoffs | `src/lib/hooks.ts`, workstream records | Handoff state record, not command proof |
| docs proof language | `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`, `tools/habitat-harness/docs/SCENARIOS.md` | Docs-example or historical current-state prose |

Requirement:
Habitat SHALL maintain a D1 receipt-surface inventory before source implementation starts. A surface in the inventory SHALL be assigned to exactly one target contract family and SHALL carry D0 compatibility handling before D1 changes a public name, JSON shape, exported type, command output, hook phrase, docs example, or handoff record.

Scenarios:

- When D1 encounters a current `Proof*`, `*Proof`, `proofClass`, `proofId`, proof notice, or proof artifact path, it records the name as a compatibility fact unless D1 explicitly keeps it for a concrete repo-maintenance scenario.
- When a surface does not yet have a D0 matrix row, D1 remains design-only and its implementation tasks are blocked until D0 supplies the row.
- When one TypeScript surface is both package-exported and command JSON, D1 keeps those as separate compatibility decisions and does not let a package export freeze command JSON by accident.

### 2. Check Result Contract

Owner: Check Result Contract.

Forbidden owners: verify, hooks, apply, Graphite handoff, adapter artifacts, and downstream D6/D7 packets may not redefine check-result semantics.

Required target rule:
`CheckReport` or its D0-approved successor is the command JSON result for `habitat check --json`. It reports structural rule selection, rule execution status, diagnostics, baseline integrity, and check command outcome. It is not a handoff receipt, not an Nx proof, not apply safety, not CI, and not product/runtime proof.

Required states:

- `ok: true` is derived from every rule report having status other than `fail`; it is not independently hand-authored.
- `ok: false` is required when any selected rule status is `fail`.
- Rule status set remains closed: `pass`, `fail`, `advisory-findings`.
- Rule-selection failures project to the existing `rule-selection-integrity` report, status `fail`, `ok: false`.
- Baseline contract failures are diagnostics inside the check result, not proof/handoff records.

Scenarios:

- When `habitat check --json --rule definitely-not-a-rule` runs, output is schemaVersion 1 `CheckReport`, exits 1, has `ok: false`, has only `rule-selection-integrity`, and does not claim that Habitat rules executed.
- When an advisory rule has diagnostics, the rule may be `advisory-findings` without making `CheckReport.ok` false.
- When any enforced rule fails, `CheckReport.ok` is false.
- When `CheckReport.ok` contradicts rule statuses, validation fails or construction is impossible.

Bad cases:

- `ok: true` with a `rules[].status === "fail"`.
- Unknown rule status.
- Rule-selection failure followed by ordinary rule execution rows.
- Human-mode invalid selector output that emits schema JSON despite not being JSON mode.

### 3. Diagnostic Contract

Owner: Diagnostic Contract, consumed by check and later D6/D7 but not owned by them for D1's boundary.

Required target rule:
`HabitatDiagnostic` is the normalized finding shape inside check results. It reports a concrete rule finding, baseline status, severity, location, and message. It does not claim command success, receipt completeness, or remediation safety.

Required states:

- Severity set is closed: `error`, `advisory`.
- Diagnostic path is repo-relative or `"."` for coarse whole-rule findings.
- Baselined is a boolean property of a diagnostic, not a proof claim.
- Diagnostics appear under a rule report; standalone diagnostics are not D1 handoff receipts.

Scenarios:

- When `validateCheckReport` receives a diagnostic with invalid severity, it returns an error.
- When baseline integrity emits `malformed-baseline`, the diagnostic appears in `baseline-integrity` or the selected rule's row and makes the check result fail.
- When hook parses Grit check JSON, invalid adapter parse failures become hook outcomes, not broader proof claims.

Bad cases:

- `diagnostics` not an array.
- missing `ruleId`, `path`, `message`, `severity`, or `baselined`.
- Diagnostic object used as a command receipt outside its parent report.

### 4. Verify Handoff Receipt Contract

Owner: Verify Handoff Receipt Contract.

Forbidden owners: check may supply check summary but not verify receipt semantics; Nx may supply task output but not handoff non-claims; Graphite may supply base/state facts but not command receipt semantics.

Required target rule:
`VerifyProof` must either be preserved as a D0-backed `schemaVersion: 1` compatibility wrapper or renamed/versioned to a target term such as `VerifyHandoffReceipt`. D1 must choose before implementation. The contract records a bounded handoff receipt for `habitat verify --json`: command invocation, base resolution, check summary, Nx affected state, bounded streams, post-state, and non-claims.

Required states:

- `nxAffected.status: "executed"` only when Habitat check passed and Nx affected was actually run.
- `nxAffected.status: "skipped"` only when Habitat check failed first, with `skipReason: "habitat-check-failed"`, empty projects/cache states, null exit code, and empty streams.
- Bounded stdout/stderr include truncation booleans; no external artifact path is implied unless the contract explicitly designs one.
- Cache state is task-local: `cache-hit`, `fresh`, or `unknown`; D1 must decide whether current parser only detects `cache-hit` and `unknown`, and must not overclaim freshness.
- `postState` is observation after verify, not evidence that the tree is clean unless its fields explicitly say so.
- Non-claims must be stable target labels, not vague prose, or D1 must choose to keep prose compatibility explicitly.

Scenarios:

- When check fails, verify JSON exits 1 and `nxAffected` is skipped, not executed.
- When Nx affected runs and stdout includes cached-task text, `cacheStateByTask` records only task-local cache state.
- When stdout or stderr exceeds the bounded stream limit, the text is truncated and the corresponding truncation boolean is true.
- When `requestedBase` is absent, `base.source` is `default`; when flag-provided, `base.source` is `flag`.

Bad cases:

- `nxAffected.status: "executed"` with a failing check summary.
- `nxAffected.status: "skipped"` with stdout, stderr, projects, cache states, or numeric exit code.
- Command receipt claims CI execution, apply safety, baseline migration, Grit row semantics, or product/runtime behavior.

### 5. Hook Local Feedback Trace Contract

Owner: Local Feedback Trace Contract for hook records.

Forbidden owners: D11 may redesign hook local feedback later, but D1 must prevent hooks from being modeled as proof or CI authority now.

Required target rule:
`HookTrace`, `PreCommitTrace`, and `PrePushTrace` record local hook feedback, command provenance, repo snapshots, resource state, formatter/restage actions, and outcomes. They are local feedback traces, not review proof, CI proof, product proof, or broad command handoff receipts.

Required states:

- Pre-commit outcome set remains closed, including resource-blocked, file-layer-failed, partial-staging-refused, biome failures, grit failures, and pass.
- Pre-push outcome set remains closed: started, affected-failed, pass.
- The hook proof notice is either renamed or explicitly retained as compatibility human output; its target meaning must be local-feedback non-claim.
- Trace commands record phase, argv, cwd, optional env, exit code, start/end/duration.

Scenarios:

- When resources are dirty, pre-commit exits 1 before file-layer, Biome, Grit, or publish commands and records resource-blocked.
- When partially staged Biome-supported files exist, pre-commit refuses before formatting or restaging.
- When staged Grit JSON is malformed, pre-commit records `grit-parse-failed`.
- When pre-push Nx affected fails, pre-push exits nonzero and records `affected-failed` with base provenance.

Bad cases:

- Hook trace or human output implies CI/review authority.
- A failed local hook is reported as a passing receipt.
- Resource-publish commands are recorded as invoked when only remediation text was printed.

### 6. Apply Transaction Record Contract

Owner: Apply Transaction Contract.

Forbidden owners: check diagnostics may not define apply transaction success; D9 may consume/refine transaction semantics later but may not bypass D1's receipt/non-claim boundary.

Required target rule:
`GritApplyTransactionResult` is the command outcome for `habitat fix` / `runGritApplyTransaction`. `GritApplyTransactionProof` must either be renamed/versioned to an apply transaction record or retained as a D0-backed compatibility wrapper. The transaction record distinguishes dry-run, live apply, isolated copy, rollback, formatter handoff, selected gates, failure tags, changed paths, diff evidence, and non-claims.

Required states:

- Live apply against dirty worktree fails before executing Grit unless explicitly allowed by the designed transaction mode.
- Dirty dry-run is allowed because it does not write.
- Dry-run output must be structured inventory, zero matches, or must trigger isolated-copy validation/failure.
- A compact dry-run that reports matches but isolated copy produces no diff is a failure.
- Unapproved creates, deletes, outside-root changes, missing target exports, live apply failures, Biome handoff failures, and gate failures are transaction failures with rollback where applicable.
- Transaction `ok` must align with failure tag and command/result state.

Scenarios:

- Dirty live apply returns failure tag `GritApplyDirtyWorktree`, no process call, and no success record.
- Ambiguous dry-run output fails closed as `GritApplyDryRunMismatch`.
- Live apply failure after approval records apply command, rollback command, and clean final state when rollback succeeds.
- Isolated copy dry-run proves changed paths and diff evidence without writing the source tree.
- Missing public ops export blocks isolated copy with `GritApplyMissingTargetExport`.

Bad cases:

- `ok: true` with non-null `failureTag`.
- Changed path outside approved roots classified as pre-approved.
- Create/delete evidence without pattern-owned approval reported as success.
- Rollback failure hidden behind a successful transaction.

### 7. Adapter Command-Result Artifact Compatibility Contract

Owner: Adapter Command-Result Artifact Compatibility, unless D1 explicitly decomposes it into command-result receipt plus artifact retention policy.

Forbidden owners: Grit adapter may emit command evidence, but it may not define broad product proof. Artifact-writing infrastructure may not become generic Habitat architecture unless a later packet triggers D15.

Required target rule:
`AdapterProofArtifact`, `ProofArtifactWriter`, `proofClass`, and the historical path under `openspec/changes/habitat-effect-grit-adapter/workstream/proofs` are compatibility facts until D1 decides preserve, rename/version, facade, or retire. If retained, the record must remain adapter-scoped, redacted, path-safe, and non-claiming.

Required states:

- `proofId` path validation rejects traversal and unsafe IDs.
- Redacted environment keys are recorded without sensitive values.
- Raw stdout/stderr are summarized by hashes/byte counts/truncation, not full unbounded stream persistence.
- `nonClaims` merges command-level and artifact-level non-claims without duplicates.
- `retention` remains a closed set or D1 defines a replacement closed set.

Scenarios:

- Invalid proof ID such as `../escape` throws before writing.
- Secret env value appears in command input but not in serialized artifact.
- Artifact path remains packet-local compatibility path or is version-renamed with migration notes.

Bad cases:

- Adapter artifact claims current-tree proof, CI proof, product proof, or rule correctness.
- Sensitive env value persisted.
- Artifact writer becomes a generic proof substrate without D15 trigger.

### 8. Refusal And Recovery Instruction Contract

Owner: Command Refusal And Recovery Contract for D1-owned projection boundaries.

Required target rule:
Failures that are intentional product refusals must be recorded as refusals or recovery instructions, not silent skips and not passing receipts. This applies to invalid selectors, malformed check payloads, hook resource blockers, partial-staging refusal, Grit parse failure, dirty live apply, unexpected paths, and unsupported hook names.

Scenarios:

- Unsupported hook name exits 2 with a clear expected-name message and no hook trace success.
- Invalid selector exits 1 and emits `rule-selection-integrity` in JSON mode or human failure without JSON in human mode.
- Partial staging prints recovery instruction and does not run formatting.
- Dirty live apply prints failure and does not run Grit.

Bad cases:

- Silent skip without explicit reason.
- Failure projected as `ok: true`.
- Recovery text that implies unsupported command/path is supported.

### 9. Graphite And Handoff State Record Contract

Owner: Handoff State Record Contract.

Forbidden owners: Graphite state may be observed by hooks/workstream records, but Graphite stack state is not command proof and must not be collapsed into `CheckReport`, `VerifyReceipt`, or apply transaction semantics.

Required target rule:
Graphite branch/parent/base and worktree cleanliness may appear in handoff records as observed state. D1 must forbid interpreting them as verification proof, CI proof, or receipt success unless a command contract explicitly ran and recorded the relevant gate.

Scenarios:

- Hook pre-push may record Graphite parent as base provenance, but that does not prove PR readiness.
- Workstream phase records may cite `git status --short --branch`, but a clean status does not prove Habitat checks passed.

Bad cases:

- `gt branch info` success treated as verify/check success.
- Clean worktree used to close D1 implementation without required tests and OpenSpec gates.

### 10. Legacy Proof-Language Compatibility Contract

Owner: D1 Terminology Compatibility.

Required target rule:
D1 must classify every proof/evidence-shaped current term as one of:

- `target-retained`: kept because a concrete repo-maintenance scenario requires the stronger term.
- `compatibility-wrapper`: public or exported current term preserved with non-claim/migration text.
- `versioned-rename`: new target term with explicit schema/version/migration notes.
- `internal-rename`: internal implementation name can change after D0 confirms non-public status.
- `docs-historical`: historical/current-state prose may remain because it is operationally clear.
- `remove`: unused/internal term removed by a later implementation task.

Scenarios:

- When `VerifyProof` remains public under D0, D1 chooses compatibility-wrapper or versioned-rename before implementation.
- When `proof-artifact.test.ts` remains as a current test filename, D1 records whether the filename is compatibility-only, target language, or deferred rename.
- When docs say "proof coverage", D1 classifies the text as historical current-state prose, docs-example, or target term requiring rewrite.

Bad cases:

- Proof/evidence language survives in target code/type/spec language without a classification.
- D1 performs broad terminology churn without D0 compatibility disposition.

## Required Validation Gates

D1 must express each gate as command, expected status, oracle, bad case, cache/freshness stance, and non-claims. Green command execution alone is not sufficient.

| Gate | Expected status | Oracle | Required bad case | Cache/freshness stance | Non-claims |
| --- | --- | --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | 0 | Public entrypoint forwarding remains pinned; invalid JSON selectors exit 1 with schemaVersion 1 `CheckReport`; human invalid selectors do not emit JSON; output path is honored. | Unknown owner/rule/tool and wrong-namespace selector all produce `rule-selection-integrity`, `ok: false`, exit 1. | Normal Vitest execution; no Nx cache claim. | Does not prove all rules correct, current tree clean, or D1 terminology accepted. |
| `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts` | 0 | Adapter artifact compatibility remains path-safe, redacted, retention-bounded, and non-claiming. | `adapterProofArtifactPath("../escape")` throws; secret env value absent from serialized artifact. | Normal Vitest execution; file writes use temp root or controlled path. | Does not prove command result correctness, current tree proof, or product proof. |
| `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts` | 0 | Verify receipt bounds streams, records task-local cache state, and truthfully skips Nx affected when Habitat check fails. | Failing check produces `nxAffected.status: "skipped"`, empty streams/projects/cache states, null exitCode. | Normal Vitest execution; cache state parsed from fixture stdout, not asserted as fresh unless fixture says so. | Does not prove CI execution, apply safety, baseline migration, Grit row semantics, product/runtime behavior. |
| `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` | 0 | Hook local-feedback traces record outcomes, resource refusals, partial-staging refusal, Grit parse failures, pre-push base provenance, and local-only non-claim notice. | Dirty resources and partial staging exit before later commands; malformed Grit JSON records `grit-parse-failed`; pre-push Nx failure exits nonzero. | Normal Vitest execution with fake runtime; no live hook execution; no Nx cache claim. | Does not prove CI, review readiness, product correctness, or broad command proof. |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts` | 0 | Apply transaction distinguishes dry-run, dirty live refusal, isolated copy, rollback, Biome handoff, gate failure, diff evidence, and failure tags. | Dirty live apply does not call process; ambiguous dry-run fails; outside-root/create/delete/missing-export cases block; rollback failure remains failure. | Normal Vitest execution; Grit process is faked for most cases; isolated copy uses temp directory; Grit cache stance is isolated/unknown unless command record states otherwise. | Does not prove all Grit patterns safe, current-tree check success, baseline shrink, Nx scheduling, or product runtime. |
| `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts test/commands/habitat-entrypoints.test.ts` | 0 | Combined D1-focused regression set passes in one invocation. | Any malformed payload/failure-projection test above fails the gate. | Normal Vitest; no Nx cache claim. | Does not replace OpenSpec validation or current-tree command samples. |
| `bun run habitat check --json` | 0 for implementation closure; if nonzero during design, D1 must record actual nonzero result as current-tree diagnostic evidence only | Output is valid schemaVersion 1 `CheckReport`; `ok` matches rule statuses; command does not claim receipt/handoff/CI/apply safety. | A D1-added/required malformed `CheckReport` unit test rejects `ok: true` with failing rule status. | Fresh command invocation from current remediation worktree; no Nx cache; current-tree state must be recorded. | Does not prove individual rule correctness, runtime behavior, apply safety, or D1 implementation completeness by itself. |
| `bun run habitat verify --json` | 0 for implementation closure when current check and Nx affected pass; if check fails, expected nonzero with valid skipped-Nx receipt | JSON is valid verify receipt or D0-approved `VerifyProof` compatibility wrapper; Nx affected executed only after check pass; non-claims are present; streams bounded. | Check-failed fixture/unit test prevents executed Nx state. | Fresh command invocation; Nx cache may occur but must be visible task-locally as cache-hit/unknown/fresh according to the designed parser. | Does not prove CI, Graphite readiness, apply safety, or product/runtime behavior. |
| `bun run habitat fix --dry-run` | 0 for no-op or approved dry-run; nonzero only for explicit transaction refusal | Output/transaction record distinguishes dry-run from live apply and carries apply non-claims. | Ambiguous dry-run output cannot be reported as success. | Fresh command invocation; Grit request records isolated/default cache policy and observable status. | Does not prove live apply safety unless live transaction gate is separately run and accepted. |
| `bun run habitat hook --help` | 0 | Help surface is available without executing pre-commit/pre-push local hook behavior. | Unsupported hook name behavior covered by tests: exit 2 with explicit expected hook names. | Fresh command; no hook execution; no Nx cache. | Does not prove hooks pass in current worktree. |
| `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` | 0 after D1 packet repair | OpenSpec shape is valid after requirements/scenarios/tasks/ledgers are repaired. | Packet missing required D1 scenario family or carrying unresolved P1/P2 review row blocks acceptance even if CLI shape validates; this must be captured in closure checklist. | Fresh command; OpenSpec validation no cache claim. | Does not prove TypeScript implementation. |
| `bun run openspec:validate` | 0 after packet repair | Full OpenSpec tree remains valid. | Any changed OpenSpec packet with malformed spec delta fails. | Fresh command; no cache claim unless command output reports one. | Does not prove Habitat source behavior. |
| `git diff --check` | 0 | No whitespace/patch hygiene errors in D1 artifacts and implementation diff. | Whitespace error fails closure. | Fresh command over current diff. | Does not prove semantic correctness. |
| `git status --short --branch` | Expected state recorded before and after; clean for implementation closure unless an explicit next packet owns dirty state | Worktree/branch state is known and dirty files are classified. | Untracked/generated artifacts or packet/source edits outside write set block closure. | Fresh git state; no cache. | Clean git status does not prove any D1 contract behavior. |

Additional validation requirements for D1 packet text:

- Every validation bullet in proposal/tasks/phase record must include expected status and oracle, not just command names.
- Every gate must name what it does not prove.
- Every gate touching Nx or Grit must state whether cache is disabled, isolated, allowed with recorded evidence, or irrelevant.
- D1 must include at least one malformed payload bad case and one command-failure projection bad case per affected family, either through existing tests or tasks to add tests.

## OpenSpec Spec Delta Requirements

D1's `specs/habitat-harness/spec.md` must expand from one generic requirement into separate normative requirements. Minimum required structure:

1. `Requirement: D1 Classifies Current Proof-Shaped Surfaces Before Implementation`
   - Scenario: proof-shaped name encountered.
   - Scenario: public surface lacks D0 row.
   - Scenario: docs proof prose is current-state/historical only.

2. `Requirement: Check Results Cannot Claim Receipt Semantics Beyond Structural Diagnostics`
   - Scenario: valid check JSON result.
   - Scenario: invalid selector JSON failure.
   - Scenario: contradictory `ok` and rule status is rejected.

3. `Requirement: Diagnostics Remain Findings Inside Owning Reports`
   - Scenario: invalid diagnostic severity rejected.
   - Scenario: baseline contract failure remains diagnostic/check failure.

4. `Requirement: Verify Handoff Receipts Bound Check, Nx Affected, Streams, Post-State, And Non-Claims`
   - Scenario: check pass executes Nx affected.
   - Scenario: check fail skips Nx affected.
   - Scenario: stream truncation is explicit.
   - Scenario: cache state is task-local and not a broad freshness claim.

5. `Requirement: Hook Traces Are Local Feedback Only`
   - Scenario: pre-commit resource refusal.
   - Scenario: partial-staging refusal.
   - Scenario: malformed Grit JSON.
   - Scenario: pre-push base provenance and affected failure.

6. `Requirement: Apply Transaction Records Distinguish Dry-Run, Live Apply, Rollback, Formatter Handoff, Gate Failure, And Refusal`
   - Scenario: dirty live apply refused before process execution.
   - Scenario: dry-run ambiguity fails closed.
   - Scenario: rollback failure remains failure.
   - Scenario: isolated copy dry-run does not write source tree.

7. `Requirement: Adapter Command-Result Artifacts Are Compatibility-Bounded`
   - Scenario: path-safe artifact ID.
   - Scenario: redaction and non-claims.
   - Scenario: proof artifact path is preserved or version-renamed by explicit D0-backed decision.

8. `Requirement: Legacy Proof-Shaped Public DTOs Require D0-Backed Preserve, Version, Rename, Or Remove Decisions`
   - Scenario: `VerifyProof` remains public.
   - Scenario: `GritApplyTransactionProof` remains public.
   - Scenario: package export and command JSON decisions diverge by D0 plane.

9. `Requirement: Command Refusals And Recovery Instructions Are Explicit`
   - Scenario: unsupported hook.
   - Scenario: invalid selector.
   - Scenario: unsupported apply evidence.

10. `Requirement: D1 Does Not Claim CI, Runtime, Apply Safety, Rule Correctness, Or Graphite Readiness`
    - Scenario: verify receipt includes non-claims.
    - Scenario: hook trace includes local-feedback-only non-claim.
    - Scenario: clean git status cannot close D1 without gates.

## Write-Set And Protected-Path Gates

D1 must name these gates in `proposal.md`, `design.md`, `tasks.md`, and `workstream/phase-record.md` before implementation.

### Proposal Requirements

The proposal must include:

- a high-level expected implementation write set;
- a high-level protected path list;
- a statement that D1 implementation is blocked until required D0 rows exist or the packet explicitly remains design-only;
- the exact current proof-shaped surfaces D1 expects to classify;
- the downstream dominoes enabled and the rationale for any source-packet difference.

### Design Requirements

The design must include an `Approved Write Set` section. Candidate D1 implementation write set:

- `tools/habitat-harness/src/lib/diagnostics.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/lib/grit-apply.ts`
- `tools/habitat-harness/src/lib/proof-artifact.ts`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/commands/verify.ts`
- `tools/habitat-harness/src/commands/fix.ts`
- `tools/habitat-harness/src/commands/hook.ts`
- `tools/habitat-harness/src/index.ts` only if D0 classifies affected exports and D1 chooses facade/version/rename handling.
- `tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`
- `tools/habitat-harness/test/lib/proof-artifact.test.ts`
- `tools/habitat-harness/test/lib/verify-proof.test.ts`
- `tools/habitat-harness/test/lib/hooks.test.ts`
- `tools/habitat-harness/test/lib/grit-apply.test.ts`
- New D1-specific tests only if adjacent to the owning contract family.
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` only for D1-approved terminology/non-claim clarification.
- `tools/habitat-harness/docs/SCENARIOS.md` only for D1-approved command receipt/non-claim examples.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/**` for packet implementation by the D1 owner, not during this investigation.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md` only for status/citation updates after D1 acceptance.

The design must include a `Protected Paths` section:

- `docs/projects/habitat-harness/phase2-workstream-packets/**` source packets are read-only inputs.
- `openspec/changes/deep-habitat-d0-command-surface-inventory/**` is read-only except citation by D1; D1 must not repair D0 in the D1 layer.
- Other domino packets under `openspec/changes/deep-habitat-d{2..15}-*/**` and `deep-habitat-host-policy-boundary-gate/**` are read-only except downstream ledger/index updates explicitly owned by D1.
- Generated artifacts: `dist/**`, `tools/habitat-harness/dist/**`, `oclif.manifest.json`, Nx cache outputs, generated project outputs, `mod/**`, and package-manager lockfiles.
- Root `package.json`, `nx.json`, `tools/habitat-harness/package.json`, generator schemas, and migrations unless D0 row and D1 design explicitly authorize a public-surface change.
- Runtime Civ7 direct-control packages; D1 does not add alternate runtime transports.

### Tasks Requirements

Tasks must become implementation actions, not open design questions. Required task groups:

1. Grounding: read accepted D0 design/spec/review, D1 source packet, D1 repaired OpenSpec packet, D1 review scratch, and record initial git/Graphite state.
2. D0 prerequisite: attach or cite the exact D0 rows for every affected D1 surface; block if rows are missing.
3. Surface inventory: complete the D1 receipt-surface inventory table.
4. Contract implementation: implement one contract family at a time with tests after each family.
5. Compatibility handling: preserve/version/facade/deprecate/refuse based on D0 rows and D1 decisions.
6. Bad cases: add or preserve explicit malformed payload and command-failure projection tests.
7. Validation: run the exact gates above with expected status, actual status, cache stance, and non-claims.
8. Realignment: update docs/examples/downstream ledgers only where D1 changed terminology or public contract facts.
9. Closure: record review disposition, validation evidence, worktree state, and remaining non-claims.

### Phase Record Requirements

The phase record must include:

- Worktree, branch, and Graphite stack state.
- Dirty-file ownership before implementation.
- Accepted D0 prerequisite state and row citations.
- Approved write set and protected paths.
- Contract-family implementation sequence.
- Validation gates with expected/actual status and cache stance.
- Evidence boundary and non-claims.
- Review lanes and blocker disposition.
- Downstream realignment status.
- Clean or explicitly handed-off repo state.

## Downstream Realignment Requirements

D1 must replace generic downstream rows with per-domino contract dependencies:

| Downstream | D1 handoff required |
| --- | --- |
| D6 Diagnostic Pattern Catalog | Diagnostic/check result field and refusal boundary; D6 must not redefine check receipt semantics. |
| D7 Structural Enforcement Pipeline | Check result and diagnostic status/non-claim contract; D7 must consume D1 states rather than inventing enforcement proof language. |
| D8 Pattern Governance | Explicit include/exclude decision. Source D1 packet says D1 unblocks D8; current packet index omits it. D1 must either restore D8 as consumer or record why D8 only needs D0/D2/D5/D6. |
| D9 Transformation Transaction | Apply transaction record, dry-run/live/rollback/refusal/non-claim contract. |
| D10 Protected Zone Authority | Explicit include/exclude decision. Source D1 packet says D1 unblocks D10; current index omits it. If D10 consumes hook/apply/check refusals, list the D1 contract. |
| D11 Local Feedback | Hook local-feedback trace and local-only non-claim. |
| D12 Verify Handoff Receipt | Verify handoff receipt boundary and legacy `VerifyProof` compatibility decision. |
| D13 Scaffolding And Refusal Contracts | Explicit include/exclude decision. Source D1 packet says D1 unblocks D13; current index omits it. If D13 refusals use D1 refusal/recovery contract, list it. |
| D14 Authoring Topology Fence | Explicit include/exclude decision. Source D1 packet says D1 unblocks D14; current index omits it. If D14 consumes handoff/refusal examples, list D1 dependency. |
| D15 Trigger | D1 must state whether adapter artifact/general receipt substrate triggers D15. Default: no trigger unless multiple consumer packets need shared execution provenance substrate. |

Docs realignment must classify `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` and `tools/habitat-harness/docs/SCENARIOS.md` proof language as target, compatibility, docs-example, or historical current-state prose. It must not rewrite durable docs merely to hide compatibility obligations.

## Remaining Blockers And Concrete Repairs

### P1: Required inventory is absent

Current problem:
D1 source packet requires schema inventory, non-claim inventory, and current tests asserting proof output. The scaffold replaces that with broad implementation tasks.

Concrete repair:
Add the receipt-surface inventory table to `design.md`; cite it from proposal/tasks/phase record. Include every minimum row listed above. Add tasks to complete the row before source implementation. Implementation cannot start until no row is unclassified.

Clearance criterion:
A reviewer can point from every current proof-shaped surface to one D1 family, one owner, one D0 compatibility decision, one test/gate, one bad case, and one non-claim.

### P1: D0 compatibility prerequisite is unresolved for implementation

Current problem:
D0 is accepted for design/specification, not implementation-complete. Its matrix file is not yet implementation-complete, so D1 cannot cite actual row IDs before implementation.

Concrete repair:
D1 may proceed as a design/spec packet only if it says implementation is blocked until D0 matrix rows exist. D1 must list the exact required D0 row set and use `blocked-pending-d0-row` placeholders only in design artifacts, not implementation closure.

Clearance criterion:
Before D1 implementation, every public command/JSON/export/hook/docs surface has a D0 `surface_id` and compatibility handling. Missing rows stop implementation.

### P1: Domain owner is too broad

Current problem:
The scaffold's "Command Receipt Contract" owner hides separate check, diagnostic, verify, hook, apply, adapter, refusal, and handoff authorities.

Concrete repair:
Keep D1 as umbrella accountable owner only for the boundary packet, but define projection-specific contract families with forbidden adjacent owners. Add owner/forbidden-owner rows to the inventory and spec.

Clearance criterion:
No downstream packet can claim check, hook, apply, or verify semantics merely because D1 says "receipt"; each family has an explicit boundary and consumer rule.

### P2: Spec delta is too thin

Current problem:
The current spec has one generic SHALL and two scenarios. It does not constrain allowed states, non-claims, bad cases, compatibility wrappers, or projection boundaries.

Concrete repair:
Replace it with the minimum ten requirement groups listed above. Each requirement must include at least one normal scenario and one bad-case scenario.

Clearance criterion:
An implementation agent can write or update tests from the spec without reopening target terminology or failure-state design.

### P2: Validation gates are commands without falsifying oracles

Current problem:
The scaffold lists commands but omits expected status, oracle, bad case, cache/freshness stance, and non-claims.

Concrete repair:
Copy the validation-gate table shape into proposal/design/tasks/phase record. Add missing `habitat verify --json`, `grit-apply.test.ts`, and command-entrypoint coverage. Require malformed payload and command-failure projection tests.

Clearance criterion:
Every gate says what would make it fail and what it does not prove.

### P2: Write set and protected paths are deferred

Current problem:
Proposal says the write set is in design, but design/tasks defer it to the executor.

Concrete repair:
Add the approved write set and protected paths above. Tasks must require phase record confirmation before source edits.

Clearance criterion:
A diff touching an unlisted source, generated artifact, other domino packet, D0 packet, root config, or source packet blocks closure unless D1 is repaired first.

### P2: Downstream sequence diverges from source packet without rationale

Current problem:
Source D1 unblocks D6, D7, D8, D9, D10, D11, D12, D13, D14. Current packet index/proposal include only D6, D7, D9, D11, D12.

Concrete repair:
Add per-domino downstream table. Restore omitted dependencies or record concrete no-dependency rationale.

Clearance criterion:
No downstream packet can either ignore a D1 contract it needs or reinvent proof/receipt language locally.

### P2: Durable docs and hook proof language are not dispositioned

Current problem:
Docs and hook output still contain proof language. Some is current-state/historical; some is public human output; some may be target-language smell.

Concrete repair:
Inventory docs/hook phrases. Classify each as target-retained, compatibility-wrapper, versioned-rename, internal-rename, docs-historical, or remove. Do not rewrite docs until the classification and D0 handling justify it.

Clearance criterion:
D1 can explain why each surviving proof/evidence phrase remains and what it does not claim.

### P3: Test filenames and compatibility names need explicit status

Current problem:
Tests like `proof-artifact.test.ts` and `verify-proof.test.ts` may remain for compatibility or current organization, but D1 does not say whether names are target language.

Concrete repair:
Add test-file naming to the inventory. Decide keep-as-compatibility, rename-in-D1, or defer-to-D0/D15. Avoid filename churn unless it reduces real ambiguity and D0 permits it.

Clearance criterion:
Reviewers do not infer target vocabulary from legacy test filenames.

## Review Closure Criteria

D1 can advance from draft scaffold only when:

- The surface inventory exists and every row is classified.
- D0 prerequisite rows are cited, or implementation is explicitly blocked pending D0 matrix implementation.
- Contract-family requirements and bad-case scenarios are in the spec delta.
- Proposal/design/tasks/phase record carry the same write-set/protected-path gates.
- Validation gates include command, expected status, oracle, bad case, cache/freshness stance, and non-claims.
- The review ledger imports the current D1 review and this investigation, dispositions every accepted P1/P2 finding, and records repair evidence.
- Downstream realignment explains D6/D7/D8/D9/D10/D11/D12/D13/D14/D15 impact.
- Closure checklist states that design acceptance does not imply TypeScript implementation, CI proof, runtime behavior, apply safety, Graphite readiness, or current-tree cleanliness.

## Non-Claims Of This Investigation

- This file does not accept D1.
- This file does not implement or validate any code.
- This file did not run Habitat, OpenSpec, or test commands.
- This file does not edit packet files by design.
- Current code and tests were used as present-behavior evidence, not as target authority.
