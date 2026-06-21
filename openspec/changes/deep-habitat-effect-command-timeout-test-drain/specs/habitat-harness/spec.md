## MODIFIED Requirements

### Requirement: Command provider tests stay deterministic for provider-owned policy

Habitat command provider unit tests SHALL validate provider-owned command
policies without spawning command fixtures, probing host tool availability, or
depending on wall-clock timeout waits.

#### Scenario: Git-state capture is exercised through the provider seam

- **WHEN** a command result is wrapped by git-state capture
- **THEN** before/after git state comes from the Git state provider
- **AND** the unit test does not start a host command.

#### Scenario: Unavailable command projection is exercised without host probing

- **WHEN** a host command failure cause is projected by the command provider
- **THEN** the result is a `CommandUnavailable` error
- **AND** the unit test does not probe the host `PATH`.

#### Scenario: Timeout policy is exercised by the Effect clock

- **WHEN** a command effect does not complete before its timeout policy
- **THEN** the provider timeout transformation returns `CommandInterrupted`
- **AND** the test advances Effect test time rather than starting a live process.
