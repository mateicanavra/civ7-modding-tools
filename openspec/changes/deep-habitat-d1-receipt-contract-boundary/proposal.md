# Proposal: D1 Receipt And Command Record Boundary

## Summary

Design D1 as the boundary that separates Habitat's bounded command records from inherited proof-shaped compatibility surfaces. This packet turns the D1 domino into an executable OpenSpec design for check reports, diagnostics, verify receipts, local hook feedback traces, apply transaction records, adapter command-capture artifacts, refusals, handoff links, and non-claims.

This is not a generic proof-artifact framework. It is the contract layer that prevents local command output from being misread as CI, runtime behavior, apply safety, Graphite readiness, OpenSpec acceptance, or product completion.

## Authority

- Source domino packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D1-proof-contract-boundary.md`.
- Accepted D0 design/specification packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/`.
- D1 investigations:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-domain-ontology-investigation.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-code-topology-investigation.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-openspec-testing-investigation.md`
- Remediation frame: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`.
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

- D1 does not implement source changes in this remediation pass.
- D1 does not redesign D6 diagnostics, D7 enforcement, D9 apply behavior, D11 hook behavior, D12 verify workflow, D8 pattern governance, or D13 scaffolding/refusal ownership.
- D1 does not authorize broad terminology churn. Legacy proof/evidence names are compatibility facts until D0 rows and this packet choose a handling.
- D1 does not create a shared artifact substrate or a `Proof<T>` abstraction.

## D0 Prerequisite

D0 is accepted for design/specification, but the concrete compatibility matrix rows are still an implementation prerequisite. D1 implementation is blocked until every affected public or durable surface has a D0 `surface_id`, plane, compatibility handling, target owner, and downstream citation.

D1 may describe implementation strategy with terms such as compatibility wrapper or target rename, but the actual D0 compatibility handling value must be one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.

Required D0 row classes:

| Surface family | Required D0 planes | D1 target owner |
| --- | --- | --- |
| `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `validateCheckReport` | package-export, command-json, docs-example | Check report / diagnostic boundary |
| `VerifyProof`, `createVerifyProof`, `habitat verify --json` help and JSON output | command-json, human-output, command-behavior, docs-example | Verify receipt boundary |
| `HookTrace`, `PreCommitTrace`, `PrePushTrace`, hook proof notice | hook, human-output, package-internal/package-export if exposed, docs-example | Local feedback trace boundary |
| `GritApplyTransactionResult`, `GritApplyTransactionProof`, `habitat fix` output | package-export, command-behavior, docs-example | Apply transaction boundary |
| `AdapterProofArtifact`, `ProofArtifactWriter`, `adapterProofArtifactPath` | package-export, generated/workstream-artifact, docs-example | Adapter command artifact compatibility |
| docs proof/evidence phrases in Habitat docs | docs-example | D1 terminology compatibility or downstream owner |

Missing D0 rows stop D1 implementation. They do not stop this design packet from recording the required dependency.

## Affected Owners

- D1 owns shared receipt/handoff boundary vocabulary, non-claim policy, compatibility translation rules for proof-shaped command records, and typed relationship semantics.
- Check/diagnostics own check report and diagnostic meaning.
- D9 owns apply transaction behavior.
- D11 owns hook local feedback behavior.
- D12 owns verify command workflow composition.
- D8/D13/D14 may consume D1 vocabulary but may not redefine it locally.
- D15 is not triggered by D1 unless later packets need a shared execution provenance substrate beyond these family-specific records.

## Expected Implementation Write Set

D1 implementation may touch these paths only after D0 row citations exist:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/diagnostics.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-apply.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/proof-artifact.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/check.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/verify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/fix.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/hook.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts` only for D0-classified export compatibility.
- Focused tests under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/`.
- Habitat docs examples only when D0 rows classify them and D1 changes target guidance.
- This OpenSpec change path and the remediation packet index for status/citation updates.

## Protected Paths

- Source domino packets under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/**`.
- Accepted D0 packet files except read-only citation by D1.
- Other domino OpenSpec packets except downstream ledger/index updates explicitly caused by D1 acceptance and the narrow D10 dependency metadata alignment required by D1 cross-domino review: D10 `Requires`, dependency-gate task, and refusal-vocabulary dependency line only. D1 does not authorize D10 behavior, design, spec, or validation repair.
- Generated outputs, lockfiles, Nx cache, `dist/**`, `tools/habitat-harness/dist/**`, `oclif.manifest.json`, `mod/**`, generator outputs, and runtime Civ7 control packages.
- Root/build configuration unless a D0 row and D1 design explicitly authorize the public-surface change.

## Enables

D1 feeds D6, D7, D8, D9, D10, D11, D12, D13, and D14. D15 remains a conditional trigger only if later packets demonstrate a repeated need for a shared execution-provenance substrate.

## Stop Conditions

- Any implementation starts before affected D0 matrix rows exist.
- A target code/type/spec name keeps proof/evidence language without being classified as target-retained for a concrete repo-maintenance scenario.
- An implementation wrapper strategy is mistaken for a D0 compatibility handling action or becomes a new target domain model.
- A report, receipt, trace, transaction, artifact, refusal, or handoff link can represent contradictory states.
- Human output and JSON output diverge on what the command did or did not claim.
- Validation gates list commands without expected status, bad case, cache/freshness stance, and non-claims.

## Validation Gates

The implementation phase must run the gates named in `tasks.md` and `workstream/phase-record.md`, including focused Habitat tests, `habitat check --json`, `habitat verify --json`, `habitat fix --dry-run`, `habitat hook --help`, strict D1 OpenSpec validation, full OpenSpec validation, `git diff --check`, and final git status. Each gate must record expected status, actual status, oracle, bad case, cache/freshness stance, and non-claims.
