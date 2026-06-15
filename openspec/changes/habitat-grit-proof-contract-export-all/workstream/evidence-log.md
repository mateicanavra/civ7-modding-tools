# Evidence Log - Contract Export All Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| CEA-E1 | `.grit/patterns/habitat/checks/contract_export_all.md` | Pattern exists with `level: error`, `language js(typescript)`, value-star match, type-star text exclusion, and filename predicates. | Rule semantics are authored. | No current-tree or injected proof. |
| CEA-E2 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-contract-export-all` registered as enforced `grit-check`. | Habitat rule identity and owner metadata exist. | Registry scope is less exact than Grit predicate. |
| CEA-E3 | `docs/projects/habitat-harness/invariant-corpus.md` | Old `eslint-contract-export-all` invariant recorded with type-star allowance. | Retired mechanism authority exists. | No current proof that Grit fully replaces it. |
| CEA-E4 | `docs/projects/habitat-harness/taxonomy.md` and `discrepancy-log.md` | Domain-root facade concerns are linked to domain-surface family. | Broader public-surface authority exists. | Current Grit predicate does not prove those facades. |
| CEA-E5 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter contract_export_all --json` | Exit 0; one testable pattern succeeded with one positive and one negative sample. | Native fixture proof. | No type-star, current-tree, baseline, injected, or rewrite proof. |
| CEA-E6 | `bun run habitat:check -- --json --rule grit-contract-export-all` | Exit 0; report contains `grit-contract-export-all` and `baseline-integrity`, both pass. | Current Habitat wrapper proof for valid rule selection. | No injected violation or selector false-green proof. |
| CEA-E7 | `GRIT_TELEMETRY_DISABLED=true grit check mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes --json --level error --no-cache` | Exit 0 with JSON `results: []`. | Bounded raw zero-result seed for domain/recipe roots. | Does not prove exact Habitat projection or injected behavior. |
| CEA-E8 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/domain` and `/tmp/.../src/recipes`. | Value-star reports in op index, op `rules/index.ts`, op `strategies/index.ts`, and step `contract.ts`; named export, type-star, non-op shared index, and op-local `rules.ts` do not report. | Direct Grit behavior for core positives and controls. | Disposable probe is not a committed fixture or Habitat wrapper proof. |
| CEA-E9 | `rg "export \\* from" mods/mod-swooper-maps/src/domain -g '*.ts' \| rg -v "export type \\*"` | Live value-star facades exist in domain root/config/index/resource/orogeny files outside current predicate. | Domain-root facade gap exists. | Does not decide whether to expand this row. |
| CEA-E10 | `git status --short --branch` before packet | Clean branch header. | Work started from clean repo state. | Not cleanup proof for future injected probes. |
| CEA-E11 | `docs/projects/habitat-harness/research/official-docs-effect.md` and `local-effect-adoption-fit.md` | Effect supplies typed error/requirement/service/resource/command primitives; local research names Grit adapter hardening as a strong fit. | Substrate decision is evidence-gated for injected proof. | Effect does not prove Grit, Biome, Nx, baseline, owner-layer, or runtime semantics. |
| CEA-E12 | `tools/habitat-harness/src/lib/grit.ts` | Current adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, recipes, maps, and domain. | Exact wrapper-root truth is available. | Bounded raw domain/recipe proof is not whole-wrapper proof. |

## Evidence Still Required

- expanded fixture matrix or accepted adapter proof;
- native or adapter proof for `export type *`;
- named type export control;
- namespace re-export disposition;
- exact wrapper-root and omitted-root projection proof;
- parser-grade current-tree inventory or accepted adapter proof;
- Effect/manual substrate decision for injected proof;
- injected positive step-contract and domain-op probes;
- outside-scope path-control probe;
- explicit empty baseline proof;
- baseline owner linkage;
- domain-root facade predicate expansion, sibling implementation/proof ids, or
  downstream blocked downgrade;
- aggregate proof matrix proof-id linkage;
- stale-record realignment.
