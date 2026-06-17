# Source Synthesis - Recipe Domain Surface Proof

## Authority Order

1. `docs/projects/habitat-harness/dra-takeover-frame.md`
2. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
3. `docs/system/libs/mapgen/policies/IMPORTS.md`
4. `docs/projects/habitat-harness/invariant-corpus.md`
5. `docs/projects/habitat-harness/taxonomy.md`
6. `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
7. H5/H6 OpenSpec records
8. `tools/habitat-harness/src/rules/rules.json`
9. Current pattern file and command behavior
10. Official Grit docs
11. Official Effect docs and local Effect adoption fit research for substrate
    decisions
12. H5/H6 historical records as historical claims

## Product Source

The takeover frame requires each Grit pattern workstream to start from a corpus
row, state owner/proof shape, and keep proof classes separate. The Grit ledger
row for `grit-recipe-domain-surface` says recipes import only approved domain
entrypoints and names this OpenSpec id.

## Architecture Source

`IMPORTS.md` is the strongest current policy source. It says standard recipe
imports from `@mapgen/domain/*` must stay on named domain surfaces:

- recipe assembly: `@mapgen/domain/<domain>`;
- op registry: `@mapgen/domain/<domain>/ops`;
- config/knob compilation: `@mapgen/domain/<domain>/config.js`.

`invariant-corpus.md` records the retired `mapgen-recipe-imports` script and
the retired `recipe-import-boundary` test as recipe public-surface invariants.

`taxonomy.md` places the rule in `scope:domain-surface`.

`NORMALIZATION-GUARDRAILS.md` G4 names Habitat
`grit-recipe-domain-surface` and `grit-domain-deep-import` as the recipe deep
import guard family.

`rules.json` registers the rule as enforced, owner `grit-check`, owner project
`mod-swooper-maps`, scope `mods/mod-swooper-maps/src/recipes/**/*.ts`, and
message "Recipes may import @mapgen/domain/<domain>, @mapgen/domain/<domain>/ops,
or /config.js only."

## Current Pattern Source

`.grit/patterns/habitat/checks/recipe_domain_surface.md` now records the active
predicate:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- matches static import declarations, named re-exports, and star re-exports;
- filters filenames to `mods/mod-swooper-maps/src/recipes/.*\.ts`;
- matches `@mapgen/domain/<domain>/<tail>` sources;
- allows only exact domain root, exact `/ops`, and exact `/config.js` public
  surfaces;
- partitions `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and
  `strategies/<tail>` to the accepted `grit-domain-deep-import` row;
- reports other non-public recipe domain subpaths, including
  `config.js/<tail>` and RDS-owned `/ops` / `config.js` lookalikes.

Current native fixture coverage:

- thirteen positive match objects, covering default import, named import,
  namespace import, type import, side-effect import, named re-export, type
  re-export, star re-export, recipe-local test path, step-contract overlap
  path, RDS-owned `/ops` lookalikes, `config.js/<tail>`, and RDS-owned
  `config.js` lookalikes;
- zero-match controls for domain root, exact `/ops`, exact `/config.js`,
  DDI-owned `/ops/<tail>`, `ops-by-id`, `rules/<tail>`,
  `strategies/<tail>`, `.tsx`, maps, other mods, and non-recipe tests.

Current native samples prove parser-edge behavior and the row-owned
exact-surface partition. Habitat wrapper, baseline, and injected proof are
recorded separately. Raw direct Grit acquisition, retired parity, source
remediation, apply safety, and product/runtime proof remain non-claims.

## Official Grit Source

Official Grit docs establish:

- `grit patterns test --filter` as the pattern fixture proof command;
- Markdown pattern conventions under `.grit/patterns`;
- frontmatter `level` for diagnostics;
- `grit check [PATHS]...` as current-tree check command;
- explicit `language js(typescript)` as the TypeScript parser declaration.

Official docs do not establish Habitat rule projection, shrink-only baselines,
injected-probe cleanup, old-mechanism parity, overlap classification, or
stale-record truth. Habitat owns those proof classes.

## Effect Substrate Source

