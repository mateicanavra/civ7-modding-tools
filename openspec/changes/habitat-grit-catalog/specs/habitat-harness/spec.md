## ADDED Requirements

### Requirement: GritQL Owns The Syntax Layer

Source-shape invariants SHALL be enforced by GritQL patterns in the harness
catalog — import shapes, forbidden constructs, and contract file shapes — each
with fixtures and an agent-readable failure message, surfaced through
`grit:check`.

#### Scenario: Forbidden source shape introduced
- **WHEN** a change introduces a non-baselined match of a catalog pattern
  (e.g. a deep `@mapgen/domain/*/ops/*` import)
- **THEN** `grit:check` runs through `habitat check --tool grit-check`, fails
  via the harness with the pattern's message and remediation, and derives
  pass/fail from Grit JSON results rather than raw Grit exit codes

#### Scenario: Pattern without fixtures
- **WHEN** a pattern lacks fixtures
- **THEN** it may run only in check mode and cannot be wired into
  `habitat fix`

#### Scenario: Grit report contains findings
- **WHEN** native `grit check --json --level error` reports one or more
  findings in `results[]`
- **THEN** Habitat maps each finding to the matching rule-pack entry, applies
  the rule baseline, and returns nonzero for any unbaselined enforced finding

### Requirement: Codemods Are Deterministic Fixture-Gated Remediation

`habitat fix` SHALL apply only approved grit-apply patterns that are
deterministic, repeatable, fixture-proven, Biome-formatted after rewrite, and
fail closed on ambiguity.

#### Scenario: Safe rewrite available
- **WHEN** a violation has an approved apply-mode pattern
- **THEN** `habitat fix` rewrites it, runs Biome format on touched files, and
  re-check passes

#### Scenario: Ambiguous intent
- **WHEN** a rewrite cannot be proven safe from the source shape alone
- **THEN** the harness emits a diagnostic naming the boundary decision needed
  and performs no rewrite

### Requirement: Generated Zones Are Write-Protected

Generated paths SHALL be writable only by their owning generators; staged
hand-edits SHALL fail `habitat check --staged`, and CI SHALL detect drift by
regenerating and diffing zones that have a repo-runnable generator.

#### Scenario: Hand-edit of a generated file
- **WHEN** a change stages an edit under a protected generated zone
- **THEN** the check fails with the owning regenerate command as remediation

#### Scenario: Generator drift
- **WHEN** outputs in a zone with a repo-runnable generator no longer match
  their source declarations
- **THEN** the CI regenerate-and-diff gate fails naming the stale zone
