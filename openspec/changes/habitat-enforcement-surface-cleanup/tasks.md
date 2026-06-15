## 1. Design And Review Gate

- [x] 1.1 Open this packet with proposal, design, spec delta, tasks, phase
  record, source synthesis, evidence log, review ledger, and downstream
  realignment ledger.
- [x] 1.2 Run product/outcome, command/evidence, owner-layer, wrapper/parser,
  and downstream-record review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-enforcement-surface-cleanup --strict`.
- [x] 1.5 Accept an Effect adopt/manual decision table before any
  implementation task touches `command-engine.ts`, `architecture.ts`,
  `verify.ts`, wrapper execution, selector validation, proof provenance, hook
  sequencing, or command-result contracts.
- [x] 1.6 Accept the structured `VerifyProof` artifact contract before closing
  verify proof design.

## 2. Source Refresh And Current Evidence

- [x] 2.1 Re-read takeover frame, `CLAIM-H6-ONE-PATH`, H6 historical packet,
  command/Grit/baseline repair packets, root scripts, CI, rule pack, and
  current wrapper code.
- [x] 2.2 Capture current root script inventory and CI verification wiring.
- [x] 2.3 Capture current `rules.json` ownerTool inventory.
- [x] 2.4 Capture current wrapped-script, wrapped-test, stale wrapped-eslint,
  direct docs-lint, strict-core alias, and `habitat verify` evidence.
- [x] 2.5 Refresh official Effect, Nx, Biome, and Grit docs relevant to typed
  errors, command orchestration, resource scopes, task execution, CI checks,
  and pattern proof.
- [x] 2.6 Capture current CI-step classification and known stale authority in
  `invariant-corpus.md`.

## 3. Enforcement Surface Taxonomy

- [ ] 3.1 Classify every root structural script as canonical Habitat entrypoint,
  Habitat alias, non-canonical diagnostic command, exterior product/runtime
  verifier, or stale bypass.
- [ ] 3.2 Classify every Habitat-owned Nx target in `tools/habitat-harness/src/plugin.js`
  by proof class and cache/fresh requirement.
- [ ] 3.3 Define accepted naming and documentation policy for retained direct
  diagnostic scripts.
- [ ] 3.4 Patch root scripts and docs when a script name implies stronger proof
  than the command supplies.
- [ ] 3.5 Inventory surviving enforcement wrapper files under `scripts/**` and
  classify duplicates, direct aliases, and Habitat-mediated paths.

## 4. Wrapper And Parser Policy

- [ ] 4.1 Build a wrapper-disposition table for every `wrapped-script` and
  `wrapped-test` rule.
- [ ] 4.2 Compare direct output and Habitat report output for `mapgen-docs`,
  `adapter-boundary`, and `domain-refactor-guardrails`.
- [ ] 4.3 Compare direct output and Habitat report output for every
  `wrapped-test` rule, including skip/warning/debt output, prerequisite output,
  proof class, owner, non-claims, and retirement trigger.
- [ ] 4.4 Decide whether direct zero-exit warnings are outside the structural
  claim, advisory diagnostics, or enforced diagnostics.
- [ ] 4.5 Patch parser behavior, rule metadata, or docs so wrapper output policy
  is executable and recorded.
- [ ] 4.6 Record retirement triggers for every surviving wrapper and wrapped
  architecture test.

## 5. Selector And Empty-Proof Dependency

- [ ] 5.1 Consume `habitat-oclif-entrypoint-repair` selector truth before closing
  stale owner/tool/rule proof.
- [ ] 5.2 Prove stale owner tool selections such as `wrapped-eslint` cannot pass
  as proof.
- [ ] 5.3 Require parsed JSON assertions for selected rule/tool/owner proof.

## 6. Verify Command Proof

- [ ] 6.1 Run `habitat verify` and record branch, base, command, env, exit code,
  Habitat rule counts, Nx target/project list, cache/fresh status, duration,
  and post-run repo/resource state.
- [ ] 6.2 Implement or generate the structured `VerifyProof` artifact described
  in `workstream/verify-proof-contract.md`; terminal transcript summaries are
  not accepted as closure proof.
- [ ] 6.3 Decide whether verify target composition should avoid direct `check`
  recursion or stale target names.
- [ ] 6.4 Patch `verify` command, target metadata, docs, or proof records if the
  accepted command policy differs from historical H6.

## 7. Owner-Layer And Effect Decision

- [ ] 7.1 Reaffirm Nx, Grit, Biome, file-layer, Habitat-native, and tests as
  distinct proof owners.
- [ ] 7.2 Reaffirm command selector implementation belongs to
  `habitat-oclif-entrypoint-repair` unless this packet consumes an accepted
  selector repair.
- [ ] 7.3 Reaffirm Grit pattern semantics and apply safety belong to
  `habitat-grit-proof-repair` and per-pattern packets.
- [ ] 7.4 If implementation changes command orchestration, wrapper execution,
  proof provenance, cleanup finalizers, service-injected tests, or typed error
  states, record an adopt/manual Effect decision using the trigger table in
  `design.md`.
- [ ] 7.5 If Effect is not adopted for a trigger-area slice, prove the manual
  implementation still supplies typed failure states, command provenance,
  cleanup proof, and test substitution.
- [ ] 7.6 If Effect is adopted, prove runtime-edge discipline, `CheckReport`
  compatibility, selector failure, command provenance, collect-all check
  behavior, fail-closed mutation behavior, and service-injected tests paired
  with real root/dev/prod command tests.

## 8. Downstream Realignment

- [ ] 8.1 Update `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-H6-ONE-PATH` with reviewed current proof boundaries.
- [ ] 8.2 Update `docs/projects/habitat-harness/workstream-record.md` if H6
  closure wording overclaims current proof.
- [ ] 8.3 Update `openspec/changes/habitat-enforcement-consolidation/**`
  historical records that claim one path, green closure, or retired mechanisms
  beyond current evidence.
- [ ] 8.4 Update `tools/habitat-harness/README.md` and root `AGENTS.md` if
  accepted root/CI command policy changes agent guidance.
- [ ] 8.5 Update dependent repair packets that cite H6 as proof without the
  current cleanup boundary.

## 9. Verification

- [x] 9.1 `bun run openspec -- validate habitat-enforcement-surface-cleanup --strict`
- [x] 9.2 `bun run openspec:validate`
- [x] 9.3 `git diff --check`
- [ ] 9.4 Root script inventory proof
- [ ] 9.5 CI step classification proof
- [ ] 9.6 Rule ownerTool inventory proof
- [ ] 9.7 Wrapped-script and wrapped-test proof
- [ ] 9.8 Invalid selector proof after command-surface dependency lands
- [ ] 9.9 Direct-vs-Habitat wrapper output comparison
- [ ] 9.10 Direct-vs-Habitat wrapped-test output comparison
- [ ] 9.11 Legacy enforcement wrapper file inventory proof
- [ ] 9.12 Effect decision proof for orchestration-changing slices
- [ ] 9.13 Structured `VerifyProof` artifact proof
- [ ] 9.14 `habitat verify` whole-command proof
- [ ] 9.15 Stale-record scan and patches
- [x] 9.16 Full-depth-language guardrail scan over this packet

## 10. Closure

- [ ] 10.1 Record verification results and proof boundaries in
  `workstream/phase-record.md`.
- [ ] 10.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [ ] 10.3 Ensure downstream realignment ledger is patched or has exact actions.
- [ ] 10.4 Commit through Graphite with a clean worktree.
