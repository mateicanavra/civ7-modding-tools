## 1. Grit Infrastructure

- [ ] 1.1 `bun add -d @getgrit/cli`; `bunx grit init`; `.grit/grit.yaml`
  loading `tools/habitat-harness/patterns/grit/`; commit `.grit/grit.yaml`;
  gitignore `.grit/.gritmodules` and cache artifacts.
- [ ] 1.2 Harness grit wrapper: run `grit check --json`, derive pass/fail from
  results vs baseline (never exit code); fixture-runner test harness for
  patterns.

## 2. Pattern Porting (check mode)

- [ ] 2.1 Port `scope:domain-surface` family (5 patterns) with fixtures;
  declare `parityWith` eslint/script ids.
- [ ] 2.2 Port `scope:runtime-purity` family (6 patterns, including the G3
  runtime-value ban — no Civ7 runtime imports in mapgen-core engine/core
  paths) with positive/negative fixtures (selector-derived patterns
  especially).
- [ ] 2.3 Port `scope:stage-isolation` family (G1, G2, G5, G8, G9 → 5
  patterns, each with fixtures); G6/G7 explicitly remain habitat-native
  (record in rule pack).
- [ ] 2.4 Port ownership family (4 patterns, each with fixtures): adapter
  `/base-standard/` isolation (baseline = current 6 allowlisted files,
  migrated from the script allowlist), control-orpc contract-ownership,
  viz contract ownership (G10: no shared `steps/viz.ts` hubs, no cross-step
  private viz imports), and SDK mapgen entrypoint isolation (G11: SDK root
  must not import `./mapgen`; `@civ7/adapter/civ7` importable only under
  `src/mapgen/`).
- [ ] 2.5 domain-refactor-guardrails port scope (H6 consumes this enumeration
  for its retirement table): the BOUNDARY-profile families port to grit in
  this slice — ops-import bans (adapter/context/map-projection/
  domain-root-config), cross-domain deep imports, and RNG/engine import bans
  outside runtime layers. The FULL-profile-only families (JSDoc presence,
  schema descriptions, config-merge bans) REMAIN wrapped (habitat wrapped
  rule — not ported, not retired).
- [ ] 2.6 Parity run: dual-execute originals vs grit rules; record the parity
  table (identical finding sets) in the phase record; for every ported rule
  whose current-tree finding set is empty, run an injected-violation dual run
  (synthetic violation file through BOTH the original mechanism and the grit
  port; assert both flag it) and record the row as `empty/empty +
  probe-confirmed`; any delta follows the stop condition.

## 3. Codemods (apply mode)

- [ ] 3.1 `export-star-to-named` codemod with input/output fixtures; wire into
  `habitat fix`; apply runs Biome format after rewrite.
- [ ] 3.2 `deep-import-to-public-surface` codemod for mechanical mappings
  only; ambiguous cases emit diagnostics (fixture both).

## 4. File Layer

- [ ] 4.1 Rule-pack file-layer rules for the three generated zones with
  regenerate remediation messages; `habitat check --staged` protected-glob
  enforcement.
- [ ] 4.2 CI regenerate-and-diff gates for BOTH repo-runnable generators:
  `gen:maps` outputs AND `civ7-map-policy:gen-tables` (`civ7-tables.gen.ts`)
  — drift detection. `packages/civ7-types/generated/**` is produced by the
  external resources workflow and cannot regenerate in CI: it gets
  write-protection only; record that gap explicitly in the phase record,
  along with the staged-edit trade-off from design.md.

## 5. Verification And Closure

- [ ] 5.1 All fixtures green; `bunx nx affected -t grit:check` green;
  generated-zone staged probe fails then removed.
- [ ] 5.2 Ratchet entries for every rule introduced in this slice — all grit
  patterns AND the three file-layer generated-zone rules (empty baselines,
  locked at adoption); grit patterns locked where parity shows zero findings;
  adapter-boundary starts at 6.
- [ ] 5.3 `bun run build && bun run check && bun run test` unchanged-green;
  `bun run openspec -- validate habitat-grit-catalog --strict`; realignment +
  closure per workstream record.
