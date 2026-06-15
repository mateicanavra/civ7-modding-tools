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

- [ ] 2.1 Reread the takeover frame, Grit corpus ledger, recovery claim ledger,
  invariant corpus, taxonomy, discrepancy log, H5 catalog records, H6
  enforcement records, official Grit docs pack, local Grit corpus extraction,
  `IMPORTS.md`, `NORMALIZATION-GUARDRAILS.md`, and aggregate Grit proof
  repair.
- [x] 2.2 Confirm `rules.json` metadata for
  `grit-recipe-domain-surface`.
- [x] 2.3 Confirm current Grit predicate file classes and exact Habitat Grit
  adapter scan roots.
- [x] 2.4 Confirm the retired recipe import lint/test invariant and retirement
  parity claim.
- [ ] 2.5 Reconcile registry metadata, import policy, taxonomy, corpus row, and
  Grit predicate on exact domain-root, `/ops`, and `/config.js` surfaces.
- [x] 2.6 Confirm neighboring boundaries with `grit-domain-deep-import`,
  `grit-step-contract-domain-surface`, and domain-import apply rows.
  - Current row records the boundary: `/ops/<tail>` is sibling-owned by
    `grit-domain-deep-import`, `ops-by-id` remains blocked on that row's
    defect repair, and step-contract overlap remains a neighboring proof
    dependency.

## 3. Native Fixture And Parser-Edge Proof

