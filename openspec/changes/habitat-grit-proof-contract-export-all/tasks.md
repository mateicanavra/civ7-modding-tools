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
  invariant corpus, taxonomy, discrepancy log, H5 catalog records, H6
  enforcement records, official Grit docs pack, local Grit corpus extraction,
  and aggregate Grit proof repair.
- [x] 2.2 Confirm `rules.json` metadata for `grit-contract-export-all`.
- [x] 2.3 Confirm current Grit predicate file classes and exact Habitat Grit
  adapter scan roots.
- [x] 2.4 Confirm the old ESLint/script value-star invariant and retirement
  parity claim.
- [x] 2.5 Reconcile registry metadata, taxonomy, discrepancy records, corpus
  row, and Grit predicate on domain-root facade coverage.
  - Current closure disposition: this row proves the contract/op-local
    predicate only. Broader domain-root facade value-star closure remains a
    non-claim and requires sibling proof or a predicate expansion packet.
- [x] 2.6 Decide whether `export * as name from ...` is allowed, forbidden, or
  sibling-owned.
  - Current row disposition: namespace re-export is a non-match/allowed control
    for this predicate. Any policy change needs a sibling row or accepted scope
    expansion.

## 3. Native Fixture And Parser-Edge Proof

- [x] 3.1 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter contract_export_all --json`.
- [x] 3.2 Add or record proof for positive value-star fixtures in step
  contract, dotted step contract, domain op index, domain op contract/types,
  rules directory, strategies directory, and non-index rules/strategies paths.
- [x] 3.3 Add or record proof for negative named value exports and named type
  exports.
  - Native proof covers named value export and `export { type ... }`; it does
    not claim `export type *`.
- [x] 3.4 Add or record proof for `export type *` allowance.
  - Native fixture proof remains unavailable because the pinned markdown
    fixture parser rejected the syntax. Current-tree parser inventory found
    135 in-scope `export type *` declarations, and the Habitat per-rule and
    aggregate wrapper proofs passed with zero diagnostics, so the active
    wrapper path proves type-star allowance for current source.
- [x] 3.5 Add or record proof for namespace re-export classification.
- [x] 3.6 Add path-control fixtures for domain root/config/index facades,
  op-local `rules.ts`, `.tsx` predicate control, matching-root test paths,
  non-op shared files, and package barrels.
  - Native controls cover domain root/config, op-local `rules.ts`, `.tsx`,
    and package barrels. Current parser inventory records broader
    domain-root/config/facade value-star exports as out of scope, not as CEA
    closure.
- [x] 3.7 Record fixture class counts and parser-edge proof ids in the
  aggregate proof matrix.

## 4. Current-Tree Proof

- [x] 4.1 Run `bun run habitat:check -- --json --rule grit-contract-export-all`
  and record output class, selected rule ids, diagnostics count, and baseline
  state.
  - Current proof selected exactly `grit-contract-export-all` plus
    `baseline-integrity`; both passed with zero diagnostics.
- [x] 4.2 Record exact Habitat wrapper scan roots and selected rule projection.
  - Exact adapter scan roots are recorded from source; selected rule
    projection is proven by the current per-rule wrapper command.
- [ ] 4.3 Run bounded raw Grit acquisition over domain and recipe roots or
  consume an accepted adapter proof id.
  - Blocked/non-claim for closure; prior bounded raw seed is not consumed as
    row proof.
- [ ] 4.4 Prove how bounded raw roots relate to wrapper scan roots, including
  omitted-root projection proof or explicit non-claims.
- [x] 4.5 Run current-tree inventory for value-star and type-star exports inside
  and outside effective scope.
- [x] 4.6 Record live domain-root facade value-star examples and link predicate
  expansion proof, sibling implementation/proof ids, or downstream blocked
  downgrade.
  - Current disposition is downstream blocked/unproven, not predicate
    expansion or sibling implementation.

## 5. Injected Violation Proof

- [x] 5.1 Complete or consume `habitat-effect-grit-adapter`, or record an
  accepted typed Grit adapter substrate with equivalent proof, before
  implementing probe creation/cleanup, parser classification, pattern
  projection, or command provenance.
- [ ] 5.2 Add positive recipe step contract probe that fails the exact Habitat
  rule id.
  - Row-specific injected corpus currently proves the registered domain-op
    index probe and outside-scope domain-root path control. Step-contract
    injected coverage remains a non-claim; native fixtures cover the
    step-contract syntax branch.
- [x] 5.3 Add positive domain op probe that fails the exact Habitat rule id.
- [ ] 5.4 Add rules/strategies directory probes while the current predicate
  includes those classes.
  - Native fixtures cover rules/strategies syntax branches; registered
    injected corpus has one match/control pair for this row, so
    rules/strategies injected coverage remains a non-claim.
- [x] 5.5 Add outside-scope path-control probe.
- [x] 5.6 Prove cleanup leaves `git status --short` clean after success and
  failure.
- [x] 5.7 Record protected generated-output non-claims.
- [x] 5.8 Record the Effect/no-Effect substrate decision and prove a non-Effect
  substrate supplies tagged failures, service-injected tests, explicit command
  provenance, scan-root provenance, parser classification, and cleanup
  behavior before use.
- [x] 5.9 Block row closure if the implementation preserves string-only JSON
  recovery, exit-code-only command facts, cleanup by convention, or unit tests
  that require real repo mutation.

## 6. Baseline Proof

- [x] 6.1 Add explicit empty baseline file
  `tools/habitat-harness/baselines/grit-contract-export-all.json`.
- [x] 6.2 Prove `baseline-integrity` accepts the explicit empty baseline.
- [x] 6.3 Prove an injected finding is unbaselined and fails.
- [x] 6.4 Link baseline expansion safety to the accepted scaffold/baseline
  contract repair owner before claiming shared baseline mutation safety.
  - Current proof consumes the accepted explicit empty-baseline owner contract
    for baseline inventory and integrity. Shared baseline mutation safety is
    not broadened beyond the accepted scaffold contract.

## 7. Downstream Realignment

- [x] 7.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
  with proof ids and fixture counts.
- [x] 7.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  for this row after implementation.
- [x] 7.3 Update `docs/projects/habitat-harness/taxonomy.md` and
  `docs/projects/habitat-harness/discrepancy-log.md` if their wording implies
  stronger domain-root facade coverage than this row supplies.
- [x] 7.4 Update H5/H6 historical records if their wording implies stronger
  proof than implementation supplies.
- [x] 7.5 Update `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  for H5, H6, baseline, and stale-record truth after aggregate proof ids exist.
- [x] 7.6 Update command docs only if user-visible diagnostics or remediation
  text changes.
  - No user-visible diagnostic or remediation text changed in this row.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-grit-proof-contract-export-all --strict`
- [x] 8.2 native fixture proof
- [x] 8.3 type-star proof
- [x] 8.4 namespace re-export disposition
- [x] 8.5 Habitat current-tree wrapper proof
- [x] 8.6 wrapper scan-root and projection proof
- [ ] 8.7 bounded raw acquisition or adapter proof id
- [x] 8.8 current-tree export inventory
- [x] 8.9 domain-root facade disposition
- [ ] 8.10 injected step-contract and domain-op proof
  - Domain-op injected proof is complete; step-contract and rules/strategies
    injected branch proof remain non-claims covered by native fixture proof.
- [x] 8.11 outside-scope path-control proof
- [x] 8.12 explicit baseline proof
- [x] 8.13 baseline owner linkage
- [x] 8.14 aggregate proof matrix aligned
- [x] 8.15 recovery claim ledger aligned
- [x] 8.16 active-packet language guardrail scan
- [x] 8.17 `git diff --check`
- [x] 8.18 `bun run openspec:validate`
- [x] 8.19 commit via Graphite with a clean worktree
