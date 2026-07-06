# Swooper Catalog Generation Index Cutover

## Why

After request-scoped generation exists, durable catalog generation can stop
using directory scans as source authority. This packet cuts catalog generation
over to the tracked catalog source index introduced earlier.

## System Context

Affected owners:

- Swooper Maps catalog map artifact generation target
- Studio recipe/schema/catalog generation targets
- catalog source index reader
- Nx target dependencies for catalog outputs

This packet does not change Run in Game request generation.

## Before And After

Before:

- catalog generation may infer sources by scanning authored config paths;
- Studio UI recipe/catalog generation can be coupled to shared mod/runtime
  artifact generation.

After:

- catalog map artifact generation reads only `CatalogSourceIndex`;
- Studio recipe/schema/catalog targets are catalog metadata outputs;
- shared mod/runtime artifacts are not prerequisites for Studio dev/check/test
  unless a named catalog-build target explicitly owns them.

## Behavior Verification

Behavior tests verify catalog generation output from the index and validation
failure for missing index entries. They do not search for retired path names.

## Structural Enforcement

Permanent positive assertions:

- catalog generation has exactly one source index input;
- Studio catalog/recipe targets own metadata outputs;
- catalog metadata targets emit exactly the metadata-only output classes defined
  in `target-vocabulary.md`.

Structural authority row: SA-09 `nx-swooper-catalog-index-target-topology`.

## Verification Gates

- Catalog generation behavior tests.
- Nx target metadata verification.
- SA-09 `nx-swooper-catalog-index-target-topology`.
- `bun run openspec -- validate swooper-catalog-index-cutover --strict`.
