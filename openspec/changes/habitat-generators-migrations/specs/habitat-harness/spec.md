## ADDED Requirements

### Requirement: Structure Comes From Generators

For supported project kinds, new workspace structure SHALL be scaffolded by
harness generators whose output passes every harness rule with zero baseline
entries. Unsupported kinds SHALL be refused with a documented rationale rather
than scaffolded by guess.

#### Scenario: New plugin project
- **WHEN** `bunx nx g @internal/habitat-harness:project my-lib --kind=plugin`
  runs
- **THEN** the generated project carries correct tags, layout, and config, and
  `habitat check` plus build/check/test pass without modification

### Requirement: Agents Classify Before They Author

The harness SHALL provide `habitat classify <path-or-diff>` mapping any target
to its project, tags, owning rules, and required verification targets, and the
repository's agent routing docs SHALL prescribe the
classify→generate→author→verify loop.

#### Scenario: Agent orients on an unfamiliar file
- **WHEN** an agent runs `habitat classify` on a path it is about to edit
- **THEN** the output names the owning project, its tags, the rules in scope,
  and the targets that must pass before handoff

### Requirement: Harness Evolution Propagates Via Migrations

Changes to harness conventions SHALL ship with Nx migrations so downstream
configuration updates are generated, not hand-applied.

#### Scenario: Harness convention change
- **WHEN** a harness version changes a convention consumed by projects
- **THEN** `bunx nx migrate @internal/habitat-harness` applies the update
  mechanically
