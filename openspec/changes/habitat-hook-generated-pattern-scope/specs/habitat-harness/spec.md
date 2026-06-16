## ADDED Requirements

### Requirement: Pre-Commit Grit Uses Hook-Scoped Rule-Pack Selection

Pre-commit staged Grit execution SHALL select only Grit rules whose rule-pack
metadata declares `hookScope: "pre-commit"`.

#### Scenario: Hook-scoped Grit rule is selected
- **WHEN** pre-commit runs staged Grit checks and a selected Grit rule declares
  `hookScope: "pre-commit"`
- **THEN** Habitat MAY execute that rule through the staged Grit hook path

#### Scenario: Current-tree-only Grit rule is not selected for staged hook
- **WHEN** pre-commit runs staged Grit checks and a registered Grit rule lacks
  `hookScope: "pre-commit"`
- **THEN** Habitat SHALL NOT execute that rule as part of the staged hook Grit
  selection

### Requirement: Pre-Commit Grit Uses Exact Approved Staged Paths

Pre-commit staged Grit execution SHALL scan exact staged JavaScript/TypeScript
paths that are inside accepted Grit adapter scan roots.

#### Scenario: Staged file is inside approved Grit root
- **WHEN** a staged JavaScript or TypeScript path is inside an accepted Grit
  adapter scan root
- **THEN** Habitat SHALL preserve that exact file path as the staged Grit scan
  root

#### Scenario: Staged file is outside approved Grit root
- **WHEN** a staged JavaScript or TypeScript path is outside accepted Grit
  adapter scan roots
- **THEN** Habitat SHALL NOT include that path in staged Grit scan roots
- **AND** Biome MAY still process the file according to its own staged-file
  support

#### Scenario: Approved staged file does not broaden to root
- **WHEN** one staged file is inside an approved Grit adapter root
- **THEN** Habitat SHALL NOT convert that file into a broad root scan for the
  staged hook proof

### Requirement: Pre-Commit Consumes Normalized Habitat Grit Reports

Pre-commit Grit execution SHALL consume the normalized Habitat CheckReport
contract for staged Grit results.

#### Scenario: Grit adapter reports parser failure
- **WHEN** native Grit output cannot be parsed into the accepted exact JSON
  shape and Habitat projects that as a Grit adapter failure
- **THEN** pre-commit SHALL fail closed as a Grit parse failure

#### Scenario: Grit rule reports findings
- **WHEN** the normalized staged Grit CheckReport contains unbaselined enforced
  findings
- **THEN** pre-commit SHALL fail as a Grit finding
