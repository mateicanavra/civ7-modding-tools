# Proposal: D1 Receipt And Command Record Boundary

## Summary

Design D1 as the boundary that separates Habitat's bounded command records from inherited proof-shaped compatibility surfaces. This packet turns the D1 domino into an executable OpenSpec design for check reports, diagnostics, verify receipts, local hook feedback traces, apply transaction records, adapter command-capture artifacts, refusals, handoff links, and non-claims.

This is not a generic proof-artifact framework. It is the contract layer that prevents local command output from being misread as CI, runtime behavior, apply safety, Graphite readiness, OpenSpec acceptance, or product completion.

## Authority

- Source domino packet: `docs/projects/habitat-harness/phase2-workstream-packets/D1-proof-contract-boundary.md`.
- Accepted D0 OpenSpec packet: `openspec/changes/deep-habitat-d0-command-surface-inventory/`.
- Concrete D0 matrix authority: `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- D1 investigations:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-domain-ontology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-code-topology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-openspec-testing-investigation.md`
- Remediation frame: `docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Current Habitat source and tests as present-behavior evidence, not target domain authority.

## Product Scenario

A DRA owner and reviewer use Habitat during repo maintenance. Habitat command output must say what command ran, what was checked, what was observed, what was skipped, what was refused, what transaction happened, and what should be handed off next. It must also say what the record does not claim. The user should not need to infer safety or readiness from vague proof/evidence language.

## What Changes

- D1 defines target contract families:
  - `CheckReport` and diagnostics as check output, not receipt/proof.
  - `VerifyReceipt` as the target meaning for verify handoff output, with `VerifyProof` treated as a legacy public surface unless D0 handling is `preserve`, `version`, or `facade`.
  - `HookTrace` / local feedback as local hook output, never CI authority.
  - `ApplyTransactionRecord` as the target meaning for apply/fix transaction state, with `GritApplyTransactionProof` treated as a legacy public surface unless D0 handling is `preserve`, `version`, or `facade`.
  - `AdapterCommandArtifact` as adapter command capture, with `AdapterProofArtifact` and proof writer names treated as legacy public surfaces whose D0 row must separately record contract state and closed compatibility handling.
  - `RefusalRecord`, `HandoffLink`, and canonical `NonClaim` identifiers as shared boundary terms.
- D1 requires a surface inventory tied to D0 rows before implementation changes public names, command JSON, package exports, hook text, docs examples, or generated/workstream artifacts.
- D1 requires impossible states to become invalid or unrepresentable: contradictory check results, executed Nx affected after failed check, passing transaction with failure tag, silent skip instead of refusal, hook local output that implies CI authority, and untyped downstream links.

## What Does Not Change

- D1 design acceptance did not implement source changes. The implementation
  phase may make source changes only after this packet's D1 execution inventory
  cites concrete D0 rows, records review disposition, and stays inside the
  approved write set.
- D1 does not redesign D6 diagnostics, D7 enforcement, D9 apply behavior, D11 hook behavior, D12 verify workflow, D8 pattern governance, or D13 scaffolding/refusal ownership.
- D1 does not authorize broad terminology churn. Legacy proof/evidence names are compatibility facts until D0 rows and this packet choose a handling.
- D1 does not create a shared artifact substrate or a `Proof<T>` abstraction.

## D0 Prerequisite

D0 is complete enough to unblock this D1 preparation step: the concrete matrix at `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` has stable rows for the D1 seed surfaces. D1 source implementation remains blocked until the D1 execution inventory expands each touched surface per D0 plane, cites concrete `surface_id` values, records D0 compatibility handling and downstream owner facts, and resolves implementation-start review findings.

D1 may describe implementation strategy with terms such as compatibility wrapper or target rename, but the actual D0 compatibility handling value must be one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.

Required D0 row classes:

| Surface family | Required D0 planes | D1 target owner |
| --- | --- | --- |
| `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `validateCheckReport` | package-export, command-json, docs-example | Check report / diagnostic boundary |
| `VerifyProof`, `createVerifyProof`, `habitat verify --json` help and JSON output | command-json, cli, human-output, docs-example | Verify receipt boundary |
| `HookTrace`, `PreCommitTrace`, `PrePushTrace`, hook proof notice | hook, human-output, package-internal/package-export if exposed, docs-example | Local feedback trace boundary |
| `GritApplyTransactionResult`, `GritApplyTransactionProof`, `habitat fix` output | package-export, cli, human-output, docs-example | Apply transaction boundary |
| `AdapterProofArtifact`, `ProofArtifactWriter`, `adapterProofArtifactPath` | package-export, docs-example | Adapter command artifact compatibility |
| docs proof/evidence phrases in Habitat docs | docs-example | D1 terminology compatibility or downstream owner |

