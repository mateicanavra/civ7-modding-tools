<toc>
  <item id="purpose" title="Purpose"/>
  <item id="why" title="Why this exists"/>
  <item id="model" title="Model"/>
  <item id="where-it-shows-up" title="Where it shows up"/>
  <item id="how-to-debug" title="How to debug it"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Truth vs projection (explanation)

## Purpose

Explain the “truth vs projection” model as a mental tool for reasoning about MapGen correctness and drift.

Contract/policy lives in:
- [`docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`](/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md)

## Why this exists

MapGen frequently needs to model “physics truth” at one resolution/representation (e.g. a mesh/cell graph), while the engine consumes results at another (tile fields).

Without an explicit model, you get drift:
- projections computed from different sources disagree,
- steps accidentally use an outdated projected field,
- and debugging becomes “guess the ordering”.

The goal is to make drift **observable and preventable**.

## Model

- **Truth**: canonical domain state at the “physics” representation.
  - Owned by a domain; should be treated as the authoritative substrate.
- **Projection**: a deterministic mapping of truth into a consumer-facing representation.
  - Projections can be recomputed; they should not become “shadow truth”.

## Where it shows up

Common examples:
- Foundation mesh/crust/tectonics truth → tile projections used by later stages.
- Hydrology truth models → tile rainfall/routing fields.

The standard recipe often introduces explicit projection steps whose job is to:
- compute projections deterministically from truth,
- publish projection artifacts/fields,
- emit viz layers for inspection.

## How to debug it

- Use trace/viz to compare:
  - truth-driven projection outputs across steps,
  - “before/after” snapshots when a later step mutates buffers.
- Avoid “fixing drift” by copying projected fields; fix the projection source instead.

## Ground truth anchors

- Policy (contracts/invariants): `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Foundation projection step (tile projections + viz emissions): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Morphology no-water-drift invariant (assertion): `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/assertions.ts`
