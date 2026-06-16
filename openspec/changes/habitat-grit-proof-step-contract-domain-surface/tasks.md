## 1. Design And Review Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Run product/outcome, Grit semantics, architecture, evidence, system,
  and Effect/substrate review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Validate this packet with OpenSpec strict mode after review repairs.

## 2. Source And Authority Refresh

- [x] 2.1 Reread the takeover frame, Grit corpus ledger, recovery claim ledger,
  invariant corpus, taxonomy, discrepancy log, H5/H6 records, official Grit
  docs pack, local Grit corpus extraction, stage/step authoring docs,
  `IMPORTS.md`, and aggregate Grit proof repair.
- [x] 2.2 Confirm `rules.json` metadata for
  `grit-step-contract-domain-surface`.
- [x] 2.3 Confirm current Grit predicate file classes and exact Habitat Grit
  adapter scan roots.
- [x] 2.4 Confirm the retired step-contract import invariant and parity claim.
  - Confirmed as a historical parity target only; parity closure remains
    unclaimed.
- [x] 2.5 Reconcile registry metadata, raw regex, adapter roots, stage/step
  authoring docs, current contract filenames, and current source-specifier
  predicate.
  - Current row repaired the gap: registry metadata names
    `contract.ts`/`*.contract.ts`, the current predicate matches those
    filename classes, recipe-local test dirs are excluded, and the source
    predicate is exact for optional-quote `@mapgen/domain/<domain>/<tail>`.
- [x] 2.6 Confirm neighboring boundaries with `grit-recipe-domain-surface`,
  `grit-domain-deep-import`, and `grit-contract-export-all`.
  - Native fixtures record overlap families for current-predicate behavior;
    reviewed multi-rule closure remains pending.

## 3. Native Fixture And Parser-Edge Proof

- [x] 3.1 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter step_contract_domain_surface --json`.
- [x] 3.2 Add or record proof for positive default import, named import,
  namespace import, type import, side-effect import, named re-export, type
  re-export, and star re-export fixtures.
- [x] 3.3 Add or record proof that exact domain root imports do not report.
- [x] 3.4 Add or record proof that `/ops`, `/config.js`, `ops/<tail>`,
  `ops-by-id`, `rules/<tail>`, `strategies/<tail>`, `shared/<tail>`, `types.js`,
  and arbitrary domain subpaths report this row in matching step contracts.
- [x] 3.5 Add source-specifier lookalike controls for prefixed package strings,
  relative strings containing `@mapgen/domain/<domain>/<tail>`, and other
  non-package specifiers matched by the superseded leading-wildcard source
  regex.
  - Predicate repaired; these are now ignore controls, not current-predicate
    positives.
- [x] 3.6 Add path-control fixtures for `.tsx`, maps, ordinary recipe files,
  non-step contract files, stage artifact contract files, other mods,
  recipe-local tests, filename lookalikes, and generated paths.
  - Other-mod remains raw predicate context, not all-mod wrapper enforcement.
    Recipe-local test and filename-lookalike cases are now controls.
    Generated-output-shaped paths are fixture controls only; no generated
    output was edited.
- [x] 3.7 Record fixture class counts and parser-edge proof ids in the
  aggregate proof matrix.

## 4. Current-Tree Proof

- [x] 4.1 Run
  `bun run habitat:check -- --json --rule grit-step-contract-domain-surface`
  and record output class, selected rule ids, diagnostics count, and baseline
  state.
  - Current row-specific wrapper proof is recorded by
    `SCDS-PER-RULE-SELECTOR-2026-06-16`; this remains distinct from native
    fixture proof, all-mod wrapper enforcement proof, raw acquisition, and
    product proof.
- [x] 4.2 Record exact Habitat wrapper scan roots and selected rule projection.
  - Exact adapter scan roots are recorded from source and parser inventory;
    selected rule projection proof is current through
    `SCDS-PER-RULE-SELECTOR-2026-06-16` and
    `SCDS-HABITAT-GRIT-TOOL-2026-06-16`.
- [ ] 4.3 Run bounded raw Grit acquisition over the Swooper recipe root or
  consume an accepted adapter proof id.
  - Blocked/non-claim for closure; parser inventory is not raw Grit
    acquisition.
- [ ] 4.4 Prove how bounded raw roots relate to wrapper scan roots, including
  omitted-root projection proof or explicit non-claims.
- [x] 4.5 Run current-tree inventory for matching step-contract filenames and
  domain imports.
- [x] 4.6 Record live domain-root import examples and zero-candidate evidence
  for domain subpaths, source-specifier lookalikes, filename lookalikes, `.tsx`,
  and recipe-local tests.

## 5. Injected Violation Proof

- [x] 5.1 Consume the accepted shared injected-probe runner for row-specific
  probe creation, path control, exact rule projection, clean-start/final git
  state, and cleanup proof.
- [x] 5.2 Add positive step-contract probe that fails the exact Habitat rule id.
  - Recorded by `SCDS-INJECTED-PROBE-2026-06-16`.
- [x] 5.3 Disposition parser-edge probes for namespace imports, type imports,
  side-effect imports, and export forms.
  - Parser-edge forms are covered by native fixtures; this row does not claim a
    full parser-edge injected matrix.
- [x] 5.4 Add exact allowed-surface path control for domain-root imports.
  - Domain root is a native fixture control; injected path control uses a
    non-step contract control path.
- [x] 5.5 Add forbidden-source proof for `/ops`, `/config.js`, `ops/<tail>`,
  `ops-by-id`, `rules/<tail>`, `strategies/<tail>`, `shared/<tail>`, and
  `types.js`.
  - Native fixtures cover the source family matrix; injected proof uses one
    representative unbaselined domain-subpath violation.
- [x] 5.6 Add source-specifier lookalike controls for prefixed package strings,
  relative strings containing `@mapgen/domain/<domain>/<tail>`, and other
  non-package specifiers matched by the old leading-wildcard source regex.
  - Predicate repaired; these now remain native controls, not injected probes.
- [x] 5.7 Add outside-scope and classified-scope path-control proof for maps,
  ordinary recipe files, non-step contract files, stage artifact contract files,
  other mods, `.tsx`, recipe-local tests, and filename lookalikes.
  - Native fixtures cover the full path-control set; injected proof records a
    clean non-step contract control. Other-mod remains a raw predicate context
    non-claim for wrapper enforcement.
- [x] 5.8 Record neighboring-rule overlap disposition for recipe-domain,
  domain-deep, and contract-export cases.
  - This row owns step-contract domain-root-only remediation; neighboring rows
    retain their broader surfaces.
- [x] 5.9 Prove cleanup leaves `git status --short` clean after injected run.
- [x] 5.10 Record protected generated-output non-claims.
- [x] 5.11 Record the substrate decision.
  - This row consumes the accepted shared injected-probe runner; it does not
    claim Effect adapter closure or raw Grit acquisition.
- [x] 5.12 Block row closure if injected proof leaves residue or hides failures.
  - Clean-start injected proof reported clean initial/final git state and clean
    probe-root cleanup; aggregate runner exit remains nonzero only for accepted
    unrelated DDIT.

## 6. Baseline Proof

- [x] 6.1 Record explicit empty baseline file
  `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`.
  - Current restacked shared baseline file proof is inherited through
    `HGPR-BASELINE-FILES-2026-06-15`; this is not a row-local baseline
    mutation claim.
- [x] 6.2 Record accepted `baseline-integrity` proof through
  `HGPR-BASELINE-INTEGRITY-2026-06-15`.
- [x] 6.3 Prove an injected finding is unbaselined and fails.
  - `SCDS-INJECTED-PROBE-2026-06-16` reports one diagnostic at the injected
    step-contract path with the explicit empty baseline unchanged.
- [x] 6.4 Link shared baseline owner/integrity to
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`; no separate SCDS baseline-mutation
  claim is made.

