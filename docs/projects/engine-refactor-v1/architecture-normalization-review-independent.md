# MapGen / Swooper Maps — Architecture Normalization Review (independent)

> Independent second-pass review, produced without anchoring on the Codex pass
> (`docs/projects/engine-refactor-v1/architecture-normalization-review.md`, commit
> `375ca51df`). The Codex review was read only *after* this team formed its own
> conclusions, for the comparison in Part 4.
>
> Status: source material for the consolidated refactoring packet
> (`architecture-normalization-packet.md`). Retained for provenance.

## Part 1 — The intended architecture (where it's written, what it says)

The authority is **not** spread randomly — it's a clean SSOT chain that's been *buried under stale companion docs*. The real source of truth, in priority order:

1. **`docs/projects/engine-refactor-v1/resources/spec/SPEC-*.md`** — the canonical specification set. Entry is `SPEC.md` → `SPEC-target-architecture-draft.md` plus the splits:
   - `SPEC-architecture-overview.md` — core principles (§1.1), pipeline contract (§1.2), context shape (§1.3), tags (§1.4), phase ownership (§1.5), narrative model (§1.6), observability (§1.7).
   - `SPEC-step-domain-operation-modules.md` — the op-module + step model and **Hard Rules R-001..R-007**.
   - `SPEC-packaging-and-file-structure.md` — §2.3 **forbids recipe-root catalogs** (`tags.ts`, `artifacts.ts`); §2.4 colocation/export rules.
   - `SPEC-global-invariants.md` — core SDK has no mod deps; mega-modules forbidden; colocation default.
   - `SPEC-appendix-target-trees.md` — target trees (⚠️ uses *older* `morphology-pre/mid/post` naming superseded by ADR ER1-006).
2. **`docs/system/libs/mapgen/`** (Diátaxis canon) — `explanation/ARCHITECTURE.md` (the 7 layers), `policies/*` (normative rules), `reference/*`, `how-to/tune-realism-knobs.md` (the **DX north star**).
3. **ADRs** in engine-refactor-v1 — ER1-002 (no `shouldRun`), ER1-003 (RunRequest boundary), ER1-006 (coasts/routing/erosion/features naming), ER1-032 (no global overrides), ER1-034 (op kind).

**The intended architecture in one breath:** a deterministic 7-layer pipeline — **Domains → Steps → Stages → Recipe → Compilation → Execution → Consumers** — where:

- **Domains** own algorithms as **contract-first ops** (`defineOp`/`createOp`, out-of-line `strategies/` incl. a `default`, op-local `rules/`, types exported *only* from `types.ts`). Colocation is the default; **centralized catalogs are forbidden** unless they're thin re-export barrels.
- **Steps** are pure orchestration: `defineStep({requires,provides,artifacts,schema,ops})` + `run()`/`normalize()`. No heavy computation, no op-graph binding.
- **Stages** are the author surface: `knobs` (small semantic enums) + `advanced` (deep overrides). **Advanced is the baseline; knobs apply last** as deterministic, shape-preserving transforms.
- **Recipe** is the single source of ordering + enablement (no manifests, no prose ordering, no `shouldRun`).
- **RunRequest = {recipe, settings}** → compiled `ExecutionPlan` → `PipelineExecutor` with **tags as the type system** (`artifact:*`/`buffer:*`/`effect:*`/`field:*`, validated vs registry, write-once artifacts).
- **Truth vs projection**: `map-*` stages are the *projection/apply* layer; they consume pipeline truth and must never become the authority. The engine is a projection target, **not** a truth source.

**The DX litmus (your stated signal):** the `foundation` stage is the architecture's own worked example of "good DX" — and every assessor independently converged on it as the reference. So "perfect DX" here has a concrete shape: *a tiny knobs surface, compute fully in ops, tag-wired dependencies, colocated artifacts, no central catalogs.* Anything that deviates from that shape is the "wrong" architecture leaking back in.

