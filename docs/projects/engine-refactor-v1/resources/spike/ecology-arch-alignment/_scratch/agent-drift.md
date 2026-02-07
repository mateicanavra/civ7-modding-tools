# agent-drift.md

## Objective

Drift analysis (target architecture vs current ecology) focused on the ecology lane:

- **Truth stage**: `ecology`
- **Projection stage**: `map-ecology`

Definition of done for this note is a drift matrix keyed to the target-architecture invariants:

- ops vs steps separation
- stage compile boundary
- truth vs projection boundary
- schemas/validation posture
- dependency gating (requires/provides)
- viz emission posture (keys stability)

## Where To Start (Pointers)

Target / invariants:

- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`
- `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

Current ecology implementation (primary evidence set):

- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
- `mods/mod-swooper-maps/src/domain/ecology/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`

## Findings (Grounded)

Highest-signal drift items (ordered by “risk to architecture invariants”):

- **Truth artifact embeds engine ids**: `artifact:ecology.featureIntents` appears to carry engine-facing `FeatureKey` strings (e.g. `FEATURE_FOREST`), conflicting with target truth/posture (“truth artifacts MUST NOT embed engine ids”). Evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:109-112`, `mods/mod-swooper-maps/src/domain/ecology/types.ts:18-49`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:211-268`.
- **Artifact mutation in truth lane**: `biome-edge-refine` mutates `biomeClassification` in-place after publish (write-once/read-only invariant violated). Evidence: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md:13-36`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-23`.
- **Ops/step contract bypass**: `features-plan` imports runtime ops surface `@mapgen/domain/ecology/ops` and calls `.run` directly for some ops (not declared in the step contract and likely bypassing `runValidated`). Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:1-3`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188`.
- **Viz categorical mapping unstable**: `plot-effects` assigns numeric values to plot-effect keys based on first-seen order (no stable categories mapping), making diffs less reliable. Evidence: `docs/system/libs/mapgen/reference/VISUALIZATION.md:21-27`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:29-58`.
- **Schema permissiveness (known gap)**: Ecology truth artifact schemas use `Type.Any()` for typed-array fields; runtime validators catch issues but schema-level strictness is missing. Evidence: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md:55`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-31`, `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md:14-38`.

## Drift / Issues Noted

### Matrix: Ops vs Steps Separation

Target invariant (ops vs steps):

- Ops are pure compute/plan units with explicit I/O schemas; steps orchestrate and bind ops, read/write artifacts/buffers, emit trace/viz. Evidence: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md:20-39`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:81-99`.
- Steps should not reach into op internals (rules/strategies); they call ops. Evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:136-139`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Step bypasses bound ops surface | `features-plan` imports `@mapgen/domain/ecology/ops` and calls op `.run` directly for vegetated/wet placements (instead of calling through bound `ops` param / declared step ops). | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:3`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:72-90`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188` | Makes op wiring partially “out of contract”, risks bypassing validation/tracing wrappers, and increases coupling to internal module paths. | Declare these ops in the step contract `ops` surface (even if “optional”), then call via the bound `ops` param (or via a typed “compile ops” handle). If the step needs both adjacency masks + placements, consider a focused op that owns that whole algorithm so step stays orchestration. |
| Step mutates artifact produced by another step | `biome-edge-refine` refines `biomeIndex` by mutating the previously-published `biomeClassification` artifact in-place. | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46` | Hidden “write” path turns orchestration into a data mutation hack; breaks assumptions about artifact immutability and step boundaries. | Publish a new refined artifact (e.g. `artifact:ecology.biomeClassificationRefined`) and have downstream steps require that, or merge refinement into the classifier op so there is only one published classification. If in-place is required for perf, model it as a buffer-kind with an explicit buffers mutation surface. |

### Matrix: Stage Compile Boundary

Target invariant (compile boundary):

