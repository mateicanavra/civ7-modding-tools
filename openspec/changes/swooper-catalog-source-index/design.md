# Design

## Catalog Source Entry

Each catalog source entry contains:

- `catalogSourceId`: stable id used by Studio launch source input;
- `configPath`: repo-relative path to the authored map config;
- display metadata used by Studio catalog surfaces;
- digest inputs that define what source content participates in source digest
  calculation.

## Ownership

The Swooper Maps mod owns the tracked source index because it owns shipped
catalog membership. Studio consumes the index; it does not infer catalog
membership from paths.

## Cutover Boundary

This packet introduces and validates the source index. Catalog generation cutover
happens later after request-scoped generation exists. Until cutover, this packet
adds a consistency validator: the tracked catalog source index and the current
catalog generation source set must resolve to the same catalog source ids and
config paths. That validator prevents divergent catalog authority during the
transition.