- [x] 3.1 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_domain_surface --json`.
- [x] 3.2 Add or record proof for positive default import, named import,
  namespace import, type import, side-effect import, named re-export, type
  re-export, and star re-export fixtures.
- [x] 3.3 Add or record proof for allowed domain-root, exact `/ops`, and exact
  `/config.js` imports.
- [ ] 3.4 Add or record proof for every non-exact source containing `/ops` or
  `/config.js`, including `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`,
  `/ops-private`, `/private/ops`, `/config.js-private`, and
  `/private/config.js`.
  - Partial: native controls prove these forms do not match this current
    predicate; enforcement closure remains blocked until predicate repair,
    sibling proof ids, or downstream blocked records exist.
- [ ] 3.5 Add path-control fixtures for `.tsx`, maps, other mods, recipe-local
  tests, tests outside recipe roots, step contracts, and generated paths.
  - Partial: native fixtures classify recipe-local tests and step-contract
    overlap as current-predicate positives, while `.tsx`, maps, other mods,
    and non-recipe tests are non-matching controls. Generated outputs remain
    protected non-targets, not fixture proof targets.
- [x] 3.6 Record fixture class counts and parser-edge proof ids in the
  aggregate proof matrix.

## 4. Current-Tree Proof

- [ ] 4.1 Run
  `bun run habitat:check -- --json --rule grit-recipe-domain-surface` and
  record output class, selected rule ids, diagnostics count, and baseline
  state.
  - Blocked/non-claim under supervisor boundary because the accepted
    command-trust/selector layer is not available in this row's stack/base.
- [ ] 4.2 Record exact Habitat wrapper scan roots and selected rule projection.
  - Exact adapter scan roots are recorded from source; selected rule projection
    proof remains blocked until command selector truth is available in this
    row's stack/base.
- [ ] 4.3 Run bounded raw Grit acquisition over the recipe root or consume an
  accepted adapter proof id.
  - Blocked/non-claim for closure; prior bounded raw seed is not consumed as
    row proof.
- [ ] 4.4 Prove how bounded raw roots relate to wrapper scan roots, including
  omitted-root projection proof or explicit non-claims.
- [x] 4.5 Run current-tree inventory for `@mapgen/domain/<domain>/<tail>`
  imports and re-exports inside and outside effective scope.
- [x] 4.6 Record live `/ops`, `/config.js`, root, `/ops/<tail>`, `ops-by-id`,
  `config.js/<tail>`, contains-substring lookalike, namespace import,
  side-effect import, and recipe-local test examples or zero-candidate
  evidence.

## 5. Injected Violation Proof

- [ ] 5.1 Complete or consume `habitat-effect-grit-adapter`, or record an
  accepted typed Grit adapter substrate with equivalent proof, before
  implementing probe creation/cleanup, parser classification, pattern
  projection, overlap classification, or command provenance.
- [ ] 5.2 Add positive recipe probe that fails the exact Habitat rule id.
- [ ] 5.3 Add parser-edge probes for namespace imports, type imports,
  side-effect imports, and export forms.
- [ ] 5.4 Add exact allowed-surface path controls for root, `/ops`, `/config.js`,
  and non-exact contains-substring lookalikes.
- [ ] 5.5 Add outside-scope and classified-scope path-control probes for maps,
  other mods, `.tsx`, recipe-local tests, and tests outside recipe roots.
- [ ] 5.6 Add neighboring-rule overlap probes for recipe `rules`/`strategies`
  and step-contract paths, or record accepted predicate partition proof.
- [ ] 5.7 Prove cleanup leaves `git status --short` clean after success and
  failure.
- [ ] 5.8 Record protected generated-output non-claims.
- [ ] 5.9 Record the Effect/no-Effect substrate decision and prove a non-Effect
  substrate supplies tagged failures, service-injected tests, explicit command
  provenance, scan-root provenance, parser classification, overlap
  classification, and cleanup behavior before use.
- [ ] 5.10 Block row closure if the implementation preserves string-only JSON
  recovery, exit-code-only command facts, cleanup by convention, or unit tests
  that require real repo mutation.

## 6. Baseline Proof

- [ ] 6.1 Add explicit empty baseline file
  `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`.
  - Blocked/non-claim under supervisor boundary until the scaffold/baseline
    contract repair surface is accepted.
- [ ] 6.2 Prove `baseline-integrity` accepts the explicit empty baseline.
- [ ] 6.3 Prove an injected finding is unbaselined and fails.
- [ ] 6.4 Link baseline expansion safety to the accepted scaffold/baseline
  contract repair owner before claiming shared baseline mutation safety.
  - Expected interface needed: explicit empty-baseline owner contract plus
    shrink-only expansion rules that make row-local baseline additions safe.

## 7. Downstream Realignment

- [x] 7.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
  with proof ids and fixture counts.
- [x] 7.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  for this row after implementation.
- [ ] 7.3 Update `docs/projects/habitat-harness/taxonomy.md`,
  `docs/projects/habitat-harness/discrepancy-log.md`, and `IMPORTS.md` only if
  implementation changes policy or remediation text.
- [ ] 7.4 Update H5/H6 historical records if their wording implies stronger
  proof than implementation supplies.
- [ ] 7.5 Update `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  for H5, H6, baseline, and stale-record truth after aggregate proof ids exist.
- [ ] 7.6 Update command docs only if user-visible diagnostics or remediation
  text changes.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-grit-proof-recipe-domain-surface --strict`
- [x] 8.2 native fixture proof
- [x] 8.3 parser-edge import/export proof
- [x] 8.4 exact allowed-surface proof
- [ ] 8.5 substring-gap disposition
- [x] 8.6 namespace and side-effect import disposition
- [x] 8.7 recipe-local test-path classification
- [ ] 8.8 neighboring-rule overlap disposition
- [ ] 8.9 Habitat current-tree wrapper proof
- [ ] 8.10 wrapper scan-root and projection proof
- [ ] 8.11 bounded raw acquisition or adapter proof id
- [x] 8.12 current-tree import inventory
- [ ] 8.13 injected recipe proof
- [ ] 8.14 outside-scope path-control proof
- [ ] 8.15 explicit baseline proof
- [ ] 8.16 baseline owner linkage
- [x] 8.17 aggregate proof matrix aligned
- [ ] 8.18 recovery claim ledger aligned
- [x] 8.19 active-packet language guardrail scan
- [x] 8.20 `git diff --check`
- [x] 8.21 `bun run openspec:validate`
- [x] 8.22 commit via Graphite with a clean worktree
