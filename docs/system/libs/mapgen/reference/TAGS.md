<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="authorities" title="Dependency authorities"/>
  <item id="registry" title="Resolution and satisfaction"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tags (dependency ids) and registries

## Purpose

Define the closed dependency-authority model used to order steps and validate pipeline gates.

## Contract

- `requires` and `provides` are the sole ordered authored dependency lists. Each
  entry is either an exact `Artifact` authority or a typed effect/completion id
  constant.
- `defineStep` compiles both authored kinds into one ordered string-id ledger per
  direction for the runtime `MapGenStep`, while retaining exact artifact
  authority for typed `deps.artifacts` capabilities.
- Recipe composition resolves every ledger id to the closed
  `EffectDependencyTag | ArtifactDependencyTag` union.
- Unknown ids are registration errors; an unsatisfied requirement is an execution error.
- `effect:*` ids represent execution guarantees. `artifact:*` ids represent write-once data
  products.
- Recipe tag catalog names describe their owner or surface, not the milestone that introduced them.

## Dependency authorities

`EffectDependencyTag` is the authored authority for an effect id. It may carry an optional
effect-specific runtime postcondition:

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

Pass the catalog as `tagDefinitions` when creating the recipe. `TagRegistry.registerTag` and
`registerTags` likewise accept only `EffectDependencyTag` values.

`ArtifactDependencyTag` is recipe-derived from the exact `Artifact` authorities
selected directly in step `requires` and `provides`. Authored code cannot use a
raw `artifact:*` string, explicitly register artifact dependency authorities, or
place them in recipe `tagDefinitions`; this prevents dependency identity from
diverging from publication admission.

The registry's resolved authority is the closed union:

```ts
type DependencyTag = EffectDependencyTag | ArtifactDependencyTag;
```

## Resolution and satisfaction

Recipe composition merges explicit effect authorities with recipe-derived artifact authorities,
then validates each compiled step's ordered string ledgers against that closed registry. The DAG
projects exact `Artifact` references into artifact edges and preserves string completion dependencies
as metadata; it does not reconstruct artifact ownership from ids.

- An artifact is satisfied when its provision has completed and its exact authority is present in
  the private write-once artifact store. Its validator runs at publication; dependency satisfaction
  does not add another predicate or validation transition.
- An effect without `satisfies` is satisfied by successful provision. An effect with `satisfies`
  must also pass that synchronous predicate.
- Optional `satisfies` predicates are effect-only. Their `DependencyEvidence` can verify only the
  effect currently being evaluated; it cannot inspect artifact storage or another effect.

## Ground truth anchors

- Dependency authorities, registry, and satisfaction: `packages/mapgen-core/src/engine/tags.ts`
- Recipe-derived artifact authorities: `packages/mapgen-core/src/authoring/recipe/create.ts`
- Step ledger derivation: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step registration: `packages/mapgen-core/src/engine/StepRegistry.ts`
- Policy: registered-only tags: `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`
- Standard effect definitions: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Artifact contract: `docs/system/libs/mapgen/reference/ARTIFACTS.md`
