# Resource Policy Data Contract Domino

Status: tracked later outside the active Domain Model Config Law execution.

This domino records the one durable corpus row that is intentionally not burned
down by the current config-law pass: resource expected count ranges.

## Trigger

Run before executing a resource-domain model/config cleanup or any resource
operation-contract consolidation that touches:

- `mods/mod-swooper-maps/src/domain/resources/artifacts/earthlike-expectations.artifact.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-*/contract.ts`
- `mods/mod-swooper-maps/src/domain/resources/lib/earthlike-expectations/**`
- `@civ7/map-policy` official resource catalog or placement policy exports

## Decision To Resolve

Split the row into its actual owners:

- official `RESOURCE_*`, `AGE_*`, catalog slots, and official placement-policy
  facts belong to `@civ7/map-policy` unless they are type-only runtime
  declarations owned by `@civ7/types`;
- earthlike expected count ranges and evidence posture belong to the resource
  expectation artifact or a named resource data-contract owner;
- resource operation contracts should recompose from accepted resource policy
  or data-contract fragments rather than each redefining local range envelopes.

## Current Disposition

The Domain Model Config Law pass records this as `track later`, not as a
domain `model/schemas` primitive. The row is visible here so it is not hidden in
the narrative corpus or dropped during execution-plan hardening.
