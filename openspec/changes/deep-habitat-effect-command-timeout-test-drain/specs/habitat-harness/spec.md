## ADDED Requirements

### Requirement: Live provider commands have one bounded release owner

Habitat SHALL acquire each supported live provider command as a scoped detached
process group and SHALL bound TERM grace, conditional KILL, and settlement.

#### Scenario: Timeout releases a live provider tree

- **WHEN** a provider command exceeds its explicit timeout
- **THEN** the command returns the existing `CommandInterrupted` contract
- **AND** scope release attempts bounded cleanup of the detached group, including
  descendants that outlive the direct child.

#### Scenario: Observed absence is absorbing

- **WHEN** the initial probe, TERM delivery, or a later liveness sample reports
  `ESRCH`
- **THEN** release treats the group as absent
- **AND** release sends no later TERM or KILL signal to that process-group id in
  the same attempt.

#### Scenario: KILL follows only sampled presence

- **WHEN** every sampled liveness observation through the TERM grace reports the
  group present
- **THEN** release MAY attempt SIGKILL
- **AND** a settlement deadline with no observed absence fails explicitly rather
  than reporting successful cleanup.

#### Scenario: Identity continuity remains outside the guarantee

- **WHEN** a process group disappears or its numeric id is reused between two
  separate POSIX observations
- **THEN** Habitat does not claim to detect that transition
- **AND** the release contract does not claim continuous identity or absolute ABA
  prevention without a stable OS ownership handle or supervisor.

### Requirement: CLI cancellation reaches scoped provider release

Habitat SHALL carry one cancellation signal from each CLI command through its
local oRPC call, dispose the managed runtime before normal replay, and preserve
the first native signal identity within bounded deadlines.

#### Scenario: First signal interrupts then replays

- **WHEN** a running command receives SIGINT or SIGTERM
- **THEN** its caller `AbortSignal` is interrupted before managed-runtime
  disposal
- **AND** the first native signal is re-delivered after disposal or by the outer
  replay deadline.

#### Scenario: Repeated signal forces replay

- **WHEN** another SIGINT or SIGTERM arrives while cleanup is pending
- **THEN** Habitat immediately re-delivers the first recorded signal
- **AND** does not wait indefinitely behind the pending finalizer.

#### Scenario: Normal completion owns no signal

- **WHEN** a CLI command completes without interruption
- **THEN** Habitat disposes the managed runtime once
- **AND** removes its temporary signal listeners without synthesizing a signal.

### Requirement: Grit resource use is bounded and exact-root grouped

Habitat SHALL execute Grit units sequentially with a fixed two-thread native
worker pool and SHALL share a native check command only across eligible rules
with the exact same ordered canonical scan roots and distinct pattern
identities.

#### Scenario: Eligible peers share one native command

- **WHEN** selected check rules have exact ordered root equality and distinct
  pattern identities
- **THEN** valid peers run through one immutable catalog and one native command
- **AND** each peer receives its own projected outcome in selected order.

#### Scenario: Ineligible peers remain separate

- **WHEN** rules differ by ordered roots, repeat a pattern identity, use apply
  dry-run, or do not reach executable check admission
- **THEN** Habitat does not merge them into the same native check command.

#### Scenario: Invalid assets do not contaminate peers

- **WHEN** one rule asset fails materialization before shared catalog acquisition
- **THEN** that rule fails with zero execution duration and no shared timing
- **AND** valid peers remain eligible for one shared command whose timing names
  and counts only admitted rules.

### Requirement: Structure traversal reuse is invocation scoped

Habitat SHALL reuse path-kind, directory-entry, and completed-walk observations
within one structure-check invocation and SHALL NOT retain those observations
across independent invocations.

#### Scenario: Shared roots are traversed once per run

- **WHEN** rules or scopes in one run resolve the same literal glob base
- **THEN** Habitat reuses the completed in-memory traversal and observed entry
  kinds.

