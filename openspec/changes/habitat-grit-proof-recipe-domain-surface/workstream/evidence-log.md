# Evidence Log - Recipe Domain Surface Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| RDS-E1 | `.grit/patterns/habitat/checks/recipe_domain_surface.md` | Pattern exists with `level: error`, `language js(typescript)`, import/re-export match forms, recipe `.ts` filename predicate, and substring exclusions for `/ops` and `/config.js`. | Rule semantics are authored. | No current-tree or injected proof. |
| RDS-E2 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-recipe-domain-surface` registered as enforced `grit-check`. | Habitat rule identity and owner metadata exist. | Registry scope does not prove exact source semantics. |
| RDS-E3 | `docs/system/libs/mapgen/policies/IMPORTS.md` | Recipe imports from `@mapgen/domain/*` must stay on domain root, `/ops`, or `/config.js` surfaces. | Current policy authority exists. | Does not prove the current Grit predicate enforces exact surfaces. |
| RDS-E4 | `docs/projects/habitat-harness/invariant-corpus.md` | Retired recipe import script/test invariant recorded. | Retired mechanism authority exists. | No current proof that this row fully replaces it. |
| RDS-E5 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter recipe_domain_surface --json` | Exit 0; one testable pattern succeeded with one positive and one negative sample. | Native fixture proof. | No parser-edge, current-tree, baseline, injected, overlap, or rewrite proof. |
| RDS-E6 | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` | Exit 0; report contains `grit-recipe-domain-surface` and `baseline-integrity`, both pass. | Current Habitat wrapper proof for valid rule selection. | No injected violation or selector false-green proof. |
| RDS-E7 | `GRIT_TELEMETRY_DISABLED=true grit check mods/mod-swooper-maps/src/recipes --json --level error --no-cache` | Exit 0 with JSON `results: []`. | Bounded raw zero-result seed for the recipe root. | Does not prove exact Habitat projection or injected behavior. |
| RDS-E8 | `rg "@mapgen/domain/[^\"']+/" mods/mod-swooper-maps/src/recipes -g '*.ts'` | Live recipe imports are approved `/ops` and `/config.js` forms. | Supplemental live import inventory. | Regex inventory is not parser-grade proof. |
| RDS-E9 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/recipes`. | Shared/private import and export forms report; root, `/ops`, `/config.js`, `.tsx`, maps, other mods, `/ops/private`, `ops-by-id`, and `config.js/private` do not. | Direct Grit behavior for core positives and controls. | Disposable probe is not committed fixture or Habitat wrapper proof. |
| RDS-E10 | `openspec/changes/habitat-grit-proof-domain-deep-import/**` | `/ops/private` is a neighboring-rule case; `ops-by-id` is a recorded current defect. | Neighboring boundary authority exists. | Does not repair this row. |
| RDS-E11 | `tools/habitat-harness/src/lib/grit.ts` | Current adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, recipes, maps, and domain. | Exact wrapper-root truth is available. | Bounded raw recipe proof is not whole-wrapper proof. |
| RDS-E12 | `docs/projects/habitat-harness/research/official-docs-effect.md` and `local-effect-adoption-fit.md` | Effect supplies typed error/requirement/service/resource/command primitives; local research names Grit adapter hardening as a strong fit. | Substrate decision is evidence-gated for injected proof. | Effect does not prove Grit, Biome, Nx, baseline, owner-layer, or runtime semantics. |
| RDS-E13 | `git status --short --branch` before packet | Clean branch header. | Work started from clean repo state. | Not cleanup proof for future injected probes. |
| RDS-E14 | External adversarial review agent `019ec71a-00ec-7f83-bbcb-a8448683c629` | No P1 findings; P2 findings for contains-substring lookalikes, namespace/side-effect imports, and recipe-local test paths. | Review lanes found closure gaps that are now accepted design requirements. | Review does not implement fixtures or adapter proof. |

## Evidence Still Required

- expanded fixture matrix or accepted adapter proof;
- parser-edge import/export proof;
- exact allowed-surface proof;
- every non-exact source containing `/ops` or `/config.js`, including
  `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`, and lookalike segment
  disposition;
- namespace import and side-effect import disposition;
- recipe-local test-path classification;
- neighboring-rule overlap disposition;
- exact wrapper-root and omitted-root projection proof;
- parser-grade current-tree inventory or accepted adapter proof;
- Effect/manual substrate decision for injected proof;
- injected positive recipe probe;
- outside-scope path-control probe;
- explicit empty baseline proof;
- baseline owner linkage;
- aggregate proof matrix proof-id linkage;
- stale-record realignment.
