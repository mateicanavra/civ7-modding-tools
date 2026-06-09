## Why

The previous branch proved six projected/live navigable terrain tiles on a
standard Earthlike map. That is too sparse to satisfy a user-visible river
product claim. The projection stage needs coherence and density gates that make
normal maps visibly rivered while preserving arid/no-signal exceptions.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/earthlike-visible-river-acceptance/**`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`

## What Changes

- Add navigable projection coherence metrics: connected chains, sampled trunk
  length, slope/obstruction legality, mouth proximity, and distribution.
- Predeclare minimum visible terrain thresholds for normal wet Earthlike maps.
- Keep `map-rivers.navigableRiverDensity` as the projection knob and preserve
  Hydrology `riverDensity` as physical classification.

## Requires

- Hydrology planned major rivers and discharge/flow direction.
- Hydrology network metrics when available; initial implementation may use
  current discharge/flowDir with explicit limitations.

## Enables Parallel Work

- Runtime visual proof has enough candidate chains to inspect.
- Studio River Inspector can show useful projection counts/statuses.

## Affected Owners

- `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/**`
- `mods/mod-swooper-maps/src/recipes/standard/projection-policies/**`
- Map config fixtures and hydrology knobs tests

## Forbidden Owners

- No minor-river metadata stamping.
- No hydrology truth changes solely to increase projection count.
- No product closure from terrain rows alone.

## Stop Conditions

- A normal wet map with planned major rivers projects fewer than the declared
  minimum visible terrain tiles without a typed no-signal exception.
- Projection fragments into isolated disconnected specks.

## Verification Gates

- Unit tests for chain coherence and fallback behavior.
- Seed-matrix projection stats with visible-density thresholds.
- Same-run terrain readback parity.
- OpenSpec strict validation.
