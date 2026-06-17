# Evidence Log - Recipe Runtime Domain Ops Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| RDO-E1 | `tools/habitat-harness/src/rules/rules.json` | `grit-recipe-runtime-domain-ops` is registered as enforced `grit-check` with runtime recipe scope and message "Recipe runtime files must import @mapgen/domain/<domain>/ops for runtime domains." | Rule identity and metadata exist. | Metadata does not prove wrapper behavior. |
| RDO-E2 | `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` | The standard recipe collects compile-time domain ops into a registry used to bind op contracts to implementations by op id. | Policy/architecture source exists for runtime op bundle use. | Does not prove current Grit behavior. |
| RDO-E3 | `docs/projects/habitat-harness/invariant-corpus.md` | `eslint-recipe-domain-ops` is assigned to `grit-check`. | Retired invariant and owner mapping exist. | No parity closure. |
| RDO-E4 | `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md` | Current predicate matches runtime `recipe.ts` imports whose source ends with `@mapgen/domain/<domain>`. | Authored current predicate exists. | No injected, baseline, raw acquisition, wrapper, apply, or product proof. |
| RDO-E5 | `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | Standard recipe imports six approved `/ops` domain bundles. | Current allowed runtime recipe exemplar exists. | No full inventory proof by itself. |
| RDO-E6 | `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts` | Browser-test recipe imports one approved `/ops` domain bundle. | Current allowed runtime recipe exemplar exists. | No full inventory proof by itself. |
| RDO-E7 | `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_runtime_domain_ops --json` on branch `agent-HG-habitat-grit-recipe-runtime-domain-ops` | Exit 0; one testable pattern succeeds. The committed fixture produces 9 current-predicate matches across default, named, namespace, type-only, side-effect, browser-test runtime recipe, other-mod raw predicate, nested runtime recipe, and source-prefix root lookalike classes. The ignore sample produces 0 matches for approved `/ops`, `/config.js`, deeper domain paths, non-`recipe.ts`, `.tsx`, map, package, step-contract, re-export, dynamic import, and trailing slash controls. | Native fixture/parser-edge proof for current predicate behavior. | No Habitat wrapper selector truth, current-tree wrapper proof, raw acquisition, baseline proof, injected cleanup proof, Effect adapter proof, retired parity, apply safety, all-mod wrapper enforcement, product proof, or exact policy closure beyond current predicate. |
| RDO-E8 | Inline Bun/Node TypeScript parser inventory over `mods/mod-swooper-maps/src/recipes` on branch `agent-HG-habitat-grit-recipe-runtime-domain-ops` | Scan root: `mods/mod-swooper-maps/src/recipes`; exclusions: `node_modules`, `dist`, `mod`; parsed `.ts`/`.tsx` imports and re-exports with the TypeScript compiler API. Script shape: walk scan root, skip exclusions, parse `ImportDeclaration` and `ExportDeclaration` module specifiers, classify current-predicate `mods/<mod>/src/recipes/**/recipe.ts` files, domain root sources, `/ops`, `/config.js`, other deep domain paths, source-prefix lookalikes, import clause kinds, and out-of-scope domain references. Counts: 222 scanned TS/TSX files, 2 current-predicate `recipe.ts` files, 29 import declarations inside those runtime recipe files, 0 export-from declarations inside those runtime recipe files, 7 domain references inside those runtime recipe files, 0 current-row matches, 7 approved `/ops` references, 0 config references, 0 other deep domain references, 0 source-prefix root lookalikes, 0 type-only root imports, 0 default root imports, 0 named root imports, 0 namespace root imports, 0 side-effect root imports, 0 root re-exports, 82 root-domain references outside runtime `recipe.ts`, and 117 domain references outside runtime `recipe.ts`. Temporary stdout was scratch only; durable evidence is this bounded summary. | Parser inventory and live zero-candidate evidence inside the current Swooper recipe root. | Not native Grit current-tree behavior, not Habitat wrapper behavior, not raw Grit acquisition, not baseline behavior, not injected violation proof, not all-mod wrapper enforcement, not product proof, and not stale-record closure. |

## Evidence Still Required

- current restacked shared wrapper/selector proof is inherited through
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`;
- current restacked shared explicit baseline proof is inherited through
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`;
- current restacked shared injected Grit-row proof is inherited through
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`;
- raw acquisition or accepted adapter proof;
- retired parity proof;
- apply safety proof only in a separate apply row.