- Normalize/default **before** execution; avoid runtime normalization. Evidence: `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md:14-40`, `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md:14-31`.
- `step.normalize` is compile-time only; `step.run` is runtime. Evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:89-103`, `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md:47-49`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Runtime-derived defaults for config fields | `features-plan` derives radii for adjacency masks at runtime using `Math.floor/Math.max` and fallback `??` defaults from config (`nearRiverRadius`, `isolatedRiverRadius`). | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:165-183` | Pulls normalization/defaulting into execution (harder to fingerprint/debug; diverges from compile-first posture). | Ensure `wetFeaturePlacements` selection config is strictly defaulted+normalized at compile-time (then read normalized values without fallback), or move adjacency mask computation into the op that already owns the rules so `step.run` only builds inputs and calls ops. |
| Op selection schema reconstructed in step | Step contract builds `{strategy, config}` union from `op.strategies` instead of reusing `op.config` schema. | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:7-25`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:28-40` | Duplicated schema logic is a drift vector: if op contract changes, step can silently desync; also increases compile-surface complexity. | Use `ecology.ops.planVegetatedFeaturePlacements.config` and `ecology.ops.planWetFeaturePlacements.config` directly in the step schema; rely on op-level `normalize` for canonicalization. |

### Matrix: Truth vs Projection Boundary

Target invariant (truth vs projection):

- Truth artifacts are engine-agnostic; must not embed engine ids or adapter coupling. Evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:109-112`, `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md:13-44`.
- Any step that touches the engine adapter must be projection/gameplay and provide a corresponding effect boundary. Evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:187-189`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Truth artifact embeds engine-facing ids | `artifact:ecology.featureIntents` publishes placements containing `feature` strings that are engine-like `FEATURE_*` keys. | Target rule: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:109-112`. Current ids: `mods/mod-swooper-maps/src/domain/ecology/types.ts:18-49`. Artifact schema + publish: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:55-103`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:211-268`. | “Physics truth” becomes coupled to engine vocabulary/content (harder to port/reuse; violates the conceptual split and can drag adapter lookups into truth). | Reclassify feature intents as a projection/map artifact (e.g. `artifact:map.featureIntents` or similar) or change truth to emit engine-agnostic intent types (domain enum/suitability fields) and let `map-ecology` map those to engine `FEATURE_*` ids. |
| Adapter touch without effect tag | `plot-effects` applies plot effects to adapter but contract declares no `provides` effect tag. | Spec: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:187-189`. Adapter use: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/apply.ts:24-37`. Contract provides empty: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-14`. | Consumers/other steps can’t gate on “plot effects applied”; ordering becomes implicit and verification is weaker. | Add + register an explicit effect tag (engine or map) for plot effects application, and provide it from the step contract. |

### Matrix: Schemas / Validation Posture

Target invariant (schemas/validation):

- Defaults/normalization happen in compilation; schemas closed; no “best effort” invalid configs. Evidence: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md:14-50`, `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md:14-50`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Permissive artifact schemas for typed arrays | Ecology truth artifact schemas use `Type.Any()` for typed-array fields (biome + pedology). | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-31`, note: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md:55` | Schema-level validation can’t catch shape problems early; tooling/docs/codegen can’t rely on contracts; more runtime-only failures. | Replace `Type.Any()` with `TypedArraySchemas.*` where possible; keep runtime validators if needed for clearer errors until fully tightened. |
| Op runtime calls bypass validation wrappers | `features-plan` calls `ecologyOps.ops.*.run` for some ops (rather than bound op wrapper), likely bypassing `runValidated`. | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:3`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188` | Schema/contract drift may go undetected until deep runtime failures; undermines “contract-first + compile-first” posture. | Call via bound `ops` surface (declare these ops in the contract), or explicitly call `runValidated` where available. |
| “Best effort” unknown feature keys | `features-apply` filters placements to only keys present in adapter lookups, silently dropping unknown keys. | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:26-30` | Makes it hard to debug misconfigured/unknown content ids; violates “fail-fast unless explicitly compiled out” posture. | Make the posture explicit: either fail-fast with a helpful error (default), or treat as an explicit “extension mode” and emit trace warnings + stable “unknown” viz bucket. |

### Matrix: Dependency Gating (requires/provides)

Target invariant (dependency gating):

