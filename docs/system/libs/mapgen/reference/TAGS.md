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

## TagRegistry + validation

TagRegistry is responsible for:

- registering tag definitions,
- validating tags (kind and id correctness),
- and validating `requires/provides` lists.

## Ground truth anchors

- TagRegistry implementation and helpers: `packages/mapgen-core/src/engine/tags.ts`
- StepRegistry validation: `packages/mapgen-core/src/engine/StepRegistry.ts`
- Policy: registered-only tags: `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`

