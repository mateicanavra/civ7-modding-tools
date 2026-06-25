# Habitat Authority Contract

Status: active authority frame with provisional flattened domain-niche hierarchy

## What This Establishes

`.habitat` is the only durable repository-local source of truth for structural
enforcement intent. Other files may execute, bridge, cache, generate, or test
that intent, but they do not define it independently.

The immediate goal is not to move executables or tool dispatch into `.habitat`.
The goal is to make every authored enforcement policy trace back to Habitat
artifacts, while execution mechanics stay in Habitat Toolkit source.

The current checked-in hierarchy is provisional. It first names domain niches,
then places exact-niche-owned artifact packets under `_self/<kind>/`, where
`<kind>` is `check`, `fix`, `generate`, `migrate`, or `triage`. The flattened
shape is defined in `AUTHORITY-TREE-SHAPE.md`.

Policies defined at a niche level are expected to cascade to child niches once
the manifest model exists, but this commit does not implement cascade
semantics.

## Already True

- Collected artifact packets live under each provisional niche root's
  `_self/<kind>/` directories.
- Rule identity is co-located as
  `<niche>/_self/check/<packet>/<packet>.rule.json`.
- Subject-local JSON files preserve baseline, fixture, generated-artifact, or
  rule-pack evidence gathered during triage, using
  `<subject>.baseline.json` for rule-owned baseline/evidence files.
- Subject-local Markdown files preserve authored check and apply pattern source.
- Subject-local command-check adapters are co-located with the subject they
  enforce as `<subject>.check.{sh,mjs,py,ts}` and must be read-only.
- Habitat-owned docs fix/generate operations have provisional
  `<subject>.operation.md` identities until the Toolkit has typed operation
  admission.
- Habitat artifact kinds and mutability rules are defined in
  `ARTIFACT-KINDS.md`. That reference currently admits `check`, `fix`,
  `generate`, and `migrate` only.
- The current authority-tree shape is defined in `AUTHORITY-TREE-SHAPE.md`.
  That reference treats gathered leaf folders as artifact packets under
  niche-local `_self/<kind>/` directories plus `_self/triage/`.
- Transitional adapters and legacy rule modules are co-located with the packet
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

These rules describe the current checked-in authority tree.

1. A structural check packet is admitted only by a packet folder under a
   recognized niche root at `_self/check/<packet>`.
2. A structural rule is admitted only by that folder's
   `<subject>.rule.json` record or a documented transitional adapter in the
   Habitat Toolkit niche.
3. A source-pattern rule is authored as `<subject>.pattern.md` in the owning
   subject folder until the final manifest shape is accepted.
4. A baseline or current-tree evidence file is accepted only when co-located
   with the owning rule as `<subject>.baseline.json` until the final
   manifest shape is accepted.
5. A command-backed check is accepted only when its script is read-only and
   co-located with the owning packet as `<subject>.check.{sh,mjs,py,ts}` or
   explicitly classified as product/package tooling outside Habitat.
6. Tool dispatch, provider selection, command construction, and result
   normalization are Habitat Toolkit implementation details.
7. External tool configs such as `biome.json`, `nx.json`,
   `eslint.boundaries.config.mjs`, `.grit/grit.yaml`, `.husky/*`, and
   `.github/workflows/*` are invocation or bridge layers. They remain in their
   conventional locations, but their structural meaning must be recoverable from
   `.habitat`.
8. Habitat-owned fix/generate/migrate operations require an explicit operation
   identity. Until typed operation admission exists, use
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
| `<niche>/_self/<check|fix|generate|migrate>/**` | Current location for admitted artifact packets, grouped by mutability kind under the owning niche. | Domain ownership, support-file ontology, blueprint schema, or implementation adapter dispatch. |
| `<niche>/_self/triage/**` | Holding area for mixed, unclear, legacy, or not-yet-admitted packets. | Default execution. |
| `<niche>/<child-niche>/**` | Child jurisdiction under the parent niche. | Parent-owned artifact packets; those belong under the parent's `_self/`. |
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

Habitat's current working artifact-kind vocabulary is documented in
`ARTIFACT-KINDS.md`: `check`, `fix`, `generate`, and `migrate`. How each kind
reaches Grit, Biome, Nx, Vitest, Bun, shell commands, or package-local tooling
is Toolkit code, not repo-authored adapter configuration.

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
7. Teach Toolkit discovery to route by `_self/<kind>/<packet>` before hardening
   resolver metadata around artifact packets.

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
- a new concern-layer bucket is introduced beneath a niche instead of using
  `_self/<kind>/`;
- a new niche level is created for `swooper-maps`, `ecology`, `placement`, a
  runner name, an artifact class, a rule ID, or a current defect name without
  later domain proof.
