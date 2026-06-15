## 1. Design And Review Gate

- [x] 1.1 Open this packet with proposal, design, spec delta, tasks, phase
  record, source synthesis, review ledger, and downstream realignment ledger.
- [x] 1.2 Run product/outcome, Nx graph/target, generator, evidence/system, and
  Effect/substrate review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-classify-generator-repair --strict`.

## 2. Source Refresh And Current Evidence

- [x] 2.1 Re-read the takeover frame, recovery claim rows
  `CLAIM-H8-CLASSIFY`, `CLAIM-PRODUCT-GENERATORS`, and
  `CLAIM-P1-CLASSIFY-TARGETS`, H8 historical records, official Nx evidence,
  and pattern-generator metadata dependency.
- [x] 2.2 Inspect current classify command, `classifyPath`, target construction,
  project generator, migration metadata, README guidance, root AGENTS guidance,
  and Nx config.
- [x] 2.3 Capture fresh command proof for classify target overclaim:
  `@civ7/adapter:test` is reported by classify and rejected by
  `nx show target`.
- [x] 2.4 Capture generator proof for unsupported-kind refusal and mismatched
  root acceptance in dry-run.
- [x] 2.5 Capture package inventory evidence for projects without `test`
  scripts.
- [x] 2.6 Refresh official Nx docs and local Nx command behavior before
  implementation selects exact metadata APIs.
- [ ] 2.7 Refresh Effect fit evidence if implementation crosses into external
  command orchestration, provenance, service-runtime, scoped resource,
  retry/concurrency, or typed failure-channel boundaries.
- [x] 2.8 Refresh command-surface dependency evidence: the upstream
  `habitat-oclif-entrypoint-repair` packet is accepted downstack, so this
  packet may use Habitat wrapper classify probes for bounded command-surface
  proof while keeping generator/rule-scope closure separate.

## 3. Resolved Target Classification

- [x] 3.1 Add a resolved project metadata reader for classify.
- [x] 3.2 Replace static project target construction with target existence
  checks.
- [x] 3.3 Separate project-local targets from workspace/Habitat gates.
- [x] 3.4 Record missing targets as absent or unavailable instead of emitting
  commands.
- [x] 3.5 Add target proof data to classify output or internal verification.
- [x] 3.6 Add workspace-level path handling that reports only workspace/Habitat
  gates.

## 4. Path-Aware Rule Scope

- [x] 4.1 Add rule-scope classification for exact-path, project-owner,
  workspace-gate, and unresolved-metadata.
- [x] 4.2 Use machine-readable scan-root metadata where it exists.
- [x] 4.3 Mark Grit and rule-pack rows with unresolved scope when metadata is not
  yet present.
- [x] 4.4 Preserve current useful guidance without presenting unresolved scope as
  exact.
- [x] 4.5 Add tests proving exact scope, qualifier/exclusion refusal, and
  unresolved scope are distinct.

## 5. Generator Support And Refusal

- [x] 5.1 Define supported kind/root/package/tag matrix for `plugin`,
  `foundation`, and `app`.
- [x] 5.2 Refuse mismatched kind/root pairs before writes.
- [x] 5.3 Refuse package-name collisions before writes.
- [x] 5.4 Preserve unsupported-kind refusal for non-uniform kinds.
- [ ] 5.5 Prove generated scratch projects are discoverable by Nx.
- [ ] 5.6 Prove generated scratch projects expose the accepted target matrix.
- [x] 5.7 Keep pattern-generator registration metadata outside this packet.

## 6. Migration Claims

- [ ] 6.1 Reclassify the current no-op migration as wiring proof only.
- [ ] 6.2 Add convention-migration proof requirements to docs/tests or records.
- [ ] 6.3 Add a test or record that prevents no-op migration proof from being
  used as convention-change proof.

## 7. Tests

- [ ] 7.1 Add classify matrix tests for adapter, mod, foundation, app, tooling,
  plugin, generated-zone, and workspace-level paths.
- [x] 7.2 Add tests that missing project targets are not emitted.
- [x] 7.3 Add tests that existing project targets are emitted with proof.
- [x] 7.4 Add tests that workspace/Habitat gates are separate from project
  targets.
- [x] 7.5 Add tests for literal diff classification with resolved targets.
- [ ] 7.6 Add tests for missing paths and multi-path diffs.
- [x] 7.7 Add generator refusal tests for unsupported kinds.
- [x] 7.8 Add generator refusal tests for mismatched kind/root pairs.
- [ ] 7.9 Add generator scratch discovery tests for supported kinds.
- [ ] 7.10 Add migration proof-boundary tests or fixture records.
- [ ] 7.11 Add README/AGENTS stale guidance scan.

## 8. Downstream Realignment

- [ ] 8.1 Update root AGENTS classify/generator guidance.
- [ ] 8.2 Update `tools/habitat-harness/README.md` classify/generator guidance.
- [ ] 8.3 Update `docs/projects/habitat-harness/recovery-claim-ledger.md` after
  implementation proof.
- [ ] 8.4 Update `openspec/changes/habitat-generators-migrations/**` to mark H8
  target/generator closure as historical where this repair supersedes it.
- [ ] 8.5 Update `habitat-pattern-generator-metadata-repair` downstream records
  if classify target proof changes its dependency wording.
- [ ] 8.6 Update Nx adoption or boundary taxonomy packets only if resolved graph
  proof changes their assumptions.
- [ ] 8.7 Consume implemented root/dev/prod command-surface proof from
  `habitat-oclif-entrypoint-repair` before closing canonical classify command
  proof.

## 9. Verification

- [x] 9.1 `bun run openspec -- validate habitat-classify-generator-repair --strict`
- [x] 9.2 `bun run openspec:validate`
- [x] 9.3 `git diff --check`
- [ ] 9.4 classify matrix proof
- [ ] 9.5 Nx target-existence proof matrix
- [x] 9.6 generator dry-run proof
- [ ] 9.7 generator scratch discovery proof
- [x] 9.8 generator refusal proof
- [ ] 9.9 migration proof-boundary proof
- [ ] 9.10 README/AGENTS stale guidance scan
- [x] 9.11 full-depth-language guardrail scan over this packet
- [ ] 9.12 Effect fit decision proof if the implementation crosses its
  substrate decision boundary
- [x] 9.13 Upstream command-surface proof consumed: root/dev/prod Habitat
  entrypoints and selector behavior are repaired before this packet claims
  canonical `habitat classify` product proof.

## 10. Closure

- [ ] 10.1 Record verification results and proof boundaries in
  `workstream/phase-record.md`.
- [ ] 10.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [ ] 10.3 Ensure downstream realignment ledger is patched or has exact
  remaining actions.
- [ ] 10.4 Commit through Graphite with a clean worktree.
