## 1. Investigation And Spec

- [x] 1.1 Measure hydrology climate indices, soil buckets, fertility, plains,
  and vegetation-density distribution across representative Earthlike seeds.
- [x] 1.2 Identify whether root causes sit in hydrology, pedology, biome
  classification, or engine biome bindings.

## 2. Implementation

- [x] 2.1 Add pedology/climate/biome metrics to balance stats.
- [x] 2.2 Repair pedology input semantics for slope and sediment; leave bedrock
  absent rather than claiming supplied bedrock semantics.
- [x] 2.3 Repair plains/biome classification or bindings where evidence shows
  drift.
- [x] 2.4 Keep validation in world-product balance telemetry for plains,
  fertility, aridity/humidity, and vegetation density.

## 3. Verification

- [x] 3.1 Run focused hydrology, pedology, and biome validation through the
  world-balance stats gate.
- [x] 3.2 Run world-balance stats tests.
- [x] 3.3 Run OpenSpec validation.
- [x] 3.4 Run `git diff --check`.
