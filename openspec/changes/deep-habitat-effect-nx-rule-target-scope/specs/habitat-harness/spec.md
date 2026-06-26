## MODIFIED Requirements

### Requirement: Habitat Rule Nx Targets

Habitat SHALL expose per-rule Nx targets as runnable, cacheable units whose
command and file inputs correspond to the selected Habitat rule.

#### Scenario: Scoped pattern rules infer direct rule targets

- **WHEN** a Habitat rule is registered with `ownerTool: "pattern-check"`
- **AND** the rule has precise `pathCoverage`
- **THEN** the owning project SHALL receive a `habitat:rule:<id>` target that
  runs `bun tools/habitat-harness/bin/dev.ts check --rule <id>`
- **AND** the target SHALL use rule-specific source coverage inputs
- **AND** the target SHALL include the SourceCheck implementation surface needed
  to evaluate the rule
- **AND** the target SHALL NOT depend on the broad `grit:check` aggregate.

#### Scenario: Scoped file-layer rules infer direct rule targets

- **WHEN** a Habitat rule is registered with `ownerTool: "file-layer"`
- **AND** the rule has precise `pathCoverage`
- **THEN** the owning project SHALL receive a `habitat:rule:<id>` target that
  runs `bun tools/habitat-harness/bin/dev.ts check --rule <id>`
- **AND** the target SHALL use rule-specific source coverage inputs
- **AND** the target SHALL NOT depend on the broad `generated:check` aggregate.

#### Scenario: Broad rules stay honest

- **WHEN** a Habitat rule declares `workspace-gate` or `unresolved-metadata`
  path coverage
- **THEN** the inferred Nx target SHALL keep workspace-wide Habitat inputs until
  the rule's metadata is made precise
- **AND** Habitat SHALL NOT pretend a broad rule is narrow for cacheability.