## 7. Downstream Realignment

- [x] 7.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
  with proof ids and fixture counts.
- [x] 7.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  for this row after implementation.
- [ ] 7.3 Update `docs/projects/habitat-harness/taxonomy.md`,
  `docs/projects/habitat-harness/discrepancy-log.md`, `IMPORTS.md`, and
  stage/step docs only if implementation changes policy or remediation text.
- [ ] 7.4 Update H5/H6 historical records if their wording implies stronger
  proof than implementation supplies.
- [x] 7.5 Update `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  for H5, H6, baseline, and stale-record truth after aggregate proof ids exist.
  - Current front-door recovery ledger realignment is recorded in the HG
    record-truth follow-up layer; it does not close raw acquisition, injected
    row-local proof, apply safety, or product proof.
- [ ] 7.6 Update command docs only if user-visible diagnostics or remediation
  text changes.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-grit-proof-step-contract-domain-surface --strict`
- [x] 8.2 native fixture proof
- [x] 8.3 parser-edge import/export proof
- [x] 8.4 domain-root allowed proof
- [x] 8.5 forbidden-source family proof
- [x] 8.6 source-specifier lookalike disposition
- [x] 8.7 filename lookalike disposition
- [x] 8.8 other-mod and wrapper-scope disposition
- [x] 8.9 recipe-local test-path classification
- [x] 8.10 neighboring-rule overlap disposition
- [x] 8.11 Habitat current-tree wrapper proof inherited through
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`
- [x] 8.12 wrapper scan-root and projection proof inherited through
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`
- [ ] 8.13 bounded raw acquisition or adapter proof id
- [x] 8.14 current-tree contract/import inventory
- [x] 8.15 injected step-contract proof
- [x] 8.16 outside-scope path-control proof
- [x] 8.17 explicit baseline proof inherited through
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`
- [x] 8.18 baseline owner linkage inherited through
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`
- [x] 8.19 aggregate proof matrix aligned
- [x] 8.20 recovery claim ledger aligned for current shared proof and
  non-claim state
- [x] 8.21 active-packet language guardrail scan
- [x] 8.22 `git diff --check`
- [x] 8.23 `bun run openspec:validate`
- [x] 8.24 commit via Graphite with a clean worktree
