## ADDED Requirements

### Requirement: Habitat supports native structure-check rule records

Habitat SHALL admit `ownerTool: "structure-check"` rule records only when they
declare a repo-relative `structureFile`. Structure records SHALL project into a
dedicated structure facts slice and SHALL NOT project into command execution
facts.

#### Scenario: Valid structure rule metadata

- **WHEN** the rule registry contains a `structure-check` rule with
  `structureFile`
- **THEN** the registry parses the rule
- **AND** rule facts include the structure file path.

#### Scenario: Command fields do not authorize structure execution

- **WHEN** a `structure-check` rule lacks `structureFile`
- **THEN** the registry rejects the record
- **AND** Habitat does not route the rule through `.check.*` command execution.

### Requirement: Structure authority is declared through TOML v1 scopes

Habitat SHALL parse structure authority from TOML files with
`schemaVersion = 1` and `[[scopes]]` entries containing `name`, `root`, `kind`,
`mode`, and optional `required`, `allowed`, and `forbidden` arrays.

#### Scenario: Directory scope evaluation

- **WHEN** a directory scope root matches a current-tree directory
- **THEN** Habitat evaluates required, allowed, and forbidden glob patterns
  against direct child names only
- **AND** closed scopes reject undeclared direct children
- **AND** open scopes ignore extra direct children.

#### Scenario: File scope evaluation

- **WHEN** a file scope root matches a current-tree file
- **THEN** Habitat treats the scope as satisfied
- **AND** Habitat does not evaluate direct-child topology for that file.

#### Scenario: Invalid structure TOML

- **WHEN** a structure TOML file is malformed or contains unsupported fields
- **THEN** Habitat emits a structure diagnostic for that rule
- **AND** does not call command, Grit, Nx, or package code as a fallback.

### Requirement: Structure-check executes as a native Habitat runner

Habitat SHALL run selected structure rules through native service-model
execution inside `executeSelectedRulesEffect()`. Structure-check execution SHALL
consume filesystem reads through the platform resource/provider boundary.

#### Scenario: Tool selection

- **WHEN** a caller runs `habitat check --tool structure-check`
- **THEN** Habitat selects registered structure rules
- **AND** executes them through the native structure runner.

#### Scenario: No proof-class leakage

- **WHEN** a structure rule runs
- **THEN** Habitat does not call command-check, Grit, Nx, source-check, package
  validators, source regex, import/export analysis, freshness checks, or
  graph traversal for that rule.

### Requirement: Standard stage topology canary is split by proof class

Habitat SHALL split `preserve_standard_stage_topology_and_path_invariants` so
pure file-tree topology is structure-check authority and source declaration
order remains outside structure-check.

#### Scenario: Stage filesystem topology

- **WHEN** Habitat checks `preserve_standard_stage_topology_and_path_invariants`
- **THEN** structure-check validates the standard stage directory topology,
  active stage directories, aggregate/helper roots, retired direct-child names,
  and required active `index.ts` files.

#### Scenario: Recipe source-order residual

- **WHEN** Habitat checks `verify_standard_recipe_declared_stage_keys`
- **THEN** the residual command rule validates literal
  `orderStandardStages({ ... })` key order
- **AND** that source-order assertion is not encoded in structure-check.
