# Owner Boundaries

Status: active working reference

This file records reusable owner criteria for the closed-structure workstream.
Slice inventories record current red-path rows.

## Domain Model Owners

Domain model config owns one exported authoring config object per file: schema,
type, defaults, and deterministic compile or normalization transforms local to
that object.

Domain model policy owns domain semantic law: classification encodings,
domain-owned legality interpretation, scoring policy, selection policy, and
domain interpretation over artifacts.

Domain model data owns domain-authored data and expectation tables. Generated
official-policy catalogs and runtime proof helpers route to their external
owners.

## External Owners

Reusable official Civ7 map-policy facts, legality tables, shared resource or
feature catalogs, table-index mappings, and policy-table proofs belong to
`@civ7/map-policy` or its accepted repo-local source path.

Ambient Civ7 engine/global TypeScript declarations belong to `@civ7/types`.

Direct Civ7 engine calls, adapter reads/writes, materialization behavior, and
adapter-specific runtime catalogs belong to `@civ7/adapter` or explicit mod
runtime integration.

Pure grid and scalar math helpers with no domain model meaning, Civ7 policy,
recipe-stage meaning, adapter calls, or mod-specific semantics belong to
`packages/mapgen-core/src/lib/**`.

Stage-facing projection config, public recipe-stage config validation, and
stage-specific binding tables belong to the owning standard recipe stage.

Gameplay/narrative material routes through a Gameplay/story-artifact owner-law
domino before movement into a model slot.

## Boundary Rule

Owner identity selects placement. When a symbol appears to fit a domain slot only
because the slot is physically available, movement waits for local owner proof.
