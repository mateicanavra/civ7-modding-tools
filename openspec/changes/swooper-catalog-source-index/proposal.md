# Swooper Catalog Source Index

## Why

Durable catalog membership must be source data, not an accidental directory
scan. Run in Game will soon generate request-local artifacts, so catalog source
identity has to be explicit before the source-resolution contract depends on it.

This packet introduces the catalog index and its identity contract without
cutting over catalog generation yet.

## System Context

Affected owners:

- `mods/mod-swooper-maps/src/maps/**`
- Swooper Maps catalog metadata readers
- Studio catalog/source resolution consumers in later packets

This packet does not change Run in Game request generation or catalog generation
targets.

## Before And After

Before:

- catalog membership can be inferred by scanning config directories;
- catalog ids, display metadata, and source paths are coupled implicitly.

After:

- Swooper Maps owns tracked `CatalogSourceIndex` source data;
- each entry has `catalogSourceId`, `configPath`, display metadata, and digest
  inputs;
- validation proves each id and path is unique and resolvable;
- a temporary Grit pattern asserts the index matches the current catalog
  generation source set until the catalog cutover packet makes the index the
  only catalog authority.

## Behavior Verification

Behavior tests cover index parsing, validation, duplicate rejection, missing
path rejection, and reader behavior. They do not assert repository topology.

## Structural Enforcement

Permanent positive assertions:

- Swooper Maps owns the catalog source index file;
- catalog source entries are the required source identity shape;
- catalog source index placement is enforced by SA-04
  `structure-swooper-catalog-source-index`.

Structural authority row: SA-04 `structure-swooper-catalog-source-index`.

Temporary pattern:

- id: `grit-swooper-catalog-index-consistency-temporary`;
- lifecycle: `registered-advisory`;
- owner surface: Swooper catalog source reader and current catalog generation
  source discovery;
- scan roots: `mods/mod-swooper-maps/src/maps`,
  `mods/mod-swooper-maps/scripts`;
- hazard assertion: catalog source ids and config paths in
  `CatalogSourceIndex` match the current catalog generation source set until
  cutover;
- baseline action: committed empty baseline after validator lands;
- hook scope: none;
- removal condition: remove after `swooper-catalog-index-cutover` registers
  SA-09 `nx-swooper-catalog-index-target-topology`.

## Verification Gates

- Index parser and validator behavior tests.
- Focused Swooper Maps reader tests.
- SA-04 `structure-swooper-catalog-source-index`.
- Temporary `grit-swooper-catalog-index-consistency-temporary`.
- `bun run openspec -- validate swooper-catalog-source-index --strict`.
