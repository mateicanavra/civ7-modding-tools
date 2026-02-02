<toc>
  <item id="objective" title="Objective"/>
  <item id="setup" title="Worktree + stack setup"/>
  <item id="artifacts" title="Working artifacts"/>
  <item id="overall-plan" title="Overall research plan"/>
  <item id="local-plans" title="Local (fractal) plans"/>
  <item id="system-map" title="MapGen system map (current vs target)"/>
  <item id="doc-classification" title="Document classification (working set vs non-canonical)"/>
  <item id="drift-ledger" title="Drift ledger (doc-visible mismatches)"/>
  <item id="recommendations" title="Recommendations + directional policy"/>
  <item id="backlog" title="Follow-on backlog"/>
</toc>

# MapGen docs + examples alignment spike

## Objective
Reconcile our current MapGen docs + examples with the intended “DX-first” architecture:
- MapGen core SDK
- MapGen pipeline / recipe model
- Domains + “standard recipe” (foundation/morphology/hydrology/ecology/placement/narrative)

This spike treats all non-archived docs as **not meeting the bar** until proven otherwise.

## Worktree + stack setup (for MCP indexing)

- Spike worktree (this one): `agent-codex-mapgen-docs-alignment-viz` (tip of the stack).
- Primary worktree branch (for Code Intelligence indexing): `dev-viz-sdk-v1-01-shared-contract` (highest branch in the stack that is *not* already checked out by another worktree).

## Working artifacts
- Scratch index: `scratch/00-index.md`
- Docs inventory + classification: `scratch/docs-inventory.md`
- Engine-refactor workflow inventory: `scratch/docs-inventory-engine-refactor-workflow.md`
- Policies/conventions scratch: `scratch/policies.md`
- Core SDK notes: `scratch/sdk.md`
- Pipeline/recipe notes: `scratch/pipeline.md`
- Domain notes:
  - Foundation: `scratch/domains-foundation.md`
  - Morphology: `scratch/domains-morphology.md`
  - Hydrology: `scratch/domains-hydrology.md`
  - Ecology: `scratch/domains-ecology.md`
  - Placement: `scratch/domains-placement.md`
  - Narrative: `scratch/domains-narrative.md`

## Overall research plan (passes)
1. **Discovery**:
   - Inventory all active (non-archived) MapGen-related docs + examples + “buried canon” in project/workflow docs.
   - Inventory code entrypoints and “real usage” examples (Studio worker + mod runtime).
2. **Classification**:
   - Classify docs into working set / partially salvageable / obsolete.
   - Record *why* (API drift, architecture drift, missing guardrails, unclear audience, etc.).
3. **Ground-truth vs target**:
   - Compare current implementation surfaces against the target spec (`docs/projects/engine-refactor-v1/resources/spec/**`).
   - Produce an explicit “drift ledger” of naming/contract differences that docs must reconcile (even if code stays as-is).
4. **Reconciliation**:
   - Define the smallest coherent set of canonical docs (“working set”) and what should be clearly marked non-canonical.
5. **Policy extraction**:
   - Extract DX-critical policies (imports, DI, tagging, config compilation, domain boundaries).
   - Propose a durable “where these live” map under `docs/system/libs/mapgen/**`.

## Local (fractal) plans

### MapGen core SDK
- **Looking for:** public entrypoints, type-level contracts, DI boundaries, naming conventions, “happy path” usage for a consumer.
- **Search in:** `packages/mapgen-core/**`, `packages/mapgen-viz/**`, `docs/projects/engine-refactor-v1/resources/spec/**`.
- **How to evaluate:** can a new dev follow one doc to generate a map end-to-end without reading internal code?

### Pipeline / recipe model
- **Looking for:** the canonical runtime model (stages/steps), how domains plug in, how artifacts flow, how configuration overrides work.
- **Search in:** `packages/mapgen-core/src/authoring/**`, `packages/mapgen-core/src/compiler/**`, `packages/mapgen-core/src/engine/**`, `mods/mod-swooper-maps/src/recipes/**`, Studio worker runner.
- **How to evaluate:** does the doc match how code actually composes/executes the pipeline today?

