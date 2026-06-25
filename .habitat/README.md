# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement.
The Habitat SDK code under `tools/habitat-harness` manages, validates, and
executes these artifacts, but package source, root scripts, tests, CI, hooks,
and tool configs are not independent sources of enforcement truth.

The current layout is a provisional domain-niche hierarchy. Niches are domain
nouns. Exact-niche-owned artifact packets live under `_self/<kind>/`, where
`<kind>` is `check`, `fix`, `generate`, `migrate`, or `triage`.

This is not a final ontology, and it is not evidence that runtime integration
has been fully rewired.

Current niche roots:

- `global/repository/**`: repo-wide policy for formatting, import boundaries,
  host-protected surfaces, and package-manager artifacts.
- `habitat/toolkit/**`: Habitat's own Toolkit authority, service shape,
  provider paths, generator schemas, rule-pack registry, and transitional
  runtime adapters.
- `docs/content/**`: documentation content hygiene, including portable docs
  references.
- `docs/projects/**`: documentation project maintenance operations such as
  issue-link fixing.
- `docs/site/**`: documentation site generation operations such as sidebar
  refresh.
- `civ7/resources/**`: official-resource-derived Civ7 generated projections
  and generated resource surfaces.
- `civ7/platform/**`: Civ7 adapter, control, and oRPC integration surfaces.
- `civ7/mapgen/core/**`: MapGen package/runtime core, SDK entrypoint, and docs
  surface.
- `civ7/mapgen/pipeline/**`: MapGen pipeline policy subjects, including stage
  contracts, domain/recipe imports, runtime capability access, RNG/config,
  schema defaults, and cutover guardrails.
- `civ7/mapgen/studio/**`: MapGen Studio integration with recipe artifacts.

Within a niche, `_self/` separates packets owned by that exact niche from child
niches. Artifact-kind folders under `_self/` carry mutability and runner intent:

- `check`: read-only evaluation.
- `fix`: idempotent repair of existing authored files.
- `generate`: materialization of declared generated or scaffolded outputs.
- `migrate`: intentional transition from one accepted authored shape to another.
- `triage`: holding area for mixed, legacy, or not-yet-admitted packets.

Each artifact packet remains the unit of evidence. Packet folders live under
`<niche>/_self/<kind>/` and use a shared filename prefix for related rule-owned
artifacts:

- `<subject-name>.rule.json`: rule metadata.
- `<subject-name>.baseline.json`: baseline, fixture, current-tree, or
  generated-artifact policy data.
- `<subject-name>.pattern.md`: primary check or apply pattern source.
- `<subject-name>.apply.pattern.md`: secondary apply pattern source when a rule
  also has a primary diagnostic pattern.
- `<subject-name>.check.{sh,mjs,py,ts}`: subject-local transitional read-only
  command adapter when the policy has not yet been expressed as Grit, Biome,
  Nx, or a typed Habitat provider.
- `<subject-name>.operation.md`: provisional identity for Habitat-owned
  non-check operations until typed operation admission exists.

Authority planes:

- `AUTHORITY.md`: the contract for what may be authoritative here and what
  remains Toolkit execution mechanics elsewhere.
- `ARTIFACT-KINDS.md`: the working reference for Habitat artifact kinds and
  their mutability rules.
- `AUTHORITY-TREE-SHAPE.md`: the working reference for the current flattened
  authority-tree shape.
- `dominoes.md`: the working ratchet sequence for authority-tree and runner
  integration dominoes.
- `config.md`: a human-readable sketch of the Habitat operation model. It is
  not consumed programmatically.
- `<niche>/_self/check/<packet>/<packet>.rule.json`: provisional rule metadata.
- `<niche>/_self/check/<packet>/<packet>.pattern.md`: provisional check or apply
  pattern source.
- `<niche>/_self/check/<packet>/<packet>.baseline.json`: provisional baseline,
  fixture, current-tree, or generated-artifact policy data.
- `<niche>/_self/check/<packet>/<packet>.check.{sh,mjs,py,ts}`: transitional
  packet-local read-only command check.
- `<niche>/_self/<fix|generate|migrate>/<packet>/<packet>.operation.md`:
  provisional non-check operation identity.
- `<niche>/_self/triage/<packet>/**`: mixed, unclear, legacy, or
  not-yet-admitted packet material excluded from default execution.
- Normal directories under a niche remain child niches. `_self/` separates
  exact-niche-owned packets from child niches.

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

Runner status note: curated `habitat check --rule <id>` execution is the
currently proven bridge for package scripts. Plain `habitat check` /
`bun run habitat:check` full-suite execution has known resolver/admission debt
and should be treated as a rebuild target rather than a surprising failure. The
full-suite runner should be rebuilt around `.habitat/**/_self/<kind>/<packet>/`
discovery, path-inferred niche/kind identity, explicit triage exclusion, and
clear packet-level diagnostics.
