# Design: D1 Receipt And Command Record Boundary

## Frame

D1 is a rugged, high-commitment design space: once command records become public contracts, downstream packets will build on their names, states, and limits. The solution threshold is not "rename proof to receipt." The threshold is a set of bounded command record contracts where each family has one owner, one state model, explicit public compatibility handling, and clear non-claims.

The design uses Solution Design by separating aspiration from constraints:

- Aspiration: Habitat helps agents and humans maintain a repo by producing command records that are direct, scoped, and hard to overread.
- Constraint reality: current code already exposes proof-shaped names through command JSON, package exports, hook output, tests, docs, and artifact paths.
- Design move: preserve compatibility only through D0-classified surfaces while introducing target semantics as family-specific reports, receipts, traces, transactions, artifacts, refusals, links, and non-claims.

## Target Semantic Objects

| Target object | Standard name | Purpose | Not this |
| --- | --- | --- | --- |
| Command request | `CommandInvocation` | Stable identity for the requested Habitat command: command name, argv, cwd, and requested scope before process execution. | Process result or semantic success. |
| Raw process invocation | `CommandExecutionRecord` | argv, cwd, bounded streams, exit code, duration, env projection, truncation/hash metadata. | Domain correctness or CI proof. |
| Command handoff | `CommandReceipt` | Reviewer-facing summary of one Habitat command outcome, scope, links, and non-claims. | Product completion, Graphite readiness, or OpenSpec acceptance. |
| Check output | `CheckReport` | Selected rules, rule statuses, diagnostics, baseline/check command outcome. | Handoff receipt or global current-tree proof. |
| Rule finding | `Diagnostic` / `RuleDiagnostic` | Structured rule finding for a path/scope. | Standalone command receipt. |
| Verify output | `VerifyReceipt` | Handoff record for `habitat verify --json`, including check summary, affected-target state, bounded output, post-state observation, and non-claims. | CI, apply safety, or PR readiness. |
| Hook output | `HookTrace` / `LocalFeedbackTrace` | Local hook event and command feedback. | CI authority or review proof. |
| Apply operation | `ApplyTransactionRecord` | Dry-run/live apply/isolated copy/formatter/gate/rollback/refusal lifecycle. | Current-tree diagnostic proof or runtime product proof. |
| Adapter capture | `AdapterCommandArtifact` | Adapter-scoped command capture with redaction, retention, bounded raw output metadata, and links. | Generic proof artifact substrate. |
| Post-command observation | `PostStateObservation` | Time-bound observation of git status, resources state, tree state, or Graphite base provenance after a command. | Clean-tree proof or PR readiness. |
| Public compatibility identity | `LegacyCompatibilitySurface` | D0-backed identity for a legacy public DTO, output phrase, docs example, or generated/workstream artifact. | Free-form name string. |
| Handoff target | `DownstreamHandoffTarget` | Allowed downstream packet, workstream record, review ledger, or D0-cited public surface that receives a receipt link. | Broad workflow blob. |
| Refused request | `RefusedRequest` | Concrete command, path, selector, hook name, generator request, or protected-zone operation Habitat declined. | D0 public-surface compatibility classification. |
| Refusal | `RefusalRecord` | Intentional refusal of unsafe/unsupported command/path/state with recovery instruction. | Silent skip or passing receipt. |
| Limit statement | `NonClaim` | Canonical statement of what a record does not assert. | Free-form disclaimer blob. |
| Relationship | `HandoffLink` / typed relation | Connects record to D0 row, check report, transaction, hook trace, downstream packet, or handoff. | Untyped downstream link. |

`CommandInvocation`, `CommandExecutionRecord`, and `PostStateObservation` are
D1 vocabulary and relationship endpoint roles only. D1 does not authorize new
package exports, execution runtime, or shared command-observation substrate.
Any shared implementation of these objects outside family-specific records
requires the D15 trigger-request contract and a separate accepted
trigger-accepted owner packet.

## Term Disposition

