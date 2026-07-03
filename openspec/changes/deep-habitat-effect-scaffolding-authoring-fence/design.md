# Design: Scaffolding Authoring Fence

## Owner

Scaffolding domain and generator host boundary.

## Target Files

```text
tools/habitat-harness/src/domains/scaffolding/index.ts
tools/habitat-harness/src/domains/scaffolding/project.ts
tools/habitat-harness/src/domains/scaffolding/pattern.ts
tools/habitat-harness/src/domains/scaffolding/refusals.ts
tools/habitat-harness/src/generators/**
tools/habitat-harness/src/plugin/**
```

## Fence Rules

- Generic Habitat scaffolding may create supported Habitat project/pattern
  artifacts only.
- Product authoring requests receive typed unsupported-domain refusals unless a
  future accepted packet adds a product authoring domain.
- Nx generator mechanics stay in generator/plugin host entrypoints; reusable
  decisions live in `src/domains/scaffolding/**`.

## Stop Conditions

- Generic scaffolding parses Civ7/MapGen recipe, stage, op, or step semantics.
- Generator code performs direct filesystem writes outside provider/resource
  services where reusable Habitat logic is involved.
- Unsupported-domain refusals are generic thrown strings.