**The trap to avoid (the Codex-revert warning):** the "bad" architecture is the legacy `MapGenConfig` mega-object + presets/tunables + stage manifests + `shouldRun` + recipe-root catalogs + engine-as-authority. The codebase is **mostly cut over** — no `MapGenConfig`, no `shouldRun`, no forbidden core dirs survive — so the risk isn't a full relapse; it's the **residual legacy fixtures** (the `tags.ts` catalog, centralized `config.ts` blobs, engine-authoritative placement) being treated as "fine" and re-cemented.

## Part 2 — Per-stage / phase assessment

Verdicts are **clean** (the reference shape) / **transitional** (right surface, internal gaps) / **divergent** (violates a core invariant).

| Stage / area | Verdict | Key evidence |
|---|---|---|
| **foundation** | ✅ **Clean (reference)** | `knobsSchema`-only surface, `createStage` synthesizes the rest; knobs applied last in step `normalize` (`steps/mesh.ts:17-33`); compute fully in ops; colocated artifacts. The yardstick. |
| **morphology-routing / -erosion / -features** | ✅ **Clean** | Canonical `knobsSchema` + `{advanced}` + `compile`; compute delegated to `plan-*`/`compute-*` ops. |
| **morphology-coasts** | 🟡 **Transitional** | Clean surface, but heavy BFS leaked into the step: `computeDistanceToCoast` (`steps/ruggedCoasts.ts:70-101`) + elevation rewrite loop (`:193-213`). Belongs in an op. |
| **hydrology-climate-baseline / -hydrography / -climate-refine** | 🟡 **Transitional** | Best knob surfaces in the repo; clean colocation. But ordering rides **artifact deps with empty semantic tags** (`requires:[]/provides:[]`). |
| **ecology-features-score** | 🟡 **Transitional** | Internally textbook orchestration (reads artifacts, calls 17 ops, publishes 2). But reads the centralized `ecologyArtifacts` catalog; no knobs. The de-facto "real" ecology compute stage. |
| **ecology-pedology / -biomes** | 🔴 **Divergent (split-brain)** | Don't own their steps — re-export from a sibling: `../ecology/steps/index.js` (`ecology-pedology/index.ts:7`, `ecology-biomes/index.ts:2`). Zero knobs. |
| **ecology-ice / -reefs / -wetlands / -vegetation** | 🟡 **Transitional** | Near-empty wrappers; sequencing smuggled through an `occupancy*` artifact daisy-chain instead of tags. No knobs. |
| **map-morphology** | 🟡 **Transitional** | Correct projection separation, but a *different* surface idiom (flat keys + key-renaming `compile`, `index.ts:30-37`) than the morphology-* stages, and milestone tags (`M10_EFFECT_TAGS`). |
| **map-hydrology (lakes)** | 🔴 **Divergent** | **Engine is the lake truth authority**: `lakes.ts:73` `adapter.generateLakes(...)`; pipeline `sinkMask` explicitly demoted to "parity telemetry" (`lakes.ts:122-124`). A `plan-lakes` op was specced to fix this but is a contract-only stub (no impl). |
| **map-ecology** | 🟡 **Transitional** | Richest projection stage; correct engine-as-target; but milestone tags + inconsistent step layout (flat vs nested). |
| **placement** | 🔴 **Divergent** | **God-step**: `apply.ts` is 1115 lines; `applyPlacementPlan` (`:83-351`) runs ~12 opaque sub-ops behind one step with two effect tags. **Resources** (`:581`) and **discoveries** (`:498`) use official Civ generators as *authority*, plan demoted to "diagnostic." (Wonders + starts are correctly plan-projected & fail-hard.) |
| **narrative** | 🔴 **Dead code** | Zero recipe wiring; `ops/contracts.ts = {}`. The story model is actually conformant in *shape* (snapshot publish, no global `StoryTags`) — but it's an empty `defineDomain` shell = a DX trap. |
| **Core SDK purity** | 🔴 **Divergent (the real backslide)** | `packages/mapgen-core/src/authoring/maps/index.ts` **runtime-imports** `@civ7/adapter/civ7` (`:6`) and uses `GameplayMap`/`engine` globals (`:49,90,135`) — directly contradicts `mapgen-core/AGENTS.md:18`. |
| **Recipe-root `tags.ts`** | 🔴 **Forbidden catalog** | 263-line recipe-root catalog with milestone buckets `M3_/M4_/M10_` (`:8,18,28`) + a centralized `EFFECT_OWNERS` map (`:55-141`); ~15 step contracts import it. SPEC §2.3 violation. |
| **`domain/morphology/config.ts`** | 🔴 **Centralized catalog** | 877 lines of config schemas for 10+ unrelated ops. Foundation has *no* `config.ts` (colocated in each `contract.ts`) — that's the contrast. |
| **`stages/morphology/` & `stages/ecology/`** | 🔴 **Orphaned hubs** | Not in `recipe.ts`, but imported by 20+ / 18+ files respectively. They're the *old single-stage roots* that were never dissolved when the stages were split — now functioning as domain-wide catalogs (split-brain gravity). |
| **Studio config exports** | 🔴 **DX violation** | `STANDARD_RECIPE_CONFIG[_SCHEMA]` exist only in generated **dist**; Studio can't run without a codegen+build step. The machinery to derive at runtime already exists (`deriveRecipeConfigSchema`, `recipe-config-schema.ts:30`). |
| **Presets / `domain/config.ts`** | ✅ **Clean** | Presets use knobs-only (`earthlike.config.ts`); `domain/config.ts` is a 3-line thin barrel (allowed). |

