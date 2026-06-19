# Tasks

## 1. Grounding

- [x] 1.1 Read the accepted D0 design/spec/review, the D1 source domino packet, this OpenSpec packet, and the D1 investigation scratch files before source edits.
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

- [x] 4.1 Implement check report semantic validation first: `ok` must be derived from or validated against rule statuses; contradictory reports fail validation or construction.
- [x] 4.2 Implement verify receipt boundaries second: target semantics as `VerifyReceipt`, skipped/executed/failed Nx affected states, bounded streams, task-local cache stance, and canonical non-claims.
- [x] 4.3 Implement hook local-feedback terminology and trace boundaries only where D0 permits; preserve or version human output deliberately.
- [x] 4.4 Remove adapter proof/evidence artifact runtime surfaces that existed only to demonstrate migration/refactor capability; keep no D1 product artifact API from that slice.
- [x] 4.5 Implement apply transaction terminology only at the D1 boundary; leave lifecycle behavior refactor to D9 unless D0 and D9 explicitly assign a narrow D1 change.
- [x] 4.6 Replace untyped links and broad proof fields only where the D1 inventory says the surface is D1-owned.

## 5. Bad-Case Tests

- [x] 5.1 Add or preserve a malformed check payload test where `ok: true` with a failing rule is rejected or impossible.
- [x] 5.2 Add or preserve a verify check-failed projection test where Nx affected is skipped and cannot carry command output, projects, cache states, or numeric exit code.
- [x] 5.3 Add or preserve hook tests proving local-feedback-only output and refusal before later commands for resource-blocked, partial-staging, malformed Grit JSON, and affected-failed states.
- [x] 5.4 Add or preserve apply transaction tests for dirty live refusal, ambiguous dry-run failure, rollback failure remaining failure, outside-root/create/delete refusal, and missing-export refusal.
- [x] 5.5 Delete adapter proof/evidence artifact tests with the deleted artifact surface; D1 retained product behavior is covered by verify receipt, hook, apply, entrypoint, process, and Grit adapter tests.

## 6. Validation Gates

- [x] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`; expected status 0; oracle: public command entrypoints and invalid-selector JSON/human behavior remain correct; bad case: unknown selector produces `rule-selection-integrity` with `ok: false`; cache stance: Vitest local execution; non-claims: does not prove rule correctness or current-tree cleanliness.
- [x] 6.2 Deleted with the product-inappropriate adapter proof/evidence artifact surface; no replacement artifact-compatibility gate is retained for D1.
- [x] 6.3 Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts`; expected status 0; oracle: verify receipt bounds streams, records task-local cache state, skips Nx after failed check, and represents failed Nx execution as `nxAffected.status: "failed"`; cache stance: fixture-derived only; non-claims: does not prove CI, apply safety, Graphite readiness, product completion, runtime, OpenSpec acceptance, or rule correctness.
- [x] 6.4 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`; expected status 0; oracle: hooks remain local feedback with refusal and failure states; bad case: dirty resources/partial staging/malformed Grit JSON stop later commands; cache stance: fake runtime; non-claims: does not prove CI or review readiness.
- [x] 6.5 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`; expected status 0; oracle: apply transaction states distinguish dry-run, live apply, rollback, formatter handoff, gate failure, and refusal; bad case: `ok: true` with failure tag remains impossible or rejected; cache stance: fake Grit/temp copy; non-claims: does not prove all patterns safe.
- [x] 6.6 Run focused D1 cross-family tests with `verify-receipt.test.ts` and without deleted proof-artifact/verify-proof tests; expected status 0; oracle: cross-family compatibility remains coherent.
- [x] 6.7 Run `bun run --cwd tools/habitat-harness check`; expected status 0; oracle: Habitat package typecheck and build-contract checks pass. D1 does not claim current-tree structural cleanliness from this package-local gate.
- [x] 6.8 Verify receipt failed-state behavior is covered by `test/lib/verify-receipt.test.ts`; full `bun run habitat verify --json` remains D12 workflow ownership and is not claimed as D1 closure proof.
- [x] 6.9 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`; expected status 0; oracle: dry-run and live apply are not conflated.
- [x] 6.10 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`; expected status 0; oracle: hook surfaces remain local feedback and D1 does not repair hook help behavior beyond the command base `--help` behavior required for command entrypoints.
- [x] 6.11 Run `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict`; expected status 0.
- [x] 6.12 Run `bun run openspec:validate`; expected status 0.
- [x] 6.13 Run `git diff --check`; expected status 0.
- [x] 6.14 Run `git status --short --branch`; expected state: only D1-owned files dirty before commit, and no generated/untracked artifacts outside approved scope.
- [x] 6.15 Record every validation result in `workstream/phase-record.md` under `Validation Results Recording Contract`; do not invent a separate result location.

## 7. Review And Realignment

- [x] 7.1 Run fresh per-domino domain/ontology, OpenSpec, code/topology, testing/validation, information-design, and cross-domino reviews.
- [x] 7.2 Import accepted P1/P2 findings into the review ledger and repair each finding before D1 acceptance.
- [x] 7.3 Update D6/D7/D8/D9/D10/D11/D12/D13/D14 downstream ledgers or index rows only where D1 accepted contract decisions change their input.
- [x] 7.4 Record whether D15 remains untriggered or is triggered by an explicit shared-substrate need.
- [x] 7.5 Leave the worktree clean after commit, or write a zero-context handoff with every dirty file classified.