Any newly discovered affected public/durable surface without a D0 row still stops D1 source implementation. D1 must not invent D0 planes such as command-behavior or generated/workstream-artifact; command behavior is cited through D0 `cli` rows, and package-internal status is a D0 contract state on `package-export` rows.

## Affected Owners

- D1 owns shared receipt/handoff boundary vocabulary, non-claim policy, compatibility translation rules for proof-shaped command records, and typed relationship semantics.
- Check/diagnostics own check report and diagnostic meaning.
- D9 owns apply transaction behavior.
- D11 owns hook local feedback behavior.
- D12 owns verify command workflow composition.
- D8/D13/D14 may consume D1 vocabulary but may not redefine it locally.
- D15 is not triggered by D1 unless later packets need a shared execution provenance substrate beyond these family-specific records.

## Expected Implementation Write Set

D1 implementation may touch these paths only after the execution inventory and implementation-start review clear:

- `tools/habitat-harness/src/lib/diagnostics.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/lib/grit-apply.ts`
- `tools/habitat-harness/src/lib/proof-artifact.ts`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/commands/verify.ts`
- `tools/habitat-harness/src/commands/fix.ts`
- `tools/habitat-harness/src/commands/hook.ts`
- `tools/habitat-harness/src/index.ts` only for D0-classified export compatibility.
- Focused tests under `tools/habitat-harness/test/`.
- Habitat docs examples only when D0 rows classify them and D1 changes target guidance.
- This OpenSpec change path and the remediation packet index for status/citation updates.

## Protected Paths

- Source domino packets under `docs/projects/habitat-harness/phase2-workstream-packets/**`.
- Accepted D0 packet files except read-only citation by D1.
- Other domino OpenSpec packets except downstream ledger/index updates explicitly caused by D1 acceptance and the narrow D10 dependency metadata alignment required by D1 cross-domino review: D10 `Requires`, dependency-gate task, and refusal-vocabulary dependency line only. D1 does not authorize D10 behavior, design, spec, or validation repair.
- Generated outputs, lockfiles, Nx cache, `dist/**`, `tools/habitat-harness/dist/**`, `oclif.manifest.json`, `mod/**`, generator outputs, and runtime Civ7 control packages.
- Root/build configuration unless a D0 row and D1 design explicitly authorize the public-surface change.

## Enables

D1 feeds D6, D7, D8, D9, D10, D11, D12, D13, and D14. D15 remains a conditional trigger only if later packets demonstrate a repeated need for a shared execution-provenance substrate.

## Stop Conditions

- Any source implementation starts before D1 has expanded its execution
  inventory against affected D0 matrix rows and recorded implementation-start
  review disposition.
- A target code/type/spec name keeps proof/evidence language without being classified as target-retained for a concrete repo-maintenance scenario.
- An implementation wrapper strategy is mistaken for a D0 compatibility handling action or becomes a new target domain model.
- A report, receipt, trace, transaction, artifact, refusal, or handoff link can represent contradictory states.
- Human output and JSON output diverge on what the command did or did not claim.
- Validation gates list commands without expected status, bad case, cache/freshness stance, and non-claims.

## Validation Gates

The implementation phase must run the gates named in `tasks.md` and `workstream/phase-record.md`, including focused Habitat tests, `habitat check --json`, `habitat verify --json`, `habitat fix --dry-run`, the D0/D11-approved hook surface gate, strict D1 OpenSpec validation, full OpenSpec validation, `git diff --check`, and final git status. Each gate must record expected status, actual status, oracle, bad case, cache/freshness stance, and non-claims.