**Op-module conformance (R-001..R-007):** strong overall. Two real nits: R-006 violation at `compute-era-tectonic-fields/rules/index.ts:580` (a rule re-exports a type), and `plan-lakes` is a stub missing `index.ts`/`types.ts`/`strategies/`. A consistency gap (not a hard break): 10 foundation ops author `default` inline rather than out-of-line `strategies/` like every morphology op does.

## Part 3 — Normalization plan (smallest-diff-first, sequenced)

**Tier 0 — zero-risk, do first (kills two forbidden fixtures + a DX trap):**
1. **Delete or wire `domain/narrative`.** No importers, empty ops. If not imminently needed, remove it (+ its `domain/config.ts` re-export line). Pure deletion, no behavior change.
2. **De-milestone `recipes/standard/tags.ts`.** Mechanical rename across ~15 importers: `M3_DEPENDENCY_TAGS→FIELD_TAGS`, `M4_EFFECT_TAGS→ENGINE_EFFECT_TAGS`, `M10_EFFECT_TAGS→MAP_EFFECT_TAGS`. No behavior change; removes the legacy-naming smell immediately.

**Tier 1 — purity & DX fixes (clear the backslide):**
3. **Move `createMap` out of core.** Relocate `authoring/maps/index.ts` to the mod content package (or a `@civ7` binding package); update `maps/*.ts`. Removes the `@civ7/adapter/civ7` runtime import + globals from core. *Highest-value purity fix.*
4. **Make Studio config source-derived.** Studio imports the recipe from source and calls `deriveRecipeConfigSchema(recipe.stages)` + a source-exported default — eliminating the dist dependency and codegen step.

**Tier 2 — colocation (dissolve the catalogs/hubs):**
5. **Then** finish the `tags.ts` decomposition: move each effect tag's declaration + `owner` into its owning step's `contract.ts`; leave `tags.ts` as a thin aggregating barrel only.
6. **Rehome `stages/morphology/artifacts.ts` → `domain/morphology/artifacts.ts`** (update 20+ importers); delete the orphan dir.
7. **Dissolve `stages/ecology/`**: move `ecologyArtifacts`/validation into owning stages (or thin barrel); relocate pedology/biomes steps into their own stages so no stage imports a sibling's source.
8. **Break up `domain/morphology/config.ts`**: colocate each op's schema into its own `contract.ts` (foundation pattern); start with single-consumer schemas.

