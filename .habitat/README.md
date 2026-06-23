# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement.
The Habitat SDK code under `tools/habitat-harness` manages, validates, and
executes these artifacts, but package source, root scripts, tests, CI, hooks,
and tool configs are not independent sources of enforcement truth.

The current layout is a provisional niche hierarchy. It groups gathered rule,
pattern, baseline, and adapter artifacts by durable policy seam so later work
can define one pattern at a time and burn down violations against that pattern.
It is not a final ontology, and it is not evidence that runtime integration has
been fully rewired.

Current niche roots:

- `global/repo-hygiene/**`: repo-wide hygiene policies such as checkout path
  normalization, format/CI conformance, and import boundary rules.
- `global/generated-and-protected-artifacts/**`: generated outputs and protected
  surfaces whose ownership is structural rather than product-specific.
- `habitat/authority-and-toolkit-runtime/**`: Habitat's own authority,
  generator, service-shape, provider-path, rule-pack, and transitional Toolkit
  runtime artifacts.
- `civ7/platform-integration-boundaries/**`: Civ7 platform adapter, control,
  and oRPC boundary policies.
- `civ7/mapgen/core-and-sdk-boundaries/**`: MapGen package and SDK surface
  boundaries.
- `civ7/mapgen/pipeline-architecture/**`: MapGen pipeline architecture rules,
  including stage contracts, domain/recipe imports, runtime purity, RNG/config,
  schema defaults, and cutover guardrails.
- `civ7/mapgen/studio-integration/**`: MapGen Studio integration artifacts.

Each rule folder remains the unit of evidence. Rule folders live under the
owning niche's `rules/` directory and use a shared filename prefix for related
artifacts:

- `<rule-name>.rule.json`: rule metadata.
- `<rule-name>.baseline.json`: baseline, fixture, current-tree, or
  generated-artifact policy data.
- `<rule-name>.pattern.md`: primary check or apply pattern source.
- `<rule-name>.apply.pattern.md`: secondary apply pattern source when a rule
  also has a primary diagnostic pattern.

Authority planes:

- `AUTHORITY.md`: the contract for what may be authoritative here and what
  remains Toolkit execution mechanics elsewhere.
- `config.md`: a human-readable sketch of the Habitat operation model. It is
  not consumed programmatically.
- `<niche>/rules/<rule-name>/<rule-name>.rule.json`: provisional rule metadata.
- `<niche>/rules/<rule-name>/<rule-name>.pattern.md`: provisional check or apply
  pattern source.
- `<niche>/rules/<rule-name>/<rule-name>.baseline.json`: provisional baseline,
  fixture, current-tree, or generated-artifact policy data.
- `<niche>/rules/<rule-name>/*.{mjs,ts}`: transitional adapters or legacy rule
  sources that must either be admitted as Toolkit execution mechanics or
  converted into authored patterns.

Executor compatibility views are outside this authority tree. Habitat owns the
rule, pattern, baseline, and rule-folder hierarchy here; Grit, Biome, Nx, Vitest,
Husky, CI, and shell/Node/Python scripts are execution mechanisms. The dispatch
logic that invokes those mechanisms belongs in Habitat Toolkit source, not in a
separate `.habitat` tooling configuration layer.

Compatibility note: several Toolkit paths still reference the old flat
`.habitat/rules`, `.habitat/patterns`, `.habitat/baselines`, and
`.habitat/tooling/components` shapes. Those references are follow-up integration
work for the Toolkit resolver, package scripts, target routing, source-check
loader, generator schema bridge, tests, and docs. This hierarchy pass is
classification and authority layout only.
