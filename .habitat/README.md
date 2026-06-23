# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement.
The Habitat SDK code under `tools/habitat-harness` manages, validates, and
executes these artifacts, but package source, root scripts, tests, CI, hooks,
and tool configs are not independent sources of enforcement truth.

The current layout is a provisional domain-niche hierarchy with four flat
policy layers inside each niche: `boundaries`, `structure`, `capabilities`, and
`contracts`. Niches are domain nouns. Layers are generic governance concerns.
Rule, pattern, baseline, and adapter artifacts are then grouped by subject under
the layer that best describes the subject's primary concern.

This is not a final ontology, and it is not evidence that runtime integration
has been fully rewired.

Current niche roots:

- `global/repository/**`: repo-wide policy for checkout hygiene, formatting,
  import boundaries, protected surfaces, generated outputs, and package
  artifacts.
- `habitat/toolkit/**`: Habitat's own Toolkit authority, service shape,
  provider paths, generator schemas, rule-pack registry, and transitional
  runtime adapters.
- `docs/**`: documentation maintenance authority such as project issue-link
  fixers and docs site sidebar generation.
- `civ7/platform/**`: Civ7 adapter, control, and oRPC integration surfaces.
- `civ7/mapgen/core/**`: MapGen package/runtime core, SDK entrypoint, and docs
  surface.
- `civ7/mapgen/pipeline/**`: MapGen pipeline policy subjects, including stage
  contracts, domain/recipe imports, runtime capability access, RNG/config,
  schema defaults, and cutover guardrails.
- `civ7/mapgen/studio/**`: MapGen Studio integration with recipe artifacts.

Within a niche, subjects are grouped into these flat layer buckets:

- `boundaries`: import/export, dependency direction, public/private surface, and
  ownership-edge subjects.
- `structure`: file-tree, module-shape, generated/protected file placement,
  docs-shape, and retired-topology subjects.
- `capabilities`: privileged runtime, provider, engine, RNG, validation,
  process, or other effectful capability subjects.
- `contracts`: schema, DTO, public API, registry, manifest, generator input, and
  dependency-contract subjects.

Each subject folder remains the unit of evidence. Subject folders live directly
under one of the layer buckets and use a shared filename prefix for related
rule-owned artifacts:

- `<subject-name>.rule.json`: rule metadata.
- `<subject-name>.baseline.json`: baseline, fixture, current-tree, or
  generated-artifact policy data.
- `<subject-name>.pattern.md`: primary check or apply pattern source.
- `<subject-name>.apply.pattern.md`: secondary apply pattern source when a rule
  also has a primary diagnostic pattern.
- `<subject-name>.check.{sh,mjs,py,ts}`: subject-local transitional command
  adapter when the policy has not yet been expressed as Grit, Biome, Nx, or a
  typed Habitat provider.

Authority planes:

- `AUTHORITY.md`: the contract for what may be authoritative here and what
  remains Toolkit execution mechanics elsewhere.
- `config.md`: a human-readable sketch of the Habitat operation model. It is
  not consumed programmatically.
- `<niche>/<layer>/<subject>/<subject>.rule.json`: provisional rule metadata.
- `<niche>/<layer>/<subject>/<subject>.pattern.md`: provisional check or apply
  pattern source.
- `<niche>/<layer>/<subject>/<subject>.baseline.json`: provisional baseline,
  fixture, current-tree, or generated-artifact policy data.
- `<niche>/<layer>/<subject>/<subject>.check.{sh,mjs,py,ts}`: transitional
  subject-local command check.
- `<niche>/<layer>/<subject>/*.{mjs,ts}`: transitional adapters or legacy rule
  sources that must either be admitted as Toolkit execution mechanics or
  converted into authored patterns.

Executor compatibility views are outside this authority tree. Habitat owns the
rule, pattern, baseline, and subject-folder hierarchy here; Grit, Biome, Nx,
Vitest, Husky, CI, and shell/Node/Python scripts are execution mechanisms. The
dispatch logic that invokes those mechanisms belongs in Habitat Toolkit source,
not in a separate `.habitat` tooling configuration layer.

Compatibility note: several Toolkit paths still reference the old flat
`.habitat/rules`, `.habitat/patterns`, `.habitat/baselines`, and
`.habitat/tooling/components` shapes. Those references are follow-up integration
work for the Toolkit resolver, package scripts, target routing, source-check
loader, generator schema bridge, tests, and docs. This hierarchy pass is
classification and authority layout only.
