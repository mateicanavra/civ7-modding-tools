<toc>
  <item id="purpose" title="Purpose"/>
  <item id="recipe-v2" title="RecipeV2 (schema v2)"/>
  <item id="invariants" title="Invariants"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Recipe schema (RecipeV2)

## Purpose

Define the canonical runtime recipe schema that:
- can be serialized,
- can be validated,
- and can be compiled into an execution plan.

## RecipeV2 (schema v2)

RecipeV2 is a flat list of steps:

- `schemaVersion: 2` (locked)
- `id?: string` (optional recipe identifier)
- `steps: Array<{ id: string; enabled?: boolean; config?: Record<string, unknown> }>`

## Invariants

- Step ids are unique within a recipe.
- If `enabled` is omitted, it defaults to `true`.
- Steps are compiled to execution nodes via the StepRegistry; unknown steps are a compile error.

## Ground truth anchors

- RecipeV2 schema + invariants: `packages/mapgen-core/src/engine/execution-plan.ts`
- Target posture: ordering source of truth is recipe only (not stage manifests): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-001-ordering-source-of-truth-is-recipe-only-no-stage-order-stagemanifest.md`