- Dependencies are explicit and validated; no “magic” coupling or unregistered strings. Evidence: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md:26-31`, `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md:14-50`.
- Artifact reads/writes are modeled explicitly; artifacts are write-once/read-only. Evidence: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md:13-36`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Hidden write to a required artifact | `biome-edge-refine` mutates an artifact it only “requires” (no `artifacts.provides`), breaking write-once/read-only expectations. | Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-23`. Mutation: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46`. Policy: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md:13-36`. | Compiler/executor can’t reason about dataflow; downstream steps see mutated state without explicit dependency edges; caching/replay/debug become fragile. | Publish a separate refined artifact or convert to an explicit buffer-mutation posture with dedicated surfaces; update downstream requires accordingly. |
| Adapter step lacks effect dependency key | `plot-effects` touches adapter but provides no effect tag; nothing is registered/gateable for that side effect. | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-14`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/apply.ts:24-37` | Steps/consumers can’t “require” plot effects to have been applied; future steps risk implicit coupling. | Introduce/register a dedicated effect tag and provide it from the step; verify via adapter if possible. |
| Op dependency not expressed in contract | `features-plan` relies on additional ops via `@mapgen/domain/ecology/ops` that are not declared in `contract.ops`. | Contract ops: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`. Usage: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:3`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188`. | Contracts drift away from reality; recipe compiler/registry can’t validate op surfaces used by a step. | Add those ops to the step contract (even if guarded by config), or factor them into existing declared ops so the step only ever touches declared ops. |

### Matrix: Viz Emission Posture (Keys Stability)

Target invariant (viz keys stability):

- `dataTypeKey` is stable semantic identity; disambiguate variants via `variantKey` (and/or role). Evidence: `docs/system/libs/mapgen/reference/VISUALIZATION.md:21-27`.

| Drift item | Current reality | Evidence pointers | Why it matters | Conceptual refactor shape |
| --- | --- | --- | --- | --- |
| Unstable categorical encoding for plot effects | `plot-effects` assigns numeric values to `plotEffect` keys based on first-seen order (depends on placements order) and emits no categories mapping. | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:29-58` | Value meaning can shift between runs, breaking diffs/debugging even though `dataTypeKey` is stable. | Build a stable mapping (e.g. collect unique keys, sort, assign values deterministically) and emit `meta.categories` so the legend and values are stable. |
| (Aligned) deterministic feature-key encoding | `features-plan` sorts unknown feature keys and builds a deterministic category mapping for viz. | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:233-238`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:249-264` | Good example of stable categorical mapping; useful as a pattern for `plot-effects`. | Copy this pattern into other categorical point layers (plot effects, etc.) to keep value semantics stable across runs. |

## Open Questions

- **Is `FEATURE_*` intended to be “canonical domain semantics” or strictly “engine ids”?** Spec posture treats engine ids as projection-only (`SPEC-DOMAIN-MODELING-GUIDELINES.md:109-112`), but current ecology truth artifacts + types embed them. If this is an intentional exception, it should be documented as such with an explicit rationale and a trigger for tightening.
- **Should `biome-edge-refine` be modeled as a new artifact or as a buffer mutation?** If classification is meant to be refined in-place for performance, it probably wants an explicit buffer-kind artifact + dedicated mutation surface (per `ARTIFACT-MUTATION.md:37-44`). Otherwise publish a new refined artifact and update downstream deps.
- **What is the intended “effect tag” taxonomy for plot effects?** Today there’s no tag in `mods/mod-swooper-maps/src/recipes/standard/tags.ts` for plot effects, but the step mutates the engine adapter (so it likely needs one for gating and verification).
- **Do we want strict vs extension-mode behavior for unknown feature keys?** `features-plan` includes unknown keys in viz; `features-apply` silently drops unknown keys. That mismatch may be intentional mod extensibility, but the posture should be explicit (error vs warning vs filtered output artifact that records what was dropped).

## Suggested Refactor Shapes (Conceptual Only)

These are “shape notes” only (no sequencing):

- **Reclassify engine-facing outputs into projection lane**: move `featureIntents` out of the ecology truth lane (or split it into “truth suitability signals” and “projection engine ids”), then have `map-ecology` own mapping/stamping + effect tags. This restores the hard truth/projection boundary and keeps `artifact:ecology.*` engine-agnostic.
- **Make refine steps publish, not mutate**: `biome-edge-refine` should publish a distinct artifact (or use an explicit buffer posture) so the dependency graph is explicit and artifacts remain write-once/read-only by default.
- **Push conditional optional ops into the contract surface**: avoid importing runtime ops surfaces inside a step. If config enables an optional op, declare it in the step contract and call it through bound ops so validation/tracing/registry surfaces stay consistent.
- **Normalize categorical viz mappings**: for any points/grid categorical layer, use a deterministic value mapping (stable key set + stable ordering) and emit categories metadata to keep diffs meaningful.
