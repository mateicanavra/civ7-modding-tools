## ADDED Requirements

### Requirement: No Inlined Per-Consumer Hex Adjacency In The Generation Pipeline

Live generation-pipeline consumers SHALL obtain hex neighbors, hex-space
projection, cube coordinates, hex distance, and neighbor direction vectors from
the single canonical odd-R primitive in `@swooper/mapgen-core`. A consumer MUST
NOT inline its own neighbor-offset table or key adjacency parity on the column
(`x & 1`). A consumer that cannot import the canonical primitive across a project
boundary MUST mirror the canonical odd-R table in place, keyed on row parity, with
a comment recording why.

#### Scenario: A domain op needs hex neighbors
- **WHEN** a hydrology, morphology, ecology, or placement op enumerates neighbors,
  builds a hex-space gradient, or selects an upwind/upcurrent donor
- **THEN** it calls the shared mapgen-core odd-R helpers (neighbor iterator,
  direction vectors, or best-direction selector)
- **AND** it declares no local `OFFSETS_*` / `HEX_DELTAS_*` table and no `x & 1`
  adjacency parity selector

#### Scenario: A boundary-restricted adapter needs adjacency
- **WHEN** the mock adapter (or any `kind:adapter` surface) classifies neighbor
  land/coast adjacency
- **THEN** it uses an odd-R table keyed on row parity that mirrors the engine
  `getAdjacentPlotLocation` adjacency
- **AND** the in-place table carries a comment explaining the boundary that
  prevents importing the canonical primitive

### Requirement: Dead Hex And Heightfield Code Is Removed, Not Migrated

Unused hex/heightfield code surfaced during the adjacency migration SHALL be
deleted outright, together with its build-config entry points and package export
surface. Such code MUST NOT be migrated, patched, or carried forward.

#### Scenario: An unused legacy helper is found during migration
- **WHEN** a hex/heightfield module (for example `generateBaseHeightfield`) has no
  live importer in any package, mod, or app
- **THEN** the module is deleted rather than migrated to odd-R
- **AND** its `tsup` entry and `package.json` subpath export are removed so the
  build and published surface stay consistent
