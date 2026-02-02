<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add a step

## Purpose

Add a new **step** to a recipe stage (target posture: step contracts + dependency tags + artifacts; no hidden coupling).

This how-to is **recipe-level** (steps are authored/registered in a recipe). It routes to:
- Step authoring contract reference: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- Tag registry reference: `docs/system/libs/mapgen/reference/TAGS.md`
- Artifact reference: `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- Import policy: `docs/system/libs/mapgen/policies/IMPORTS.md`

## Prereqs

- You know which **domain** you’re extending (Foundation/Morphology/Hydrology/Ecology/Placement/Narrative) and which **stage** owns the new step.
- You have a step id and phase that fit the stage’s naming/ordering conventions.

## Checklist

### 1) Decide the contract surface (before writing code)

- Pick a stable step id (string) and phase (`"foundation" | "morphology" | "hydrology" | "ecology" | "placement" | ...`).
- Identify required dependency tags (what must exist before your step can run).
- Identify provided dependency tags (what your step guarantees after it runs).
- Identify artifacts read/write needs (buffer vs snapshot; publish-once rule).

### 2) Define the step contract (`defineStep`)

- Create a `*.contract.ts` adjacent to the implementation.
- Use `defineStep({ id, phase, requires, provides, artifacts, ops, schema })`.
- Wire **artifact requirements** (and any required ops) explicitly into the contract.

Example pattern (existing): a step contract with artifact requirements.

### 3) Implement the step (`createStep`)

- Create the step `*.ts` file and call `createStep(YourStepContract, { normalize?, run })`.
- Keep step code “boring”: read inputs from `deps`/artifacts, mutate only permitted buffers, publish only allowed artifacts, emit trace/viz only via `context.trace` / `context.viz`.
- Prefer `context.trace.event(() => ({ ... }))` for verbose-only structured dumps.

### 4) Register the step in its stage

- Add your step into the stage’s `steps/index.ts` (or equivalent stage wiring).
- Ensure the stage ordering places your step after its requirements are satisfied and before any steps that require its provides.

### 5) Update dependency tags if needed

If your step introduces a new required/provided dependency tag:
- Define it and register it in the tag registry (see: `docs/system/libs/mapgen/how-to/add-a-new-tag.md`).

## Verification

- Run the package tests:
  - `bun run test:mapgen`
  - `bun run --cwd mods/mod-swooper-maps test`
- Enable verbose tracing for your step id and confirm the trace shows:
  - `step.start` and `step.finish` for your step id
  - expected `step.event` payloads (if you emit them)
- If your step emits viz layers via `context.viz?.dumpGrid(...)`, confirm a run produces a layer entry in the viz manifest:
  - Use the local dump harness patterns referenced in the anchors below.

## Footguns

- **Forgetting to register the step**: writing a contract and implementation does nothing unless the stage/recipe composes it.
- **Missing dependency tags**: the executor will fail early with `MissingDependencyError`; fix by adding tags/provides or adjusting ordering.
- **Republishing buffer artifacts**: buffer artifacts are “publish once, mutate via `ctx.buffers`”; don’t republish in later steps.
- **Import drift**: prefer published entrypoints (see import policy); avoid `@mapgen/*` aliases in docs/examples unless explicitly internal.

## Ground truth anchors

- Step contract API: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step implementation wrapper: `packages/mapgen-core/src/authoring/step/create.ts`
- Example step contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts`
- Example step implementation (createStep + trace + viz): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts`
- Pipeline executor dependency gating: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
