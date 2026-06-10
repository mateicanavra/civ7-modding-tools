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
- lake area share and lake-connected discharge share;
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

- HydroRIVERS / HydroATLAS inclusion floors and global routed-network coverage.
- GRWL river-surface-area order of magnitude for visible wide rivers.
- global non-perennial and headwater-dominance studies for minor/headwater
  class ratios.
- HydroLAKES / global lake inventory area share for lake abundance.
- endorheic-basin datasets for closed-terminal frequency and no-ocean outcomes.

The local generated seed matrix can calibrate against those anchors; it cannot
define them.

## Review Lanes

- Physical hydrology review.
- Generated seed-matrix/statistics review.
- Product no-signal exception review.
