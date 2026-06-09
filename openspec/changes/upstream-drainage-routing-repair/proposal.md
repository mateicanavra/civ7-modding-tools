## Why

Normal wet generated maps were producing sparse or invisible navigable rivers
because Hydrology routed discharge over raw local steepest descent. Rough
Morphology terrain contains many local pits and flats; treating each one as a
terminal sink fragments discharge and major-river intent before `map-rivers`
can materialize anything coherent.

The root fix belongs upstream. `map-rivers` must not repair broken drainage by
inventing projection-only connectors or fallback corridors.

## Target Authority Refs

- `docs/system/libs/mapgen/_archive/hydrology.md`
- `docs/system/libs/mapgen/research/SPIKE-synthesis-earth-physics-systems-swooper-engine.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- `openspec/changes/hydrology-river-network-metrics/**`
- `openspec/changes/map-rivers-navigable-coherence/**`

## What Changes

- Add a Hydrology-owned drainage routing op over Morphology terrain.
- Use depression-conditioned routing and topological accumulation for
  Hydrography discharge/rivers.
- Publish basin/terminal/conditioning diagnostics on the Hydrology artifact.
- Remove downstream connected-corridor fallback selection from `map-rivers`.
- Keep Morphology terrain/elevation truth unchanged; routing conditioning is a
  Hydrology diagnostic surface, not terrain mutation.

## Requires

- Morphology topography (`elevation`, `landMask`) as input terrain truth.
- Existing Hydrology runoff, discharge, river-class, and lake-plan consumers.

## Enables Parallel Work

- Hydrology river-network metrics can assert generated-map route invariants.
- `map-rivers-navigable-coherence` can become a consumer contract instead of a
  route-repair slice.
- Studio River/Lake Inspector can explain drainage validity and terminal types.

## Affected Owners

- `mods/mod-swooper-maps/src/domain/hydrology/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/**`
- `mods/mod-swooper-maps/src/recipes/standard/projection-policies/**`
- Hydrology and map-rivers tests

## Forbidden Owners

- No projection-only spill routing in `map-rivers`.
- No downstream connector terrain outside Hydrology major-river intent.
- No silent cycle fallback in discharge accumulation.
- No product closure from generated arrays, terrain readback, or stale maps
  alone.

## Stop Conditions

- Hydrology still recomputes raw steepest-descent flow locally.
- `map-rivers` can satisfy visible-river thresholds using fallback corridors
  disconnected from Hydrology flow.
- Generated wet maps still route most land into untyped terminal pits.

## Verification Gates

- Fixture tests for pit spill routing, closed basins, acyclic accumulation, and
  lake planning.
- Generated seed probes/stats showing normal Earthlike maps produce coherent
  major-river intent and visible navigable candidates without fallback.
- Map-rivers fixture tests proving short fragments are not padded by fallback.
- Typecheck and OpenSpec strict validation.
