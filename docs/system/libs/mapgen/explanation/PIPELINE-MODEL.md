<toc>
  <item id="purpose" title="Purpose"/>
  <item id="mental-model" title="Mental model"/>
  <item id="lifecycle" title="Lifecycle (compile → plan → run)"/>
  <item id="data" title="Data model (tags, artifacts, fields)"/>
  <item id="observability" title="Observability (trace + viz)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Pipeline model (explanation)

## Purpose

Provide a high-signal mental model for how a MapGen pipeline run works end-to-end.

For contractual details, route to:

- [`docs/system/libs/mapgen/reference/REFERENCE.md`](/system/libs/mapgen/reference/REFERENCE.md)

## Mental model

A pipeline run is:

- **a recipe** (declared ordering + composition),
- **executed as steps** (each step is an orchestration unit),
- **with explicit dependency gating** (requires/provides tags validated by a registry),
- **producing artifacts** (internal products) and eventually **fields/effects** (engine outputs),
- with **trace/viz** as the default debugging posture.

## Lifecycle (compile → plan → run)

1. **Author config** (knobs + flat step-id overrides)
2. **Compile config**:
   - strict validation against stage and step schemas
   - deterministic normalization (shape-preserving)
3. **Compile plan**:
   - recipe ordering becomes a list of execution nodes (step id + config)
4. **Run**:
   - executor iterates nodes in order
   - requires/provides validated via tag registry
   - step executes and publishes artifacts / mutates buffers
   - trace scope is created per step
   - after successful execution and provider admission, optional metrics and visualization facets
     project completed evidence into matching environment-owned sinks

## Data model (tags, artifacts, fields)

- **Tags** are the dependency contract language: steps declare `requires[]` and `provides[]`.
- **Artifacts** are pipeline-internal products keyed by artifact tag ids.
- **Fields/effects** are adapter-level outputs (Civ7 engine-facing).

The system uses tags to prevent “accidental ordering”: if a step’s prerequisites aren’t satisfied, the executor fails early.

## Observability (trace + viz)

Trace provides:

- run-level start/finish,
- step-level start/finish,
- optional verbose step events (structured debug).

Visualization is an optional `createStep({ viz })` facet. It projects pure portable evidence from
`{ result, config, dimensions }` only after the step succeeds. The execution environment supplies
the sink that materializes those projections for Studio streaming or filesystem replay; recipe
algorithms never observe that sink. Visualization failures are diagnostic and cannot change
generation success.

## Ground truth anchors

- Trace sessions + scopes: `packages/mapgen-core/src/trace/index.ts`
- Executor tag gating + trace scoping: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Optional facet dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Tag validation/satisfaction: `packages/mapgen-core/src/engine/tags.ts`
- Artifact store type: `packages/mapgen-core/src/core/types.ts`
- Canonical viz doc (deck.gl): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
