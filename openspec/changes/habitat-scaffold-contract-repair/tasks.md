## 1. Design And Review Gate

- [x] 1.1 Open this packet with proposal, design, spec delta, tasks, phase
  record, source synthesis, review ledger, and downstream realignment ledger.
- [x] 1.2 Run product/outcome, evidence/system, baseline/scaffold, and
  generator/Grit consumer review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-scaffold-contract-repair --strict`.

## 2. Source Refresh And Current Evidence

- [x] 2.1 Re-read `dra-takeover-frame.md`, recovery claim rows
  `CLAIM-H2-SCAFFOLD` and `CLAIM-P1-BASELINE`, and the H2 scaffold records.
- [x] 2.2 Capture fresh current behavior for `workspace-entrypoints`,
  `adapter-boundary`, and full `habitat:check` baseline reporting.
- [x] 2.3 Inspect current baseline files, rule registry, `baseline.ts`,
  `command-engine.ts`, and `architecture.ts`.
- [x] 2.4 Record that `habitat-oclif-entrypoint-repair` has not landed on this
  branch; selector-sensitive baseline mutation must stay closed until accepted
  selector validation is available.

## 3. Typed Baseline State

- [ ] 3.1 Replace the `Set<string>`-only load boundary with typed baseline
  states equivalent to `explicit-empty`, `explicit-debt`,
  `external-exception-source`, and `contract-failure`.
- [ ] 3.2 Validate baseline JSON shape, sorted order, unique keys, and string
  entry types.
- [ ] 3.3 Detect registered rules without explicit baseline state.
- [ ] 3.4 Detect baseline files whose rule id is not registered.
- [ ] 3.5 Preserve CheckReport schemaVersion 1 while rendering baseline contract
  failures as Habitat-native diagnostics.
- [ ] 3.6 Lock v1 baseline keys to current executable `path::message` behavior
  unless a separate key-format migration is accepted.
- [ ] 3.7 Model comparison-source failures as contract failures: unavailable
  comparison base, missing/malformed base rule registry, unreadable base
  baseline, and Graphite stack-parent ambiguity.
- [ ] 3.8 Record the manual-vs-Effect substrate decision before implementation
  commits to the baseline state module shape.

## 4. Explicit Current Rule State

- [ ] 4.1 Materialize committed empty baseline files for every current registered
  rule that has no debt baseline and no modeled external exception source.
- [ ] 4.2 Reconcile `adapter-boundary` debt so every baselined diagnostic is owned
  by explicit Habitat baseline state or a modeled external exception source.
- [ ] 4.3 Inventory every current non-`none` `exceptionPath`, including
  `adapter-boundary` and `doc-ambiguity`, and classify each as committed Habitat
  baseline file, modeled external exception source, or contract failure.
- [ ] 4.4 Ensure parser/native `baselined: true` output exactly matches accepted
  baseline contract state or emits a contract failure.
- [ ] 4.5 Ensure `locked` report output reflects typed baseline state, not only
  loaded key count.
- [ ] 4.6 Update README or adjacent harness docs with the accepted baseline state
  contract.

## 5. Baseline Mutation And Integrity

- [ ] 5.1 Consume the accepted selector-validation boundary from
  `habitat-oclif-entrypoint-repair` before `--expand-baseline` writes.
- [ ] 5.2 Refuse existing-rule baseline growth before writing.
- [ ] 5.3 Allow rule-introduction baseline writes only when the rule is new at the
  comparison base and an accepted rule-introduction baseline manifest is
  present.
- [ ] 5.4 Parse base and current rule registries structurally for
  `baseline-integrity`.
- [ ] 5.5 Add integrity diagnostics for missing, malformed, duplicate, unsorted,
  orphan, and existing-rule growth states.
- [ ] 5.6 Add integrity diagnostics for unavailable comparison base,
  missing/malformed base `rules.json`, unreadable base baselines, and Graphite
  child-branch growth against a downstack rule.
- [ ] 5.7 Add the rule-introduction baseline manifest contract and refuse
  missing, malformed, placeholder, or contradicted manifest records before
  writing.
- [ ] 5.8 If the Effect adoption gate selects Effect, implement baseline store,
  rule registry, comparison base, command runner, clock, and report assembly as
  services/layers behind the existing Habitat command boundary.

## 6. Unit And Integration Tests

- [ ] 6.1 Add unit tests for every baseline state and contract failure.
- [ ] 6.2 Add fake Git/rule-registry tests for existing-rule growth and
  new-rule introduction.
- [ ] 6.3 Add command-level or smoke tests for current explicit locked behavior.
- [ ] 6.4 Add command-level or smoke tests for current adapter-boundary debt
  behavior after reconciliation.
- [ ] 6.5 Add write-safety tests proving refused baseline mutations do not create,
  rewrite, or delete files.
- [ ] 6.6 Add invalid `--rule`, `--tool`, `--owner`, and empty-intersection
  no-write tests for `--expand-baseline`.
- [ ] 6.7 Add engine-level baseline tests with fake Git, fake rule registry, and
  fake filesystem inputs; command mocks alone do not satisfy this packet.
- [ ] 6.8 Add external exception projection equality tests and parser-owned
  baselining rejection tests.

## 7. Downstream Realignment

- [ ] 7.1 Update `habitat-grit-proof-repair` records to consume the accepted
  baseline contract.
- [ ] 7.2 Update `habitat-effect-grit-adapter` records if the baseline access
  boundary changes.
- [ ] 7.3 Update generator/pattern metadata records with the baseline-file
  dependency, without claiming generator authority metadata is repaired here.
- [ ] 7.4 Reclassify stale H2/workstream-record baseline closure text as
  historical where current repair supersedes it.
- [ ] 7.5 Add or update the future `habitat-pattern-generator-metadata-repair`
  dependency so generated enforced rules cannot bypass authority/proving
  metadata or the baseline contract.
- [ ] 7.6 Split H2 detection parity from ratchet exit semantics wherever stale
  records imply wrapped checks and Habitat reports must have identical exit
  behavior for accepted baselined debt.
- [ ] 7.7 Record `--staged` as file-layer-only unless a future accepted packet
  expands staged behavior for other owner tools.

## 8. Verification

- [ ] 8.1 `bun run openspec -- validate habitat-scaffold-contract-repair --strict`
- [ ] 8.2 baseline state unit matrix
- [ ] 8.3 baseline integrity unit matrix
- [ ] 8.4 command proof for `workspace-entrypoints`
- [ ] 8.5 command proof for `adapter-boundary`
- [ ] 8.6 malformed/orphan/missing baseline probes
- [ ] 8.7 refused mutation proof for existing-rule growth
- [ ] 8.8 invalid selector and empty-intersection no-write probes
- [ ] 8.9 comparison-source failure tests
- [ ] 8.10 Graphite child/downstack baseline growth test
- [ ] 8.11 external exception inventory and projection equality proof
- [ ] 8.12 Effect adoption-gate record
- [ ] 8.13 `bun run --cwd tools/habitat-harness test`
- [ ] 8.14 selected root Habitat check probes after command trust repair
- [ ] 8.15 full-depth-language guardrail scan over Habitat initiative docs
- [ ] 8.16 `git diff --check`
- [ ] 8.17 `bun run openspec:validate`

## 9. Closure

- [ ] 9.1 Record verification results and proof boundaries in
  `workstream/phase-record.md`.
- [ ] 9.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [ ] 9.3 Ensure downstream realignment ledger is patched or has exact remaining
  actions.
- [ ] 9.4 Commit through Graphite with a clean worktree.
