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
