# Habitat Authority Contract

Status: active authority frame with provisional domain-niche hierarchy

## What This Establishes

`.habitat` is the only durable repository-local source of truth for structural
enforcement intent. Other files may execute, bridge, cache, generate, or test
that intent, but they do not define it independently.

The immediate goal is not to move executables or tool dispatch into `.habitat`.
The goal is to make every authored enforcement policy trace back to Habitat
artifacts, while execution mechanics stay in Habitat Toolkit source.

The current subject hierarchy is provisional. It first names domain niches, then
places each subject under one of four generic governance layers: `boundaries`,
`structure`, `capabilities`, or `contracts`. This is intentionally not organized
by runner, rule ID, source folder, current defect name, or artifact class.
Policies defined at a niche level are expected to cascade to child niches once
the manifest model exists, but this commit does not implement cascade
semantics.

## Already True

- Collected subject folders live under each provisional niche root's layer
  buckets: `boundaries`, `structure`, `capabilities`, and `contracts`.
- Rule identity is co-located as
  `<niche>/<layer>/<subject>/<subject>.rule.json`.
- Subject-local JSON files preserve baseline, fixture, generated-artifact, or
  rule-pack evidence gathered during triage, using
  `<subject>.baseline.json` for rule-owned baseline/evidence files.
- Subject-local Markdown files preserve authored check and apply pattern source.
- Subject-local command-check adapters are co-located with the subject they
  enforce as `<subject>.check.{sh,mjs,py,ts}` and must be read-only.
- Habitat-owned docs fix/generate operations have provisional
  `<subject>.operation.md` identities until the Toolkit admits typed operation
  manifests.
- Transitional adapters and legacy rule modules are co-located with the subject
  folder or Toolkit niche that owns their policy evidence.
- CI and hooks already delegate into root commands that can route through
  Habitat and Nx.

## Still Not True

- Toolkit resolvers, tests, and docs still contain compatibility references to
  old flat `.habitat/rules`, `.habitat/patterns`, `.habitat/baselines`, and
  `.habitat/tooling/components` paths.
- Many registered source rules still use `ownerTool: "source-check"` even when
  an authored Markdown pattern exists in a subject folder.
- Some command-backed rules still execute transitional subject-local read-only
  scripts instead of typed Habitat/Grit/Biome/Nx policy.
- Structural tests live in package `test/` trees without a Habitat rule identity
  or explicit decision that they are product tests rather than structure rules.
- `.grit/grit.yaml` is still a bridge, not an authority surface; it must point
  at Habitat-authored patterns rather than duplicate them.
- Habitat source still contains executable enforcement implementation details
  that must be classified as provider/runtime/tooling code, not authored policy.

## Authority Rules

1. A structural subject is admitted only by a subject folder under a recognized
   niche root and one of the accepted layer buckets: `boundaries`, `structure`,
   `capabilities`, or `contracts`.
2. A structural rule is admitted only by that folder's
   `<subject>.rule.json` record or a documented transitional adapter in the
   Habitat Toolkit niche.
3. A source-pattern rule is authored as `<subject>.pattern.md` in the owning
   subject folder until the final manifest shape is accepted.
4. A baseline or current-tree evidence file is accepted only when co-located
   with the owning rule as `<subject>.baseline.json` until the final
   manifest shape is accepted.
5. A command-backed check is accepted only when its script is read-only and
   co-located with the owning subject as `<subject>.check.{sh,mjs,py,ts}` or
   explicitly classified as product/package tooling outside Habitat.
6. Tool dispatch, provider selection, command construction, and result
   normalization are Habitat Toolkit implementation details.
7. External tool configs such as `biome.json`, `nx.json`,
   `eslint.boundaries.config.mjs`, `.grit/grit.yaml`, `.husky/*`, and
   `.github/workflows/*` are invocation or bridge layers. They remain in their
   conventional locations, but their structural meaning must be recoverable from
   `.habitat`.
