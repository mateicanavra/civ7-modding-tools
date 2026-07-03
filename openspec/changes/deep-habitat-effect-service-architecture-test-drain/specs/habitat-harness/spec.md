## MODIFIED Requirements

### Requirement: Structural service architecture is enforced by Habitat guards

Habitat SHALL enforce its service/provider/domain topology through Habitat
structural guard targets rather than current-tree Vitest topology tests.

#### Scenario: Service topology is checked by Habitat guard execution

- **WHEN** service runtime construction, service module ownership, router
  procedure ownership, provider dependency direction, or removed service/lib
  paths drift
- **THEN** `habitat check --owner @internal/habitat-harness` reports the
  violation through Habitat guard rules
- **AND** the package unit suite does not scan the live source tree to enforce
  the topology.