This table separates D0 compatibility handling from D1 target strategy. The only valid D0 handling values are `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, and `generated-only`. Terms such as "wrapper" and "rename" describe D1 implementation strategy, not new compatibility actions.

| Current term | Required D0 handling | D1 target strategy | Design decision |
| --- | --- | --- | --- |
| `Proof*`, `*Proof` | `preserve`, `version`, `facade`, `deprecate`, or `document-only` by plane | legacy-name wrapper or target rename | Not target language for D1 unless a future packet names a concrete invariant requiring proof semantics. |
| `VerifyProof` | `preserve`, `version`, or `facade` for public JSON/human surfaces | legacy-name wrapper for `VerifyReceipt` or versioned public rename | Target meaning is `VerifyReceipt`; public name remains only where D0 requires compatibility or until D0 permits `version`. |
| `GritApplyTransactionProof` | `preserve`, `version`, or `facade` for package/export surfaces | legacy-name wrapper for `ApplyTransactionRecord` or versioned public rename | D9 owns behavior refactor. |
| `AdapterProofArtifact` | `preserve`, `version`, `facade`, or `generated-only` by plane | legacy-name wrapper for `AdapterCommandArtifact` or generated artifact version | Adapter scope must remain explicit. |
| `ProofArtifactWriter` | `preserve`, `version`, `facade`, or `deprecate` for package exports | legacy-name wrapper or internal rename if non-public | Target meaning is adapter command artifact writer; package export handling waits for D0 row. |
| `proofId` | inherited from owning surface row | field wrapper or family-specific field rename | Target field is `artifactId`, `recordId`, or `receiptId` by family. |
| `proofClass` / `AdapterProofClass` | inherited from owning surface row | field wrapper or family-specific kind rename | Target field is family-specific kind such as `recordKind`, `operationKind`, `captureKind`, or transaction state. |
| `Evidence` in DTO names | inherited from owning surface row | target rename unless raw source evidence | Prefer `Observation`, `Digest`, `ChangeDigest`, `CommandOutput`, or `Citation` depending on the actual object. |
| hook proof notice | `preserve`, `version`, `facade`, or `deprecate` for human output | legacy phrase wrapper or replacement phrase | Target meaning is local feedback only; D11 may rename text after D0 human-output row. |
| `nonClaims` | `preserve` unless D0 versions the owning surface | target-retained field | Real policy invariant; should become canonical identifiers plus optional text. |
| `schemaVersion` | `preserve` or `version` | compatibility/versioning infrastructure | Versioning field, not domain claim. |

## Owner Map

| Family | Owner | Owns | Forbidden local claim |
| --- | --- | --- | --- |
| Public compatibility | D0 | Surface row, plane, `surface_id`, compatibility handling, target owner. | D1 cannot change public surfaces without D0 rows. |
| Shared receipt/handoff boundary | D1 | Non-claims, typed relationships, wrapper rules, handoff limits. | D1 cannot own every downstream record's behavior. |
| Check report summary | D1 for receipt/check boundary | Report containment, summary state, `ok`/rule-status consistency, and receipt-facing check projection. | D1 cannot define diagnostic taxonomy or rule semantics. |
| Diagnostic taxonomy | D6/D7 diagnostics/enforcement owners | Diagnostic severity, rule semantics, finding taxonomy, and enforcement interpretation. | Verify/apply/hooks cannot reinterpret diagnostics as proof. |
| Verify handoff | D12 constrained by D1 | Verify-specific composition. | Verify output cannot imply CI or Graphite readiness. |
| Local feedback | D11 constrained by D1 | Hook trace and local-only feedback. | Hook output cannot imply CI authority. |
| Apply transaction | D9 constrained by D1 | Apply lifecycle and rollback behavior. | Apply transaction cannot imply product runtime proof. |
| Adapter command capture | Current adapter artifact owner constrained by D1; D15 only if later triggered | Redacted durable command capture, retention, bounded raw output metadata, and legacy artifact path handling. | Adapter artifact cannot become generic proof substrate. |
| Graphite state | Graphite/workstream owner | Branch/base/stack observation. | Graphite state cannot substitute for command receipt. |
| OpenSpec workstream records | OpenSpec workstream owner | Packet status, tasks, review dispositions. | OpenSpec status cannot substitute for Habitat command output. |

## D1 Execution Inventory Row Contract

Implementation must complete a D1 execution inventory before source edits. The inventory is one row per surface-plane when a current surface spans multiple D0 planes. `blocked-pending-d0-row` is allowed only in design/specification artifacts; implementation source edits cannot start while a non-protected public or durable row still has that placeholder.

Required row columns:

| Column | Meaning |
| --- | --- |
| `current_surface` | Current type, function, command JSON shape, human-output phrase, docs example, generated/workstream artifact, or test filename. |
| `current_path` | Current repo path for the surface. |
| `d0_plane` | One D0 plane for this row, such as package-export, command-json, cli, human-output, hook, or docs-example. D1 must not invent D0 planes; command behavior is cited through CLI rows, and package-internal status is a contract state on package-export rows. |
| `d0_surface_id` | Concrete D0 `surface_id`; `blocked-pending-d0-row` only before implementation. |
| `d0_contract_state` | D0 contract state copied from the row, such as public, package-internal, command-only DTO, docs-example, or generated-derived. |
| `d0_compatibility_handling` | One closed D0 handling value: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`. |
| `target_family` | One D1 family: check report, diagnostic containment, verify receipt, local feedback trace, apply transaction, adapter command artifact, refusal, handoff relationship, or terminology compatibility. |
| `target_name` | Target semantic name or protected downstream-owned name. |
| `schema_version_stance` | Preserve schemaVersion 1, version public schema, not applicable, or D0-row-specific stance. |
| `owner` | Single authority for this row's semantics. |
| `forbidden_owner_or_protected_owner` | Adjacent owner that may consume but not redefine the row, or protected downstream owner when D1 must not edit. |
| `d1_strategy` | D1 implementation strategy, such as tighten validation, legacy-name wrapper, target rename, no D1 source edit, docs classification, or downstream handoff. |
| `required_test_or_gate` | Exact test file or command gate that exercises the row. |
| `bad_case` | Invalid state that must fail validation or be unrepresentable. |
| `non_claims` | Canonical D1 non-claim identifiers required by this row. |
| `downstream_consumers` | Dominoes that consume this row. |
| `implementation_disposition` | `blocked-pending-d0-row`, `ready-for-D1-implementation`, `protected-for-downstream`, or `deferred-to-owning-domino`. |

