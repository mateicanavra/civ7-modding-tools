# Prework Decision Qualification Inventory

Status: historical checklist with closure overlay

These are the unresolved decisions to walk before domain-blueprint source-moving
work begins. They are ordered from least defined to more defined. Completed
prework decisions stay in the completed section as proof pointers, not as active
queue items.

Current next move: none in this prework slice.

Foundation Lib and Domain Model Config Law are completed
decision/execution packets for the current repair scope. Placement Status,
Resources Initial Map Authoring, Morphology `ops.ts` Non-Binding Exports, and
Domain Public / Import Surface are superseded by the accepted config-law and
cleanup execution records unless a future Habitat red surface creates a new
owner question. The active next work is implementation/topology burn-down from
the current execution packets, not another prework decision queue.

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
blueprint. Every row now has an exact destination/action:

- domain model policy rows for crust buoyancy, reference area, and tectonic
  event types;
- artifact contracts for foundation mesh, crust, mantle, plate, tectonics,
  history, provenance, event, era-field, plate-id, and tracer-index products;
- core mechanics APIs in existing `@swooper/mapgen-core` `lib/math`,
  `lib/grid`, and `lib/mesh` subpaths;
- operation-local provenance reset policy and tracer-advection constants;
- delete actions for dead duplicate tectonics files and stale constants.

Proof packet:
`Decisions/002-foundation-lib-tectonics-disposition/`

Done:
`require.ts` is resolved to artifact-contract assertion helpers, and
`shared.ts` helpers are resolved to accepted core APIs, an existing core
replacement, or operation-local provenance policy.

Execution:
packet-linked execution is closed through the S6 closure branch; the original
`require-guards.domino.md` and `tectonics-shared-core.domino.md` remain as
resolved proof records, not active deferred work.

### Domain Model Config Law

Decision:
decide which current config-shaped rows belong to stage authoring, operation
contracts, `model/schemas`, `model/policy`, facade residue, or deletion. The
decision must distinguish stage authoring surfaces from domain-owned reusable
primitives: stages own public schemas, `knobsSchema`, and public-to-internal
compile mappings; operation contracts own operation/strategy config; domain
model files own reusable schemas, types, enums, invariants, and semantic policy
fragments that stages or operations compose.

Inspect:

- `mods/mod-swooper-maps/src/domain/*/config.ts`
- `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts`
- `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts`
- `mods/mod-swooper-maps/src/domain/morphology/shared/**`
- `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts`
- `mods/mod-swooper-maps/src/domain/placement/config.ts`
- current candidate `model/schemas/` rows for ecology, foundation, hydrology,
  morphology, placement, and resources
- stage and operation consumers of those config surfaces

Choices:

- create `model/schemas/` only when the domain has real domain-owned reusable
  schema primitive objects;
- name real schema primitive files for each accepted `model/schemas/` owner;
- move config-like material to the named standard recipe stage file when it is
  a public authoring surface, knob surface, public-to-step compile mapping, or
  projection/stage-facing concern;
- route reusable semantic policy to `model/policy/`, not `model/schemas/`;
- inline operation config fragments into operation `contract.ts`;
- delete unused defaults and duplicate facades. Root or per-domain `config.ts`
  facade deletion is gated by import-surface law unless caller proof shows no
  public surface remains.

Done:
every current config/shared-knob row has an exact destination: domain schema
primitive file, domain policy file, operation `contract.ts`, a named standard
recipe stage file, or delete action. Ecology and resources are explicitly
resolved as domains with real `model/schemas` primitives or no schema-primitive
rows in this pass.

Result:
the config-shaped confusion has been burned down for the current scope.
Operation contract, recipe stage authoring, domain model schema/policy,
artifact aggregate, recipe/map public-surface, test public-surface, current
domain source topology, root domain ops binding, and domain ops registry checks
are green. The former resource data-contract domino is closed by the Slice 001
cleanup execution: the expected-count range primitive has a named resource
model schema owner, operation contracts compose it, and the artifact keeps
strict corpus validation.

Proof packet:
`Decisions/003-domain-model-config-law/`

## Historical Candidate Decisions

The sections below are retained as the original prework candidates. They are
not the active queue after the closure overlay above.

### 2. Placement Status

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
- `morphology/model/schemas/<part>.schema.ts`;
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
