## ADDED Requirements

### Requirement: Grit Check And Apply Use Provider Resources

Habitat SHALL route Grit check and apply behavior through the Grit provider and
shared resource substrate while preserving Grit as the semantic owner of
pattern matching and rewrites.

#### Scenario: Grit check runs

- **WHEN** Habitat runs a Grit-backed check
- **THEN** the Grit provider owns command construction, scan roots, cache
  policy, parser boundaries, and failure tags
- **AND** Habitat domain services own baseline and report decisions

#### Scenario: Grit apply dry-run is observed

- **WHEN** Habitat runs a Grit apply dry-run path
- **THEN** command observations, write-set evidence, and cleanup are typed
- **AND** no live write is approved without the transformation transaction
  proof required by its owning packet