## D1 Execution Inventory

The rows below are the implementation-start inventory. Each row cites a concrete
D0 surface, copies its D0 state and compatibility handling, and assigns a D1
disposition. Source implementation may start only for rows marked
`ready-for-D1-implementation`; rows marked `protected-for-downstream` or
`deferred-to-owning-domino` may be cited by D1 but must not be locally reworked
by D1 without an amended packet.

| current_surface | current_path | d0_plane | d0_surface_id | d0_contract_state | d0_compatibility_handling | target_family | target_name | schema_version_stance | owner | forbidden_owner_or_protected_owner | d1_strategy | required_test_or_gate | bad_case | non_claims | downstream_consumers | implementation_disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CheckReport` | `tools/habitat-harness/src/lib/diagnostics.ts`, `tools/habitat-harness/src/commands/check.ts` | package-export | `D0-package-export-symbol-checkreport` | command-only-dto | version | check report | `CheckReport` | preserve schemaVersion 1 unless versioned by D0 | D7 check output boundary constrained by D1 | D6/D7 diagnostic taxonomy; D9/D11/D12 may not reinterpret as proof/receipt/apply/hook authority | tighten validation while preserving public name | `test/commands/habitat-entrypoints.test.ts`; `habitat check --json` | `ok: true` with failing rule | `does-not-prove-rule-correctness`, `does-not-prove-current-tree-cleanliness` | D6, D7, D12 | `ready-for-D1-implementation` |
| `CheckReport` | `tools/habitat-harness/src/lib/diagnostics.ts`, `tools/habitat-harness/src/commands/check.ts` | command-json | `D0-command-json-type-checkreport` | command-only-dto | version | check report | `CheckReport` | preserve schemaVersion 1 unless versioned by D0 | D7 check output boundary constrained by D1 | D6/D7 diagnostic taxonomy; D9/D11/D12 may not reinterpret as proof/receipt/apply/hook authority | validate command JSON semantics | `test/commands/habitat-entrypoints.test.ts`; `habitat check --json` | `ok: true` with failing rule | `does-not-prove-rule-correctness`, `does-not-prove-current-tree-cleanliness` | D6, D7, D12 | `ready-for-D1-implementation` |
| `CheckReport` proof wording | `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-implemented-surface-proof-coverage-proof-terminology` | docs-example | document-only | terminology compatibility | current-state check-report prose | not applicable | D1 terminology compatibility | downstream docs owners | classify before rewrite; docs row cannot define behavior | docs review plus affected command tests | docs teaching check output as proof | `does-not-prove-rule-correctness`, `does-not-prove-current-tree-cleanliness` | D8, D10, D13, D14 | `ready-for-D1-implementation` |
| `validateCheckReport` | `tools/habitat-harness/src/lib/diagnostics.ts` | package-export | `D0-package-export-symbol-validatecheckreport` | package-internal | facade | check report | `validateCheckReport` or successor | not applicable | D1 check report summary | D6/D7 diagnostic taxonomy | semantic validator gate | `test/commands/habitat-entrypoints.test.ts`; malformed payload unit test | structurally valid but semantically contradictory report | `does-not-prove-rule-correctness` | D6, D7, D12 | `ready-for-D1-implementation` |
| `RuleReport` | `tools/habitat-harness/src/lib/diagnostics.ts` | package-export | `D0-package-export-symbol-rulereport` | command-only-dto | version | diagnostic containment | `RuleReport` | preserve schemaVersion 1 unless D0 versions | D7 diagnostic report boundary constrained by D1 | D6/D7 diagnostic taxonomy; D1 receipt boundary only constrains containment/non-claims | preserve name and narrow validation | `test/commands/habitat-entrypoints.test.ts`; invalid severity/status unit test | unknown status or standalone receipt use | `does-not-prove-rule-correctness` | D6, D7 | `ready-for-D1-implementation` |
| `RuleReport` | `tools/habitat-harness/src/lib/diagnostics.ts` | command-json | `D0-command-json-type-rulereport` | command-only-dto | version | diagnostic containment | `RuleReport` | preserve schemaVersion 1 unless D0 versions | D7 diagnostic report boundary constrained by D1 | D6/D7 diagnostic taxonomy; D1 receipt boundary only constrains containment/non-claims | preserve name and narrow validation | `test/commands/habitat-entrypoints.test.ts`; invalid severity/status unit test | unknown status or standalone receipt use | `does-not-prove-rule-correctness` | D6, D7 | `ready-for-D1-implementation` |
| `HabitatDiagnostic` | `tools/habitat-harness/src/lib/diagnostics.ts` | package-export | `D0-package-export-symbol-habitatdiagnostic` | command-only-dto | version | diagnostic containment | `Diagnostic` | preserve schemaVersion 1 unless D0 versions | D6 diagnostic taxonomy constrained by D1 containment rules | D6/D7 diagnostic taxonomy; D1 receipt boundary only constrains containment/non-claims | preserve public compatibility and narrow validation | `test/commands/habitat-entrypoints.test.ts`; invalid severity unit test | unknown severity or standalone receipt use | `does-not-prove-rule-correctness` | D6, D7 | `ready-for-D1-implementation` |
| `HabitatDiagnostic` | `tools/habitat-harness/src/lib/diagnostics.ts` | command-json | `D0-command-json-type-habitatdiagnostic` | command-only-dto | version | diagnostic containment | `Diagnostic` | preserve schemaVersion 1 unless D0 versions | D6 diagnostic taxonomy constrained by D1 containment rules | D6/D7 diagnostic taxonomy; D1 receipt boundary only constrains containment/non-claims | preserve command JSON compatibility and narrow validation | `test/commands/habitat-entrypoints.test.ts`; invalid severity unit test | unknown severity or standalone receipt use | `does-not-prove-rule-correctness` | D6, D7 | `ready-for-D1-implementation` |
| `VerifyProof` | `tools/habitat-harness/src/lib/command-engine.ts`, `tools/habitat-harness/src/commands/verify.ts` | command-json | `D0-command-json-type-verifyproof` | command-only-dto | version | verify receipt | `VerifyReceipt` target, `VerifyProof` legacy public name | preserve schemaVersion 1 or version by D0 row | D12 verify composition constrained by D1 | D1 shared receipt boundary | legacy-name wrapper or versioned public rename | `test/lib/verify-proof.test.ts`; `habitat verify --json` | executed Nx affected after failing check | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| `habitat verify --json` | `tools/habitat-harness/src/commands/verify.ts` | cli | `D0-cli-cmd-verify-flag-json` | public-stable | preserve | verify receipt | `VerifyReceipt` target, `VerifyProof` legacy public name | preserve schemaVersion 1 or version by D0 row | D12 verify composition constrained by D1 | D1 shared receipt boundary | keep command flag compatible while tightening receipt semantics | `test/lib/verify-proof.test.ts`; `habitat verify --json` | executed Nx affected after failing check | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| `createVerifyProof` | `tools/habitat-harness/src/lib/command-engine.ts` | package-export | `D0-package-export-symbol-createverifyproof` | package-internal | facade | verify receipt | `VerifyReceipt` target, `VerifyProof` legacy helper | not applicable | D12 verify composition constrained by D1 | D1 shared receipt boundary | compatibility helper facade; do not cite `runAffectedVerification` as factory | `test/lib/verify-proof.test.ts`; `habitat verify --json` | executed Nx affected after failing check | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| `VerifyProof` help wording | `tools/habitat-harness/src/commands/verify.ts` | human-output | `D0-human-output-cmd-verify-help-json-proof-wording` | public-stable | preserve | verify receipt | legacy help wording for `VerifyReceipt` | not applicable | D12 verify composition constrained by D1 | D1 shared receipt boundary | preserve or intentionally migrate wording only under D12-compatible path | `test/lib/verify-proof.test.ts`; `habitat verify --help` | help text implying CI or product proof | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| verify affected-run notice | `tools/habitat-harness/src/commands/verify.ts` | human-output | `D0-human-output-cmd-verify-line-running-affected` | public-stable | document-only | verify receipt | verify affected execution prose | not applicable | D12 verify composition constrained by D1 | D1 shared receipt boundary | classify as human output, not schema | `test/lib/verify-proof.test.ts`; `habitat verify --json` | human output implying CI or Graphite readiness | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| `VerifyProof` docs wording | `tools/habitat-harness/docs/SCENARIOS.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-diagnostic-habitat-verify-proof-terminology` | docs-example | document-only | terminology compatibility | current-state verify prose | not applicable | D1 terminology compatibility | D12 verify composition | classify before rewrite; docs row cannot define behavior | docs review plus `test/lib/verify-proof.test.ts` | docs teaching verify as CI or Graphite proof | `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-product-completion`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness` | D12, D14 | `ready-for-D1-implementation` |
| `HookTrace` | `tools/habitat-harness/src/lib/hooks.ts` | package-export | `D0-package-export-symbol-hooktrace` | package-internal | facade | local feedback trace | `HookTrace` / `LocalFeedbackTrace` | not applicable unless public schema emerges | D11 local feedback constrained by D1 | CI/review systems | preserve trace compatibility; do not promote hook JSON receipt | `test/lib/hooks.test.ts`; D0/D11-approved hook surface gate | hook output implying CI authority | `local-feedback-only`, `does-not-prove-ci` | D11 | `deferred-to-owning-domino` |
| hook local-feedback notice | `tools/habitat-harness/src/commands/hook.ts` | human-output | `D0-human-output-cmd-hook-line-local-feedback-authority` | public-stable | preserve | local feedback trace | local-feedback-only notice | not applicable | D11 local feedback constrained by D1 | CI/review systems | preserve or version human wording deliberately | `test/lib/hooks.test.ts`; D0/D11-approved hook surface gate | hook pass implying CI or packet closure | `local-feedback-only`, `does-not-prove-ci` | D11 | `deferred-to-owning-domino` |
| pre-commit hook feedback | `.husky/pre-commit`, `tools/habitat-harness/src/commands/hook.ts` | hook | `D0-hook-hook-pre-commit-line-local-feedback-ci-authority` | public-stable | preserve | local feedback trace | local-feedback-only notice | not applicable | D11 local feedback constrained by D1 | CI/review systems | keep local feedback boundary explicit | `test/lib/hooks.test.ts`; D0/D11-approved hook surface gate | hook pass implying CI | `local-feedback-only`, `does-not-prove-ci` | D11 | `deferred-to-owning-domino` |
| pre-push hook feedback | `.husky/pre-push`, `tools/habitat-harness/src/commands/hook.ts` | hook | `D0-hook-hook-pre-push-line-local-feedback-ci-authority` | public-stable | preserve | local feedback trace | local-feedback-only notice | not applicable | D11 local feedback constrained by D1 | CI/review systems | keep local feedback boundary explicit | `test/lib/hooks.test.ts`; D0/D11-approved hook surface gate | hook pass implying CI | `local-feedback-only`, `does-not-prove-ci` | D11 | `deferred-to-owning-domino` |
| hook proof docs wording | `tools/habitat-harness/docs/SCENARIOS.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-local-hooks-pre-push-affected-proof-terminology` | docs-example | document-only | terminology compatibility | hook local-feedback prose | not applicable | D1 terminology compatibility | D11 local feedback | classify before rewrite; docs row cannot define behavior | docs review plus `test/lib/hooks.test.ts` | docs teaching hook output as CI or product proof | `local-feedback-only`, `does-not-prove-ci` | D11 | `deferred-to-owning-domino` |
| `GritApplyTransactionResult` | `tools/habitat-harness/src/lib/grit-apply.ts` | package-export | `D0-package-export-symbol-gritapplytransactionresult` | package-internal | facade | apply transaction | `ApplyTransactionRecord` target | preserve or version by D0 row | D9 apply transaction constrained by D1 | D1 shared receipt boundary only | record boundary and non-claims; D9 owns behavior refactor | `test/lib/grit-apply.test.ts`; `habitat fix --dry-run` | `ok: true` with `failureTag` | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D11 | `deferred-to-owning-domino` |
| `GritApplyTransactionProof` | `tools/habitat-harness/src/lib/grit-apply.ts` | package-export | `D0-package-export-symbol-gritapplytransactionproof` | package-internal | facade | apply transaction | `ApplyTransactionRecord` target | preserve or version by D0 row | D9 apply transaction constrained by D1 | D1 shared receipt boundary only | legacy-name wrapper; D9 owns behavior refactor | `test/lib/grit-apply.test.ts`; `habitat fix --dry-run` | `ok: true` with `failureTag` | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D11 | `deferred-to-owning-domino` |
| `habitat fix --dry-run` | `tools/habitat-harness/src/commands/fix.ts` | cli | `D0-cli-cmd-fix-flag-dry-run` | public-stable | preserve | apply transaction | dry-run apply transaction boundary | preserve or version by D0 row | D9 apply transaction constrained by D1 | D1 shared receipt boundary only | keep dry-run and live apply distinct; D9 owns behavior | `test/lib/grit-apply.test.ts`; `habitat fix --dry-run` | dry-run success implying live apply safety | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D11 | `deferred-to-owning-domino` |
| `habitat fix --dry-run --json` | `tools/habitat-harness/src/commands/fix.ts` | cli | `D0-cli-cmd-fix-flag-json-refused` | refused | refuse | apply transaction | no direct fix JSON receipt exists | not applicable unless D9/D12 version the command | D9 apply transaction constrained by D1 | D1 shared receipt boundary only | record refused D0 surface; do not implement or cite direct fix JSON in D1 | negative flag probe or D9 gate | D1 treating stale fix JSON examples as live receipt surface | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D12 | `deferred-to-owning-domino` |
| apply transaction docs wording | `tools/habitat-harness/docs/SCENARIOS.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-apply-the-approved-deep-import-repair-transaction-proof-terminology` | docs-example | document-only | terminology compatibility | apply transaction prose | not applicable | D1 terminology compatibility | D9 apply transaction | classify before rewrite; docs row cannot define behavior | docs review plus `test/lib/grit-apply.test.ts` | docs teaching apply output as runtime or product proof | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D11 | `deferred-to-owning-domino` |
| `AdapterProofArtifact` | `tools/habitat-harness/src/lib/proof-artifact.ts` | package-export | `D0-package-export-symbol-adapterproofartifact` | package-internal | facade | adapter command artifact | `AdapterCommandArtifact` target | package/docs compatibility only; generated artifact schema changes require a new D0 row | current adapter artifact owner constrained by D1 | D15 unless triggered | legacy-name wrapper or generated artifact version without creating a shared substrate | `test/lib/proof-artifact.test.ts` | unsafe artifact id, unknown retention, unbounded raw output body | `command-output-only`, `does-not-prove-current-tree-cleanliness` | D8, D9, D15 evaluation | `ready-for-D1-implementation` |
| `ProofArtifactWriter` | `tools/habitat-harness/src/lib/proof-artifact.ts` | package-export | `D0-package-export-symbol-proofartifactwriter` | package-internal | facade | adapter command artifact | `AdapterCommandArtifact` writer | package/docs compatibility only; generated artifact schema changes require a new D0 row | current adapter artifact owner constrained by D1 | D15 unless triggered | legacy-name wrapper or internal rename if non-public without creating a shared substrate | `test/lib/proof-artifact.test.ts` | unsafe artifact id, unknown retention, unbounded raw output body | `command-output-only`, `does-not-prove-current-tree-cleanliness` | D8, D9, D15 evaluation | `ready-for-D1-implementation` |
| `adapterProofArtifactPath` | `tools/habitat-harness/src/lib/proof-artifact.ts` | package-export | `D0-package-export-symbol-adapterproofartifactpath` | package-internal | facade | adapter command artifact | adapter artifact path helper | package/docs compatibility only; generated artifact schema changes require a new D0 row | current adapter artifact owner constrained by D1 | D15 unless triggered | preserve path helper compatibility while constraining artifact semantics without creating a shared substrate | `test/lib/proof-artifact.test.ts` | unsafe artifact id or path traversal | `command-output-only`, `does-not-prove-current-tree-cleanliness` | D8, D9, D15 evaluation | `ready-for-D1-implementation` |
| adapter artifact docs wording | `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-implemented-surface-grit-pattern-work-proof-artifacts-terminology` | docs-example | document-only | terminology compatibility | adapter command artifact prose | not applicable | D1 terminology compatibility | current adapter artifact owner | classify before rewrite; docs row cannot define behavior | docs review plus `test/lib/proof-artifact.test.ts` | docs teaching adapter artifact as generic proof substrate | `command-output-only`, `does-not-prove-current-tree-cleanliness` | D8, D9, D15 evaluation | `ready-for-D1-implementation` |
| capability verify proof wording | `tools/habitat-harness/docs/CAPABILITIES.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-capabilities-command-surface-verify-proof-artifact-terminology` | docs-example | document-only | terminology compatibility | verify command artifact prose | not applicable | D1 terminology compatibility | D12 verify composition | classify before rewrite; docs row cannot define behavior | docs review plus affected command tests | docs teaching verify as CI/product proof | `does-not-prove-ci`, `does-not-prove-graphite-readiness` | D12, D14 | `ready-for-D1-implementation` |
| capability grit apply wording | `tools/habitat-harness/docs/CAPABILITIES.md` | docs-example | `D0-docs-example-doc-tools-habitat-harness-docs-capabilities-grit-apply-proof-data-terminology` | docs-example | document-only | terminology compatibility | apply command artifact prose | not applicable | D1 terminology compatibility | D9 apply transaction | classify before rewrite; docs row cannot define behavior | docs review plus affected command tests | docs teaching apply as runtime/product proof | `does-not-prove-runtime`, `does-not-prove-apply-safety` | D9, D11 | `deferred-to-owning-domino` |
| `ClassifiedTarget.proof` | `tools/habitat-harness/src/lib/command-engine.ts` | command-json | `D0-command-json-field-classifiedtarget-proof` | command-only-dto | version | orientation/routing metadata | downstream D3/D4 term | preserve unless D3/D4 versions | D3/D4 orientation/routing | D1 | no D1 source edit | `test/lib/classify.test.ts` or D3/D4 gate | D1 renaming classify metadata prematurely | `command-output-only` | D3, D4 | `protected-for-downstream` |
| `ClassifiedTarget.proof` | `tools/habitat-harness/src/lib/command-engine.ts` | package-export | `D0-package-export-symbol-classifiedtarget` | command-only-dto | version | orientation/routing metadata | downstream D3/D4 term | preserve unless D3/D4 versions | D3/D4 orientation/routing | D1 | no D1 source edit | `test/lib/classify.test.ts` or D3/D4 gate | D1 renaming classify metadata prematurely | `command-output-only` | D3, D4 | `protected-for-downstream` |
| Pattern Authority proof fields | `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` | package-export | `D0-package-export-symbol-patternauthoritymanifest` | public-versioned | version | pattern governance terminology | downstream-owned | D8/D13-owned | D8/D13 pattern governance | D1 | no D1 source edit | `test/rules/pattern-authority-manifest.test.ts` or D8/D13 gate | D1 redesigning pattern governance terminology | row-specific | D8, D13 | `protected-for-downstream` |
| Pattern Authority validator | `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` | package-export | `D0-package-export-symbol-validatepatternauthoritymanifest` | public-versioned | version | pattern governance terminology | downstream-owned | D8/D13-owned | D8/D13 pattern governance | D1 | no D1 source edit | `test/rules/pattern-authority-manifest.test.ts` or D8/D13 gate | D1 redesigning pattern governance terminology | row-specific | D8, D13 | `protected-for-downstream` |

