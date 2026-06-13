## ADDED Requirements

### Requirement: Project-Plane Boundaries Are Graph Law

Every workspace project SHALL carry `kind:*` tags from the derived taxonomy in
its `package.json`, and cross-project dependency constraints SHALL be enforced
by `@nx/enforce-module-boundaries` as a locked harness rule.

#### Scenario: Illegal cross-project dependency
- **WHEN** a project imports from a project whose tags violate the
  depConstraints (e.g. `kind:foundation` importing `kind:engine`)
- **THEN** the `boundaries` target fails with a message naming the source tag,
  the constraint, and the taxonomy revision protocol

#### Scenario: Taxonomy revision is deliberate
- **WHEN** a tag or constraint must change
- **THEN** the change edits taxonomy.md and the boundary config together with
  recorded provenance, not ad-hoc rule weakening

### Requirement: ESLint Is Quarantined To The Boundary Rule

ESLint SHALL exist in the repository only as the runner for
`@nx/enforce-module-boundaries` via a dedicated boundaries config, exposed as
the `boundaries` target (never named `lint`).

#### Scenario: Adding an ESLint rule
- **WHEN** a contributor proposes adding any other rule to the boundaries
  config
- **THEN** the harness documentation directs the rule to its owning layer
  (Biome for hygiene, GritQL for syntax shape, file layer for paths) and the
  boundaries config stays single-rule
