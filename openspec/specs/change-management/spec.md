# OpenSpec Change Management

## Purpose

Define how OpenSpec operates in Civ7 Modding Tools while accepted product,
architecture, and project-baseline documents remain the source of authority.
## Requirements
### Requirement: OpenSpec Is Downstream Of Accepted Authority

OpenSpec SHALL be used only for implementation change management downstream of
direct user decisions, repo instructions, accepted project baselines, canonical
docs, ADRs, and deferrals.

#### Scenario: Normalization change cites authority
- **WHEN** an agent creates an OpenSpec change for MapGen architecture
  normalization
- **THEN** the proposal cites the relevant section of
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- **AND** it does not introduce a competing architecture source

#### Scenario: Current code conflicts with the packet
- **WHEN** current implementation conflicts with the accepted normalization
  packet
- **THEN** the OpenSpec change treats current code as implementation evidence
- **AND** the change follows the accepted packet rather than preserving the
  current container by default

### Requirement: Changes Map To Bounded Domino Slices

OpenSpec changes SHALL map to bounded workstream slices derived from the
accepted domino sequence unless a later accepted authority record changes the
sequence.

#### Scenario: Slice dependencies are explicit
- **WHEN** an OpenSpec change is drafted
- **THEN** the proposal names prerequisite dominoes or workstreams
- **AND** it names work that becomes parallelizable after those prerequisites
  are satisfied

#### Scenario: Slice scope is reviewable
- **WHEN** an OpenSpec change is reviewed
- **THEN** the proposal names affected owners, forbidden owners, expected file
  areas, protected paths, consumer impact, stop conditions, and verification
  gates

### Requirement: Shortcut Language Is Rejected

OpenSpec artifacts SHALL NOT authorize shims, fallbacks, silent skips, dual
paths, compatibility buckets, optional target shape, or generated-output hand
edits unless a controlling authority record explicitly accepts that strategy.

#### Scenario: Proposal contains shortcut language
- **WHEN** a proposal or design uses shortcut language as an allowed
  implementation strategy
- **THEN** review rejects the change before implementation starts

#### Scenario: Task preserves rejected topology
- **WHEN** a task asks implementers to preserve stale stage hubs, fake
  dependency chains, broad shared buckets, or generated artifacts as source
- **THEN** review rejects the task before implementation starts

### Requirement: Validation Is Additive Evidence

OpenSpec validation SHALL prove only OpenSpec artifact structure and SHALL NOT
be claimed as proof of code behavior, generated mod output, or in-game behavior.

#### Scenario: OpenSpec validation passes before implementation
- **WHEN** `openspec validate <change-id> --strict` passes
- **THEN** the change remains open until source changes, repo gates, review
  disposition, downstream realignment, and any required runtime proof also pass

#### Scenario: Change completes
- **WHEN** implementation is complete and verified against the stated gates
- **THEN** archiving may merge accepted deltas into `openspec/specs/`
- **AND** the archive remains historical implementation evidence rather than a
  replacement for accepted product or architecture authority

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