## State-Space Reductions

D1 requires TypeScript refactoring moves that collapse states instead of rearranging files:

| Smell | Target move | Example invalid state removed |
| --- | --- | --- |
| Boolean/optional soup | Discriminated result states with state-specific fields. | `ok: true` plus `failureTag`. |
| Broad proof DTO | Family-specific record type or compatibility wrapper. | `VerifyProof` claiming apply safety. |
| Whole-record leakage | Typed projections from check/apply/hook into receipts. | Receipt consumers depending on diagnostic internals. |
| Untyped links | Relationship objects with allowed endpoints. | `downstreamLinks` with unknown meaning. |
| Prose non-claims only | Canonical non-claim identifiers plus optional text. | Local hook output read as CI proof. |
| Nullable transaction phases | Closed apply transaction lifecycle owned by D9. | Rollback fields present without rollback state. |

## Relationship Ontology

D1 allows these relationship types:

| Relation | Allowed source endpoint | Allowed target endpoint | Meaning |
| --- | --- | --- | --- |
| `references-d0-surface` | Any D1 record, wrapper, docs classification, or protected downstream-owned surface | D0 `surface_id` / `LegacyCompatibilitySurface` | Public compatibility authority. |
| `wraps-compatibility-surface` | Target record or D1 implementation strategy row | `LegacyCompatibilitySurface` with D0 `surface_id` | Old surface exists only under D0 handling. |
| `records-execution-of` | `CommandExecutionRecord` | `CommandInvocation` | Captures process execution for a requested command. |
| `summarizes-check-report` | `CommandReceipt` or `VerifyReceipt` | `CheckReport` | Receipt includes check projection. |
| `contains-diagnostic` | `CheckReport` | `Diagnostic` / `RuleDiagnostic` | Diagnostic membership. |
| `observes-post-state` | `VerifyReceipt` or `ApplyTransactionRecord` | `PostStateObservation` | Time-bound observation of git, resources, tree, or Graphite base provenance. |
| `bounded-by-non-claim` | Any D1 record, report, trace, transaction, artifact, or refusal | `NonClaim` | Explicit limit. |
| `hands-off-to` | `CommandReceipt` or `VerifyReceipt` | `DownstreamHandoffTarget` | Handoff without claiming downstream completion. |
| `is-local-feedback-for` | `HookTrace` / `LocalFeedbackTrace` | `CommandInvocation` for the hook | Local hook feedback. |
| `is-transaction-record-for` | `ApplyTransactionRecord` | `CommandInvocation` for apply/fix | Apply lifecycle record. |
| `rolled-back-by` | failed `ApplyTransactionRecord` state | `CommandExecutionRecord` for rollback | Rollback relation and outcome. |
| `refuses-request` | `RefusalRecord` | `RefusedRequest`; D0 `surface_id` only when refusing public-surface use | Explicit refusal and recovery path. |

