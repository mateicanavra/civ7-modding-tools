# Prework Decision Qualification Inventory

Status: active slice checklist

These are the unresolved decisions to walk before domain-blueprint source-moving
work begins. They are ordered from least defined to more defined. Completed
prework decisions stay in the completed section as proof pointers, not as active
queue items.

Current next move: `Domain Model Config Law`.

## Completed Decisions

### Narrative Liveness And Ownership Disposition

Decision:
determine which `mods/mod-swooper-maps/src/domain/narrative/**` paths and
symbols were live, which owner controlled the live material, and which unused
material could be deleted.

Result:
the current MapGen narrative implementation was removed with no replacement in
this cleanup. Direct-control, control-oRPC, and CLI narrative-choice surfaces
remain under their own runtime-control owners. Future Gameplay/story behavior
starts from a separate owner-law domino.

Proof packet:
`Decisions/001-narrative-liveness-ownership/`

Done:
every narrative path has liveness evidence and one disposition. The selected
disposition was deletion of the current implementation plus protected retention
of separate runtime-control narrative-choice surfaces.

### Foundation `lib/` / Tectonics Disposition

Decision:
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.

Result:
the current `foundation/lib/**` tree is not a legal owner in the closed domain
blueprint. Live rows split into named foundation model policy, foundation
artifact contracts, operation-local guard/support work, and core-candidate
helpers that require later execution proof. Unimported tectonics implementation
files are qualified for deletion because active operation-local rule owners
already exist.

Proof packet:
`Decisions/002-foundation-lib-tectonics-disposition/`

Done:
every current `foundation/lib/**` file has a row disposition. Mixed constants
and helper files are split by symbol group. No row lands in generic
`model/data`, `model/policy`, `artifacts/contract`, `core`, or shared `lib`
without a named destination or a named authority gap before execution.

## 1. Domain Model Config Law

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

## 2. Placement Status

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

## 3. Resources Initial Map Authoring

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

## 4. Morphology `ops.ts` Non-Binding Exports

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

## 5. Domain Public / Import Surface

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
