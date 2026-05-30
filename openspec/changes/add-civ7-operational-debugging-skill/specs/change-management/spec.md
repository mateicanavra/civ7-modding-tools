## ADDED Requirements

### Requirement: Operational Skills Capture Durable Debugging Process

Repo-local operational skills SHALL capture reusable process, evidence
locations, proof boundaries, and anti-patterns without storing task status or
feature-specific incident notes.

#### Scenario: A Civ7 runtime failure is debugged through logs
- **WHEN** a repeated debugging process depends on source builds, deployed mod
  files, and Civ7 logs
- **THEN** a repo-local operational skill may document that evidence loop
- **AND** the skill routes architecture, product, OpenSpec, and Graphite
  authority to their existing owners
- **AND** task-specific findings remain in specs, implementation records,
  watcher notes, commits, or issue artifacts instead of the skill
