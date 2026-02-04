<toc>
  <item id="objective" title="Objective"/>
  <item id="status" title="Status (here’s where we are)"/>
  <item id="artifacts" title="Working artifacts"/>
  <item id="overall-plan" title="Overall research plan (executed)"/>
  <item id="local-plans" title="Local (fractal) plans (executed)"/>
  <item id="system-map" title="System map (target vs current)"/>
  <item id="as-is-happy-path" title="As-is DX happy path (today)"/>
  <item id="working-set" title="Doc curation: working set vs non-canonical"/>
  <item id="drift" title="Drift ledger (must reconcile)"/>
  <item id="policies" title="DX policies + guardrails (canonical)"/>
  <item id="recommendations" title="Recommendations (doc spine + priorities)"/>
  <item id="backlog" title="Follow-on backlog (implementation + doc work)"/>
  <item id="appendix" title="Appendix: source-of-truth anchors"/>
</toc>

# MapGen docs + examples alignment spike

## Objective

Reconcile our current MapGen docs + examples with the intended “DX-first” architecture:
- MapGen core SDK
- MapGen pipeline / recipe model
- Domains + “standard recipe” (foundation/morphology/hydrology/ecology), plus gameplay surfaces

This spike treats all non-archived docs as **not meeting the bar** until proven otherwise.

## Status (here’s where we are)

This is the integrated “where we are” picture after auditing:
- engine-refactor-v1 **target specs/ADRs**,
- current **core SDK** (`packages/mapgen-core/**`),
- current **standard content package** (`mods/mod-swooper-maps/**`),
- and current **reference consumer** (`apps/mapgen-studio/**`).

### What is solid (directionally correct, already usable)

- A real DX-first “happy path” exists today: `createRecipe(...)` + strict config compilation + plan compilation + `PipelineExecutor` (Studio worker is the clearest example).
- The **standard recipe** has a coherent stage order and a practical separation between:
  - **truth** artifact-producing stages (foundation/morphology/hydrology/ecology), and
  - gameplay **projection** stages that mostly produce `effect:*` / `field:*` and write engine-facing surfaces.
- Domain conceptual docs under `docs/system/libs/mapgen/**` are generally strong and align with the target mental model (especially Foundation/Morphology/Hydrology), while gameplay-facing concerns are now documented under a separate “Gameplay” domain surface.

### What is confusing (high-impact doc drift)

- Docs currently mix:
  - spec-first `RunSettings` / `buffer:*` vocabulary,
  - code-first `Env` / `field:*` vocabulary,
  - and example docs that sometimes use workspace-only TS path aliases (`@mapgen/*`) that mean different things depending on which package defines them.
- Studio seams docs include valuable ideas but are mixed with refactor-history and drift (including references to deleted packages).

### What must be reconciled (non-negotiable for canonical docs)

- **Run boundary naming:** `Env` is canonical in current code; `RunSettings` is legacy naming and must not be treated as “target posture”.
- **Dependency kind naming:** specs mention `buffer:*` while runtime uses `field:*` as the “mutable engine-facing surface” kind.
- **Domain ownership:** Narrative + Placement were explicitly absorbed into **Gameplay** planning/ownership; docs must not present them as target-canonical MapGen domains.
- **Import policy:** `@mapgen/*` is not a stable public import surface; it collides across packages and breaks copy/paste.

## Working artifacts

This spike’s “fractal working memory” lives in `scratch/`:

- Hardening execution plan (post-spine build): `HARDENING-IMPLEMENTATION-PROPOSAL.md`
- Scratch index: `scratch/00-index.md`
- Target architecture (spec-first): `scratch/target-architecture.md`
- Current architecture (code-first): `scratch/current-architecture.md`
- Drift ledger (spec vs code vs docs): `scratch/drift-ledger.md`
- Canonical doc spine proposal: `scratch/doc-set-proposal.md`
- Docs inventory + classification: `scratch/docs-inventory.md`
- Engine-refactor workflow inventory (buried canon): `scratch/docs-inventory-engine-refactor-workflow.md`
- Policies/conventions extraction: `scratch/policies.md`
- Core SDK notes: `scratch/sdk.md`
- Pipeline/recipe notes: `scratch/pipeline.md`
- Studio consumer/examplar: `scratch/studio.md`
- Domain pads:
  - Foundation: `scratch/domains-foundation.md`
  - Morphology: `scratch/domains-morphology.md`
  - Hydrology: `scratch/domains-hydrology.md`
  - Ecology: `scratch/domains-ecology.md`
  - Placement: `scratch/domains-placement.md`
  - Narrative: `scratch/domains-narrative.md`

## Overall research plan (executed)

