## 1. Metrics

- [x] 1.1 Add hydrology network metric derivation for basin, upstream area,
  stream hierarchy, mouth type, slope class, and flow permanence.
- [x] 1.2 Emit metrics in diagnostics and map statistics without changing Civ
  projection behavior.
- [x] 1.3 Update physical-grounding docs with the metric oracles and uncertainty
  markers.
- [x] 1.4 Add observed benchmark-summary fields for channel class ratios,
  river-specific permanence, low-order hierarchy, terminal shares, lake area
  share, basin coverage, and routing-health counters.
- [x] 1.5 Add benchmark-contract metadata for tile scale, visible feature floor,
  regime row, and stylization notes.
- [x] 1.6 Record external Earth benchmark anchors before changing any local
  acceptance threshold.

## 2. Seed Matrix

- [x] 2.1 Add fast deterministic generated-map hydrology checks.
- [x] 2.2 Add Earthlike and holdout seed checks with declared pass bands.
- [x] 2.3 Add arid/desert no-signal controls.
- [x] 2.4 Add closed/endorheic and wet-headwater rows so normal Earth variation
  is tested instead of averaged away.

## 3. Validation

- [x] 3.1 Run hydrology fixtures and generated-map stats tests.
- [x] 3.2 Validate this OpenSpec change and `bun run openspec:validate`.
