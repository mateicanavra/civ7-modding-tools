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

Current native samples:

- one positive default import from a private domain subpath;
- one negative import from `/config.js`.

Current native samples do not prove domain root, exact `/ops`, type imports,
namespace imports, side-effect imports, re-export forms, path controls, or
substring-gap cases.

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
| RDS-E1 | `grit patterns test --filter recipe_domain_surface --json` | exits 0; one testable pattern succeeds | native fixture proof exists |
| RDS-E2 | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` | exits 0; `grit-recipe-domain-surface` and `baseline-integrity` pass | valid wrapper selection currently passes |
| RDS-E3 | bounded raw `grit check` over recipe root | exits 0 with `results: []` | raw current-tree zero-result seed for the effective root |
| RDS-E4 | `rg` over recipe source for `@mapgen/domain/<domain>/<tail>` | live imports are `/ops` and `/config.js` | no obvious live recipe violation |
| RDS-E5 | disposable parser-edge probe | shared/private import and export forms report; root, `/ops`, `/config.js`, `.tsx`, maps, other mods, `/ops/private`, `ops-by-id`, and `config.js/private` do not | core forms work, but exact-surface, side-effect import, namespace import, recipe-local test, and scope gaps exist |
| RDS-E6 | `domain_deep_import` packet | `/ops/private` is owned there; `ops-by-id` is a current defect there | neighboring proof ids are required |
| RDS-E7 | Effect docs and local Effect fit pack | Grit adapter hardening is a strong substrate fit | injected proof needs explicit Effect/manual decision |

## Design Consequences

1. The row is ready for a per-pattern packet.
2. Native fixture proof needs expansion or supplement before implementation
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
