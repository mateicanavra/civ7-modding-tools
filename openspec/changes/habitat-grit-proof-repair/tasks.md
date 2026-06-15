## 1. Design And Review Gate

- [x] 1.1 Open this repair packet with proposal, design, spec delta, tasks,
  phase record, proof matrix, review disposition ledger, and downstream
  realignment ledger.
- [x] 1.2 Run Grit corpus, evidence/system, and Effect/substrate review lanes
  against the packet before implementation.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run `bun run openspec -- validate habitat-grit-proof-repair --strict`.

## 2. Proof Matrix And Corpus

- [ ] 2.1 Fill `workstream/grit-proof-matrix.md` for all 22 current checks and
  the current apply pattern.
- [ ] 2.2 Record exact scan roots and exclusions for every check row.
- [ ] 2.3 Record native sample command, report count, sample count, and
  non-claims for every row.
- [ ] 2.4 Record current-tree Habitat wrapper command and output class for
  every row.
- [ ] 2.5 Record parity source, current parity command, and parity disposition
  for each row that H5/H6 tied to an old mechanism.
- [ ] 2.6 Fill every required matrix field from `design.md`; no row may move
  out of pending status with placeholder proof text.
- [ ] 2.7 Classify fixture coverage for every row as positive, negative,
  parser-edge, and false-positive, with sample counts or evidence-backed
  not-applicable dispositions.

## 3. Selector And Current-Tree Proof

- [ ] 3.1 Verify this repair runs after `habitat-oclif-entrypoint-repair` or
  mark selector-dependent tasks blocked.
- [ ] 3.2 Prove `--tool grit-check` selects the 22 current Grit checks plus
  `baseline-integrity`.
- [ ] 3.3 Prove `--rule grit-check` fails truthfully as a wrong-namespace
  selector after the command repair.
- [ ] 3.4 Prove `--rule <each current grit rule id>` selects exactly that rule
  plus `baseline-integrity`.
- [ ] 3.5 Update every affected matrix row with one raw acquisition value:
  satisfied with command-proof log id, or direct raw proof unclaimed and
  Habitat wrapper proof controls only the current-tree wrapper claim.

## 4. Injected Violation Harness

- [ ] 4.1 Add a controlled probe harness that creates and removes ephemeral
  source files under approved scan roots.
- [ ] 4.2 Prove every current enforced Grit check fails on an injected matching
  source shape with the expected Habitat rule id.
- [ ] 4.3 Prove negative/false-positive probes where existing native samples do
  not cover the row's false-positive model.
- [ ] 4.4 Prove probe cleanup leaves `git status --short` clean.
- [ ] 4.5 Record generated-output and protected-path non-claims.
- [ ] 4.6 Do not implement this harness until `habitat-effect-grit-adapter` or
  a reviewed typed Grit adapter design accepts scan-root injection, command
  provenance, exact rule mapping, path-control probes, and cleanup.

## 5. Baseline Contract

- [ ] 5.1 Add explicit committed empty baseline files for every current
  enforced Grit check that lacks one.
- [ ] 5.2 Add or update tests for explicit empty Grit baseline behavior.
- [ ] 5.3 Prove `baseline-integrity` accepts explicit empty Grit baselines.
- [ ] 5.4 Prove baseline expansion cannot make Grit baselines grow outside the
  accepted rule-introduction policy.
- [ ] 5.5 Realign H5/H6 wording so historical missing-file behavior is not
  confused with the explicit Grit baseline record introduced by this repair.

## 6. Apply Codemod Proof

- [ ] 6.1 Prove target public `/ops` exports exist for injected
  `deep_import_to_public_surface` cases.
- [ ] 6.2 Inventory live matches before any apply proof and prove every matched
  imported symbol has a public target export or is refused.
- [ ] 6.3 Add a missing-export negative fixture/probe proving Habitat refuses
  or leaves an unsafe deep import unchanged.
- [ ] 6.4 Prove `habitat fix --dry-run` on an injected matching file produces
  no file changes.
- [ ] 6.5 Prove real `habitat fix` on an injected matching file produces only
  the approved import-specifier and Biome-format diff.
- [ ] 6.6 Prove `import type` remains type-only after the rewrite.
- [ ] 6.7 Run selected typecheck/test gates after the applied diff.
- [ ] 6.8 Revert probe changes through normal Git cleanup and prove the
  worktree is clean.
- [ ] 6.9 Do not run destructive apply proof until `habitat-effect-grit-adapter`
  or a reviewed transaction design is accepted.

## 7. Effect/Substrate Gate

- [ ] 7.1 Evaluate whether implementation needs new Grit adapter
  parse/provenance/transaction code.
- [ ] 7.2 Fill the substrate decision table in `phase-record.md` before tasks
  4, 6, or adapter tests begin.
- [ ] 7.3 If any Effect Trigger Matrix row fires, open
  `habitat-effect-grit-adapter` or `habitat-effect-command-runner` before
  dependent code changes.
- [ ] 7.4 Record the accepted substrate decision in the phase record and proof
  matrix.
- [ ] 7.5 If a Grit adapter substrate opens, require tests for no JSON,
  malformed JSON, wrapper noise, schema drift, empty scan roots, pattern miss,
  cache provenance, and cache/fresh status.

## 8. Downstream Realignment

- [ ] 8.1 Update `openspec/changes/habitat-grit-catalog/tasks.md` and phase
  record so historical H5 proof is accurately classified.
- [ ] 8.2 Update `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md`
  where H6 retirements rely on H5 proof.
- [ ] 8.3 Update Habitat project records and ledgers listed in
  `workstream/downstream-realignment-ledger.md`.
- [ ] 8.4 Update README/generator guidance if proof, baseline, or apply safety
  rules change user-facing behavior.
- [ ] 8.5 Block the first new Grit pilot from using generated enforced rules
  until `habitat-pattern-generator-metadata-repair` lands or this repair
  records a reviewed stop-gate path.

## 9. Verification

- [ ] 9.1 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [ ] 9.2 `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
- [ ] 9.3 `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts`
- [ ] 9.4 `bun run habitat:check -- --json --tool grit-check`
- [ ] 9.5 `bun run habitat:check -- --json --rule grit-check`
- [ ] 9.6 injected-violation proof suite for all current Grit checks
- [ ] 9.7 explicit Grit baseline behavior proof suite
- [ ] 9.8 old-mechanism parity probes:
  `wrapped-script`, `wrapped-eslint`, and `wrapped-test`
- [ ] 9.9 `nx run @internal/habitat-harness:grit:check --outputStyle=static`
- [ ] 9.10 `bun run habitat:fix -- --dry-run`
- [ ] 9.11 controlled apply proof for `deep_import_to_public_surface`
- [ ] 9.12 selected typecheck/test gates for the applied-diff surface
- [ ] 9.13 stale-record scan:
  `rg -n "H5|grit|Grit|baseline|parity|fixture|current-tree|apply|codemod|retired|closed|CLOSED|green|proof" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'`
- [ ] 9.14 full-depth-language scan over Habitat initiative docs
- [ ] 9.15 `bun run openspec:validate`
- [ ] 9.16 `workstream/command-proof-log.md` contains a row for every accepted
  proof label above.

## 10. Closure

- [ ] 10.1 Record verification results and non-claims in the phase record.
- [ ] 10.2 Mark all accepted P1/P2 findings repaired or source-rejected.
- [ ] 10.3 Ensure downstream realignment ledger has patch/no-patch/deferred
  disposition for each affected record.
- [ ] 10.4 Commit via Graphite with a clean worktree.
