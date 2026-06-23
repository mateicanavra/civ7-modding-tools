# Habitat Authority Contract

Status: active authority frame with provisional niche hierarchy

## What This Establishes

`.habitat` is the only durable repository-local source of truth for structural
enforcement intent. Other files may execute, bridge, cache, generate, or test
that intent, but they do not define it independently.

The immediate goal is not to move executables or tool dispatch into `.habitat`.
The goal is to make every authored enforcement policy trace back to Habitat
artifacts, while execution mechanics stay in Habitat Toolkit source.

The current subject hierarchy is provisional. It is a first-pass domain design
for organizing the 54 triage subjects by policy seam, not by runner, rule ID,
source folder, or current defect name. Rules defined at a niche level are
expected to cascade to child niches once the manifest model exists, but this
commit does not implement cascade semantics.

## Already True

- Collected rule folders live under each provisional niche root's `rules/`
  directory.
- Rule identity is co-located as
  `<niche>/rules/<rule-name>/<rule-name>.rule.json`.
- Subject-local JSON files preserve baseline, fixture, generated-artifact, or
  rule-pack evidence gathered during triage, using
  `<rule-name>.baseline.json` for rule-owned baseline/evidence files.
- Subject-local Markdown files preserve authored check and apply pattern source.
- Transitional adapters and legacy rule modules are co-located with the rule
  folder or Toolkit-runtime niche that owns their policy evidence.
- CI and hooks already delegate into root commands that can route through
  Habitat and Nx.

## Still Not True

- Toolkit resolvers, target routing, tests, docs, and package scripts still
  contain compatibility references to old flat `.habitat/rules`,
  `.habitat/patterns`, `.habitat/baselines`, and
  `.habitat/tooling/components` paths.
- Many registered source rules still use `ownerTool: "source-check"` even when
  an authored Markdown pattern exists in a rule folder.
- Some command-backed rules point directly at root `scripts/lint/*` files.
- Structural tests live in package `test/` trees without a Habitat rule identity
  or explicit decision that they are product tests rather than structure rules.
- `.grit/grit.yaml` is still a bridge, not an authority surface; it must point
  at Habitat-authored patterns rather than duplicate them.
- Habitat source still contains executable enforcement implementation details
  that must be classified as provider/runtime/tooling code, not authored policy.

## Authority Rules

1. A structural subject is admitted only by a rule folder under a recognized
   niche root's `rules/` directory.
2. A structural rule is admitted only by that folder's
   `<rule-name>.rule.json` record or a documented transitional adapter in the
   Habitat Toolkit runtime niche.
3. A source-pattern rule is authored as `<rule-name>.pattern.md` in the owning
   rule folder until the final manifest shape is accepted.
4. A baseline or current-tree evidence file is accepted only when co-located
   with the owning rule as `<rule-name>.baseline.json` until the final
   manifest shape is accepted.
5. Tool dispatch, provider selection, command construction, and result
   normalization are Habitat Toolkit implementation details.
6. External tool configs such as `biome.json`, `nx.json`,
   `eslint.boundaries.config.mjs`, `.grit/grit.yaml`, `.husky/*`, and
   `.github/workflows/*` are invocation or bridge layers. They remain in their
   conventional locations, but their structural meaning must be recoverable from
   `.habitat`.
7. No new loose lint, validation, structural-check, or pattern script may be
   introduced as authored policy without a Habitat rule identity. If it is
   Toolkit execution machinery, it belongs in Toolkit source and must not be
   represented as repo-authored Habitat policy.

## Directory Ownership

| Path | Owns | Does Not Own |
| --- | --- | --- |
| `global/repo-hygiene/rules/**` | Repo-wide hygiene rules that are not owned by a single product or Toolkit domain. | Product-specific architecture. |
| `global/generated-and-protected-artifacts/rules/**` | Generated files, protected host surfaces, lock/artifact policies, and current-tree ownership evidence. | Generator implementation. |
| `habitat/authority-and-toolkit-runtime/rules/**` | Habitat's own authority, service shape, provider-path, generator-schema bridge, rule-pack, and transitional runtime subjects. | Generic dispatch configuration outside Toolkit code. |
| `civ7/platform-integration-boundaries/rules/**` | Civ7 adapter, control-app, and oRPC ownership boundaries. | MapGen pipeline internals. |
| `civ7/mapgen/core-and-sdk-boundaries/rules/**` | MapGen package/runtime and SDK public surface boundaries. | Pipeline step architecture. |
| `civ7/mapgen/pipeline-architecture/rules/**` | MapGen pipeline contracts, domain/recipe import topology, runtime purity, RNG/config, schema/default, and cutover guardrails. | Separate ecology, placement, runner, or rule-ID hierarchy roots. |
| `civ7/mapgen/studio-integration/rules/**` | MapGen Studio recipe integration artifacts. | General MapGen pipeline architecture. |
| `config.md` | Human-readable operation model and vocabulary. | Parseable tool dispatch configuration. |

## Current Owner-Tool Classes

These classes describe existing rule records. They are not the top-level Habitat
ontology and should not grow into a separate adapter configuration language.

- `grit-check`: diagnostic source patterns authored under `patterns/checks`.
- `pattern-apply`: apply patterns authored under `patterns/apply`.
- `file-layer`: file-presence, generated-artifact, and protected-surface checks
  that are explicitly represented as Habitat rules.
- `format-check`: formatting and import hygiene represented as Habitat rules
  but executed by Biome.
- `nx`: workspace graph and boundary checks represented as Habitat rules but
  executed through Nx.
- `command-check`: temporary adapter class for command-backed checks that have
  not yet been rewritten as Grit, Biome, Nx, file-layer, or test-backed rules.
- `test-check`: reserved class for structural tests admitted as Habitat rules.

Long term, Habitat's user-facing operation model should be domain-oriented:
`check`, `apply`, `generate`, and `verify`. How each operation reaches Grit,
Biome, Nx, Vitest, Bun, or shell commands is Toolkit code.

## Migration Implications

The next consolidation slices should:

1. Rewire Toolkit rule, pattern, baseline, source-check, target-routing,
   generator-schema, package-script, and test references from legacy flat paths
   to the accepted authority model.
2. Convert pattern-backed `source-check` rules to `grit-check`.
3. Classify command-backed root lint scripts as either authored Habitat policy
   or Toolkit execution mechanics. Do not create a `.habitat/tooling` layer for
   generic command dispatch.
4. Decide which structural-looking tests are true Habitat rules and register
   them, leaving product/domain tests in package test trees.
5. Make `.grit/grit.yaml` an execution bridge to Habitat patterns, not a second
   pattern source.
6. Keep Nx, Biome, Husky, CI, and package scripts as thin execution layers whose
   authority is traceable to this tree.

## Stop Conditions

Stop a consolidation slice if it creates any of these states:

- an authored structural policy exists with no Habitat rule identity;
- generic tool dispatch is modeled as repo-authored `.habitat` configuration
  instead of Toolkit source;
- a pattern, baseline, or adapter exists outside its rule folder with no bridge
  rationale;
- an external config claims structural meaning not represented in `.habitat`;
- a test is used as a structural gate without either Habitat registration or an
  explicit product-test classification.
- a new niche level is created for `swooper-maps`, `ecology`, `placement`, a
  runner name, a rule ID, or a current defect name without later domain proof.
