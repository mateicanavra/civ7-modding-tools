---
id: ADR-ER1-037
title: "Complete recipe config construction and exact admission"
status: accepted
date: 2026-07-11
project: engine-refactor-v1
risk: stable
system: mapgen
component: authoring-sdk
concern: recipe-config
supersedes:
  - ADR-ER1-035
superseded_by: null
sources:
  - "ADR-ER1-032"
  - "SPEC-architecture-overview"
  - "SPEC-step-domain-operation-modules"
---

# ADR-ER1-037: Complete recipe config construction and exact admission

## Context

Public recipe config had accumulated several overlapping meanings: sparse
authoring input, persisted JSON, schema-default input, compiler input, and
runtime value. Defaulting, merging, cleaning, and compatibility transforms at
multiple boundaries made the value that launched a run differ from the value a
user selected or saved.

TypeBox already separates construction from validation. `Value.Create(schema)`
can construct a complete value from an executable schema. `Value.Check`,
`Value.Assert`, and `Value.Errors` can validate a supplied value without
changing it. Public config does not need a repository-specific structural
schema copier or property migration layer.

## Decision

1. A persisted, imported, exported, selected, saved, deployed, or launched
   recipe config is a complete JSON value.
2. Every property in a complete recipe-config object is required. Defaultable
   values remain required in the complete value; complete recipe-config schemas
   do not use `Type.Optional`.
3. Every author-controlled scalar or collection leaf declares a deliberate
   default. Required object schemas do not use `default: {}` as a structural
   seed.
4. The recipe owns complete default construction. It calls `Value.Create` on
   its executable public schema and validates the result before publishing it.
5. Every later admission boundary validates an immutable snapshot unchanged.
   It does not default, clean, merge, migrate, coerce, or repair.
6. Behavioral absence is an explicit required discriminator in a closed union,
   not an omitted property. Runtime-derived values are run or operation inputs,
   not optional config overrides.
7. Sparse patches and uncertain observations are separate contract kinds. They
   may represent meaningful omission, but they must be materialized by their
   owning boundary before they can become complete config.
8. A stage may translate complete public stage config into an internal step
   envelope. The compiler may materialize step-schema defaults on that
   recipe-produced internal value. This internal boundary is not a sparse public
   authoring surface.
9. Step and op normalizers operate only on materialized internal config and
   must return a value that validates unchanged against the same schema.
10. Algorithm-local bounds and constants stay with the algorithm unless they
    are intentionally promoted to author-controlled config.

## Consequences

- Catalog JSON, Studio editor state, save/deploy input, generation, and launch
  all carry the same complete value.
- Missing and unknown public properties fail at one exact admission boundary.
- Defaults cannot silently turn a partial historical value into a current
  config.
- Recipe evolution requires regenerating or deliberately authoring complete
  checked-in configs rather than maintaining property-level migrations.
- Internal stage-to-step materialization remains generic and domain-agnostic;
  the MapGen compiler has no knowledge of the Standard recipe's fields or
  semantics.

## Rejected alternatives

- **Default before public validation:** accepts incomplete values and hides
  which producer failed to publish a complete config.
- **`default: {}` on nested objects:** seeds absent subtrees during defaulting
  while leaving `{}` itself invalid, obscuring the construction boundary.
- **Optional config properties for modes:** encodes behavior in absence and
  creates competing runtime/default authorities.
- **Deep partial config as the canonical API:** requires merge precedence and
  makes exact run identity ambiguous.
- **Hand-written default/schema reconstruction:** duplicates TypeBox and drifts
  from the executable recipe schema.

## Ground truth anchors

- Generic compiler boundary:
  `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Exact validation:
  `packages/mapgen-core/src/compiler/normalize.ts`
- Standard recipe default construction:
  `mods/mod-swooper-maps/src/recipes/standard/artifacts.ts`
- Standard config admission:
  `mods/mod-swooper-maps/src/maps/configs/canonical.ts`
- Canonical policy:
  `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
