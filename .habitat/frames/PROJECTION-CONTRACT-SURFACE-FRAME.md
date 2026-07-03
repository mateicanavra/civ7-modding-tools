# Projection Contract Surface Frame

Status: narrow method frame for unresolved map projection contract pressure

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Theme: projection contract surface. The point is to decide whether a boundary
surface exists between pure MapGen truth, recipe projection/materialization,
and Civ7 engine-realized map state before any more rows are moved by
projection, artifact, or output label affinity.

## Purpose

Use this frame when a row has already been split down to projection contract
pressure and still cannot whole-fit an existing authority destination such as
`recipe-step`, `swooper-maps-standard-recipe`, or `mod-map`.

The seed row for this frame is
`.habitat/civ7/mapgen/map-output/_remainder/prohibit_realized_map_artifact_tags`.
It forbids `artifact:map.realized.` across both `mods/mod-swooper-maps/src`
and `packages/mapgen-core/src`. That cross-source scan is the key evidence:
the rule is not merely standard-recipe context and not merely mod-map output
authority.

## Competency Question

The surface is justified only if it can answer:

> Which artifact and effect tags may cross the boundary between pure MapGen
> truth, recipe projection/materialization, and Civ7 engine-realized map state,
> and which source owners are forbidden from declaring or consuming tags that
> claim realized in-game map truth?

If that question cannot be answered with source-backed ownership and proof,
retain the row as `_remainder` and do not create a new destination.

## In Scope

- Projection/materialization contract boundaries that cross recipe source,
  map-output source, and pure `packages/mapgen-core/src` source.
- Artifact and effect tag namespace ownership when the namespace claims map
  realization, projection, parity, or engine readback meaning.
- Existing rows that were already reviewed and retained because no existing
  owner whole-fit the predicate.
- A future narrow surface frame, destination decision, or split plan that
  reduces `_remainder` state without smuggling a blueprint by label.

## Out Of Scope

- Creating `map-projection`, `placement-outcome`, generic `artifact`, or
  generic `contract` authority from labels alone.
- Moving a row because it scans map-output files, tag strings, generated
  artifacts, or recipe projection steps.
- Broad import-law, package-graph, build, runner, or capability design.
- Rewriting projection behavior or package boundaries as part of destination
  discovery.

## Decision Criteria

Create a new destination only when the proposed surface has:

- source-backed ownership across the pure MapGen, recipe, and Civ7 map-output
  layers;
- multiple possible instances or repeated rows that need the same boundary;
- an anchor grammar or source pattern that future rules can target without
  hard-coding the current packet shape;
- proof that the boundary cannot be owned truthfully by an existing blueprint
  or honest niche context; and
- validation or projection behavior that can be tested without changing runtime
  map generation.

Retain or move to a smaller `_remainder` when:

- the row only exposes a missing positive rule;
- the destination would need package-graph or import-law work first;
- the predicate mixes runtime behavior with tag naming or generated output
  currentness; or
- the only evidence is a current filename, folder, or token prefix.

## Current Seed Disposition

`prohibit_realized_map_artifact_tags` stays under
`.habitat/civ7/mapgen/map-output/_remainder/` until this frame is run as its
own domino. It is reviewed debt, not final map-output authority.

The next implementation should not move it by itself. It should first inspect
adjacent retained rows and source boundaries to decide whether the surface
exists, whether the rule should become part of that surface, or whether the row
is garbage-collection pressure after a positive boundary rule is authored.