8. Habitat-owned apply/fix/generate/verify operations require an explicit
   operation identity. Until typed manifests exist, use
   `<subject>.operation.md` and do not register the operation as a read-only
   rule unless it actually performs a read-only check.
9. No new loose lint, validation, structural-check, or pattern script may be
   introduced as authored policy without a Habitat rule identity. If it is
   Toolkit execution machinery, it belongs in Toolkit source and must not be
   represented as repo-authored Habitat policy.

## Directory Ownership

| Path | Owns | Does Not Own |
| --- | --- | --- |
| `global/repository/**` | Repo-wide policy for formatting, imports, host-protected surfaces, lock/artifact files, and current-tree ownership evidence. | Product-specific architecture, generated product projections, or generator implementation. |
| `habitat/toolkit/**` | Habitat's own Toolkit authority, service shape, provider paths, generator schema contracts, rule-pack registry, and transitional runtime subjects. | Generic dispatch configuration outside Toolkit code. |
| `docs/content/**` | Documentation content hygiene and portable reference structure. | Product runtime behavior, package build behavior, or generated docs-site operation implementation. |
| `docs/projects/**` | Documentation project maintenance operations, including issue-link fixing. | Product runtime behavior, package build behavior, or historical evidence rewriting. |
| `docs/site/**` | Documentation site generation operations. | General docs content policy or product runtime behavior. |
| `civ7/resources/**` | Official-resource-derived Civ7 generated projections and protected generated resource surfaces. | MapGen pipeline-generated map entrypoints or generic repository artifact policy. |
| `civ7/platform/**` | Civ7 adapter, direct-control, app-facing control surfaces, and oRPC ownership. | MapGen pipeline internals. |
| `civ7/mapgen/core/**` | MapGen package/runtime core, SDK entrypoint, and docs surface. | Pipeline step architecture or Studio-specific recipe artifact use. |
| `civ7/mapgen/pipeline/**` | MapGen pipeline contracts, domain/recipe import topology, runtime capability access, RNG/config, schema/default, and cutover guardrails. | Separate ecology, placement, runner, or rule-ID hierarchy roots. |
| `civ7/mapgen/studio/**` | MapGen Studio's recipe-artifact integration surface. | General MapGen pipeline architecture. |
| `<niche>/boundaries/**` | Import/export, dependency direction, public/private surface, and ownership-edge subjects for that niche. | Runtime capability access, schema shape, or file-tree shape unless the boundary is the primary governed concern. |
| `<niche>/structure/**` | File-tree, module-shape, generated/protected placement, docs-shape, and retired-topology subjects for that niche. | Public API contracts or privileged runtime access. |
| `<niche>/capabilities/**` | Privileged runtime, provider, engine, RNG, validation, process, or other effectful capability subjects for that niche. | Ordinary import boundaries or structural file placement. |
| `<niche>/contracts/**` | Schema, DTO, public API, registry, manifest, generator input, and dependency-contract subjects for that niche. | Generic execution dispatch or narrow source-folder defects. |
| `config.md` | Human-readable operation model and vocabulary. | Parseable tool dispatch configuration. |

## Current Owner-Tool Classes

These classes describe existing rule records. They are not the top-level Habitat
ontology and should not grow into a separate adapter configuration language.

- `grit-check`: diagnostic source patterns authored under subject folders.
- `pattern-apply`: apply patterns authored under subject folders.
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
- a pattern, baseline, or adapter exists outside its subject folder with no
  bridge rationale;
- an external config claims structural meaning not represented in `.habitat`;
- a test is used as a structural gate without either Habitat registration or an
  explicit product-test classification;
- a new layer is created outside `boundaries`, `structure`, `capabilities`, and
  `contracts`, or a new niche level is created for `swooper-maps`, `ecology`,
  `placement`, a runner name, an artifact class, a rule ID, or a current defect
  name without later domain proof.
