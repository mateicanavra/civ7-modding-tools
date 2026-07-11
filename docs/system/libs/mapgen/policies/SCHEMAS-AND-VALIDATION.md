<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="allowed" title="Allowed"/>
  <item id="disallowed" title="Disallowed"/>
  <item id="footguns" title="Common mistakes / footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: schemas and validation

## Purpose

Keep MapGen configuration and step/op contracts:
- strict (fail-fast),
- deterministic (reproducible),
- and explicit (public config is complete before compilation begins).

## Audience

- Step/op authors.
- Compiler/runtime maintainers.
- Anyone authoring recipes or complete recipe configs.

## Allowed

### 1) Treat public config as complete data

- A persisted, exported, imported, selected, saved, deployed, or launched recipe
  config is one complete JSON object validated unchanged against the recipe's
  executable TypeBox schema.
- Every property in a complete recipe-config object is required. A defaultable
  property is still required in the complete value.
- Every author-controlled scalar or collection leaf has a deliberate schema
  default. Recipe-owned default construction uses `Value.Create(schema)` once,
  then validates the result before publishing it.
- Nested object schemas do not use `default: {}` to seed missing containers.
  `Value.Create` constructs required containers recursively.

### 2) Represent behavioral absence explicitly

- Do not use an optional object property to encode enabled/disabled,
  inherited/overridden, automatic/manual, or another behavioral mode.
- Model the choice as a required discriminator and a closed union, for example
  `{ mode: "disabled" } | { mode: "target", fraction: number }`.
- Runtime-derived values are operation or run inputs, not optional config
  overrides.
- Sparse patches and uncertain observations are separate contract kinds. They
  may use optional properties only when omission is part of their durable
  meaning and a discriminated union would be less honest. They never pass as a
  complete recipe config.

### 3) Keep schemas closed and admission exact

- Use `additionalProperties: false` for config objects.
- Admission clones for ownership and validates. It does not call
  `Value.Default`, clean unknown keys, merge, migrate, coerce, or repair.
- Unknown and missing keys are errors at the owning boundary.

### 4) Materialize only recipe-produced internal step envelopes

- A stage receives an already complete public stage config and translates it
  into internal step inputs.
- The compiler may apply step-schema defaults to that stage-produced internal
  value at the named stage-to-step compilation boundary. This is not public
  config admission and must not be exposed as a sparse authoring API.
- A step or op normalizer may derive a schema-valid value from already
  materialized internal config. Its output is validated unchanged. It may not
  supply missing public authoring data or silently discard data.

## Disallowed

### 1) “Best effort” execution with invalid config

Do not allow silent coercions, ignored keys, or “it kinda works” configs in canonical flows.

### 2) Runtime or admission code that invents config

Do not default, merge, clean, migrate, or reconstruct complete config inside
Studio, runtime admission, steps, ops, or execution code. Algorithm-local
constants stay local to the algorithm; they are not config merely because a
number could be exposed.

### 3) Optional complete-config properties

Do not use `Type.Optional` in complete recipe-config schemas. If absence has
behavioral meaning, encode that meaning explicitly. If a producer genuinely
cannot know a field, define a separate observation or sparse-input contract.

## Common mistakes / footguns

- **Unknown keys slip through** if schemas are not strict or if `additionalProperties` isn’t closed.
- **`default: {}` is not a valid object value.** It only causes
  `Value.Default` to manufacture a missing subtree before validation.
- **`Value.Create` can synthesize generic scalar values** when a leaf lacks a
  deliberate default. Complete authoring schemas therefore declare defaults on
  author-controlled leaves rather than relying on synthesis.
- **TypeBox declares schema metadata defaults as `unknown`.** A compiling
  `default` annotation is not evidence that the default validates against the
  schema; generated defaults are always validated.
- **Union schemas** can be tricky; make sure “best candidate” selection is deterministic (prefer compile-time selection, not runtime heuristics).
- **TypeBox formats** may not be usable in Civ7’s embedded runtime; use the shim posture where required.

## Ground truth anchors

- Exact validation implementation: `packages/mapgen-core/src/compiler/normalize.ts`
- Recipe-owned default construction: `mods/mod-swooper-maps/src/recipes/standard/artifacts.ts`
- Stage-to-step materialization: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Recipe and run request schemas: `packages/mapgen-core/src/engine/execution-plan.ts`
- Civ7/V8 format shim rationale: `packages/mapgen-core/src/shims/typebox-format.ts`
- Target posture for config authoring surface: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`
- Complete-config decision: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-037-complete-recipe-config-admission.md`
