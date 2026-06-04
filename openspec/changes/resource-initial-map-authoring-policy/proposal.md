## Why

Oil, coal, rubber, and other future-age resources can re-enter the generated
initial map because the placement planner receives the full Civ7 placeable
resource id catalog. The official corpus already records valid ages, but that
age evidence is metadata only; runtime placement treats all placeable ids as
eligible starting-map candidates.

This is a policy-boundary bug. The fix is not to blacklist three labels in one
planner. The pipeline needs a resource-owned initial-map authoring policy that
all runtime placement paths consume.

## Target Authority Refs

- `openspec/changes/resource-corpus-contract`: official resource rows include
  valid ages, placeability, and static resource row slots.
- `openspec/changes/resource-earthlike-expectations-artifact`: expectations
  preserve official corpus evidence without claiming verified runtime ids.
- `openspec/changes/resource-placement-diversity`: numeric placement currently
  balances across an adapter candidate catalog.

## What Changes

- Add a resource-domain policy derived from the official 55-resource corpus.
- Classify each resource as initial-map eligible, future-age deferred,
  official-blocked, or not-placeable for `AGE_ANTIQUITY` authoring.
- Expose the policy on earthlike expectation rows for Studio/debug auditability.
- Filter adapter resource candidate ids before placement planning.
- Assert the same policy at resource materialization so fallback assignment
  cannot stamp deferred ids.
- Remove the misleading strategy-level full resource catalog default from
  `placement/plan-resources`.

## Explicit Non-Goals

- No age-specific reveal/deposit system for future resources.
- No claim that runtime numeric ids are verified beyond the existing static slot
  boundary.
- No switch to Civ engine aggregate resource generation.
- No change to future-age geological/ecological expectation evidence.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/resources/resource-initial-map-authoring-policy.test.ts mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts mods/mod-swooper-maps/test/placement/plan-ops.test.ts mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts`
- `bunx turbo run build check --filter=@swooper/mapgen-core --filter=mod-swooper-maps --filter=mapgen-studio`
- `bun run openspec -- validate resource-initial-map-authoring-policy --strict`
- `bun run openspec:validate`
- deploy/restart Studio and, if Civ is available, run a live map/readback scan
  for placed resource ids `36`, `38`, and `40`.
