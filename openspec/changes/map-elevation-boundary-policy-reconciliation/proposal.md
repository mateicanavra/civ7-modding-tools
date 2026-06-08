## Why

The predecessor stack introduced a static `@civ7/map-policy` build-elevation
boundary helper, but the current runtime no longer calls it. Keeping that export
would imply a policy boundary that is not actually enforced and could drift from
the live map-elevation behavior.

The current pipeline has a stronger, more direct boundary: after accepted lakes
are projected, `map-elevation/buildElevation` captures the authored
land/water surface, calls Civ7 buildElevation, repairs small engine cache drift,
and fails only when drift exceeds the explicit policy budget.

## What Changes

- Remove the unused build-elevation boundary helper and export from
  `@civ7/map-policy`.
- Keep the active water-drift policy in the recipe projection policy layer,
  where it has access to the actual lifecycle surface and adapter readback.
- Preserve the map-policy package as a pure source of static Civ7 policy facts
  that are actually consumed.

## Forbidden Non-Goals

- Do not reintroduce a dead policy export as proof.
- Do not make Civ7 the authoring authority for land/water placement.
- Do not weaken the hard failure for drift above the configured budget.

## Verification Gates

- `rg` has no remaining references to the removed helper.
- `bun test packages/civ7-map-policy/test/map-policy.test.ts`
- `bun test mods/mod-swooper-maps/test/map-elevation/build-elevation-no-water-drift.test.ts`
