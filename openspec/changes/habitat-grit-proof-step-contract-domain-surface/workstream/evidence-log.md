# Evidence Log - Step Contract Domain Surface Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| SCDS-E1 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-step-contract-domain-surface` is registered as enforced `grit-check`, owner project `mod-swooper-maps`, scope `mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}`, and pattern `step_contract_domain_surface`. | Habitat rule identity and intended metadata exist. | Metadata does not prove wrapper-root coverage or exact filename predicate. |
| SCDS-E2 | `.grit/patterns/habitat/checks/step_contract_domain_surface.md` | Pattern has `level: error`, `language js(typescript)`, import and re-export arms, filename regex ending in `contract.ts`, and leading-wildcard domain-subpath source regex. | Authored Grit predicate exists. | No current-tree, injected, baseline, source-specifier lookalike, or overlap proof. |
| SCDS-E3 | `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` | Step contracts define authoring declarations; step modules own implementation. | Architecture reason for root-only contract imports exists. | Does not prove current Grit behavior. |
| SCDS-E4 | `docs/system/libs/mapgen/how-to/add-a-step.md` | Step authors create `*.contract.ts` and use published entrypoints. | Intended filename and public-entrypoint guidance exists. | Does not prove `contract.ts` or lookalike behavior. |
| SCDS-E5 | `docs/system/libs/mapgen/policies/IMPORTS.md` | Contract imports are distinguished from ordinary recipe imports; step contracts bind through the domain root. | Domain-root-only policy exists. | Ordinary recipe `/ops` and `/config.js` allowances do not apply to this row. |
| SCDS-E6 | `docs/projects/habitat-harness/invariant-corpus.md` | Retired `eslint-step-contract-imports` invariant says step contracts import only `@mapgen/domain/<d>`. | Retired-mechanism parity source exists. | No current proof that Grit fully replaces it. |
| SCDS-E7 | `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter step_contract_domain_surface --json` | Exit 0; one pattern succeeds with one positive and one negative sample. | Native fixture seed proof exists. | No parser-edge, path-control, wrapper, baseline, injected, or overlap proof. |
| SCDS-E8 | `bun run habitat:check -- --json --rule grit-step-contract-domain-surface` | Exit 0; report includes `grit-step-contract-domain-surface` and `baseline-integrity`, both pass. | Valid single-rule wrapper selection currently passes. | No injected violation, other-mod, or exact selector-truth proof. |
| SCDS-E9 | Direct raw `grit check mods/mod-swooper-maps/src/recipes --json --level error --no-cache` | Exit 0 with `results: []`. | Bounded raw zero-result seed for current Swooper recipe root. | Not a whole-wrapper proof and not an all-mod proof. |
| SCDS-E10 | `tools/habitat-harness/src/lib/grit.ts` | Adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, `mods/mod-swooper-maps/src/recipes`, `mods/mod-swooper-maps/src/maps`, and `mods/mod-swooper-maps/src/domain`. | Wrapper-root truth is available. | Raw recipe-root proof does not equal wrapper proof. |
| SCDS-E11 | `find mods/mod-swooper-maps/src/recipes -path '*/stages/*/steps/*' -type f ...` | 53 matching files: 23 `contract.ts`, 30 `*.contract.ts`, zero lookalikes, zero `.tsx`. | Live filename inventory supports current pass state. | Zero live lookalikes does not prove filename predicate exactness. |
| SCDS-E12 | `rg "@mapgen/domain/"` over the 53 matching step contract files | Live domain imports are domain root only, including `BiomeEngineBindingsSchema` from `@mapgen/domain/ecology`. | Supplemental current-tree import inventory supports zero findings. | Regex inventory is not parser-grade proof. |
| SCDS-E13 | `rg "from \"@mapgen/domain/[^\"]+/|from '@mapgen/domain/[^']+/"` over matching files | No output. | No obvious live domain-subpath imports in matching Swooper step contracts. | No injected or parser-edge proof. |
| SCDS-E14 | Disposable raw Grit parser-form probe under `/tmp` | Default, named, namespace, type, side-effect imports and named/type/star re-exports from domain subpaths report; domain root does not. | Direct Grit behavior covers important source forms. | Probe is not committed fixture, not Habitat wrapper proof, and not enough for exact source-scope closure. |
| SCDS-E15 | Disposable raw Grit path-control probe under `/tmp` | `notacontract.ts`, other-mod raw paths, and `__tests__/contract.ts` report; `.tsx`, maps, and non-`steps` paths do not. | Scope risks are known. | No accepted decision yet on repair, inclusion, or sibling ownership. |
| SCDS-E16 | External adversarial review agent `019ec731-6096-71e2-af1e-08b432b632bc` | No P1 findings; P2 finding that a prefixed source such as `not-a-real-prefix@mapgen/domain/ecology/ops` reports through the current leading-wildcard source regex. | Source-specifier lookalike controls are required before exact source-scope claims. | Review does not implement fixtures or predicate repair. |
| SCDS-E17 | Adjacent row evidence from recipe-domain, domain-deep, and contract-export packets | Neighboring rows can report the same step-contract source forms depending on source family and export shape. | Overlap is real and must be classified. | No implementation closure for this row. |
| SCDS-E18 | `docs/projects/habitat-harness/research/official-docs-effect.md` and `local-effect-adoption-fit.md` | Effect can provide typed errors, services, scoped cleanup, command provenance, and parser classification; local research names Grit adapter hardening as a strong fit. | Substrate decision is evidence-gated for injected proof. | Effect does not decide Grit policy or owner layers. |
| SCDS-E19 | `git status --short --branch` before drafting | Clean committed base on `codex/habitat-dra-takeover-frame`; this packet became the only untracked work. | Workstream started from clean state. | Does not prove future probe cleanup. |

## Evidence Still Required

- expanded native fixtures or accepted adapter proof for all import/export
  forms;
- exact domain-root allowed proof;
- forbidden-source proof for `/ops`, `/config.js`, `ops/<tail>`, `ops-by-id`,
  `rules/<tail>`, `strategies/<tail>`, `shared/<tail>`, `types.js`, and
  arbitrary domain subpaths;
- source-specifier lookalike proof for prefixed, relative, and other
  non-package strings matched by the current leading-wildcard regex;
- filename proof for `contract.ts`, `*.contract.ts`, and lookalikes ending in
  `contract.ts`;
- `.tsx`, maps, ordinary recipe files, non-step contracts, stage artifact
  contracts, other mods, recipe-local tests, and generated path controls;
- exact wrapper-root and omitted-root projection proof;
- parser-grade current-tree inventory or accepted adapter proof;
- Effect/no-Effect substrate decision for injected proof;
- injected positive step-contract probe through the Habitat wrapper;
- outside-scope path-control proof through the accepted substrate;
- explicit empty baseline proof and injected unbaselined-finding proof;
- baseline owner linkage;
- neighboring-rule overlap disposition;
- aggregate proof matrix proof-id linkage;
- stale-record and recovery-claim realignment.
