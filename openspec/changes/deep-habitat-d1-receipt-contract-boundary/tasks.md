# Tasks

## 1. Grounding

- [ ] 1.1 Read the accepted D0 design/spec/review, the D1 source domino packet, this OpenSpec packet, and the D1 investigation scratch files before source edits.
- [x] 1.2 Record branch, worktree, Graphite state, and dirty-file ownership in the phase record.
- [x] 1.3 Confirm implementation starts from the approved implementation branch, not the dirty pre-remediation D1 branch.
- [x] 1.4 Confirm no source edit begins until every affected public/durable surface has a concrete D0 row and a D1 execution-inventory citation.

## 2. D0 Compatibility Prerequisite

- [x] 2.1 Cite concrete D0 `surface_id` rows for each D1-touched command JSON, package export, hook, human output, CLI, and docs-example surface; D1 must not invent planes such as command-behavior or generated/workstream-artifact.
- [x] 2.2 Copy the D0 `compatibility_handling`, owner, and downstream domino values into the D1 surface inventory; `compatibility_handling` must be one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.
- [x] 2.3 Stop implementation if any D1 public/durable surface remains `blocked-pending-d0-row` outside explanatory design prose.

## 3. D1 Surface Inventory

- [x] 3.1 Complete the D1 inventory for `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `validateCheckReport`, `VerifyProof`, `createVerifyProof`, `HookTrace`, hook proof notice, `GritApplyTransactionResult`, `GritApplyTransactionProof`, `AdapterProofArtifact`, `ProofArtifactWriter`, `adapterProofArtifactPath`, affected docs phrases, `ClassifiedTarget.proof`, and Pattern Authority proof fields.
- [x] 3.2 For each row, choose exactly one target family, owner, compatibility stance, schema/version stance, required test, bad case, non-claim set, and downstream consumer.
- [x] 3.3 Keep D3/D4 classify metadata and D8/D13 Pattern Authority surfaces protected unless their D0 rows and owning packets authorize a D1 change.

## 4. Contract Implementation Sequence

- [ ] 4.1 Implement check report semantic validation first: `ok` must be derived from or validated against rule statuses; contradictory reports fail validation or construction.
- [ ] 4.2 Implement verify receipt boundaries second: target semantics as `VerifyReceipt`, legacy `VerifyProof` compatibility as required by D0, skipped/executed/failed Nx affected states, bounded streams, task-local cache stance, and canonical non-claims.
- [ ] 4.3 Implement hook local-feedback terminology and trace boundaries only where D0 permits; preserve or version human output deliberately.
- [ ] 4.4 Implement adapter command artifact compatibility only where D0 classifies the exported artifact writer/API as D1-owned; otherwise defer to the adapter owner and record the deferral.
- [ ] 4.5 Implement apply transaction terminology only at the D1 boundary; leave lifecycle behavior refactor to D9 unless D0 and D9 explicitly assign a narrow D1 change.
- [ ] 4.6 Replace untyped links and broad proof fields only where the D1 inventory says the surface is D1-owned.

## 5. Bad-Case Tests

- [ ] 5.1 Add or preserve a malformed check payload test where `ok: true` with a failing rule is rejected or impossible.
- [ ] 5.2 Add or preserve a verify check-failed projection test where Nx affected is skipped and cannot carry command output, projects, cache states, or numeric exit code.
- [ ] 5.3 Add or preserve hook tests proving local-feedback-only output and refusal before later commands for resource-blocked, partial-staging, malformed Grit JSON, and affected-failed states.
- [ ] 5.4 Add or preserve apply transaction tests for dirty live refusal, ambiguous dry-run failure, rollback failure remaining failure, outside-root/create/delete refusal, and missing-export refusal.
- [ ] 5.5 Add or preserve adapter artifact tests for unsafe artifact id rejection, redaction, retention, bounded raw output metadata, and non-claim merge.

## 6. Validation Gates

- [ ] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`; expected status 0; oracle: public command entrypoints and invalid-selector JSON/human behavior remain correct; bad case: unknown selector produces `rule-selection-integrity` with `ok: false`; cache stance: Vitest local execution; non-claims: does not prove rule correctness or current-tree cleanliness.
- [ ] 6.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts`; expected status 0; oracle: adapter command artifact compatibility remains path-safe, redacted, retention-bounded, bounded in raw-output metadata, and non-claiming; bad case: unsafe artifact id throws, unknown retention is rejected, and oversized or sensitive raw stream content cannot serialize an unbounded artifact body; cache stance: Vitest temp paths; non-claims: does not prove command semantic correctness.
- [ ] 6.3 Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts`; expected status 0; oracle: verify receipt/compatibility wrapper bounds streams, records task-local cache state, and skips Nx after failed check; bad case: failed check cannot report executed Nx; cache stance: fixture-derived only; non-claims: does not prove CI, apply safety, Graphite readiness, product completion, runtime, OpenSpec acceptance, or rule correctness.
- [ ] 6.4 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`; expected status 0; oracle: hooks remain local feedback with refusal and failure states; bad case: dirty resources/partial staging/malformed Grit JSON stop later commands; cache stance: fake runtime; non-claims: does not prove CI or review readiness.
- [ ] 6.5 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`; expected status 0; oracle: apply transaction states distinguish dry-run, live apply, rollback, formatter handoff, gate failure, and refusal; bad case: `ok: true` with failure tag remains impossible or rejected; cache stance: fake Grit/temp copy; non-claims: does not prove all patterns safe.
- [ ] 6.6 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts`; expected status 0; oracle: cross-family compatibility remains coherent.
- [ ] 6.7 Run `bun run habitat check --json`; expected status 0 for implementation closure, or recorded nonzero current-tree diagnostic state if the tree is intentionally failing; oracle: valid schemaVersion 1 check report and no receipt/CI/apply claim. Timeout/interruption is evidence of a blocker, not an acceptable D1 validation result.
- [ ] 6.8 Run `bun run habitat verify --json`; expected status 0 for implementation closure when current check and Nx affected pass, or nonzero with valid skipped-Nx receipt if check fails; oracle: verify output uses D0-approved compatibility and canonical non-claims. Timeout/interruption is evidence of a blocker, not an acceptable D1 validation result.
- [ ] 6.9 Run `bun run habitat fix --dry-run`; expected status 0 for no-op/approved dry-run or nonzero explicit transaction refusal; oracle: dry-run and live apply are not conflated.
- [ ] 6.10 Run the D0/D11-approved hook surface gate; expected status follows the cited D0 hook/help row; oracle: hook surfaces remain local feedback and D1 does not repair hook help behavior unless D0/D11 explicitly authorize it.
- [ ] 6.11 Run `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict`; expected status 0.
- [ ] 6.12 Run `bun run openspec:validate`; expected status 0.
- [ ] 6.13 Run `git diff --check`; expected status 0.
- [ ] 6.14 Run `git status --short --branch`; expected state: only D1-owned files dirty before commit, and no generated/untracked artifacts outside approved scope.
- [ ] 6.15 Record every validation result in `workstream/phase-record.md` under `Validation Results Recording Contract`; do not invent a separate result location.

## 7. Review And Realignment

- [ ] 7.1 Run fresh per-domino domain/ontology, OpenSpec, code/topology, testing/validation, information-design, and cross-domino reviews.
- [ ] 7.2 Import accepted P1/P2 findings into the review ledger and repair each finding before D1 acceptance.
- [ ] 7.3 Update D6/D7/D8/D9/D10/D11/D12/D13/D14 downstream ledgers or index rows only where D1 accepted contract decisions change their input.
- [ ] 7.4 Record whether D15 remains untriggered or is triggered by an explicit shared-substrate need.
- [ ] 7.5 Leave the worktree clean after commit, or write a zero-context handoff with every dirty file classified.