`docs/projects/habitat-harness/research/official-docs-effect.md` records that
Effect exposes typed success/error/requirements, service/Layers composition,
resource scopes, command data through `@effect/platform/Command`, and structured
tagged errors. It also records that Effect is not authority for Habitat
semantics, Grit matching, Biome safe writes, Nx graph truth, baseline policy, or
owner layers.

`docs/projects/habitat-harness/research/local-effect-adoption-fit.md` identifies
`habitat-effect-grit-adapter` as a candidate slice for typed Grit command,
parse, projection, baseline, and transform-proof steps. That directly applies
to this packet's injected proof because recipe-domain-surface proof needs exact
pattern projection, parser-edge classification, scan-root provenance, overlap
classification, command provenance, and cleanup proof.

## Local Evidence

| Evidence id | Source | Result | Implication |
| --- | --- | --- | --- |
| RDS-E15 | Historical native fixture proof | Superseded by `RDS-NATIVE-FIXTURES-2026-06-16`. | Historical design evidence only. |
| RDS-E16 | Historical parser inventory | Superseded by `RDS-IMPORT-INVENTORY-2026-06-16`. | Historical count seed only. |
| RDS-E21 | `RDS-NATIVE-FIXTURES-2026-06-16` | Focused native Grit proof exits 0 with 13 positive match objects and 0 ignore-sample matches. | Native fixture/parser-edge proof is current for the repaired predicate. |
| RDS-E22 | `RDS-NATIVE-CORPUS-REFRESH-2026-06-16` | Full native corpus exits 0 with 32 testable patterns and 0 failures, RDS included. | The repaired fixture does not break the current native Grit corpus. |
| RDS-E23 | `RDS-IMPORT-INVENTORY-2026-06-16` | TypeScript parser inventory scans 222 recipe `.ts` files, finds 124 recipe-predicate domain references, 0 current-row matches, 124 exact allowed references, 0 DDI-owned sibling candidates, 0 substring lookalikes, 23 step `contract.ts` files plus 30 step `*.contract.ts` files as neighboring-policy context, and 0 parse diagnostics. | Current-tree source inventory and zero-candidate evidence are current for the repaired predicate. |
| RDS-E24 | `RDS-PER-RULE-SELECTOR-2026-06-16` | `habitat:check --rule grit-recipe-domain-surface` exits 0 with RDS plus `baseline-integrity`, both passing with zero diagnostics. | Per-rule Habitat wrapper projection and baseline-integrity proof are current. |
| RDS-E25 | `RDS-HABITAT-GRIT-TOOL-2026-06-16` | Aggregate `habitat:check --tool grit-check` exits 0 with 30 Grit rules plus `baseline-integrity`, RDS included, all passing. | Aggregate Grit wrapper health is current with RDS included. |
| RDS-E26 | `RDS-BASELINE-FILES-2026-06-16` | `tools/habitat-harness/baselines/grit-recipe-domain-surface.json` is explicit `[]`, and `baseline-integrity` passes in wrapper proof. | Explicit empty baseline ownership is current. |
| RDS-E27 | `RDS-INJECTED-PROBE-2026-06-16` | Clean-start injected probe run reports RDS passing with one diagnostic at the injected recipe path and a clean outside-scope domain control; the aggregate runner still exits nonzero only for accepted unrelated DDIT. | Row-specific injected violation/path-control proof is current; aggregate injected-corpus closure remains unclaimed. |

## Design Consequences

1. The row closes as an active Grit check proof for the repaired recipe `.ts`
   predicate.
2. Exact allowed-surface proof is implemented through exact source guards, not
   substring exclusions.
3. DDI-owned `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and
   `strategies/<tail>` are controls for this row and remain covered by the
   accepted DDI proof boundary.
4. RDS-owned `config.js/<tail>` and `/ops` / `config.js` lookalikes report in
   this row.
5. Current zero-candidate inventory, wrapper proof, explicit empty baseline,
   and injected probe proof are separate proof classes.
6. Apply remediation stays in a separate apply/generator/migration packet.
7. Raw direct Grit acquisition, retired parity, source remediation, aggregate
   injected-corpus closure while DDIT is blocked, and product/runtime proof
   remain non-claims.
