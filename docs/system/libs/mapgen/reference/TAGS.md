<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="registry" title="TagRegistry + validation"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tags (dependency ids) and registries

## Purpose

Define the dependency tag system used to wire the pipeline and validate correctness.

## Contract

- Every step has `requires` and `provides` dependency tags.
- Tags must be validated against a registry.
- Missing requirements or unknown tags are errors (unless compiled out).
- Dependency kinds are closed to `artifact:*` data and `effect:*` execution guarantees.
- Recipe tag catalog names describe their owner/surface, not the milestone that
  introduced them.

## TagRegistry + validation

TagRegistry is responsible for:

- registering tag definitions,
- validating tags (kind and id correctness),
- and validating `requires/provides` lists.

Artifact IDs are owned and registered by step-selected artifact modules. Explicit catalogs own
effect IDs and their optional runtime postconditions. Representative effect example:

```ts
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: {
    riversPlotted: "effect:map.riversPlotted",
  },
} as const;

export function registerStandardTags(registry: {
  registerTags: (defs: readonly DependencyTagDefinition[]) => void;
}) {
  registry.registerTags(STANDARD_TAG_DEFINITIONS);
}
```

## Ground truth anchors

- TagRegistry implementation and helpers: `packages/mapgen-core/src/engine/tags.ts`
- StepRegistry validation: `packages/mapgen-core/src/engine/StepRegistry.ts`
- Policy: registered-only tags: `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`
- Example effect registry + definitions: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Artifact module runtime: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
