<toc>
  <item id="purpose" title="Purpose"/>
  <item id="mental-model" title="Mental model"/>
  <item id="lifecycle" title="Lifecycle (compile → plan → run)"/>
  <item id="data" title="Data model (dependencies and engine state)"/>
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
- **producing artifacts** (internal products) and eventually **engine state writes**,
- with **trace/viz** as the default debugging posture.

## Lifecycle (compile → plan → run)

1. **Author config** (knobs + flat step-id overrides)
2. **Compile config**:
   - strict validation against stage and step schemas
   - deterministic normalization (shape-preserving)
3. **Compile plan**:
   - recipe ordering becomes a list of execution nodes (step id + config)
   - every selected dependency resolves to one earlier selected provider
   - artifact consumers retain the provider's exact authority identity
4. **Run**:
   - the recipe executes the exact compiled plan; convenience run methods compile once and delegate
   - executor iterates nodes in order
   - step executes and publishes its write-once artifact evidence
   - the executor proves every declared artifact provision is present before continuing
   - executor opens and revokes one narrow step-event lease per invocation
   - after successful execution and provider admission, optional metrics and visualization facets
     project completed evidence into matching environment-owned sinks

## Data model (dependencies and engine state)

- **Dependency selections** are the contract language: steps declare exact `Artifact` authorities and
  typed completion ids together in `requires[]` and `provides[]`.
- **Artifacts** are pipeline-internal products stored and read through their exact canonical
  artifact contract objects. Stable artifact ids remain the dependency and diagnostic vocabulary;
  they are not authored strings or storage keys.
- **Completions** are typed plan edges for payload-free external-state transactions. They are not
  runtime events or accumulated state.
- **Engine state writes** are performed through the occurrence-scoped adapter capability.

Plan compilation prevents accidental ordering by refusing a selected consumer without one earlier
selected provider. Linear fail-fast execution supplies completion reachability; artifact providers
additionally prove their declared payloads before the executor advances.

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
- Executor artifact publication proof + trace scoping: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Optional facet dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Completion identity and selected-plan validation: `packages/mapgen-core/src/engine/completion.ts`, `packages/mapgen-core/src/engine/execution-plan.ts`
- Map context and artifact store: `packages/mapgen-core/src/core/map-context.ts`
- Canonical viz doc (deck.gl): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
