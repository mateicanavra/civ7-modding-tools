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
- `docs/system/libs/mapgen/reference/REFERENCE.md`

## Mental model

A pipeline run is:

- **a recipe** (declared ordering + composition),
- **executed as steps** (each step is an orchestration unit),
- **with explicit dependency gating** (requires/provides tags validated by a registry),
- **producing artifacts** (internal products) and eventually **fields/effects** (engine outputs),
- with **trace/viz** as the default debugging posture.

## Lifecycle (compile → plan → run)

1) **Author config** (knobs + advanced overrides)
2) **Compile config**:
   - strict validation against stage and step schemas
   - deterministic normalization (shape-preserving)
3) **Compile plan**:
   - recipe ordering becomes a list of execution nodes (step id + config)
4) **Run**:
   - executor iterates nodes in order
   - requires/provides validated via tag registry
   - step executes and publishes artifacts / mutates buffers
   - trace scope is created per step; viz emissions ride on trace events

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

Visualization is emitted by steps to `context.viz` as typed layer dumps; those are written (by a sink/dumper) and rendered via the canonical deck.gl viewer.

## Ground truth anchors

- Trace sessions + scopes: `packages/mapgen-core/src/trace/index.ts`
- Executor tag gating + trace scoping: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Tag validation/satisfaction: `packages/mapgen-core/src/engine/tags.ts`
- Artifact store type: `packages/mapgen-core/src/core/types.ts`
- Canonical viz doc (deck.gl): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
