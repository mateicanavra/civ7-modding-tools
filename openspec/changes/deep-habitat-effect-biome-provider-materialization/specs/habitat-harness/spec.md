## MODIFIED Requirements

### Requirement: Vendor Provider Command Materialization

Habitat vendor providers SHALL execute workspace-managed tools through the
configured workspace-tool materialization policy rather than relying on ambient
shell `PATH`.

#### Scenario: Biome provider uses workspace binary materialization

- **WHEN** BiomeProvider requests a `biome` command
- **THEN** CommandRunner SHALL materialize the command through the configured
  workspace tool policy
- **AND** the effective command SHALL be runnable from direct Habitat service
  entrypoints as well as Bun package scripts.
