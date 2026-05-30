## Context

World-balance tests should sit at the public standard recipe/runtime boundary.
That is where shipped configs, feature-family planning, lake projection, and
engine-facing adapters meet. Unit tests still own local math, but the quality
gate must describe product-visible geography.

## Design

Keep `mods/mod-swooper-maps/test/support/world-balance-stats.ts` as the single
collector. Add derived metrics there so pipeline tests can state invariants
without rebuilding the recipe in multiple ways.

Use three threshold types:

- hard zero for invalid state: missing artifacts, lake water drift, illegal
  feature land/water placement, unknown feature keys;
- broad ratio bands for density budgets: lakes, wetlands, reef family,
  rainforest, total vegetation;
- presence/distribution expectations by map identity across N-of-M seeds for
  features that are rare but required for the identity.

Keep config identity proof separate from balance math. Schema validity proves a
config can compile; identity tests prove shipped maps and presets use current
strategies and deliberate values.

## Review Lanes

- Product: thresholds reflect map identities, not current accidents.
- Testing: failures identify the invariant that broke.
- Architecture: tests run public recipe/runtime boundaries, not manual step
  wiring.
- Adversarial: no exact-count snapshots, no one-off single feature tests for a
  categorical class.
