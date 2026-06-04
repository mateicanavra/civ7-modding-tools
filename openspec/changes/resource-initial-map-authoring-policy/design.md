# Resource Initial Map Authoring Policy Design

## Decision

Resource-domain policy owns the question "may this official resource be authored
onto the initial map surface?" The policy is derived from official resource
corpus rows:

- official blocked rows remain `blocked-official`;
- non-placeable rows remain `not-placeable`;
- placeable rows without `AGE_ANTIQUITY` are `deferred-future-age`;
- placeable rows with `AGE_ANTIQUITY` are `eligible`.

The policy currently produces 34 initial-map eligible resource ids and defers
16 future-age resources, including `RESOURCE_COAL`, `RESOURCE_OIL`, and
`RESOURCE_RUBBER`.

## Boundary

The official corpus remains evidence. Earthlike expectations retain future
geological/ecological meaning. Runtime placement consumes only the initial-map
eligible id set. This keeps Swooper authoring authority: the pipeline decides
which resources to stamp, while using official age policy as a hard eligibility
constraint.

## Architecture

- Owner: `mods/mod-swooper-maps/src/domain/resources`.
- Consumer: placement input derivation and resource materialization.
- Forbidden owner: public map config. Resource id candidate lists are not
  author knobs.
- Runtime boundary: adapter placeability is still checked, but only after
  policy filtering.

## Falsifier

Reframe if a live map readback shows resource ids `36`, `38`, or `40` after a
fresh Swooper standard generation and the scripting log shows they came from
`place-resources`, or if official age data proves these resources should be
pre-authored on the Antiquity starting map.
