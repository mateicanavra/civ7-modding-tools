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

`.grit/patterns/habitat/checks/recipe_domain_surface.md`:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- matches import declarations, named re-exports, and star re-exports;
- filters filenames to `mods/mod-swooper-maps/src/recipes/.*\.ts`;
- matches `@mapgen/domain/<domain>/<tail>`;
- excludes sources containing `/ops`;
- excludes sources containing `/config.js`.

Current native fixture coverage:

- ten positive matches: default import, named import, namespace import, type
  import, side-effect import, named re-export, type re-export, star re-export,
  recipe-local test path, and step-contract overlap path;
- zero-match controls for domain root, exact `/ops`, exact `/config.js`,
  `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`, contains-substring
  lookalikes, `.tsx`, maps, other mods, and non-recipe tests.

Current native samples prove current predicate behavior for those forms. They
do not prove Habitat wrapper selector truth, raw acquisition closure, injected
violation behavior, baseline behavior, retired-mechanism parity, or sibling-row
enforcement of substring-gap cases.

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
| RDS-E15 | `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_domain_surface --json` | exits 0; 10 positive matches and 0 ignore matches across the expanded fixture classes | native fixture/parser-edge subset is satisfied |
| RDS-E16 | TypeScript parser inventory over current wrapper roots | finds 230 `@mapgen/domain` references, 124 inside the recipe predicate, 0 current-row matches, 124 exact allowed recipe references, 0 excluded-but-non-exact recipe references, 0 recipe-local test references, and 38 step-contract references inside the recipe predicate | parser inventory and live zero-candidate evidence are recorded |
| RDS-E6 | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` design seed | exits 0; `grit-recipe-domain-surface` and `baseline-integrity` pass | not consumed as wrapper proof because accepted command selector truth is not available in this row's stack/base |
| RDS-E7 | bounded raw `grit check` over recipe root | exits 0 with `results: []` | raw acquisition closure remains unclaimed |
| RDS-E9 | disposable parser-edge probe | shared/private import and export forms report; root, `/ops`, `/config.js`, `.tsx`, maps, other mods, `/ops/private`, `ops-by-id`, and `config.js/private` do not | direct Grit behavior seed only, not current-tree closure |
| RDS-E10 | `domain_deep_import` packet | `/ops/private` is owned there; `ops-by-id` is a current defect there | neighboring proof ids are required before exact-surface closure |
| RDS-E12 | Effect docs and local Effect fit pack | Grit adapter hardening is a strong substrate fit | injected proof needs explicit Effect/manual decision |

## Design Consequences

1. The row is ready for a per-pattern packet.
2. Native fixture proof has an expanded current-predicate subset, but sibling
   substring-gap and wrapper proof remain required before implementation
   closure.
3. Exact allowed-surface proof must replace or supplement substring allowance
   for every non-exact source containing `/ops` or `/config.js`, not just the
   familiar tail cases.
4. Current zero-result proof is useful but does not replace injected proof.
5. Neighboring-rule overlap must be reviewed before downstream H5/H6 closure.
6. Apply remediation stays in a separate apply/generator/migration packet.
7. Probe implementation waits for the accepted Grit adapter substrate.
8. Manual injected-proof implementation must be rejected if it preserves the
   same untyped parser, command, cleanup, or test gaps that caused current proof
   drift.
9. Namespace imports, side-effect imports, and recipe-local test paths are proof
   requirements because the current policy language and filename predicate can
   otherwise be read more broadly than the implemented pattern.