### Domains (foundation/morphology/hydrology/ecology/placement/narrative)
- **Looking for:** each domain’s contract surface (inputs/outputs), ownership boundaries, and the “standard recipe” ordering.
- **Search in:** domain source dirs, recipe configs, studio viz layers, and any domain-specific docs/specs.
- **How to evaluate:** is the domain expressed as a pure module with stable contracts, or as an implementation detail leaking into other layers?

### MapGen Studio (example + dev loop)
- **Looking for:** current “real” usage docs (worker pipeline, recipe artifacts, config overrides, viz output surfaces).
- **Search in:** `docs/projects/mapgen-studio/**`, `apps/mapgen-studio/src/**`, `mods/mod-swooper-maps/tsup.studio-recipes.config.ts`.
- **How to evaluate:** do the docs match current code surfaces and naming (e.g. `mod-swooper-maps/recipes/*-artifacts` and `apps/mapgen-studio/src/recipes/catalog.ts`)?

### Search approach (Code Intelligence)
- Use `narsil-code-intel` for “find by intent” across the TS codebase:
  - symbol discovery (`find_symbols`, `find_references`)
  - semantic search (`hybrid_search`)
  - targeted context pulls (`get_excerpt`)

## MapGen system map (current vs target)

### Current implementation (what exists today)
- **Core SDK**: `packages/mapgen-core/**`
  - `authoring/**`: `createRecipe`, stage/step/op authoring surfaces and type helpers.
  - `compiler/**`: config normalization + compilation (`compileRecipeConfig`).
  - `engine/**`: structural recipe schema (`RecipeV2`), plan compilation (`compileExecutionPlan`), executor (`PipelineExecutor`), observability (`computePlanFingerprint`).
  - `core/**`: `Env` schema, `ExtendedMapContext`, context creation helpers.
  - `trace/**`: trace sessions + sinks.
- **Content package (standard recipe + domains)**: `mods/mod-swooper-maps/**`
  - `src/domain/**`: domain ops/rules/strategies (mod-owned).
  - `src/recipes/standard/**`: stage ordering, per-stage config surfaces, step modules, artifact tags.