Untyped `downstreamLinks` may remain only as a D0-classified compatibility field; target code must use typed relationships.

## Closed State Families

| Family | Allowed states |
| --- | --- |
| Command outcome | `succeeded`, `failed`, `refused`, `skipped`. |
| Check outcome | `pass`, `fail`, `advisory-only`, `no-rules-selected`, `refused`, `command-failed`. |
| Rule status | existing `pass`, `fail`, `advisory-findings` unless D6/D7 version it. |
| Affected target execution | `executed`, `skipped`, `failed`. |
| Hook feedback | `started`, `pass`, `failed`, `skipped`, `refused`. |
| Apply transaction | `dry-run-only`, `dry-run-refused`, `dry-run-failed`, `copy-checked`, `applied`, `formatter-failed`, `gate-failed-rollback-succeeded`, `gate-failed-rollback-failed`, `rollback-requested`, `rollback-succeeded`, `rollback-failed`, `failed-before-apply`, `failed-after-apply`. |
| Terminology classification | `target-retained`, `legacy-public-name`, `target-rename`, `internal-rename`, `docs-historical`, `remove`. |

## Canonical Non-Claims

D1 establishes these base identifiers:

- `does-not-prove-ci`
- `does-not-prove-runtime`
- `does-not-prove-product-completion`
- `does-not-prove-graphite-readiness`
- `does-not-prove-openspec-acceptance`
- `does-not-prove-apply-safety`
- `does-not-prove-current-tree-cleanliness`
- `does-not-prove-rule-correctness`
- `local-feedback-only`
- `command-output-only`

