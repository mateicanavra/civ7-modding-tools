# Source Synthesis - Step Contract Domain Surface Proof

## Authority Order

This packet separates policy authority from behavior/proof authority. Current
code, current patterns, and fresh command behavior outrank historical closure
records for behavior claims. H5/H6 records are parity targets and stale-record
risks until current proof ids re-establish their claims.

### Policy And Product Authority

1. `docs/projects/habitat-harness/dra-takeover-frame.md`
2. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
3. `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
4. `docs/system/libs/mapgen/how-to/add-a-step.md`
5. `docs/system/libs/mapgen/policies/IMPORTS.md`
6. `docs/projects/habitat-harness/invariant-corpus.md`
7. `docs/projects/habitat-harness/taxonomy.md`
8. `docs/projects/habitat-harness/discrepancy-log.md`
9. Official Grit docs
10. Official Effect docs and local Effect adoption fit research for substrate
    decisions
11. Adjacent row packets for recipe domain surface, domain deep import, and
    contract export checks
12. H5/H6 records only as historical parity targets

### Behavior And Proof Authority

1. `tools/habitat-harness/src/rules/rules.json`
2. `.grit/patterns/habitat/checks/step_contract_domain_surface.md`
3. `tools/habitat-harness/src/lib/grit.ts`
4. Fresh native Grit, Habitat wrapper, bounded raw Grit, and inventory commands
5. Disposable probes as seed evidence until replaced by durable fixtures or an
   accepted typed adapter proof
6. Adjacent row packets for overlap facts
7. H5/H6 records only as historical parity targets

## Product Source

The takeover frame requires every Grit row to become a proof-backed structural
contract before agents can rely on it. The corpus ledger row for
`grit-step-contract-domain-surface` says step contracts bind domain contracts
only through approved public domain surfaces and names this OpenSpec id.

This row protects authoring correctness, not runtime behavior. The product
outcome is that an agent modifying or creating a step contract can trust Habitat
to detect imports from domain implementation surfaces before those imports
become architectural drift.

## Architecture Source

`STAGE-AND-STEP-AUTHORING.md` defines step contracts as the authoring-time
declaration surface for id, phase, requires/provides, artifacts, schema, and
ops declarations. The step module owns implementation.

`add-a-step.md` directs authors to create `*.contract.ts`, wire required ops
through the contract, and use published entrypoints through the import policy.

`IMPORTS.md` distinguishes ordinary recipe imports from contract imports.
Ordinary recipes may use domain root, `/ops`, and `/config.js`; step contracts
must bind through the domain root because they should depend on declarations,
not runtime implementation surfaces.

`invariant-corpus.md` records the retired `eslint-step-contract-imports`
invariant: step contracts import only `@mapgen/domain/<d>`.

`taxonomy.md` places this row in the `scope:domain-surface` family and names
step contracts as a stricter surface inside recipe roots.

`rules.json` registers the rule as enforced, owner `grit-check`, owner project
`mod-swooper-maps`, scope
`mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}`, and
message "Step contracts must import only from @mapgen/domain/<domain>."

## Current Pattern Source

`.grit/patterns/habitat/checks/step_contract_domain_surface.md`:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- matches import declarations, named re-exports, and star re-exports;
- filters filenames with
  `.*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$`;
- matches source specifiers with
  `.*@mapgen/domain/[^/]+/.+`.

The current regex can match any `mods/<mod>` path when raw Grit is pointed at
that tree. The current Habitat Grit adapter can only exercise this row under
`mods/mod-swooper-maps/src/recipes` because the adapter scan roots are fixed to
existing roots from packages, Studio, Swooper recipes, Swooper maps, and Swooper
domain.

The source regex can also match prefixed, relative, or other non-package module
specifier strings that contain `@mapgen/domain/<domain>/<tail>`. That current
behavior must be repaired, sibling-owned, or blocked before exact source-scope
claims.

Current native samples:

- one positive default import from `@mapgen/domain/ecology/ops`;
- one negative import from `@mapgen/domain/ecology`.

Current native samples do not prove namespace imports, type imports,
side-effect imports, named re-exports, type re-exports, star re-exports, path
controls, neighboring overlap, current-tree wrapper behavior, injected
violations, or explicit baseline behavior.

## Official Grit Source

Official Grit docs establish:

- `grit patterns test --filter` as the pattern fixture proof command;
- Markdown pattern conventions under `.grit/patterns`;
- frontmatter `level` for diagnostic severity;
- `grit check [PATHS]...` as current-tree check command;
- explicit `language js(typescript)` as the TypeScript parser declaration;
- structural snippets with `where` predicates and regex matching as valid
  pattern tools.

Official docs do not establish Habitat rule projection, Habitat scan roots,
shrink-only baselines, injected-probe cleanup, retired-mechanism parity,
overlap ownership, or stale-record truth. Habitat owns those proof classes.

## Effect Substrate Source

`docs/projects/habitat-harness/research/official-docs-effect.md` records that
Effect exposes typed success, error, and requirements; services and Layers;
scoped resources; command data through `@effect/platform/Command`; and
structured tagged errors. It also records that Effect is not authority for
Grit semantics, Biome safety, Nx graph truth, baseline policy, or Habitat owner
layers.

`docs/projects/habitat-harness/research/local-effect-adoption-fit.md` identifies
`habitat-effect-grit-adapter` as a strong candidate for typed Grit command
acquisition, JSON parse classification, scan-root provenance, pattern
projection, diagnostic projection, baseline behavior, and scoped cleanup.

That substrate directly applies here because injected proof for this row needs
rule-id projection through the Habitat wrapper, parser-edge classification,
neighboring-rule overlap classification, command provenance, scan-root
provenance, and cleanup proof.

## Local Evidence

| Evidence id | Source | Result | Implication |
| --- | --- | --- | --- |
| SCDS-E1 | `tools/habitat-harness/src/rules/rules.json` | Rule id `grit-step-contract-domain-surface` is registered as enforced `grit-check` with `mods/*` step-contract scope. | Rule identity and intended metadata exist. |
| SCDS-E2 | `.grit/patterns/habitat/checks/step_contract_domain_surface.md` | Pattern matches import and re-export declarations from source specifiers containing non-root domain package strings in filenames ending in `contract.ts`. | Authored predicate exists and must be proven exactly. |
| SCDS-E3 | `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter step_contract_domain_surface --json` | Exit 0; one testable pattern succeeds with one positive and one negative sample. | Native fixture proof seed exists. |
| SCDS-E4 | `bun run habitat:check -- --json --rule grit-step-contract-domain-surface` | Exit 0; `grit-step-contract-domain-surface` and `baseline-integrity` pass. | Valid wrapper selection currently passes. |
| SCDS-E5 | Direct raw Grit over `mods/mod-swooper-maps/src/recipes` | Exit 0 with `results: []`. | Bounded raw zero-result seed exists for the current Swooper recipe root. |
| SCDS-E6 | `tools/habitat-harness/src/lib/grit.ts` | Adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, Swooper recipes, Swooper maps, and Swooper domain. | Wrapper roots and raw acquisition roots must be recorded separately. |
| SCDS-E7 | Current-tree `find` over Swooper step contracts | 53 matching files: 23 `contract.ts`, 30 `*.contract.ts`, zero lookalikes, zero `.tsx`. | Live filename inventory supports current zero findings but not predicate exactness. |
| SCDS-E8 | Current-tree import inventory over matching files | Domain imports are domain root only; no `@mapgen/domain/<domain>/<tail>` sources. | Supplemental live inventory supports zero current violations. |
| SCDS-E9 | Disposable raw Grit probe under `/tmp` | Default, named, namespace, type, side-effect imports and named/type/star re-exports from domain subpaths report; domain root does not. | Parser-form behavior works under direct Grit and needs durable proof. |
| SCDS-E10 | Disposable path-control probe under `/tmp` | `notacontract.ts`, other-mod raw paths, and `__tests__/contract.ts` report; `.tsx`, maps, and non-`steps` paths do not. | Filename lookalikes, recipe-local tests, and wrapper/raw scope divergence are closure issues. |
| SCDS-E11 | External adversarial review agent `019ec731-6096-71e2-af1e-08b432b632bc` | No P1 findings; P2 finding that a prefixed source such as `not-a-real-prefix@mapgen/domain/ecology/ops` reports through the current leading-wildcard source regex. | Source-specifier lookalike controls are required before exact source-scope claims. |
| SCDS-E12 | Neighboring rule probe facts | `recipe_domain_surface` overlaps on many contract subpaths; `domain_deep_import` overlaps on `ops/<tail>`, `rules/<tail>`, and `strategies/<tail>`; `contract_export_all` overlaps on star re-exports. | Closure needs reviewed multi-rule expectations or predicate partitioning. |
| SCDS-E13 | `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` and `how-to/add-a-step.md` | Step contracts are authoring declarations and implementation lives in step modules. | The stricter domain-root-only rule has architecture authority. |
| SCDS-E14 | `invariant-corpus.md` and H5/H6 records | Retired lint/test mechanisms mention step-contract import boundaries. | Parity and stale-record truth need row-level proof ids; these records do not outrank current behavior. |
| SCDS-E15 | Effect docs and local Effect fit pack | Grit adapter hardening is a strong substrate fit. | Injected proof should consume or complete the typed adapter substrate. |
| SCDS-E16 | `git status --short --branch` before packet | Branch `codex/habitat-dra-takeover-frame`; only this packet is untracked during drafting. | Design started from a clean committed base. |

## Design Consequences

1. The row is ready for a per-pattern packet.
2. Native fixture proof needs expansion or supplement before implementation
   closure.
3. Current wrapper pass is useful but does not prove injected violations,
   all-mod enforcement, exact filename scope, or parser-edge coverage.
4. Raw Grit capability, wrapper enforcement, registry metadata, and historical
   H5/H6 parity records must remain separate claims.
5. Domain root is the only allowed surface for step contracts; ordinary recipe
   `/ops` and `/config.js` allowances do not apply.
6. `notacontract.ts`, source-specifier lookalikes, recipe-local tests, and
   other-mod paths require explicit disposition before downstream records can
   claim exact scope.
7. Neighboring-rule overlap must be reviewed before aggregate closure.
8. Apply remediation stays in a separate apply/generator/migration packet.
9. Probe implementation waits for the accepted Grit adapter substrate or an
   equivalently typed reviewed substrate.
