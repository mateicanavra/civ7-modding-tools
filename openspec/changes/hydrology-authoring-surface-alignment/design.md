# Design: Hydrology Authoring Surface Alignment

## Problem

The corpus ledger classifies Hydrology as authoring-surface collapse: the
standard recipe exposes internal step ids, op ids, strategy selectors, and
`config` wrappers directly to authors. That shape is useful for runtime
composition, but it is not an intentional product surface. It makes Studio show
implementation envelopes, lets stale strategy choices leak into shipped map
configs, and obscures which controls affect map climate, river, lake, and
cryosphere behavior.

Hydrology is not a safe knobs-only cleanup. Direct compile traces show shipped
maps depend on exact Hydrology numeric values, especially precipitation,
circulation, ocean coupling, lake, and river thresholds. Collapsing those values
into broad profiles would change generated map behavior without enough
statistics or runtime proof.

## Decision

Keep Hydrology expert numeric controls public, but move them under semantic
public groups and compile them back into internal step/op envelopes:

- climate baseline controls map to `climate-baseline` internal ops;
- hydrography controls map to `rivers` and `lakes` internal ops;
- climate refinement controls map to `climate-refine` internal ops;
- strategy ids are selected by the standard recipe compile functions, not by
  authored config.

The TypeBox public schemas are cloned from the relevant Hydrology strategy
config schemas only after removing the envelope owner layer. Public descriptions
are normalized to author-facing map impact language, and numeric leaves retain
their finite min/max ranges from the domain contracts.

## Behavior Boundary

This slice changes persisted authoring shape, not Hydrology runtime algorithms.
First-party shipped configs are migrated from raw envelopes to semantic public
keys in the same slice. A checked-in pre-slice compiled Hydrology fixture proves
that the migrated configs produce the same stable internal Hydrology config for
the shipped maps.

Generated map source artifacts may churn because persisted config JSON changes
shape and generated metadata hashes include source config. That churn is not
claimed as runtime behavior evidence.

## Deferred Work

Some Hydrology groups remain expert controls rather than higher-level product
profiles. Future profile-collapse work is owned by the standard recipe
authoring-surface workstream and should re-enter only when map statistics,
goldens, or runtime proof show which coupled values must move together. Until
then, this slice records an intentional low-level expert public surface with
semantic group ownership and deterministic lowering.
