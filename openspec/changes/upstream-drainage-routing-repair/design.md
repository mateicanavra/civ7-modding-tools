## Design

### Domain Boundary

Morphology owns earth matter and terrain form: elevation, land/water mask,
bathymetry, substrate, coastline, ridges, mountains, rough lands, and any raw
geomorphic proxies it needs for erosion.

Hydrology owns water movement over that terrain: depression-conditioned drainage
routing, flow receivers, contributing area, discharge, drainage basins,
terminal classification, river class, lake intent, and river-network
diagnostics.

The word basin is split by owner:

- Morphology may describe topographic depressions or landform basins.
- Hydrology owns drainage basin ids and terminal typing under a routing model.

### Algorithm

The default Hydrology routing op runs a Priority-Flood-style expansion from
water outlets, optionally external map-edge outlets, or a typed closed-basin
seed when no outlet exists. It computes a conditioned routing surface without
mutating Morphology elevation.

Outputs include:

- `flowDir`: acyclic receiver graph over land plus water/external terminals;
- `flowAccum`: topological contributing land area, not raw elevation order;
- `basinId`: Hydrology drainage basin id;
- `routingElevation`: conditioned drainage surface;
- `depressionDepth`: fill/spill depth diagnostic;
- `sinkMask`: raw depression/lake candidates, not automatic discharge stops;
- `outletMask`: direct water/ocean outlet tiles;
- `terminalType`: none, ocean/water outlet, or closed basin.

Hydrology hydrography computes this route once, accumulates runoff along it,
classifies minor/major rivers from discharge, and publishes the diagnostics.

### Downstream Contract

`map-rivers` only selects Hydrology-authored major-river tiles that remain
projectable after Civ elevation/projection constraints. It may select fewer
than its target and publish that shortfall; it must not synthesize fallback
corridors to hide upstream route fragmentation.

### Proof Boundary

Hydrology-truth, projection-plan, terrain-readback, Studio display, rendered Civ
visibility, and product acceptance remain separate proof classes. This change
only closes the upstream route repair and generated/projection prerequisites;
it does not claim fresh in-game rendered river proof.
