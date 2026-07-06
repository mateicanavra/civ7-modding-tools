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

Domain model schema primitive:
one exported reusable domain schema fragment, enum, type, invariant, defaults
object, object-local normalizer, or object-local schema contract that stages or
operation contracts compose. This is not a stage authoring surface, full
operation envelope, or reusable semantic policy.

Stage authoring config surface:
one stage-owned public schema, `knobsSchema`, public-to-internal compile
mapping, or local stage composition surface.

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

Root config contents classify into domain model schema primitives, domain
policy, operation contracts, stage authoring owners, or deletion.

Stage public schemas, stage knobs, and public-to-step compile mappings stay
with the owning stage. Operation/strategy config stays with operation
contracts. Domain model files may expose primitives that those surfaces compose,
but they do not own the stage authoring surface.

Reusable semantic policy tables and mapping functions route to `model/policy/`
unless they are object-local invariants or normalizers for one primitive/config
contract.

Root policy contents classify to domain model policy or operation-local policy.

Root library, shared, common, utility, internal, support, public, vocabulary,
semantics, constants, types, config-shaped files, and model helper symbols
classify to a recognized owner class or named owner-law work.

Generic operation-family shared folder contents decompose into operation-local,
domain model, artifact contract, core, stage/projection, external Civ7, or
deletion owners.

Markdown notes inside source-owned artifact or operation folders require an
explicit named scope role before they can become source-owned artifacts.
