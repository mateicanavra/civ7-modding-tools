# Prework Decision Qualification Inventory

Status: active slice checklist

These are the unresolved decisions to walk before source-moving work begins.
They are ordered from least defined to more defined. Items already defined
enough to execute are excluded.

## 1. Narrative Liveness And Ownership Disposition

Decision:
determine which `mods/mod-swooper-maps/src/domain/narrative/**` paths and
symbols are live, which owner controls the live material, and which unused
material can be deleted.

Inspect:

- `mods/mod-swooper-maps/src/domain/narrative/**`
- all imports and callers of narrative exports
- recipe and stage usage
- architecture docs for Gameplay, narrative, placement, and MapGen domain
  boundaries

Choices:

- Gameplay/story-artifact owner-law row;
- recipe or stage owner row;
- domain-owned row with exact scope/file law;
- deletion with consumer proof;
- split across the owner rows above.

Done:
every narrative path has liveness evidence and one disposition: exact current
slice destination, deletion, or named later owner-law row. Any Gameplay/story
artifact row names the owner-law domino that will define root shape and public
surface.

## 2. Foundation `lib/` / Tectonics Disposition

Decision:
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.

Inspect:

- `mods/mod-swooper-maps/src/domain/foundation/lib/**`
- foundation operation consumers
- downstream recipe/stage consumers
- `packages/mapgen-core` ownership and existing grid/math/mechanics surfaces

Choices:

- promote to named `foundation/model/policy/<concern>.ts`;
- move domain-authored data to `foundation/model/data/<collection>/<name>.ts`;
- move pure reusable mechanics to `packages/mapgen-core/src/lib/**`;
- move operation-owned logic under a specific operation `rules/`;
- delete duplicate or dead helper files.

Done:
every foundation `lib/**` file has an exact destination or delete action. No
row lands in generic `model/data`, `model/policy`, or `core` without a named
file path.

## 3. Domain Model Config Law

Decision:
decide whether `model/config/` is required for every domain root covered by the
selected scope and define what counts as a valid domain model config object.

Inspect:

- `mods/mod-swooper-maps/src/domain/*/config.ts`
- `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts`
- `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts`
- `mods/mod-swooper-maps/src/domain/morphology/shared/**`
- `mods/mod-swooper-maps/src/domain/placement/config.ts`
- current candidate `model/config/` rows for ecology, foundation, hydrology,
  morphology, placement, and resources
- stage and operation consumers of those config surfaces

Choices:

- require `model/config/` only when the domain has real domain-authored config
  objects;
- require `model/config/` for every covered domain root and name real config
  object files for each one;
- move config-like material to the named standard recipe stage file when it is
  projection/stage-facing;
- inline operation config fragments into operation `contract.ts`;
- delete unused defaults and duplicate facades.

Done:
the `model/config/` requirement is decided, and every current config/shared-knob
row has an exact destination: `model/config/<part>.config.ts`, operation
`contract.ts`, a named standard recipe stage file, or delete action. Ecology
and resources are explicitly resolved as real config-object domains or as
domains with an optional `model/config/` law.

## 4. Placement Status

Decision:
determine the owner status of current `placement` material under the selected
domain topology and stage architecture.

Inspect:

- `mods/mod-swooper-maps/src/domain/placement/**`
- callers of `placement/index.ts`, `placement/ops.ts`, and
  `placement/config.ts`
- recipe/stage placement architecture docs and source

Disposition rows:

- domain-owned placement material with exact domain scope/file law;
- recipe/stage-owned placement material with named stage owner path;
- split row mapping each live symbol to domain contract, stage projection/config,
  or deletion;
- deletion with consumer proof.

Done:
current `placement` material has a declared owner status, and
`placement/config.ts` has one exact landing or delete path.

## 5. Resources Initial Map Authoring

Decision:
split `resources/policy/initial-map-authoring.ts` into its true owners.

Inspect:

- `mods/mod-swooper-maps/src/domain/resources/policy/initial-map-authoring.ts`
- imports and callers
- `packages/civ7-map-policy`
- `packages/civ7-adapter`
- standard recipe stage consumers

Choices:

- domain model policy for pure domain authoring rules;
- `@civ7/map-policy` for official-game facts and reusable policy tables;
- `@civ7/adapter` or runtime integration for engine/API behavior;
- owning recipe stage for stage-facing projection or config behavior.

Done:
each exported symbol or behavior-bearing definition has an exact destination.
The file is not moved whole into `resources/model/policy/`.

## 6. Morphology `ops.ts` Non-Binding Exports

Decision:
place the config schema exports and `DEFAULT_ELEVATION_SCALE` currently living
in `mods/mod-swooper-maps/src/domain/morphology/ops.ts`.

Inspect:

- `mods/mod-swooper-maps/src/domain/morphology/ops.ts`
- imports of each non-binding export
- related morphology operation contracts and config files
- morphology model policy/config candidates

Choices:

- operation `contract.ts`;
- `morphology/model/config/<part>.config.ts`;
- `morphology/model/policy/<concern>.ts`;
- delete if duplicate.

Done:
every non-binding export has an exact destination or delete action, and
`morphology/ops.ts` can become only the `createDomain(domain, implementations)`
binding surface.

## 7. Domain Public / Import Surface

Decision:
define what remains public after root helper exports and config barrels move.

Inspect:

- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/domain/config.ts`
- `mods/mod-swooper-maps/src/domain/*/index.ts`
- consumers of `@mapgen/domain/**` paths
- consumers of resource legacy `lib/` and policy exports

Choices:

- root domain `index.ts` exports only the domain contract surface;
- selected model or artifact surfaces are publicly re-exported by explicit law;
- consumers import owner files directly;
- short-lived compatibility shims with explicit removal criteria.

Done:
root `index.ts`, `domain/config.ts`, and resources public exports have a
public-surface law. No implementation row relies on a broad barrel staying alive
by accident.
