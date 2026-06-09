## Design

Add a hydrology diagnostics product that is downstream of physical routing and
upstream of projection.

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
- minor/headwater intent dominates physical network length on normal wet maps;
- major rivers are downstream/high-discharge subset;
- lake intent is lowland/sink-derived and does not move drainage divides;
- arid maps can produce ephemeral/no-visible outcomes with explicit status.

## Review Lanes

- Physical hydrology review.
- Generated seed-matrix/statistics review.
- Product no-signal exception review.
