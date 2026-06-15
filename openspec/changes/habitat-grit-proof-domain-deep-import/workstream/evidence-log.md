# Evidence Log - Domain Deep Import Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| DDI-E1 | `.grit/patterns/habitat/checks/domain_deep_import.md` | Pattern exists with `level: error`, `language js(typescript)`, recipe/map filename predicate, and forbidden source predicate. | Rule semantics are authored. | No current-tree or injected proof. |
| DDI-E2 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-domain-deep-import` registered as enforced `grit-check`. | Habitat rule identity and owner metadata exist. | No proof the rule catches injected violations. |
| DDI-E3 | `docs/system/libs/mapgen/policies/IMPORTS.md` | Public domain surfaces are named as boundary for recipe assembly. | Normative architecture source exists. | No current source scan proof. |
| DDI-E4 | `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md` | G4 maps recipe deep imports to this rule family. | Normalization guard source exists. | No implementation proof. |
| DDI-E5 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter domain_deep_import --json` | Exit 0; one testable pattern succeeded with one positive and one negative sample. | Native fixture proof. | No current-tree, baseline, injected, or apply proof. |
| DDI-E6 | `bun run habitat:check -- --json --rule grit-domain-deep-import` | Exit 0; report contains `grit-domain-deep-import` and `baseline-integrity`, both pass. | Current Habitat wrapper proof for valid rule selection. | No injected violation or selector false-green proof. |
| DDI-E7 | `rg "@mapgen/domain/[^\\\"']+/(ops/.+|ops-by-id|rules/.+|strategies/.+)" mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps -g '*.ts' -g '*.tsx'` | Exit 1 with no output. | Supplemental live zero-candidate inventory. | Regex inventory is not parser-grade proof. |
| DDI-E8 | `GRIT_TELEMETRY_DISABLED=true grit check mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps --json --level error --no-cache` | Exit 0 with JSON `results: []`. | Bounded raw zero-result seed for recipe/map roots. | Does not prove exact Habitat projection or injected behavior. |
| DDI-E9 | `rg "@mapgen/domain/" mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps -g '*.ts' -g '*.tsx'` | Live public root, `/ops`, and `/config.js` imports exist. | Negative current examples exist. | Does not prove all false-positive classes. |
| DDI-E10 | `git status --short --branch` after evidence probes | Clean branch header. | Probes left the worktree clean. | Not cleanup proof for future injected probes. |
| DDI-E11 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/recipes/standard` with `ops/private`, `ops-by-id`, and `ops-by-id` re-export. | `ops/private` reports; `ops-by-id` import and re-export do not report. | `ops-by-id` is a current semantic defect despite being claimed by metadata. | Does not define the repaired predicate. |
| DDI-E12 | Disposable Grit probe under `/tmp/.../mods/mod-swooper-maps/src/recipes/__tests__` and `/tmp/.../mods/mod-swooper-maps/src/maps/__type_tests__`. | Both test-path probes report `domain_deep_import` for `ops/private`. | Recipe/map-local test paths are currently inside effective scope. | Does not decide whether that scope is desired. |
| DDI-E13 | `rg` for relative local-domain imports over recipe/map roots. | Six recipe imports reach `mods/mod-swooper-maps/src/domain/**` by relative path, including one deeper `lib/corpus/types.js` reach. | This alias-based row cannot claim complete domain public-surface enforcement. | Does not decide the sibling guard shape. |

## Evidence Still Required

- expanded fixture matrix;
- parser-grade current-tree inventory or accepted adapter proof;
- injected positive recipe and map probes;
- outside-scope path-control probe;
- explicit empty baseline proof;
- `ops-by-id` predicate repair and lookalike negatives;
- recipe/map-local test scope classification;
- relative local-domain sibling guard or accepted non-claim;
- baseline owner linkage;
- aggregate proof matrix proof-id linkage;
- stale-record realignment.
