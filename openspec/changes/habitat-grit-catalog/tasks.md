## 1. Grit Infrastructure

- [x] 1.1 Add pinned `@getgrit/cli`; `.grit/grit.yaml` loads checked
  `.grit/patterns/habitat/checks/*.md` patterns; commit `.grit/grit.yaml`;
  gitignore `.grit/.gritmodules` and cache artifacts.
- [x] 1.2 Harness grit adapter: `grit:check` routes through
  `habitat check --tool grit-check`, which runs exactly one native
  `grit check --json --level error` scan per process, maps results to
  Habitat rule IDs, and derives pass/fail from unbaselined findings because
  the pinned Grit CLI exits 0 on JSON findings. Native `grit patterns test`
  is the sample authority; no temp-workspace Grit test harness.

## 2. Pattern Porting (check mode)

- [x] 2.1 Port `scope:domain-surface` family (5 patterns) with fixtures;
  declare `parityWith` eslint/script ids.
- [x] 2.2 Port `scope:runtime-purity` family (5 patterns, including the G3
  runtime-value ban — no Civ7 runtime imports in mapgen-core engine/core
  paths) with positive/negative fixtures. Runtime config-merge checks remain
  in the wrapped full-profile guardrail until a safe owner is introduced.
- [x] 2.3 Port `scope:stage-isolation` family (G2, G5, G8, G9 → 4
  patterns, each with fixtures). G1 milestone-prefixed recipe IDs and G6/G7
  doc/code sync remain in the wrapped/native guardrails; record the G1 Grit
  parity stop in the phase record.
- [x] 2.4 Port ownership family (4 patterns, each with fixtures): adapter
  runtime `/base-standard/` import isolation (Grit baseline empty; the legacy
  broad string script currently has 7 allowlisted provenance/test files),
  control-orpc contract-ownership,
  viz contract ownership (G10: no shared `steps/viz.ts` hubs, no cross-step
  private viz imports), and SDK mapgen entrypoint isolation (G11: SDK root
  must not import `./mapgen`; `@civ7/adapter/civ7` importable only under
  `src/mapgen/`).
- [x] 2.5 domain-refactor-guardrails port scope (H6 consumes this enumeration
  for its retirement table): the current BOUNDARY-profile families port to
  grit in this slice — ops adapter/context crossing, map projection/effect
  dependency keys, and domain-root config imports. FULL-profile families
  (cross-domain deep imports, RNG/engine import bans, config-merge bans,
  JSDoc/schema checks, foundation/ecology special cases) REMAIN wrapped.
- [x] 2.6 Parity evidence: current-tree originals remain green while
  `grit:check` is green/empty; every ported Grit rule has positive and
  negative fixtures. Rules that failed safe Grit parity (G1 milestone IDs and
  cross-file named export synthesis for contract/public-surface `export *`)
  remain under their original mechanisms and are not retired by H6.

## 3. Codemods (apply mode)

- [x] 3.1 `export-star-to-named` decision: not approved in H5. Pure Grit
  cannot safely synthesize named exports from target modules. The Grit check
  pattern does distinguish value `export *` from allowed `export type *`; keep
  the original ESLint guard authoritative for the named-export synthesis rule.
- [x] 3.2 `deep-import-to-public-surface` codemod for mechanical
  `@mapgen/domain/<domain>/ops/<private>` mappings only; preserve
  `import type`; wire into `habitat fix`; apply runs Biome format after
  rewrite.

## 4. File Layer

- [x] 4.1 Rule-pack file-layer rules for the three generated zones with
  regenerate remediation messages; `habitat check --staged` protected-glob
  enforcement.
- [x] 4.2 CI regenerate-and-diff gates for BOTH repo-runnable generators:
  `gen:maps` outputs AND `civ7-map-policy:gen-tables` (`civ7-tables.gen.ts`)
  — drift detection. `packages/civ7-types/generated/**` is produced by the
  external resources workflow and cannot regenerate in CI: it gets
  write-protection only; record that gap explicitly in the phase record,
  along with the staged-edit trade-off from design.md.

## 5. Verification And Closure

- [x] 5.1 All fixtures green; `bunx nx affected -t grit:check` green;
  generated-zone staged probe fails then removed.
- [x] 5.2 Ratchet entries for every rule introduced in this slice — all grit
  patterns AND the three file-layer generated-zone rules use empty baselines
  and are locked at adoption. Adapter runtime-import Grit rule starts empty;
  the legacy broad adapter-boundary script remains wrapped with 7 allowlisted
  provenance/test files until H6 disposition.
- [x] 5.3 `bun run build && bun run check && bun run test` unchanged-green;
  `bun run openspec -- validate habitat-grit-catalog --strict`; realignment +
  closure per workstream record.
