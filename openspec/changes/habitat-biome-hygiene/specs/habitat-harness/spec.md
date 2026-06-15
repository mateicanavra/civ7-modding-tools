## ADDED Requirements

### Requirement: Biome Owns The Hygiene Layer

Formatting, ordinary lint hygiene, and import organization SHALL be owned by
Biome, enforced through `biome:ci`, with no competing formatter or hygiene
linter in the repository.

#### Scenario: Unformatted code is rejected
- **WHEN** a change includes files violating the Biome formatter config
- **THEN** `biome:ci` (via `habitat check` and CI) fails and `habitat fix`
  repairs it deterministically

#### Scenario: Hygiene rules ratchet, not block
- **WHEN** a Biome lint rule is enabled while existing violations remain
- **THEN** existing violations are baselined under the harness ratchet and only
  new violations fail

### Requirement: Reformat History Is Blame-Shielded

The one-time repo-wide reformat SHALL be a dedicated format-only commit listed
in `.git-blame-ignore-revs`, with build outputs proven byte-identical across
the reformat.

#### Scenario: Investigating authorship after reformat
- **WHEN** `git blame` runs with the ignore-revs file on a reformatted file
- **THEN** authorship attributes to pre-reformat commits, not the reformat