**Tier 3 — structural (the genuinely hard, architectural ones):**
9. **Resolve lakes authority.** Implement `plan-lakes` and project its mask as truth in `map-hydrology/lakes.ts` (stamp + fail-hard like wonders), **or** formally delete the stub and document lakes as engine-projection. Stop the "telemetry, not gate" straddle.
10. **Split the placement god-step.** Promote each `runPlacementStep(...)` block (wonders/floodplains/terrain-validate/restamp/resources/starts/discoveries/fertility) to a contract-bounded sub-step. This *forces* the truth-vs-projection question to the surface for resources & discoveries (item 11).
11. **Decide resource/discovery authority** (follows 10): make the plan authoritative & projected, or remove the dead "diagnostic" plan. Don't keep both.
12. **Decide the ecology split**: collapse 7 wrappers back to one `ecology` stage *or* give each a genuine knob surface. Current state gives neither modularity nor tunability.
13. **Consistency pass** (low priority): extract the `ruggedCoasts` BFS into an op; fix the R-006 type re-export; align foundation's inline strategies to out-of-line `strategies/`; unify `map-morphology`'s surface idiom + map-ecology step layout.

**Convergence guardrails (so it doesn't relapse — directly addresses the Codex-revert concern):** add lint/CI checks that fail on (a) `M\d+_` tag identifiers, (b) any `config.ts`/`tags.ts`/`artifacts.ts` at a recipe root, (c) `@civ7/adapter` *value* imports inside `packages/mapgen-core`, (d) `@mapgen/*` deep aliases in mod source, (e) stage dirs importing a sibling stage's `steps/`. These encode "the bad architecture" as mechanical failures rather than review opinions.

## Part 4 — Independent comparison vs the Codex pass (`375ca51df`)

**Strong agreement on the core picture.** Both teams independently graded **foundation = cleanest reference**, morphology-truth & map-morphology = mostly aligned, hydrology-truth = clean / map-hydrology lakes = transitional-divergent, ecology = fragmented mid-split, placement = not clean (hidden apply sequence + official generators), core SDK = impure (adapter import), Studio config = dist-only DX mismatch. The Codex 6-slice plan and our tiered plan land on the same destinations.

**Where my team goes further / diverges:**
- **Lakes — we grade it harder.** Codex framed the lakes mismatch as "telemetry not fail-hard." We confirmed that *and* found the `plan-lakes` op is a **specced-then-abandoned stub** with no upstream lake truth at all — so it's a clean truth-vs-projection *violation*, not just a softened gate. That sharpens the lakes slice.
- **Placement — we localized it precisely.** The god-step is `apply.ts:83-351` (~12 sub-ops via an internal `runPlacementStep` harness that *mimics* step boundaries without contracts). And re: commit #1348 — its "validate discovery count" only checks the engine's returned count is finite/≥0 (`apply.ts:504-508`); it does **not** assert `placed === planned`. So discoveries remain engine-authoritative despite that commit. Wonders & starts, by contrast, are correctly plan-projected and fail-hard.
- **The orphaned hubs** (`stages/morphology/` + `stages/ecology/`) as a *named structural smell* with import counts — these are the concrete "source-layout gravity" left over from the stage splits.
- **Centralized `domain/morphology/config.ts` (877 lines)** as a distinct catalog violation, with foundation's zero-`config.ts` colocation as the explicit contrast.
- **Narrative** — we agree it's unwired, but add that its *model* (snapshot publish, no global `StoryTags`) is actually conformant; the problem is purely the empty `defineDomain` shell.

**Net:** my team reached the same conclusions via independent code reading, with three sharper findings (lakes-stub, discovery-count non-assertion, the orphaned stage hubs) and an added guardrail tier aimed squarely at preventing the relapse described.
