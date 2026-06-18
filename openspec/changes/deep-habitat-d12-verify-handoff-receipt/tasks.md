# Tasks

## 1. Design Closure Before Implementation

- [ ] 1.1 Read `$D12_SOURCE_PACKET`, `$D12_CHANGE/**`, `$D1_CHANGE`, `$D3_CHANGE`, `$D7_CHANGE`, `$D0_CHANGE`, and current verify source/tests.
- [ ] 1.2 Confirm `$ACTIVE_REMEDIATION_BRANCH` is `codex/d12-verify-handoff-packet` in `$REMEDIATION_DIR/context.md`.
- [ ] 1.3 Import first-wave D12 review findings into `$D12_REVIEW_LEDGER`.
- [ ] 1.4 Repair every accepted P1/P2 finding in proposal, design, spec, tasks, and workstream records.
- [ ] 1.5 Run fresh final D12 domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews against the repaired disk state.
- [ ] 1.6 Keep D12 blocking in `$REMEDIATION_DIR/packet-index.md` until all final rereviews record no unresolved P1/P2 findings.

## 2. Public Surface And Compatibility Inventory

- [ ] 2.1 Create the implementation-time D0 row citation list for `habitat verify`, `habitat verify --json`, `habitat verify --help`, human output, exit status, docs examples, exported types/functions, and relevant tests.
- [ ] 2.2 Decide each legacy proof-named surface through D0 closed compatibility handling: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.
- [ ] 2.3 Confirm D1 output-family mapping for target `VerifyReceipt`, canonical `NonClaim` identifiers, typed relationships, and legacy `VerifyProof` compatibility.
- [ ] 2.4 Do not edit source until concrete D0 rows and live D1/D3/D7 projections exist for every touched surface.

## 3. Later TypeScript Implementation Slices

- [ ] 3.1 Introduce a D12-owned receipt module or owner boundary for `VerifyReceipt`, `VerifyInvocation`, `VerifyBaseSelection`, `VerifyCheckConsumption`, `VerifyTargetPlanConsumption`, `AffectedTargetExecution`, `TaskCacheObservation`, `PostStateObservation`, and `VerifyReceiptOutcome`.
- [ ] 3.2 Replace `{}` requested-selector output with the closed selector state: `none`, `requested`, or `unsupported`.
- [ ] 3.3 Replace optional affected result assembly with explicit check and target-plan gates.
- [ ] 3.4 Consume D7 `VerifyCheckSummaryProjection` for selected ids, status counts, requested selector state, `allowsAffectedExecution`, and owner-sourced skipped-affected reason.
- [ ] 3.5 Consume D3 `VerifyTargetPlan` and graph-refusal states before invoking affected Nx targets.
- [ ] 3.6 Split affected target states into `executed`, `failed`, and `skipped`.
- [ ] 3.7 Replace prose non-claim strings with D1 canonical identifiers and derive human wording from those identifiers.
- [ ] 3.8 Preserve, version, facade, deprecate, or refuse legacy `VerifyProof`/`createVerifyProof` surfaces exactly as D0 rows require.
- [ ] 3.9 Keep command-engine orchestration clear by extracting D12 receipt assembly if that removes broad ownership from the current module.
- [ ] 3.10 Construct affected Nx argv from D3 `VerifyTargetPlan`, D12 `VerifyBaseSelection`, explicit `--head HEAD`, and `--outputStyle=static`, unless a final accepted D12 review records another exact command contract.
- [ ] 3.11 Record post-state command observations for git status and resource status with bounded stdout/stderr and explicit unavailable states.
- [ ] 3.12 If D12 observes D11 local-feedback or hook trace boundaries, consume only named D11 projections and record D11 non-claims without treating hook pass as verify completion.

## 4. Later Tests And Command Gates

- [ ] 4.1 Update or add verify receipt unit tests for check-allowed execution, check-blocked skip, graph-refusal skip, affected failure, bounded streams, cache observations, base selection states, post-state unavailable, D11 hook/local-feedback non-claim boundaries where consumed, and canonical non-claims.
- [ ] 4.2 Update command tests for `habitat verify --json`, human output, exit status, and help text according to D0/D1 compatibility handling.
- [ ] 4.3 Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts`.
- [ ] 4.4 Run `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` when verify public exports, scripts, or docs examples change.
- [ ] 4.5 Add or update tests asserting exact affected argv, including target order from D3, `--base`, `--head HEAD`, and `--outputStyle=static`.
- [ ] 4.6 Add or update post-state tests for observed clean, observed dirty, and unavailable command states.
- [ ] 4.7 Run `bun run habitat verify --json` with scenario-specific expected status and oracle recorded in the implementation phase record.
- [ ] 4.8 Run `bun run habitat verify --help` after help/docs compatibility handling is cited.

## 5. Design-Time Validation

- [ ] 5.1 Run `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict`.
- [ ] 5.2 Run `bun run openspec:validate`.
- [ ] 5.3 Run the D12 complete-standard wording audit over `$D12_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D12-*.md`.
- [ ] 5.4 Run `git diff --check`.
- [ ] 5.5 Record validation status in `$D12_PHASE_RECORD` and `$D12_CLOSURE_CHECKLIST`.

## 6. Downstream Realignment

- [ ] 6.1 Update `$D12_DOWNSTREAM_LEDGER` with exact D0, D1, D3, D7, D14, docs, and test handoffs.
- [ ] 6.2 Preserve the docs distinction between root `bun run verify` and diagnostic `bun run habitat verify`.
- [ ] 6.3 Update `$REMEDIATION_DIR/packet-index.md` only after final rereviews accept D12 for design/specification.
- [ ] 6.4 Preserve source blockers in every acceptance surface: D12 is not implementation-complete, and source edits remain blocked behind concrete D0 rows plus live D1/D3/D7 projections where consumed.
