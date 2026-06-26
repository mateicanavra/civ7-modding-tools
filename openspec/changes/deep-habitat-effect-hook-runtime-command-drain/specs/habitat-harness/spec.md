## MODIFIED Requirements

### Requirement: Habitat hooks compose vendor execution through providers

Habitat hook execution SHALL route external tool execution through named
providers rather than through caller-supplied command functions.

#### Scenario: Hook runtime does not own command execution

- **WHEN** Habitat executes pre-commit or pre-push
- **THEN** Git operations SHALL flow through `GitProvider`
- **AND** Graphite parent discovery SHALL flow through the service provider
  substrate
- **AND** the hook runtime SHALL NOT expose a command runner field
- **AND** the hook-domain implementation SHALL NOT retain a sync command runner
  helper for hook Git or Graphite commands.
