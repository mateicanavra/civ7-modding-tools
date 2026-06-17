# Evidence Log - Runtime Validation Imports Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| RVI-E1 | `tools/habitat-harness/src/rules/rules.json` | `grit-runtime-validation-imports` is registered as enforced `grit-check` with runtime purity scope and message "Runtime layers must not import TypeBox runtime validation or compiler normalization helpers." | Rule identity and metadata exist. | Metadata does not prove wrapper behavior. |
| RVI-E2 | `docs/projects/habitat-harness/taxonomy.md` | `scope:runtime-purity` covers TypeBox runtime helpers, `runValidated`, helper redeclarations, and config merges. | Policy family exists. | Does not prove this row or neighboring rows. |
| RVI-E3 | `docs/projects/habitat-harness/invariant-corpus.md` | `eslint-runtime-typebox-ban` is assigned to `grit-check`. | Retired invariant and owner mapping exist. | No parity closure. |
| RVI-E4 | `.grit/patterns/habitat/checks/runtime_validation_imports.md` | Current predicate matches five forbidden import sources in runtime recipe step and domain strategy paths. | Authored current predicate exists. | No injected, baseline, raw acquisition, wrapper, apply, or product proof. |
| RVI-E5 | `scripts/lint/lint-domain-refactor-guardrails.sh` full profile | Prior guardrail includes a runtime `typebox/value` import scan over runtime roots. | Retired proving source exists for part of the row family. | Does not prove current Grit behavior or the compiler-helper arms. |
| RVI-E6 | `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_validation_imports --json` on branch `agent-HG-habitat-grit-runtime-validation-imports` | Exit 0; one testable pattern succeeds. The committed fixture produces 10 current-predicate matches across TypeBox value, TypeBox compiler, mapgen compiler normalize, authoring validation, validation-surface, domain strategy, type-only, side-effect, other-mod raw predicate, and runtime recipe step `contract.ts` forbidden import classes. The ignore sample produces 0 matches for allowed mapgen-core imports, config paths, tests, domain op non-strategy paths, map paths, package paths, `.tsx`, source lookalikes, alias/root TypeBox imports, re-exports, and dynamic imports. | Native fixture/parser-edge proof for current predicate behavior. | No Habitat wrapper selector truth, current-tree wrapper proof, raw acquisition, baseline proof, injected cleanup proof, Effect adapter proof, retired parity, apply safety, neighboring runtime-purity row proof, product proof, or exact runtime-policy closure beyond current predicate. |
| RVI-E7 | Inline Bun/Node TypeScript parser inventory over `mods/mod-swooper-maps/src/recipes` and `mods/mod-swooper-maps/src/domain` on branch `agent-HG-habitat-grit-runtime-validation-imports` | Scan roots: `mods/mod-swooper-maps/src/recipes`, `mods/mod-swooper-maps/src/domain`; exclusions: `node_modules`, `dist`, `mod`; parsed `.ts`/`.tsx` imports, re-exports, and dynamic imports with the TypeScript compiler API. Counts: 886 scanned TS/TSX files, 344 current-predicate TS files, 0 current-predicate TSX files, 159 runtime recipe step TS files, 185 domain strategy TS files, 1,005 import declarations inside current-predicate files, 137 export-from declarations inside current-predicate files, 0 forbidden import matches, 0 forbidden type-only imports, 0 forbidden side-effect imports, 0 forbidden re-exports, 0 forbidden dynamic imports, 0 forbidden `contract.ts` matches, 0 forbidden matches for every forbidden source class, 0 out-of-scope forbidden references, 0 source lookalikes in runtime, 0 `typebox/value` alias runtime imports, and 0 root TypeBox runtime imports. Temporary stdout was scratch only; durable evidence is this bounded summary. | Parser inventory and live zero-candidate evidence inside the current Swooper runtime roots. | Not native Grit current-tree behavior, not Habitat wrapper behavior, not raw Grit acquisition, not baseline behavior, not injected violation proof, not product proof, and not stale-record closure. |

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
- retired parity proof.
