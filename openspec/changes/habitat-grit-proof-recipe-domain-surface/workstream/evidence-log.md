# Evidence Log - Recipe Domain Surface Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| RDS-E1 | `.grit/patterns/habitat/checks/recipe_domain_surface.md` | Pattern exists with `level: error`, `language js(typescript)`, import/re-export match forms, recipe `.ts` filename predicate, and substring exclusions for `/ops` and `/config.js`. | Rule semantics are authored. | No current-tree or injected proof. |
| RDS-E2 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-recipe-domain-surface` registered as enforced `grit-check`. | Habitat rule identity and owner metadata exist. | Registry scope does not prove exact source semantics. |
| RDS-E3 | `docs/system/libs/mapgen/policies/IMPORTS.md` | Recipe imports from `@mapgen/domain/*` must stay on domain root, `/ops`, or `/config.js` surfaces. | Current policy authority exists. | Does not prove the current Grit predicate enforces exact surfaces. |
| RDS-E4 | `docs/projects/habitat-harness/invariant-corpus.md` | Retired recipe import script/test invariant recorded. | Retired mechanism authority exists. | No current proof that this row fully replaces it. |
| RDS-E5 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter recipe_domain_surface --json` | Exit 0; one testable pattern succeeded with one positive and one negative sample. | Design seed only; superseded for fixture coverage by `RDS-E15`. | No parser-edge, current-tree, baseline, injected, overlap, or rewrite proof. |
| RDS-E6 | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` | Exit 0; report contains `grit-recipe-domain-surface` and `baseline-integrity`, both pass. | Historical pre-restack wrapper pass seed. Current restacked shared wrapper/selector proof is inherited through `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and `HGPR-PER-RULE-SELECTORS-2026-06-15`. | The historical seed is not raw acquisition proof, injected violation proof, retired parity proof, apply safety proof, or product proof. |
| RDS-E7 | `GRIT_TELEMETRY_DISABLED=true grit check mods/mod-swooper-maps/src/recipes --json --level error --no-cache` | Exit 0 with JSON `results: []`. | Bounded raw zero-result seed for the recipe root. | Does not prove exact Habitat projection, full wrapper roots, raw acquisition closure, or injected behavior. |
| RDS-E8 | `rg "@mapgen/domain/[^\"']+/" mods/mod-swooper-maps/src/recipes -g '*.ts'` | Live recipe imports are approved `/ops` and `/config.js` forms. | Supplemental live import inventory seed. | Superseded by parser inventory `RDS-E16`; regex inventory is not wrapper proof. |
| RDS-E9 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/recipes`. | Shared/private import and export forms report; root, `/ops`, `/config.js`, `.tsx`, maps, other mods, `/ops/private`, `ops-by-id`, and `config.js/private` do not. | Direct Grit behavior seed for core positives and controls. | Disposable probe is not committed fixture, current-tree proof, or Habitat wrapper proof. |
| RDS-E10 | `openspec/changes/habitat-grit-proof-domain-deep-import/**` | `/ops/private` is a neighboring-rule case; `ops-by-id` is a recorded current defect. | Neighboring boundary authority exists. | Does not repair this row. |
| RDS-E11 | `tools/habitat-harness/src/lib/grit.ts` | Current adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, recipes, maps, and domain. | Exact wrapper-root truth is available. | Bounded raw recipe proof is not whole-wrapper proof. |
| RDS-E12 | `docs/projects/habitat-harness/research/official-docs-effect.md` and `local-effect-adoption-fit.md` | Effect supplies typed error/requirement/service/resource/command primitives; local research names Grit adapter hardening as a strong fit. | Substrate decision is evidence-gated for injected proof. | Effect does not prove Grit, Biome, Nx, baseline, owner-layer, or runtime semantics. |
| RDS-E13 | `git status --short --branch` before packet | Clean branch header. | Work started from clean repo state. | Not cleanup proof for future injected probes. |
| RDS-E14 | External adversarial review agent `019ec71a-00ec-7f83-bbcb-a8448683c629` | No P1 findings; P2 findings for contains-substring lookalikes, namespace/side-effect imports, and recipe-local test paths. | Review lanes found closure gaps that are now accepted design requirements. | Review does not implement fixtures or adapter proof. |
| RDS-E15 | `RDS-NATIVE-FIXTURES-2026-06-15`: `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_domain_surface --json` | Exit 0; `Matches fixture` reports 10 matches across default import, named import, namespace import, type import, side-effect import, named re-export, type re-export, star re-export, recipe-local test path, and step-contract overlap path; `Ignores fixture` reports 0 matches for domain root, exact `/ops`, exact `/config.js`, `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`, contains-substring lookalikes, `.tsx`, maps, other mods, and non-recipe controls. | Native fixture/parser-edge subset for current predicate and listed false-positive controls. | No Habitat wrapper selector truth, baseline behavior, injected violation cleanup, raw acquisition, retired-mechanism parity, exact-surface closure for substring gaps, neighboring-row closure, or product proof. |
| RDS-E16 | `RDS-IMPORT-INVENTORY-2026-06-15`: TypeScript parser inventory over current wrapper roots. | Exit 0; 230 `@mapgen/domain` import/re-export references, 124 inside the recipe predicate, 0 current-row matches, 124 exact allowed recipe references, 0 excluded-but-non-exact recipe references, 0 recipe-local test references, and 38 step-contract references inside the recipe predicate. | Current-tree parser inventory and live exact-surface/non-exact zero-candidate evidence. | Not native Grit current-tree behavior, not Habitat wrapper behavior, not baseline behavior, not injected violation proof, not raw acquisition closure, and not stale-record closure. |
| RDS-E17 | `bun run openspec -- validate habitat-grit-proof-recipe-domain-surface --strict` | Exit 0; change is valid. | Packet schema/spec hygiene for the current row records. | OpenSpec validation is not Grit, wrapper, baseline, injected, raw, parity, or product proof. |
| RDS-E18 | `bun run openspec:validate` | Exit 0; 181 items passed, 0 failed. | Repo OpenSpec hygiene after row record updates. | Does not prove row runtime behavior. |
| RDS-E19 | `git diff --check` | Exit 0. | Diff whitespace hygiene. | Does not prove behavior. |
| RDS-E20 | Active packet language guardrail scan with `rg` over row packet, aggregate matrix, and corpus ledger. | Only non-claim/blocked contexts found for wrapper, baseline, injected, exact enforcement, closure, and product-proof terms. | Record language avoids consuming dependency-bound proof classes. | Regex scan is not semantic proof of every downstream historical record. |

## Evidence Still Required

- exact-surface closure for every non-exact source containing `/ops` or
  `/config.js`, including `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`,
  and lookalike segment disposition through predicate repair, sibling proof, or
  blocked downstream records;
- recipe-local test-path policy classification beyond current-predicate native
  proof;
- neighboring-rule overlap disposition;
- current restacked shared wrapper/selector proof is inherited through
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`;
- current restacked shared explicit baseline proof is inherited through
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`;
- current restacked shared injected Grit-row proof is inherited through
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`;
- Effect/manual substrate decision for injected proof;
- row-specific injected positive recipe probe beyond the shared aggregate proof;
- outside-scope path-control probe;
- raw acquisition or accepted adapter proof;
- stale-record realignment.
