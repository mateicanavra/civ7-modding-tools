## ADDED Requirements

### Requirement: The Harness Is The Single Enforcement Entrypoint

The repository SHALL provide a repo-local harness package
(`tools/habitat-harness`) exposing `habitat graph`, `habitat classify`,
`habitat check`, `habitat fix`, `habitat verify`, and `habitat hook` as the
canonical enforcement surface, emitting machine-readable JSON diagnostics for
every rule.

#### Scenario: Agent verifies a change locally
- **WHEN** an agent runs `bun run habitat check`
- **THEN** every registered rule reports status with rule id, scope, severity,
  message, and remediation in both human and `--json` form

#### Scenario: A rule fails
- **WHEN** a rule detects a non-baselined violation
- **THEN** the failure message names the violated invariant, why it exists,
  and the exact remediation command or boundary decision required

### Requirement: Every Rule Carries A Shrink-Only Ratchet Baseline

Every harness rule SHALL have an explicit committed baseline of known
violations. `habitat check` SHALL fail only on violations not in the baseline.
Baselines SHALL only shrink outside rule-introduction changes, and a rule with
an empty baseline SHALL be locked (any violation fails).

#### Scenario: New debt is rejected
- **WHEN** a change introduces a violation not present in the rule's baseline
- **THEN** `habitat check` fails even though older baselined violations exist

#### Scenario: Expansion of an existing rule's baseline is rejected
- **WHEN** a change adds entries to the baseline of a rule that already exists
  at the merge-base
- **THEN** the baseline self-check fails the build

#### Scenario: Rule introduction lands with its baseline
- **WHEN** a change registers a new ruleId in the rule pack and commits that
  rule's baseline in the same change
- **THEN** the self-check accepts the new baseline and the shrink-only rule
  applies from then on

#### Scenario: Rule locks at zero
- **WHEN** a rule's baseline becomes empty
- **THEN** the rule is locked and any future violation hard-fails

### Requirement: Existing Checks Are Wrapped Without Semantic Change

All inventoried enforcement mechanisms SHALL be invocable through the harness
with unchanged semantics (per
`docs/projects/habitat-harness/invariant-corpus.md`) until a later change
explicitly ports or retires them.

#### Scenario: Wrapped script parity
- **WHEN** `habitat check` runs a wrapped rule on a tree where the original
  script passes (or fails)
- **THEN** the wrapped rule passes (or fails) identically, adding only
  normalized diagnostics
