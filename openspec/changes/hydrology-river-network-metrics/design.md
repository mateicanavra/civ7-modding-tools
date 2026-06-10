## Design

Add a hydrology diagnostics product that is downstream of physical routing and
upstream of projection.

The benchmark contract is declared before tuning and must record:

- map tile-to-kilometer scale assumption;
- minimum visible feature size for rivers, lakes, and floodplains;
- climate/relief regime row (`wet`, `normal`, `arid`, `mountain`, `closed`,
  `archipelago`, or explicitly extended);
- hidden drainage, minor/headwater, major, and navigable-visible class counts;
- channel-length share by class;
- basin terminal shares (ocean, accepted lake, closed basin, unresolved);
- lake area share and lake-connected terminal discharge share;
- major-to-minor and navigable-to-major ratios;
- stylization ledger when Civ tile scale requires exaggeration, merging, or
  omission relative to Earth data.

Metrics:

- `basinId`: connected drainage basin identifier.
- `upstreamArea`: contributing land-tile count or weighted runoff area.
- `streamOrderProxy`: hierarchy value derived from contributing tributaries or
  area/discharge bands.
- `mouthType`: ocean outlet, accepted lake, closed sink, spill path, or
  unresolved.
- `slopeClass`: flat, low, moderate, steep, mountain-blocked.
- `flowPermanenceProxy`: perennial, intermittent, ephemeral, or dry/no-signal.
- `benchmarkSummary`: observed Hydrology aggregate fields for land/water/lake
  denominators, river class ratios, river-specific permanence, low-order
  hierarchy, terminal shares, basin coverage, and routing-health counters.

Benchmark metadata belongs in report/spec/docs surfaces, not in the Hydrology
compute op. It records tile scale, visible feature floor, regime row, external
Earth anchors, and stylization notes so Studio/proof tooling can interpret
observed metrics without turning projection/readback artifacts into Hydrology
truth.

Generated-map oracles:

- no invalid receivers and no cycles;
- every land route terminates at ocean, accepted lake, or typed closed basin;
- discharge does not decrease along land receivers;
- minor/headwater intent dominates physical network length on normal wet maps,
  while non-perennial/ephemeral classes remain first-class outcomes;
- major rivers are downstream/high-discharge subset;
- lake intent is lowland/sink-derived and does not move drainage divides;
- arid maps can produce ephemeral/no-visible outcomes with explicit status.

External Earth anchors constrain the first accepted pass:

- HydroRIVERS / HydroATLAS inclusion floors and global routed-network coverage:
  HydroRIVERS uses `>=10 km2` upstream area or `>=0.1 m3/s` average flow and
  reports 35.9 million km globally.
- GRWL visible-river floor: rivers `>=30 m` wide, more than 2.1 million km of
  centerlines, and sub-total-network coverage.
- global non-perennial studies: 51-60% of river length ceases flowing at least
  one day per year, so non-perennial classes are expected rather than failures.
- HydroLAKES / global lake inventory: about 1.4 million lakes/reservoirs and
  2.67 million km2 surface area for a `>=10 ha` inventory floor.
- endorheic-basin datasets for closed-terminal frequency and no-ocean outcomes.

The local generated seed matrix can calibrate against those anchors; it cannot
define them.

Generated-map pass bands are proof-class scoped:

- routing health, terminal typing, basin assignment, and monotonic discharge are
  hard Hydrology truth gates;
- visible-scale tile-share bands are local stability guardrails for a declared
  recipe, tile scale, and feature floor;
- fixture rows carry physical edge cases that generated averages can hide,
  including wet headwater dominance and endorheic closed-basin terminals;
- a scalar tile-share band must not be cited as an Earth benchmark unless the
  benchmark row records the external source, metric surface, tile scale, feature
  floor, and stylization ledger that make the comparison legitimate.

## Review Lanes

- Physical hydrology review.
- Generated seed-matrix/statistics review.
- Product no-signal exception review.