- **Dev loop**: MapGen Studio + browser runner
  - Worker runs recipes using a mock adapter and streams trace/viz: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`.
  - Recipe artifacts are built and imported from `mod-swooper-maps/recipes/*`: `apps/mapgen-studio/src/recipes/catalog.ts`.

### Target architecture (engine-refactor-v1)
- Target spec + locked decisions:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md`

## Document classification (current pass)

Canonical-ish working set lives in:
- `docs/system/libs/mapgen/**`
- `docs/system/mods/swooper-maps/**`
- `docs/projects/engine-refactor-v1/resources/spec/**` (target architecture; project-scoped canon)

Curated inventory + classification lives in:
- `scratch/docs-inventory.md`

## Docs working set (proposed “canon to build from”)

If we had to pick the smallest coherent set *today*, these are the docs to treat as authoritative starting points:

### System + domains (conceptual contracts)
- `docs/system/libs/mapgen/architecture.md`
- `docs/system/libs/mapgen/foundation.md`
- `docs/system/libs/mapgen/morphology.md` (conceptual only; Phase 2 specs are the contract authority)
- `docs/system/libs/mapgen/hydrology.md`
- `docs/system/libs/mapgen/hydrology-api.md` (code-facing authority)
- `docs/system/libs/mapgen/ecology.md`
- `docs/system/libs/mapgen/narrative.md`
- `docs/system/libs/mapgen/placement.md`

### Target architecture and policies (locked decisions)
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md`

### Example implementations (ground truth)
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (standard stage ordering + domain wiring)
- `packages/mapgen-core/src/authoring/recipe.ts` (DX-first recipe module API)
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (end-to-end consumer example)

## Drift ledger (doc-visible mismatches to reconcile explicitly)

These are not necessarily “bugs”, but they must be documented clearly because they cause reader confusion:

1. **Naming: `Env` vs `RunSettings`**
   - Target spec talks about `RunRequest.settings`.
   - Current runtime uses `Env` and `RunRequest.env` (`packages/mapgen-core/src/core/env.ts`, `packages/mapgen-core/src/engine/execution-plan.ts`).
2. **Two compilation layers**
   - Config compilation/normalization (`compileRecipeConfig`) vs plan compilation (`compileExecutionPlan`).
   - Many docs/examples collapse these or use “compile” ambiguously.
3. **Studio recipe artifact surface**
   - Current Studio imports `mod-swooper-maps/recipes/*-artifacts` and `mod-swooper-maps/recipes/*`.
   - Some older docs still reference deleted `packages/browser-recipes` / `@mapgen/browser-recipes` (see `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`).
4. **Narrative in “standard recipe”**
   - Narrative is part of the canonical domain stack, but is not currently wired into the standard recipe stage ordering.
5. **Broken reference: Narrative/Playability PRD**
   - `docs/projects/engine-refactor-v1/resources/PRD-target-narrative-and-playability.md` does not exist.
   - Canonical narrative/playability authority (today) is ADR-ER1-008: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-008-narrative-playability-contract-is-story-entry-artifacts-by-motif-views-derived-no-storytags-no-narrative-globals.md`.
   - References were repointed to ADR-ER1-008 to avoid broken links.
6. **Docs index drift: Engine Refactor V1 PRD links**
   - `docs/_sidebar.md` links to multiple `docs/projects/engine-refactor-v1/resources/PRD-*.md` files that are missing (only two PRDs exist under `resources/_archive/`).
   - This makes MapGen narrative/playability references look “canonical-but-missing” and increases confusion for new readers.

## Outputs (this spike’s deliverable shape)

### 1) Docs working set (keep + tighten)
- See `scratch/docs-inventory.md` for the current working-set candidate list.

### 2) Docs to supersede/archive (or label clearly non-canonical)
- Primary candidate (doc drift): `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` (contains valuable patterns but references deleted packages and needs reconciliation to current code).
- Beyond that, treat any project “SPIKE” docs as research/history unless they are explicitly elevated.
- Consider relabeling (or relocating) “research spike” docs that currently sit under `docs/system/libs/mapgen/research/**` so they don’t read as canonical engineering docs by default.

### 3) Proposed canonical doc structure (directional)

Keep domain modeling docs in `docs/system/libs/mapgen/**` (already in good shape):
- `architecture.md` + domain pages (`foundation.md`, `hydrology.md`, `ecology.md`, `placement.md`, `narrative.md`)

Add/ensure a small “DX-first usage spine” exists (likely missing today):
- “How to run a recipe end-to-end” (Env + context + adapter + `recipe.runAsync`)
- “How config compilation works” (stage/step surface schemas, knobs-last, normalize/compile flow)
- “How artifacts/tags/buffers work” (as a reader-facing summary aligned to the code)

### 4) Policy list (DX-critical)
- Current extraction scratch: `scratch/policies.md`

## Recommended next actions (doc alignment backlog)

### High priority (stop active confusion)
1. Fix broken narrative/playability references:
   - References are repointed to ADR-ER1-008; decide later whether a separate PRD doc should be restored/created.
2. Fix `docs/_sidebar.md` Engine Refactor V1 resource links:
   - Remove or repoint missing `resources/PRD-*.md` entries so navigation does not advertise non-existent “canonical” docs.
3. Reconcile MapGen Studio recipe artifacts docs:
   - Update `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` to match current `mod-swooper-maps/recipes/*` surfaces and current Studio `apps/mapgen-studio/src/recipes/catalog.ts`.

### Medium priority (make DX-first usage discoverable)
4. Add a concise, canonical “MapGen SDK Quickstart” doc:
   - One page that starts from a consumer POV (Env + adapter + `createExtendedMapContext` + `recipe.runAsync`) and links to the deeper conceptual docs.
   - Use `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` as the concrete runnable example.
5. Add a “Pipeline + compilation model” doc:
   - Explain the two compilation layers and the knobs/advanced-config contract clearly and consistently.
6. Decide what “research spikes” under `docs/system/libs/mapgen/research/**` should be:
   - Keep in `docs/system` but explicitly label as research-only, or move under `docs/projects/**` (to reduce “canon” confusion).
