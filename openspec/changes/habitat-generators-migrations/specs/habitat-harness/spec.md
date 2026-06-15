## ADDED Requirements

### Requirement: Structure Comes From Generators

For supported project kinds, new workspace structure SHALL be scaffolded by
harness generators whose output passes every harness rule with zero baseline
entries. Unsupported kinds SHALL be refused with a documented rationale rather
than scaffolded by guess.

Current interpretation: supported project generation is limited to the uniform
`plugin`, `foundation`, and `app` contracts. Non-uniform kinds remain
domain-owned until their owning domain supplies an accepted generator shape.

#### Scenario: New plugin project
- **WHEN** `nx g @internal/habitat-harness:project my-lib --kind=plugin`
  runs
- **THEN** the generated project carries correct tags, layout, and config, and
  `habitat check` plus build/check/test pass without modification

### Requirement: Agents Classify Before They Author

The harness SHALL provide `habitat classify <path-or-diff>` mapping any target
to its project, tags, owning rules, and required verification targets, and the
repository's agent routing docs SHALL prescribe the
classify→generate→author→verify loop.

Current interpretation: required verification targets are emitted only when
resolved by current Nx project metadata or owned as Habitat workspace gates.
Missing project targets are reported as unavailable, not runnable commands.

#### Scenario: Agent orients on an unfamiliar file
- **WHEN** an agent runs `habitat classify` on a path it is about to edit
- **THEN** the output names the owning project, its tags, the rules in scope,
  and the targets that must pass before handoff

### Requirement: Harness Evolution Propagates Via Migrations

Changes to harness conventions SHALL ship with Nx migrations so downstream
configuration updates are generated, not hand-applied.

Current interpretation: the H8 no-op migration proves migration wiring only.
Convention migration proof requires a named source shape, target shape,
file-operation plan, and idempotence proof.

#### Scenario: Harness convention change
- **WHEN** a harness version changes a convention consumed by projects
- **THEN** running the migration via a hand-authored migration run file whose
  package is `./tools/habitat-harness` (`nx migrate
  --run-migrations=<run-file>.json --skip-install`; the package is
  unpublished, so no registry resolution) applies the update mechanically
