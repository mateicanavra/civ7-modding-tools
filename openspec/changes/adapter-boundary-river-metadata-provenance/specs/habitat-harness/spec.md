## ADDED Requirements

### Requirement: Adapter Boundary Provenance Exceptions Stay Explicit

The adapter-boundary gate SHALL allow map-policy files to contain
`/base-standard/` strings only when those strings are documented provenance
metadata rather than runtime imports or direct engine access.

#### Scenario: River metadata records Civ7 source paths
- **WHEN** `packages/civ7-map-policy/src/river-type-metadata.source.ts`
  records Civ7 source files for hand-reviewed river type enum values
- **THEN** `bun run lint:adapter-boundary` treats those paths as a tracked
  map-policy provenance exception

#### Scenario: Non-provenance file references base-standard
- **WHEN** a non-allowlisted package file references `/base-standard/`
- **THEN** `bun run lint:adapter-boundary` fails and prints the offending file
