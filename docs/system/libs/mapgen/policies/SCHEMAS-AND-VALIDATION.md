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
- and compiler-owned (defaults/normalization happen before execution).

## Audience

- Step/op authors.
- Compiler/runtime maintainers.
- Anyone authoring recipes or presets.

## Allowed

### 1) Treat config as data, validated by schemas

- Every recipe step’s `config` is treated as data.
- Defaults/normalization happen in config compilation (not ad-hoc in step implementations).

### 2) Prefer strict normalization

When validating unknown user input, prefer the strict normalization/validation layer so unknown keys are rejected.

### 3) Keep schemas closed by default

Use `additionalProperties: false` for objects unless you are intentionally allowing extensibility.

## Disallowed

### 1) “Best effort” execution with invalid config

Do not allow silent coercions, ignored keys, or “it kinda works” configs in canonical flows.

### 2) Step implementations that invent defaults

Do not set defaults inside steps/ops that should have been provided by compilation.

If a default is needed, it belongs in schema defaulting/normalize.

## Common mistakes / footguns

- **Unknown keys slip through** if schemas are not strict or if `additionalProperties` isn’t closed.
- **Union schemas** can be tricky; make sure “best candidate” selection is deterministic (prefer compile-time selection, not runtime heuristics).
- **TypeBox formats** may not be usable in Civ7’s embedded runtime; use the shim posture where required.

## Ground truth anchors

- Strict normalization implementation: `packages/mapgen-core/src/compiler/normalize.ts`
- Defaulting + schema helpers: `packages/mapgen-core/src/authoring/schema.ts`
- Recipe and run request schemas: `packages/mapgen-core/src/engine/execution-plan.ts`
- Civ7/V8 format shim rationale: `packages/mapgen-core/src/shims/typebox-format.ts`
- Target posture for config authoring surface: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`

