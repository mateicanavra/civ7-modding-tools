# Design: Placement Authoring Surface Alignment

## Problem

Placement has already been decomposed around real product/effect contracts:
natural wonders, surface preparation, resources, starts, discoveries, advanced
starts, and final placement summary/evidence. The authored surface has not
caught up. It still exposes the raw `derive-placement-inputs` step and all of
its op envelopes, then exposes empty runtime step keys for the product/effect
steps.

The raw surface mixes three different owner layers:

- product-facing map controls such as resource density and floodplain length;
- runtime/adapter inputs such as resource candidate catalogs and start-sector
  allocation;
- execution plumbing such as empty step configs and op `strategy/config`
  envelopes.

## Decision

Define a semantic public `placement` stage schema and compile it into the
existing internal placement step/op config.

Public keys:

- `knobs`: documented empty stage knobs for future placement-wide controls;
- `naturalWonders`: spacing between planned natural wonder stamps;
- `discoveries`: discovery density and spacing;
- `floodplains`: river segment length thresholds for floodplain preparation;
- `resources`: resource density, spacing, and per-resource share cap.

Hidden/internal defaults:

- `wonders` continues to derive natural wonder count from Civ7 map-size
  runtime data.
- `starts` continues to derive player allocation and sector information from
  runtime map-size data, with the existing empty `startSectors` override
  injected for compile-equivalence.
- `candidateResourceTypes` is not public because the resource planner already
  uses the adapter-owned placeable resource catalog from step input and ignores
  config-owned candidate lists.
- Empty step configs for `plot-landmass-regions`,
  `place-natural-wonders`, `prepare-placement-surface`, `place-resources`,
  `assign-starts`, `place-discoveries`, `assign-advanced-starts`, and
  terminal `placement` are compiled internally.

## Behavior Boundary

This slice changes persisted authoring shape, not placement execution. Shipped
configs are migrated to semantic placement keys and compared against a
checked-in pre-migration compiled-placement fixture using the same seed,
dimensions, and latitude bounds used by earlier authoring-surface slices.

Generated map source artifacts may churn because metadata hashes include the
persisted config JSON. That churn is not runtime behavior proof. Direct Civ7
runtime proof is not required for this slice unless runtime placement code is
changed.

## Risk Controls

- Schema guards reject raw placement step keys and op envelopes as unknown
  public config.
- Public numeric controls have descriptions, defaults, minimums, and maximums.
- Studio generated schema/default tests prove that UI consumers see only
  semantic placement keys while runtime steps remain visible with empty focus
  paths.
- Placement operation tests remain the authority for algorithm behavior; this
  slice only proves compile equivalence for shipped configs.

