## ADDED Requirements

### Requirement: Generated Recipe Artifact Tests Are Serialized After Their Producer

Habitat H4 proof repairs SHALL keep generated recipe artifact consumers ordered
after the target that produces those generated artifacts.

#### Scenario: Swooper Maps tests import generated recipe exports
- **WHEN** `mod-swooper-maps:test` runs in a root Nx execution
- **THEN** Nx runs `mod-swooper-maps:build:studio-recipes` before the test
- **AND** no parallel root task may clean/rebuild `dist/recipes` while the
  package test imports `mod-swooper-maps/recipes/*` generated exports
- **AND** the existing artifact guard assertions remain intact