#### Scenario: A later run observes the filesystem anew

- **WHEN** structure evaluation is invoked again
- **THEN** it starts with an empty traversal cache
- **AND** performs the reads needed for that invocation.

### Requirement: Standalone compiler bytes have immutable distribution authority

Habitat SHALL identify its pinned Bun compiler from embedded feature data and a
verified full source revision, SHALL provision its archives only from an
immutable owner release, and SHALL retain rolling upstream observations as
non-authoritative provenance.

#### Scenario: Rolling upstream name disagrees with selected revision

- **WHEN** the captured upstream canary release name identifies a different
  revision from the selected compiler
- **THEN** the observed name remains provenance evidence only
- **AND** embedded name, version, canary state, and full verified source revision
  own compiler identity.

#### Scenario: The Darwin compiler is provisioned

- **WHEN** the owner build provisions the Darwin arm64 compiler archive
- **THEN** it downloads only the exact immutable owner-release asset URL
- **AND** verifies the archive digest, extracted executable digest, and host
  compiler feature identity before use.

#### Scenario: The Darwin Habitat artifact is admitted

- **WHEN** the moved binary runs on its target host
- **THEN** `BUN_BE_BUN=1` native version and revision output plus internal
  feature data report the exact pinned name, version, full revision, and canary
  state
- **AND** provenance records the upstream release, immutable distribution, and
  both upstream and distribution asset IDs.

### Requirement: Standalone distribution is a temporary Darwin bridge

Habitat SHALL publish only the Darwin arm64 executable required by the current
Magic consumer and developer host through this temporary bridge, SHALL NOT
advertise the bridge as platform-neutral support, and SHALL assign that future
boundary to a platform-neutral Habitat SDK/Node package.

#### Scenario: The bridge candidate is built

- **WHEN** the owner build creates the standalone release candidate
- **THEN** the candidate contains the Darwin executable, `provenance.json`, and
  `SHA256SUMS` exactly
- **AND** the release lane builds that candidate exactly once before moved-binary,
  distribution, and publication acceptance
- **AND** moved-binary acceptance is the final candidate-owning command before
  upload
- **AND** no acceptance step rebuilds or overwrites the candidate before upload
- **AND** no Linux compiler or executable asset is provisioned, built, proved,
  or published.

### Requirement: SDK publication is attach-before-immutable and retry safe

Habitat SHALL publish an SDK version only after one draft contains the complete
already-proven asset set and SHALL never mutate an already-published release.

#### Scenario: A version release does not exist

- **WHEN** the proven tag enters publication
- **THEN** the expected source commit equals candidate provenance, checked-out
  source, checked-out tag, and a fresh remote-tag resolution before draft
  creation
- **AND** the workflow creates a draft without assets, attaches the exact
  candidate inventory, and confirms each server-reported digest and byte size
  against the local candidate before publication
- **AND** `SHA256SUMS` covers every non-checksum payload exactly once
- **AND** source binding is checked again immediately before publication
- **AND** after publication it requires an immutable release record and verifies
  the downloaded bytes.

#### Scenario: Publication commands exceed their deadline

- **WHEN** a GitHub CLI operation does not complete within the owner-configured
  publication deadline
- **THEN** the publication attempt terminates that operation and fails closed
- **AND** the deadline works on the temporary Darwin lane without requiring GNU
  `timeout` or a second platform release lane.

#### Scenario: An exact immutable version release already exists

- **WHEN** publication retries for the same tag
- **THEN** the workflow verifies source binding, server-reported asset metadata,
  and downloaded bytes for that exact release without an edit, upload, or create
  operation.

#### Scenario: A nonterminal or mutable release already exists

- **WHEN** the tag resolves to a draft, mutable publication, duplicate record,
  wrong inventory, mismatched server metadata or bytes, or a different source
  commit
- **THEN** publication refuses the state
- **AND** does not repair, clobber, or otherwise mutate the release.
