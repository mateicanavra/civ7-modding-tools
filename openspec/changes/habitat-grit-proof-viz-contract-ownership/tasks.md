## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, Swooper routers,
  mapgen normalization spec authority, discrepancy log, corpus ledger, and
  proof matrix source.
- [x] 1.3 Reclassify the row from bounded blocker checkpoint to VCO closure
  because source remediation is row-owned and explicitly in scope.

## 2. Predicate, Fixture, And Inventory

- [x] 2.1 Repair
  `.grit/patterns/habitat/checks/viz_contract_ownership.md` with
  `import_statement(source=$source)` and row-owned import source-shape guards.
- [x] 2.2 Prove the focused native fixture with
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter viz_contract_ownership --json`.
- [x] 2.3 Prove full native corpus health with
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`.
- [x] 2.4 Run parser inventory over current standard recipe stage source and
  record zero current VCO candidates after source remediation.

## 3. Source Remediation

- [x] 3.1 Move the shared map-ecology biome-id visualization helper to
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/viz.ts`.
- [x] 3.2 Update `plotBiomes.ts` to consume the stage owner surface.
- [x] 3.3 Update the focused plot-biomes viz metadata test to import the stage
  owner surface.
- [x] 3.4 Run focused Swooper test proof for the moved helper.
- [x] 3.5 Run required package build/check proof from the Swooper routers.

## 4. Wrapper, Baseline, And Injected Proof

- [x] 4.1 Prove per-rule Habitat wrapper/current-tree behavior with
  `bun run habitat:check -- --json --rule grit-viz-contract-ownership`.
- [x] 4.2 Prove aggregate `grit-check` health with
  `bun run habitat:check -- --json --tool grit-check`.
- [x] 4.3 Prove explicit empty baseline ownership and `baseline-integrity`.
- [x] 4.4 Update the row-specific injected probe to exercise the repaired
  cross-step private-viz import class.
- [x] 4.5 Run clean-start injected probe proof and record the VCO row result.

## 5. Downstream Realignment

- [x] 5.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 5.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 5.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 5.4 Preserve no-change dispositions for taxonomy, invariant corpus,
  discrepancy log, recovery, and command docs.

## 6. Verification

- [x] 6.1 `bun run openspec -- validate habitat-grit-proof-viz-contract-ownership --strict`
- [x] 6.2 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.3 `bun run openspec:validate`
- [x] 6.4 `git diff --check HEAD^..HEAD`
- [x] 6.5 `git diff --check`
- [x] 6.6 deleted-file guard
- [x] 6.7 commit via Graphite with a clean worktree
