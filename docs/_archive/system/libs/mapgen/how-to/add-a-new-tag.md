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

Add a causal artifact or effect dependency to the pipeline's closed authority registry.

Routes to:

- Tag reference: [`docs/system/libs/mapgen/reference/TAGS.md`](/system/libs/mapgen/reference/TAGS.md)
- Artifact reference: [`docs/system/libs/mapgen/reference/ARTIFACTS.md`](/system/libs/mapgen/reference/ARTIFACTS.md)
- Dependency id policy: [`docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`](/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md)

## Prereqs

- For cross-step data, you have the exact owning `Artifact` authority.
- For an execution guarantee, you have a stable `effect:*` id and know whether successful provider
  completion is sufficient evidence.

## Checklist

### 1) Pick the authority kind

- Use an artifact for write-once pipeline data. Cross-step data is always a validated artifact
  vintage; local scratch values are neither context state nor dependency tags.
- Use an effect for an execution or external-materialization guarantee that carries no pipeline
  data.

### 2) Declare an artifact dependency

Define the artifact in its owning module, then select that exact authority in the step contract:

```ts
export const config = defineStep({
  id: "build-plate-graph",
  requires: [],
  provides: [artifacts.plateGraph],
});
```

The exact `Artifact` value is the authored dependency. `defineStep` derives its
id into the compiled step's ordered `provides` ledger while retaining the
authority needed to type `deps.artifacts`. Recipe composition then creates the
corresponding `ArtifactDependencyTag`. Do not replace the authority with a raw
`artifact:*` id, and do not add it to recipe `tagDefinitions` or a public
registry method.

Publish through the occurrence-bound `deps.artifacts.<name>.publish(value)` capability. Artifact
satisfaction is the successful provision plus presence of that exact authority in the private
write-once store; there is no artifact satisfaction predicate.

### 3) Define an effect dependency

Add the id to its owning namespaced constant set, then add an `EffectDependencyTag` to the recipe's
effect catalog:

```ts
import type { EffectDependencyTag } from "@swooper/mapgen-core/authoring";

export const STANDARD_TAG_DEFINITIONS: readonly EffectDependencyTag[] = [
  {
    id: STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied,
    kind: "effect",
    satisfies: (evidence) => evidence.verifyEffect(),
  },
];
```

Pass this catalog as the recipe's `tagDefinitions`. Omit `satisfies` when successful provider
execution is sufficient. When present, the predicate must return a synchronous boolean and can
verify only the effect currently being evaluated; predicates are effect-only and cannot inspect
artifacts.

### 4) Use the effect id in step contracts

Add the typed `effect:*` constant to `requires` and/or `provides`. Keep both
ordered lists minimal. Exact artifact authorities may appear in those same
lists; `defineStep` compiles both kinds to runtime ids without erasing artifact
ownership at authoring time.

## Verification

- Require the dependency from a later step. Before provision, execution should report
  `MissingDependencyError` with the id; after valid provision, execution should continue.
- Run `nx run mod-swooper-maps:test`.

## Footguns

- **Writing artifact ids into `requires` or `provides`**: put the exact owning
  `Artifact` value in the list instead.
- **Explicitly registering an artifact**: artifact authorities are recipe-derived and public
  registration rejects them.
- **Using an effect predicate to validate data**: artifact admission belongs to the artifact's
  publication validator; effect evidence cannot read artifact storage.
- **Overusing effects**: dependency ids are contracts, and redundant guarantees add coupling noise.

## Ground truth anchors

- Standard effect catalog: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Step dependency authoring and ledger derivation: `packages/mapgen-core/src/authoring/step/contract.ts`
- Recipe authority resolution: `packages/mapgen-core/src/authoring/recipe/create.ts`
- Registry and satisfaction: `packages/mapgen-core/src/engine/tags.ts`
- Dependency errors: `packages/mapgen-core/src/engine/errors.ts`
