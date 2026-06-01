## Why

Domino 2 is broader than Ecology. The packet also calls out stale morphology
hubs, recipe-root tags, and multi-owner catalogs as colocation drift. Keeping
that work implicit would leave G1/G2 without an owner and would let broad
catalogs survive after topology cleanup.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Problem Layer 3, Stage And Area Scorecard, Domino 2, Guardrails G1-G2.
- `openspec/config.yaml`: colocate contracts, artifacts, schemas, and helper
  logic with the nearest real owner; broad shared surfaces require explicit
  invariants and consumers.
- `openspec/specs/change-management/spec.md`: changes must name affected
  owners, forbidden owners, write sets, and stop conditions.

## What Changes

- Rehome stale `stages/morphology/` hub code into real morphology stage/domain
  owners or explicit stage-neutral shared surfaces.
- Decompose recipe-root or domain-root multi-owner catalogs into nearest real
  owners, thin barrels, or documented shared surfaces.
- Rename or retire milestone-prefixed tag identifiers where final owners are
  known.
- Prepare G1/G2 guardrails by making final owner boundaries observable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds a non-Ecology colocation and catalog
  ownership slice required before catalog/tag guardrails can be enabled.

## Dependencies

- Requires: `normalize-import-boundaries`.
- Enables parallel work: G1/G2 guardrails, morphology docs realignment, and
  cleaner projection/placement imports.

## Forbidden Non-Goals

- No Ecology feature-wrapper folding.
- No lake truth or placement contract behavior changes.
- No broad ban on domain-level config files that have a real shared owner.
- No dumping-ground `shared`, `common`, or `support` folder.
- No generated output hand edits.

## Impact

- Affected owners: morphology stages, morphology domain code, recipe tag
  registry, broad catalogs, docs, guard targets.
- Expected write set:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/**`
  - `mods/mod-swooper-maps/src/domain/morphology/**`
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - affected step contracts/imports
  - tag/config/catalog docs and tests
- Protected paths: Ecology topology except shared tag conflicts, hydrology lake
  behavior, placement decomposition, generated outputs.
- Stop conditions:
  - a catalog has multiple legitimate consumers but no accepted shared
    invariant;
  - a domain-root config module is shared by design and should not be banned;
  - concurrent Ecology work touches the same tags or artifact surfaces.
- Verification gates:
  - search for milestone-prefixed tag identifiers in active source;
  - search for multi-owner catalogs not classified as thin barrels or explicit
    shared surfaces;
  - focused morphology/tag tests;
  - `bun run openspec -- validate normalize-morphology-catalog-owners --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
