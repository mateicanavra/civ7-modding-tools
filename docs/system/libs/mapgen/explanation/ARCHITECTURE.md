<toc>
  <item id="purpose" title="Purpose"/>
  <item id="system" title="System model (what MapGen is)"/>
  <item id="layers" title="Layers (contracts → execution)"/>
  <item id="ownership" title="Ownership + boundaries"/>
  <item id="anti-goals" title="Anti-goals"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# MapGen architecture (explanation)

## Purpose

Explain the canonical MapGen architecture and why it’s shaped the way it is (engine-refactor-v1 posture).

This is an explanation page; it does not redefine contracts. When you need “what is allowed”, route to:
- `docs/system/libs/mapgen/policies/POLICIES.md`
- `docs/system/libs/mapgen/reference/REFERENCE.md`

## System model (what MapGen is)

MapGen is a deterministic pipeline system that produces:
- **pipeline artifacts** (internal products used to build other products), and
- **engine fields/effects** (adapter-visible outputs consumable by Civ7).

The system is designed so:
- ordering is explicit and reviewable,
- dependencies are explicit and validated,
- and observability (trace + viz) is first-class.

## Layers (contracts → execution)

Think of MapGen as these layers:

1) **Domains**
   - own algorithmic “ops” (compute/plan modules) + shared semantics (e.g., knob enums).
2) **Steps**
   - orchestration units that:
     - declare dependencies (requires/provides),
     - declare artifacts/op bindings (contract),
     - and implement `run()` (plus optional `normalize()`).
3) **Stages**
   - author-facing grouping and config surface:
     - knobs (semantic tuning) + advanced (deep overrides),
     - compile “surface config” → per-step config inputs.
4) **Recipe**
   - composes stages/steps into a canonical pipeline for a given output posture (e.g. “standard”).
5) **Compilation**
   - config compilation (strict schema validation + normalization),
   - plan compilation (turn recipe into an execution plan of step nodes).
6) **Execution**
   - executor runs step nodes with:
     - tag gating (requires/provides),
     - artifact store + buffer mutation rules,
     - trace/viz hooks.
7) **Consumers**
   - Studio and other runtimes run the pipeline via a run boundary (often a worker).
   - Consumers are “reference implementations” of posture, not architecture authorities.

## Ownership + boundaries

- Domains own ops and shared semantics; steps own orchestration, not algorithms.
- Stages own author surface shape; recipes own pipeline composition and ordering.
- The executor owns dependency validation and trace scope; steps must not reimplement gating.
- Studio owns UX and run boundary; it must not require SDK internals beyond stable surfaces.

## Anti-goals

- Implicit cross-step coupling (“it works because we happen to run step X before Y”).
- “Magic” dependencies not expressed as tags/artifacts.
- Tutorials that teach internal alias imports or fragile module paths.

## Ground truth anchors

- Step + stage + recipe authoring surfaces: `packages/mapgen-core/src/authoring/index.ts`
- Config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Execution plan schema + compilation hooks: `packages/mapgen-core/src/engine/execution-plan.ts`
- Pipeline executor (tag gating + trace scoping): `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Standard recipe (canonical consumer-facing pipeline): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
