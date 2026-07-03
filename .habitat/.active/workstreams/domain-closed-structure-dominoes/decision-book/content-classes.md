# Content Classes

Status: active working reference

This file defines reusable content classifications. Per-slice current-path rows
live in slice inventories.

## Recognized Owner Classes

Domain contract surface:
the domain identity and operation contract set exposed by root `index.ts`.

Domain implementation binding:
the binding between a domain contract and its implementation registry exposed
by root `ops.ts`.

Operation contract registry:
the operation contract set exposed from the domain `ops/` namespace.

Operation implementation registry:
the operation implementation set exposed from the domain `ops/` namespace.

Domain authoring config object:
one exported config object with object-local schema, type, defaults, and
deterministic compile or normalization transforms.

Domain model policy concern:
one named cross-operation semantic policy concern owned by the domain.

Domain model data collection:
one named domain-owned authored data or expectation collection.

Artifact contract:
one pipeline truth product contract.

Operation-local contract, policy, rule, strategy, or type:
content owned by one operation module and not reusable as domain-wide policy.

## Disposition Criteria

Root duplicate contract files resolve through duplicate authority deletion.

Root config contents classify into config-object files, operation contracts,
stage owners, or deletion.

Root policy contents classify to domain model policy or operation-local policy.

Root library, shared, common, utility, internal, support, public, vocabulary,
semantics, constants, types, and model helper symbols classify to a recognized
owner class or named owner-law work.

Generic operation-family shared folder contents decompose into operation-local,
domain model, artifact contract, core, stage/projection, external Civ7, or
deletion owners.

Markdown notes inside source-owned artifact or operation folders require an
explicit named scope role before they can become source-owned artifacts.