Downstream packets may add family-specific identifiers only when they name the owner, scenario, and compatibility impact.

## Contract Family Decisions

### Check Report

`CheckReport` remains the target term. Its `ok` value must be derived from rule statuses or validation must reject contradictions. Check output can summarize diagnostics and rule selection. It cannot claim handoff receipt completeness, current-tree proof, or rule correctness.

### Diagnostics

Diagnostics remain findings inside reports. D1 may tighten structural validation but does not own D6/D7 diagnostic catalog semantics.

### Verify Receipt

Target meaning is `VerifyReceipt`; `VerifyProof` is a legacy public name unless D0 handling is `preserve`, `version`, or `facade`. Nx affected can be `executed` only after check pass, `skipped` only with a reason and empty command output when the check fails, and `failed` when Nx ran and failed. Streams are bounded and cache state is task-local.

### Hook Local Feedback

Hook traces are local feedback. The existing proof notice is a D0-classified human-output compatibility phrase whose target meaning is `local-feedback-only`.

### Apply Transaction

Target meaning is `ApplyTransactionRecord`. D1 specifies state and non-claim boundaries; D9 owns the behavior refactor. Legacy public fields may remain only under D0 `preserve`, `version`, or `facade` handling.

### Adapter Command Artifact

Target meaning is adapter command capture with redaction, retention, output digests, and links. It must not become a generic Habitat proof substrate. D15 remains untriggered unless later packets need a shared substrate.

