<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add a new artifact

## Purpose

Add a new **artifact** (a published, dependency-gated data product) with a stable id and schema.

This how-to is **recipe/stage-level**: artifacts are typically owned by a stage and used by steps.

Routes to:
- Artifact reference: `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- Artifact mutation policy: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Dependency id policy: `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`

## Prereqs

- You’ve determined whether your artifact is:
  - a **snapshot** (immutable; publish once; safe to share), or
  - a **buffer handle** (publish once; mutate later via `ctx.buffers`).
- You have a stable artifact id string (e.g. `"artifact:morphology.topography"`).

## Checklist

### 1) Define the artifact schema (`defineArtifact`)

- Create or update the owning stage’s `artifacts.ts`.
- Define a schema using `Type.*` / `TypedArraySchemas.*`.
- Call `defineArtifact({ name, id, schema })`.

### 2) Publish the artifact in exactly one step

- In the step that creates the artifact, publish it into `context.artifacts` (directly or via the helper used by that stage).
- Add the artifact id as a `provides` tag (or ensure it’s satisfied by the tag registry’s `satisfies` predicate).

### 3) Read the artifact via the contract dependency injector

- Steps should read via `deps.artifacts.<name>.read(context)` (when using the authoring helpers that provide typed deps).
- Avoid reaching into `context.artifacts.get(id)` directly unless you are in integration code (not steps).

### 4) Update downstream step contracts

- Add your artifact to `artifacts.requires` where needed.
- If the artifact is a buffer handle, ensure downstream steps mutate via `ctx.buffers` rather than republishing.

## Verification

- Run:
  - `bun run test:mapgen`
  - `bun run --cwd mods/mod-swooper-maps test`
- Run a traced execution and confirm:
  - the artifact id appears in the satisfied tag set after the publishing step,
  - downstream steps can read the artifact without shape mismatch.

## Footguns

- **Publishing twice**: buffer artifacts must be published exactly once; later steps must mutate via buffers.
- **Shape mismatches**: typed array length must match `width * height` when the schema implies tile grids.
- **Artifact vs field confusion**: fields are adapter-level (engine) outputs; artifacts are pipeline-internal products.

## Ground truth anchors

- Artifact store + publish-once comment: `packages/mapgen-core/src/core/types.ts`
- Artifact authoring API: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Example artifact definitions: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`
- Example step reading artifacts via deps: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts`