1. **Discovery**
   - Inventory all active (non-archived) MapGen-related docs + examples + “buried canon” in project/workflow docs.
   - Inventory code entrypoints and “real usage” examples (Studio worker + mod runtime).
2. **Classification**
   - Classify docs into working set / partially salvageable / obsolete.
   - Record *why* (API drift, architecture drift, missing guardrails, unclear audience).
3. **Ground-truth vs target**
   - Compare current implementation surfaces against the target spec (`docs/projects/engine-refactor-v1/resources/spec/**`).
   - Produce a “drift ledger” of naming/contract differences that docs must reconcile (even if code stays as-is).
4. **Reconciliation**
   - Define a coherent “working set” doc pool to treat as canonical inputs.
   - Identify what must be superseded/re-labeled so new readers aren’t taught dead systems.
5. **Policy extraction**
   - Extract DX-critical policies (imports, tagging, config compilation, domain boundaries).
   - Propose a durable “where these live” map under `docs/system/libs/mapgen/**`.

Search approach:
- Planned: Code Intelligence MCP (`narsil-code-intel`) for cross-repo intent search.
- Actual: MCP transport was unavailable during this pass (“Transport closed”), so discovery and verification used `rg` + direct file reads.

## Local (fractal) plans (executed)

### MapGen core SDK
- **Looking for:** public entrypoints, type-level contracts, DI boundaries, naming conventions, “happy path” usage.
- **Search in:** `packages/mapgen-core/**`, engine-refactor specs/ADRs.
- **Evaluation:** can a new dev follow one doc to run a recipe end-to-end without reading internal code?

### Pipeline / recipe model
- **Looking for:** runtime model (stages/steps), compilation model, tag gating, artifact flow, config overrides posture.
- **Search in:** `packages/mapgen-core/src/{authoring,compiler,engine}/**`, `mods/mod-swooper-maps/src/recipes/**`, Studio worker.
- **Evaluation:** does the doc match how code composes/executes the pipeline today?

### Domains (foundation/morphology/hydrology/ecology/placement/narrative)
- **Looking for:** each domain’s boundary + contract posture + stage ownership in standard recipe.
- **Search in:** `mods/mod-swooper-maps/src/domain/**`, `mods/mod-swooper-maps/src/recipes/standard/stages/**`, `docs/system/libs/mapgen/**`, engine-refactor specs/ADRs.
- **Evaluation:** do docs clearly separate target model vs “what is wired today”?

### Studio consumer + examples
- **Looking for:** best runnable example posture and doc drift around recipes/artifacts/protocol/cancel semantics.
- **Search in:** `apps/mapgen-studio/src/browser-runner/**`, `apps/mapgen-studio/src/recipes/**`, `docs/projects/mapgen-studio/**`.
- **Evaluation:** can a new dev use the docs to wire a new recipe without spelunking the worker?

## System map (target vs current)

### Target architecture (spec-first; authority)

The authority set is:
- `docs/projects/engine-refactor-v1/resources/spec/**`
- `docs/projects/engine-refactor-v1/resources/spec/adr/**`

Key target invariants (summary; details in `scratch/target-architecture.md`):
- Boundary input: `RunRequest = { recipe, settings }` (ADR-ER1-003).
- Ordering + enablement come from recipes only (ADR-ER1-001/002); no stage manifests; no `shouldRun`.
- Step IDs and dependency tags must be registered; unknown IDs are hard errors (SPEC-tag-registry, ADR-ER1-006).
- Narrative/playability canonical output is **story-entry artifacts**; overlays/views are derived and non-canonical (ADR-ER1-008/025).
- Observability baseline (runId + fingerprint + structured errors) is required; tracing is optional and must not affect fingerprint (ADR-ER1-012/022).
- Compiler owns defaults/normalization/derived config; runtime execution treats configs as canonical.

### Current architecture (code-first; ground truth)

Key ground-truth anchors (details in `scratch/current-architecture.md`):
- Authoring “happy path”: `packages/mapgen-core/src/authoring/recipe.ts` (`createRecipe(...).compileConfig/compile/run/runAsync`).
- Two compilation layers exist:
  - config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts` (`compileRecipeConfig`)
  - plan compilation: `packages/mapgen-core/src/engine/execution-plan.ts` (`compileExecutionPlan`)
- Run boundary type is currently `RunRequest = { recipe, env }` in `packages/mapgen-core/src/engine/execution-plan.ts` (with `EnvSchema` in `packages/mapgen-core/src/core/env.ts`).
- Tag kinds used by the runtime: `artifact | field | effect` (`packages/mapgen-core/src/engine/tags.ts`).
- Standard recipe stage order is authoritative in `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`.
- The clearest end-to-end consumer is Studio’s worker: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`.

