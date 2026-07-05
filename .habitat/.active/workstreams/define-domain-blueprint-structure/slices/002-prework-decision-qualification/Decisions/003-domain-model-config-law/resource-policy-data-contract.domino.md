# Resource Policy Data Contract Domino

Status: closed by Slice 001 cleanup execution.

This domino records the resource expected-count range row that was originally
tracked outside the config-law pass, then closed by the Slice 001 cleanup
execution.

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

## Closed Disposition

Accepted owners:

- official `RESOURCE_*`, `AGE_*`, catalog slots, and official placement-policy
  facts remain owned by `@civ7/map-policy` unless they are type-only runtime
  declarations owned by `@civ7/types`;
- the reusable expected-count range primitive is
  `mods/mod-swooper-maps/src/domain/resources/model/schemas/expected-count-range.schema.ts`;
- resource model data imports/re-exports the accepted primitive types from
  `model/schemas`;
- resource planning operation contracts compose
  `ResourceExpectedCountRangeSchema` instead of cloning local
  `ExpectedCountRangeSchema` definitions;
- `earthlike-expectations.artifact.ts` keeps artifact-owned strict corpus
  validation for blocked all-zero ranges and accepted active literal tuples.

Closure proof:

- `rg` clone scan reports zero `ExpectedCountRangeSchema` definitions under
  `mods/mod-swooper-maps/src/domain/resources/ops`;
- `bun habitat check --rule require_domain_model_schema_policy_owner_shape --json`
  passes;
- `bun habitat check --rule require_domain_operation_contract_file_shape --json`
  passes;
- `bun habitat check --rule require_artifact_file_shape --json` passes;
- `bun test mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts`
  passes and includes strict rejection of an ordered non-corpus range.

Narsil note:
pre-edit Narsil reference output captured the four operation-local clone
definitions. Post-edit uncommitted proof is current-source `rg` plus Habitat and
test output; Narsil will see the accepted owner after the commit is indexed.
