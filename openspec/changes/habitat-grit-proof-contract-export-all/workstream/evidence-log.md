# Evidence Log - Contract Export All Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| CEA-E1 | `.grit/patterns/habitat/checks/contract_export_all.md` | Pattern exists with `level: error`, `language js(typescript)`, value-star match, type-star text exclusion, and filename predicates. | Rule semantics are authored. | No current-tree or injected proof. |
| CEA-E2 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-contract-export-all` registered as enforced `grit-check`. | Habitat rule identity and owner metadata exist. | Registry scope is less exact than Grit predicate. |
| CEA-E3 | `docs/projects/habitat-harness/invariant-corpus.md` | Old `eslint-contract-export-all` invariant recorded with type-star allowance. | Retired mechanism authority exists. | No current proof that Grit fully replaces it. |
| CEA-E4 | `docs/projects/habitat-harness/taxonomy.md` and `discrepancy-log.md` | Domain-root facade concerns are linked to domain-surface family. | Broader public-surface authority exists. | Current Grit predicate does not prove those facades. |
| CEA-E5 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter contract_export_all --json` | Exit 0; one testable pattern succeeded with one positive and one negative sample. | Design seed only; superseded for fixture coverage by `CEA-E13`. | No type-star, current-tree, baseline, injected, or rewrite proof. |
| CEA-E6 | `bun run habitat:check -- --json --rule grit-contract-export-all` | Exit 0; report contains `grit-contract-export-all` and `baseline-integrity`, both pass. | Historical wrapper pass seed. | Not consumed as current wrapper proof while oclif/root command trust and selector truth are unsettled in the repair chain; no injected violation proof. |
| CEA-E7 | `GRIT_TELEMETRY_DISABLED=true grit check mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes --json --level error --no-cache` | Exit 0 with JSON `results: []`. | Bounded raw zero-result seed for domain/recipe roots. | Does not prove exact Habitat projection, full wrapper roots, raw acquisition closure, or injected behavior. |
| CEA-E8 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/domain` and `/tmp/.../src/recipes`. | Value-star reports in op index, op `rules/index.ts`, op `strategies/index.ts`, and step `contract.ts`; named export, type-star, non-op shared index, and op-local `rules.ts` do not report. | Direct Grit behavior seed for core positives and controls. | Disposable probe is not a committed fixture, current-tree proof, or Habitat wrapper proof. |
| CEA-E9 | `rg "export \\* from" mods/mod-swooper-maps/src/domain -g '*.ts' \| rg -v "export type \\*"` | Live value-star facades exist in domain root/config/index/resource/orogeny files outside current predicate. | Domain-root facade gap exists. | Does not decide whether to expand this row. |
| CEA-E10 | `git status --short --branch` before packet | Clean branch header. | Work started from clean repo state. | Not cleanup proof for future injected probes. |
| CEA-E11 | `docs/projects/habitat-harness/research/official-docs-effect.md` and `local-effect-adoption-fit.md` | Effect supplies typed error/requirement/service/resource/command primitives; local research names Grit adapter hardening as a strong fit. | Substrate decision is evidence-gated for injected proof. | Effect does not prove Grit, Biome, Nx, baseline, owner-layer, or runtime semantics. |
| CEA-E12 | `tools/habitat-harness/src/lib/grit.ts` | Current adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, recipes, maps, and domain. | Exact wrapper-root truth is available. | Bounded raw domain/recipe proof is not whole-wrapper proof. |
| CEA-E13 | `CEA-NATIVE-FIXTURES-2026-06-15`: `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter contract_export_all --json` | Exit 0; `Matches fixture` reports 8 matches across domain op index, domain op contract, domain op types, rules index, rules non-index, strategies default, step contract, and dotted step contract; `Ignores fixture` reports 0 matches for named value, named type, namespace re-export, domain root/config facades, op-local `rules.ts`, `.tsx`, and package barrel controls. | Native fixture/parser-edge subset for current predicate and listed false-positive controls. | No Habitat wrapper selector truth, baseline behavior, injected violation cleanup, raw acquisition, parity, type-star native fixture proof, or product proof. |
| CEA-E14 | `CEA-EXPORT-INVENTORY-2026-06-15`: TypeScript parser inventory over current wrapper roots. | Exit 0; 0 in-scope bare value-star exports, 135 in-scope type-star exports, 0 in-scope namespace exports, 139 in-scope named exports, 82 out-of-scope bare value-star exports, including 21 Swooper domain-root/config/facade value-star exports outside this row predicate. | Current-tree parser inventory and domain-root facade non-claim evidence. | Not native Grit current-tree behavior, not Habitat wrapper behavior, not baseline behavior, not injected violation proof, and not stale-record closure. |
| CEA-E15 | Attempted native markdown fixture containing `export type * from "./contract.js";`. | Pinned native fixture parser rejected the syntax during fixture expansion; row fixture keeps a named type export control only. | `export type *` allowance remains an explicit dependency-bound non-claim. | Does not prove type-star allowance; needs accepted adapter/current-tree proof or a parser-supported fixture shape. |
| CEA-E16 | `bun run openspec -- validate habitat-grit-proof-contract-export-all --strict` | Exit 0; change is valid. | Packet schema/spec hygiene for the current row records. | OpenSpec validation is not Grit, wrapper, baseline, injected, raw, parity, or product proof. |
| CEA-E17 | `bun run openspec:validate` | Exit 0; 181 items passed, 0 failed. | Repo OpenSpec hygiene after row record updates. | Does not prove row runtime behavior. |
| CEA-E18 | `git diff --check` | Exit 0. | Diff whitespace hygiene. | Does not prove behavior. |
| CEA-E19 | Active packet language guardrail scan with `rg` over row packet, aggregate matrix, and corpus ledger. | Only non-claim/blocked contexts found for wrapper, baseline, injected, and product-proof terms. | Record language avoids consuming dependency-bound proof classes. | Regex scan is not semantic proof of every downstream historical record. |

## Evidence Still Required

- native or accepted adapter proof for `export type *`;
- exact wrapper-root and omitted-root projection proof;
- Effect/manual substrate decision for injected proof;
- injected positive step-contract and domain-op probes;
- outside-scope path-control probe;
- explicit empty baseline proof;
- baseline owner linkage;
- taxonomy/recovery stale-record updates for broader domain-root facade claims;
- stale-record realignment.
