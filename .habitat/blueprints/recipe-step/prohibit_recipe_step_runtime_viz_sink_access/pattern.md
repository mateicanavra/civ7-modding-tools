---
level: error
---
# Prohibit Recipe Step Runtime Viz Sink Access

Recipe steps author optional visualization as a pure `createStep({ viz })` facet.
They never discover or invoke an execution sink from runtime context or helpers.

```grit
language js(typescript)

or {
  `$target.viz` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `$target["viz"]` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/step.ts
context.viz?.dumpGrid(context.trace, layer);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/helpers/runtime.ts
const sink = context["viz"];
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/step.ts
export const BiomesStep = createStep(BiomesStepContract, {
  run: ({ deps }) => computeBiomes(deps),
  viz: ({ result, dimensions }) => projectBiomeViz(result, dimensions),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/config.ts
export const visualization = config.viz;

// @filename: mods/mod-swooper-maps/test/recipes/standard/stages/ecology/steps/biomes/step.test.ts
expect(context.viz).toBeUndefined();

// @filename: packages/mapgen-core/src/engine/step-projectors.ts
export type StepFacets = { viz?: () => readonly unknown[] };
```
