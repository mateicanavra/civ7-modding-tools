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
- **with explicit dependency gating** (exact artifacts and typed completion ids selected in one contract),
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
   - the recipe executes the exact compiled plan; convenience run methods compile once and delegate
   - executor iterates nodes in order
   - authored artifact authorities and completion ids are projected to the runtime dependency ledger
   - runtime ids are registry-validated; artifact requirements also require admitted store evidence
   - step executes and publishes its write-once artifact evidence
   - executor opens and revokes one narrow step-event lease per invocation
   - after successful execution and provider admission, optional metrics and visualization facets
     project completed evidence into matching environment-owned sinks

## Data model (tags, artifacts, fields)

- **Dependency selections** are the contract language: steps declare exact `Artifact` authorities and
  typed completion ids together in `requires[]` and `provides[]`.
- **Artifacts** are pipeline-internal products stored and read through their exact canonical
  artifact contract objects. Stable artifact ids remain the dependency and diagnostic vocabulary;
  they are not authored strings or storage keys.
- **Completion tags** are payload-free execution guarantees represented by typed ids.
- **Fields/effects** are adapter-level outputs (Civ7 engine-facing).

The system uses the compiled dependency ledger to prevent "accidental ordering": if an exact
artifact or completion prerequisite is not satisfied, the executor fails early.

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

- Public trace contracts: `packages/mapgen-core/src/trace/index.ts`
- Executor-owned trace sessions and step leases: `packages/mapgen-core/src/trace/session.ts`
- Executor tag gating + trace scoping: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Optional facet dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Tag validation/satisfaction: `packages/mapgen-core/src/engine/tags.ts`
- Map context and artifact store: `packages/mapgen-core/src/core/map-context.ts`
- Canonical viz doc (deck.gl): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