### Refusal And Recovery

Unsupported, unsafe, malformed, or ambiguous requests are represented as refusals or failed records with recovery instructions. They are not silent skips and not passing receipts.

## Approved Write Set

Implementation may write only the paths listed in `proposal.md` unless D1 is amended and re-reviewed. Any `src/index.ts` export change requires the corresponding D0 package-export row. Any human-output or command JSON change requires the corresponding D0 plane row.

## Protected Paths

The protected path list in `proposal.md` is normative. D1 must not edit source domino packets, D0 artifacts, other domino packets, generated outputs, lockfiles, root config, or runtime Civ7 control packages unless this packet is amended with a concrete D0 row and review disposition. The only cross-packet exception in this design pass is the narrow D10 dependency metadata alignment required to prevent D10 from bypassing D1 refusal/non-claim semantics; no D10 behavior, design, spec, or validation repair is authorized here.

## Validation Design

Validation must be falsifying, not green-command-only. Each gate records command, expected status, actual status, oracle, required bad case, cache/freshness stance, and non-claims. Required gates are enumerated in `tasks.md` and `workstream/phase-record.md`.

## Structural Alternatives Rejected

- **Clean up proof names module by module.** Rejected because it preserves accidental current composition and lets implementation decide public compatibility.
- **Create a generic artifact/proof model.** Rejected because the product scenario needs scoped records and non-claims, not a broad substrate.
- **Move apply/hook/verify behavior into D1.** Rejected because D1 owns shared boundary semantics while D9/D11/D12 own behavior packets.
