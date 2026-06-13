## 1. Grit Infrastructure

- [ ] 1.1 `bun add -d @getgrit/cli`; `bunx grit init`; `.grit/grit.yaml`
  loading `tools/habitat-harness/patterns/grit/`; gitignore grit cache.
- [ ] 1.2 Harness grit wrapper: run `grit check --json`, derive pass/fail from
  results vs baseline (never exit code); fixture-runner test harness for
  patterns.

## 2. Pattern Porting (check mode)

- [ ] 2.1 Port `scope:domain-surface` family (5 patterns) with fixtures;
  declare `parityWith` eslint/script ids.
- [ ] 2.2 Port `scope:runtime-purity` family (5 patterns) with
  positive/negative fixtures (selector-derived patterns especially).
- [ ] 2.3 Port `scope:stage-isolation` family (G1, G2, G5, G9 → 4 patterns);
  G6/G7 explicitly remain habitat-native (record in rule pack).
- [ ] 2.4 Port ownership family: adapter `/base-standard/` isolation (baseline
  = current 6 allowlisted files, migrated from the script allowlist) and
  control-orpc contract-ownership patterns.
- [ ] 2.5 Parity run: dual-execute originals vs grit rules; record the parity
  table (identical finding sets) in the phase record; any delta follows the
  stop condition.

## 3. Codemods (apply mode)

- [ ] 3.1 `export-star-to-named` codemod with input/output fixtures; wire into
  `habitat fix`; apply runs Biome format after rewrite.
- [ ] 3.2 `deep-import-to-public-surface` codemod for mechanical mappings
  only; ambiguous cases emit diagnostics (fixture both).

## 4. File Layer

- [ ] 4.1 Rule-pack file-layer rules for the three generated zones with
  regenerate remediation messages; `habitat check --staged` protected-glob
  enforcement.
- [ ] 4.2 CI regenerate-and-diff gate for `gen:maps` outputs (drift
  detection); record the staged-edit trade-off from design.md in the phase
  record.

## 5. Verification And Closure

- [ ] 5.1 All fixtures green; `bunx nx affected -t grit:check` green;
  generated-zone staged probe fails then removed.
- [ ] 5.2 Ratchet entries for every pattern (locked where parity shows zero
  findings; adapter-boundary at 6).
- [ ] 5.3 `bun run build && bun run check && bun run test` unchanged-green;
  `bun run openspec -- validate habitat-grit-catalog --strict`; realignment +
  closure per workstream record.
