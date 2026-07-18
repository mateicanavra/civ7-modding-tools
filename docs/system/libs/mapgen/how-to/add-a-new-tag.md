<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add a new tag

## Purpose

Add a new **dependency tag** for pipeline gating (target posture: all requires/provides go through a registry; no magic).

Routes to:

- Tag reference: [`docs/system/libs/mapgen/reference/TAGS.md`](/system/libs/mapgen/reference/TAGS.md)
- Dependency id policy: [`docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`](/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md)

## Prereqs

- You know what kind of tag you’re adding:
  - `kind: "artifact"` (write-once pipeline data), or
  - `kind: "effect"` (adapter-visible engine effects).
- You have a stable id string (e.g. `artifact:morphology.topography`, `effect:engine.biomesApplied`).

## Checklist

### 1) Pick the correct tag kind

- Use **artifact** tags to gate pipeline-internal products.
- Use **effect** tags for adapter-visible “effects applied” signals.
- Cross-step data is always a validated artifact vintage; local scratch arrays are not context state
  or dependency tags.

### 2) Add the tag id constant

- Define artifact IDs in their owning `defineArtifact` module.
- Add effect IDs to the owning namespaced constant set for discoverability.

Representative example (tag id constants; excerpt; see full file in anchors):

```ts
export const MAP_PROJECTION_EFFECT_TAGS = {
  map: {
    elevationBuilt: "effect:map.elevationBuilt",
    mountainsPlotted: "effect:map.mountainsPlotted",
    volcanoesPlotted: "effect:map.volcanoesPlotted",
  },
} as const;
```

### 3) Register the tag definition

- Effect tags add a `DependencyTagDefinition` entry:
  - `id`
  - `kind`
  - optional `owner` (recommended for effects)
  - optional `satisfies(context, state?)` predicate for runtime validation
- Ensure the registry function registers the full set of definitions.
- Artifact modules register their own IDs and complete validators when selected by step contracts;
  do not duplicate them in the explicit effect registry.

Representative example (registration + owner attribution; excerpt; see full file in anchors):

```ts
const EFFECT_OWNERS: Record<string, TagOwner> = {
  [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt]: {
    pkg: "mod-swooper-maps",
    phase: "gameplay",
    stepId: "build-elevation",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "gameplay",
    stepId: "plot-mountains",
  },
};

export const STANDARD_TAG_DEFINITIONS = [
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map((id) => {
    const definition: DependencyTagDefinition<ExtendedMapContext> = { id, kind: "effect" };
    const owner = EFFECT_OWNERS[id];
    if (owner) definition.owner = owner;
    return definition;
  }),
] as const;

export function registerStandardTags(registry: {
  registerTags: (defs: readonly DependencyTagDefinition[]) => void;
}) {
  registry.registerTags(STANDARD_TAG_DEFINITIONS);
}
```

### 4) Use the tag in step contracts

- Add to `requires` and/or `provides` in step contracts.
- Keep the tag list minimal and meaningful: avoid redundant tags when an artifact implies the same gating.

## Verification

- Run a pipeline execution with your tag required by a step:
  - if missing, you should see `MissingDependencyError` naming your tag id (good)
  - once satisfied, the pipeline should proceed without missing dependency failures
- Run:
  - `nx run mod-swooper-maps:test`

## Footguns

- **Defining tags but never registering** them: unregistered tags are invalid and will be rejected by validation.
- **Overusing tags**: tags are contracts; too many tags becomes coupling noise.
- **Encoding mutable state as a dependency**: publish validated artifact evidence instead.
- **Conflating artifact vs effect**: artifacts carry data; effects guarantee execution or materialization.

## Ground truth anchors

- Standard recipe tag registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Tag validation + satisfaction logic: `packages/mapgen-core/src/engine/tags.ts`
- Dependency errors: `packages/mapgen-core/src/engine/errors.ts`
