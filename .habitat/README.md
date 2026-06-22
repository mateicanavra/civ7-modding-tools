# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement.
The Habitat SDK code under `tools/habitat-harness` manages, validates, and
executes these artifacts, but package source, root scripts, tests, CI, hooks,
and tool configs are not independent sources of enforcement truth.

Authority planes:

- `AUTHORITY.md`: the contract for what may be authoritative here and what
  remains Toolkit execution mechanics elsewhere.
- `config.md`: a human-readable sketch of the Habitat operation model. It is
  not consumed programmatically.
- `rules/index.json`: shared rule registry metadata and owner-root catalog.
- `rules/<rule-id>/rule.json`: one self-contained record per registered Habitat
  rule, parsed through the
  TypeBox registry schema in
  `tools/habitat-harness/src/service/model/rules/dto/registry.schema.ts`.
- `baselines/*.json`: explicit baseline files for registered rules, parsed
  through the baseline contract.
- `patterns/checks/*.md`: active Habitat check patterns.
- `patterns/apply/*.md`: active Habitat apply patterns.

Executor compatibility views are outside this authority tree. Habitat owns the
rule, pattern, and baseline hierarchy here; Grit, Biome, Nx, Vitest, Husky, CI,
and shell/Node/Python scripts are execution mechanisms. The dispatch logic that
invokes those mechanisms belongs in Habitat Toolkit source, not in a separate
`.habitat` tooling configuration layer.