Standard recipe stage order (today; the real “truth” ordering):
- `foundation`
- `morphology-pre` → `morphology-mid` → `morphology-post`
- `hydrology-climate-baseline` → `hydrology-hydrography` → `hydrology-climate-refine`
- `ecology`
- gameplay projections: `map-morphology` → `map-hydrology` → `map-ecology`
- `placement`

## As-is DX happy path (today)

If we wrote a single “MapGen SDK Quickstart” tomorrow, this is the runnable posture to teach (aligned to current code and Studio):

1) Select a runtime recipe module + (optionally) UI artifacts.
   - Runtime recipe modules: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts` importing from `mod-swooper-maps/recipes/*`.
   - UI artifact metadata: `apps/mapgen-studio/src/recipes/catalog.ts` importing from `mod-swooper-maps/recipes/*-artifacts`.
2) Construct run-global input (`Env` today; conceptually “RunSettings”).
3) Merge defaults + overrides deterministically and validate strictly at `/config`.
4) Compile:
   - config compilation (schemas/defaults/normalize), then
   - plan compilation (graph nodes + requires/provides)
   and derive `runId` from plan fingerprint.
5) Create adapter + context and run:
   - `recipe.runAsync(context, env, config, { abortSignal, traceSink, yieldToEventLoop })`.

The core DX policy outcome: a new developer should be able to do this without importing internal code or relying on workspace-only TS path aliases.

## Doc curation: working set vs non-canonical

The curated inventory + classification is in `scratch/docs-inventory.md`. This is the spike’s “doc curation output”:

### Working set (salvageable; treat as canonical inputs)

- System / MapGen domain docs:
  - `docs/system/libs/mapgen/architecture.md`
  - `docs/system/libs/mapgen/foundation.md`
  - `docs/system/libs/mapgen/hydrology.md`
  - `docs/system/libs/mapgen/hydrology-api.md`
  - `docs/system/libs/mapgen/ecology.md`
  - `docs/system/libs/mapgen/placement.md`
  - `docs/system/libs/mapgen/narrative.md` (target model; must explicitly state integration status)
  - `docs/system/libs/mapgen/realism-knobs-and-presets.md`
- Target spec set (engine-refactor-v1):
  - `docs/projects/engine-refactor-v1/resources/spec/**`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/**`
- Mapgen-adjacent runtime context:
  - `docs/system/mods/swooper-maps/architecture.md`
  - `docs/system/mods/swooper-maps/vision.md`

### Partially salvageable (valuable, but not “how to build” today)

- Studio docs under `docs/projects/mapgen-studio/**` that are refactor-history/proposals unless rewritten to “how it works today”.
- `docs/system/libs/mapgen/morphology.md` is explicitly conceptual/aspirational; Phase 2 specs are the contract authority.
- `docs/system/libs/mapgen/research/**` and other “SPIKE-*” docs are valuable research, but should not read as canonical engineering docs by default.

### Non-canonical / superseded / must not be primary guidance

- Anything that references deleted packages/surfaces as current (e.g. `@mapgen/browser-recipes`).
- Any doc that implies Narrative is wired into the standard recipe without a verified status section.
- Any doc that uses `@mapgen/*` import paths as if they are stable public entrypoints.

## Drift ledger (must reconcile)

The full drift table is in `scratch/drift-ledger.md`. Canonical docs must reconcile (explicitly and consistently):

1) **Run boundary naming: `settings` vs `env`**
   - Teach “RunSettings” as the concept; map to `Env` as the current concrete type until migration.
2) **Dependency kind naming: `buffer:*` vs `field:*`**
   - Pick stable doc vocabulary and include a short glossary mapping (“field (aka buffer)” until unified).
3) **Two compilation layers**
   - Define “config compilation” vs “plan compilation”; never say “compile” ambiguously.
4) **Import surface collisions**
   - Prefer published entrypoints (`@swooper/mapgen-core/...`); treat `@mapgen/*` as internal-only aliases.
   - Concrete collision example:
     - `packages/mapgen-core/tsconfig.paths.json` defines `@mapgen/*` as an internal alias for that package’s own `src/*`,
     - while `mods/mod-swooper-maps/tsconfig.json` defines `@mapgen/domain/*` as an alias for the mod’s own `src/domain/*`.
   - Canonical docs must not use `@mapgen/*` unless they also state *which workspace/package defines that alias* (otherwise copy/paste breaks).
5) **Narrative**
   - State explicitly: narrative is target-canonical but not wired into the standard recipe today.
6) **Studio seams drift**
   - Any canonical guidance must match the implemented worker protocol and recipe/artifacts import surfaces.

## DX policies + guardrails (canonical)

These are the “teach everywhere” rules that prevent contributors from rebuilding multiple architectures in parallel (expanded detail in `scratch/policies.md`):

1) **Recipe-only ordering + enablement**
   - Ordering and enablement live in recipes; no manifests; no hidden enablement; no `shouldRun` silent skips.
2) **Strict schemas at boundaries**
   - Validate + default at schema boundaries (stage public surface, step schemas). Unknown keys fail fast with stable error paths.
3) **Compile-first responsibility split**
   - Defaults/normalize/derivations are compiler-owned; runtime steps treat configs as canonical.
4) **Tag registry is the contract**
   - Step IDs and dependency tags are registered sets; unknown references are hard errors.
5) **Artifacts are write-once; “buffer-handle” is an explicit exception**
   - Published artifacts are “write once”; treat as immutable by convention.
   - Some artifacts are effectively buffer handles (typed arrays mutated in-place by later steps) and docs must teach this carefully (Hydrology/Ecology have concrete examples).
6) **Ops module boundary**
   - Steps call ops; ops own strategy selection behind contract-first APIs; rules/strategies must not leak types or couple to contracts.
7) **Import policy**
   - Canonical docs/examples use published entrypoints; internal TS aliases must not appear without explicit scoping.
8) **Visualization posture is canonical**
   - Deck.gl pipeline visualization is current and must be treated as canonical (do not fork competing viz docs).
   - Reference: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`.

## Recommendations (doc spine + priorities)

The recommendation is to create a small canonical “DX spine” that sits above the excellent conceptual domain docs and eliminates drift ambiguity.

Doc spine proposal (structure + page contract): `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-PROPOSAL.md`.
Implementation plan (agent team + slices): `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-IMPLEMENTATION-PROPOSAL.md`.

### 1) Canonical doc spine (proposed)

Full proposal: `scratch/doc-set-proposal.md`.

Minimal spine:

1. **MapGen SDK Quickstart (consumer POV)**
   - “Run a recipe end-to-end” using the real Studio worker posture.
2. **Architecture overview (SDK + content boundaries)**
   - Clear ownership: core SDK vs standard content package vs Studio consumer.
3. **Pipeline + compilation model**
   - Explicitly define config compilation vs plan compilation; define tags + gating model; define artifact mutability posture.
4. **Domains**
   - Keep domain conceptual docs as “meaning + boundaries”, and ensure at least one code-facing contract doc exists where needed (Hydrology is the exemplar).
5. **Studio as reference consumer**
   - Create short evergreen “how Studio runs recipes today” docs; treat seam docs as proposals/history unless updated.

### 2) Stop-the-bleeding clarifications (no code changes required)

- Add a short drift explainer page/section mapping:
  - `RunSettings` → `Env`, and
  - `buffer` → `field`,
  and linking to the drift ledger.
- Add explicit “current integration status” sections where docs describe target-only features (Narrative is the urgent one).
- Make import guidance unambiguous: published entrypoints only.

### 3) Architectural decision points (require an explicit choice)

These are not “doc wording” problems; they are vocabulary alignment decisions:

- Decide whether we migrate code to `RunSettings` naming, or we permanently alias.
- Decide whether the canonical second kind is `field:` or `buffer:` and converge specs/docs/code.
- Decide narrative insertion point and/or plan a narrative wiring task; do not imply it is currently part of the standard recipe.

## Follow-on backlog (implementation + doc work)

Ordered by “reduce contributor confusion first”, then “tighten architecture”.

### Doc work (high priority)

1) Write “MapGen SDK Quickstart” (consumer POV) anchored to:
   - `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
   - `packages/mapgen-core/src/authoring/recipe.ts`
2) Write “Pipeline + compilation model”:
   - config compilation vs plan compilation, tags registry, satisfaction rules, artifact mutability posture.
3) Rewrite/relabel Studio seams docs so new readers don’t treat proposals/history as canonical guidance.

### Alignment work (decision + follow-up tasks)

4) Choose and converge on `Env` vs `RunSettings` naming (alias or migrate).
5) Choose and converge on `field:` vs `buffer:` terminology (and update the spec set accordingly).
6) Decide narrative’s integration timeline:
   - explicitly “not wired yet” (doc-only), or
   - wire into standard recipe (implementation), then update docs.

### Implementation work (medium priority; supports docs but not required for docs)

7) Consider tightening the published entrypoint surface (barrels) and actively discouraging internal aliases outside package scope.
8) Consider tightening artifact immutability semantics (deep freeze snapshots vs explicit buffer-handle artifacts) once performance constraints are understood.

## Appendix: source-of-truth anchors

If you only read one thing per layer:

- Target architecture authority: `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- Core SDK “happy path” entrypoint: `packages/mapgen-core/src/authoring/recipe.ts`
- Config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Plan compilation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Observability identities: `packages/mapgen-core/src/engine/observability.ts`
- Standard recipe stage ordering: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Best consumer example: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
