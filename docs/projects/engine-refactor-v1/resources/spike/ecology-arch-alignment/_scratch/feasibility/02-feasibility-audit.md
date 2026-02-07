# Feasibility Audit (Evidence Pass)

Goal: enumerate feasibility blockers and must-change touchpoints, grounded in file pointers and short excerpts.

Use Narsil MCP (do **not** reindex) when it helps; otherwise use `rg`/file reads.

## Checklist

## 1) Contract binding audit

- [ ] Steps bypassing injected ops (direct domain `ops` imports, deep imports, or hand-rolled op envelope selection schemas)
- [ ] Steps importing `rules/**` directly (should not happen; rules are internal to ops)
- [ ] Steps selecting strategy outside schema-driven op envelopes

## 2) Compiler normalization audit

- [ ] Every op envelope used at runtime is declared under `contract.ops`
- [ ] No step-level schema keys collide with `contract.ops` keys (schema merge rule in `defineStep`)
- [ ] Optional ops: check compile-time prefill/normalize coverage and mismatch risks

## 3) Artifact/buffer posture audit

- [ ] Identify publish-once buffer-handle artifacts (publish once, mutate underlying arrays)
- [ ] Identify immutable snapshot artifacts (publish as value; no in-place mutation)
- [ ] Any in-place mutation must be documented as intentional wiring posture

## 4) Effects/tags audit (adapter write boundaries)

- [ ] Steps that call adapter must provide effect guarantees if gating is intended
- [ ] Identify any adapter write steps with `provides: []` effects

## 5) Viz compatibility audit

- [ ] Inventory `dataTypeKey` / `spaceId` / `kind` emitted by ecology + map-ecology
- [ ] Mark “must not break” keys and any refactor moves that could break them

## 6) Determinism audit

- [ ] Step seed derivation labels are stable and not accidentally perturbed by refactor
- [ ] Ordering sensitivity: any steps depending on in-place mutation or implicit side-effects

## Findings

### A) Contract Binding Drift: `features-plan` bypasses injected ops

- **Direct import + execution of op implementations inside the step** (bypasses compiler injection)
  - Evidence:
    - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts` imports `@mapgen/domain/ecology/ops` and calls:
      - `ecologyOps.ops.planVegetatedFeaturePlacements.run(...)`
      - `ecologyOps.ops.planWetFeaturePlacements.run(...)`
  - Why it matters:
    - Violates the step↔op contract boundary: steps should run ops via injected `ops` to keep compilation/binding/normalization consistent.
    - Makes it easy to “forget” to declare/normalize the op envelope, which is exactly what happened here.

- **Manual op selection schema inside the step schema** (bypasses `defineStep` schema merge + compiler-owned prefill/normalize)
  - Evidence:
    - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
      - defines `createOpSelectionSchema(...)`
      - sets `schema` keys:
        - `vegetatedFeaturePlacements?: ...`
        - `wetFeaturePlacements?: ...`
      - but **does not declare** these in `contract.ops`.
  - Why it matters:
    - The compiler’s op envelope pipeline (`prefillOpDefaults` + `normalizeOpsTopLevel`) only sees ops declared in `contract.ops`.
    - Any behavior/policy encoded in `op.normalize` is skipped when the op is “manual schema only”.

### B) Compiler Normalization: evidence of the exact mechanism we’re bypassing

- **Schema merge invariant**
  - Evidence: `packages/mapgen-core/src/authoring/step/contract.ts`
    - `defineStep` merges `contract.ops` config schemas into the step schema and throws on collisions:
      - error message: `schema already defines key "${opKey}" (declare it only via contract.ops)`

- **Compiler prefill + normalize pipeline**
  - Evidence: `packages/mapgen-core/src/compiler/recipe-compile.ts`
    - `prefillOpDefaults(step, rawStepConfig, stepPath)` runs before schema validation.
    - `normalizeOpsTopLevel(step, normalized, ctx, compileOpsById, stepPath)` calls `op.normalize(...)` for each declared op envelope.
  - Implication:
    - If we move `vegetatedFeaturePlacements` / `wetFeaturePlacements` into `contract.ops`, the compiler will own prefill + normalize (good).

### C) Critical Edge Case: Declaring an op in `contract.ops` makes it “always present” by default

- Evidence: `packages/mapgen-core/src/compiler/normalize.ts` → `prefillOpDefaults(...)`
  - For every `opKey` in `contract.ops`, if `stepConfig[opKey] === undefined`, it clones `contract.defaultConfig` into the config.

- Why it matters for `features-plan`
  - Today those envelopes are **optional**, and the step treats `undefined` as “off”.
  - If we declare them under `contract.ops` without changing op defaults, the compiler will prefill the default envelope, and the step will treat them as “on” unless we change the selection semantics.

- Feasibility conclusion (behavior-preserving options):
  - **Option 1 (preferred, architecture-aligned): fold the “advanced” planners into the existing per-feature op as strategies**
    - Example: make “vegetation planning” a single op with strategies `{ classic, placements }`, instead of two separate ops.
    - Keeps “per feature = one op” invariant while allowing algorithm variance via strategies.
  - **Option 2: introduce an explicit `disabled` (or `fallback`) strategy with defaultConfig set to it**
    - Then the envelope can be always present, but defaults preserve current “off unless explicitly enabled” behavior.

### D) Artifact / Buffer Mutability: `biomeClassification` is a publish-once mutable handle

- Evidence:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`
    - comment: “Biome classification is refined in-place after the initial publish.”
    - `mutable.biomeIndex.set(refined.biomeIndex)`
- Why it matters:
  - Behavior-preserving refactors must preserve this wiring posture (or explicitly cut over to immutable snapshots with proof + consumer updates).

### E) Effects/Tags: `plot-effects` is an adapter-write boundary without an effect guarantee

- Evidence:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`
    - calls `applyPlotEffectPlacements(context, result.placements)` (engine writes)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
    - `provides: []`
  - Contrast:
    - `plot-biomes` provides `effect:engine.biomesApplied`
    - `features-apply` provides `effect:engine.featuresApplied`
- Feasibility note:
  - Likely add a dedicated effect tag (mod-owned or adapter-owned) to make this boundary explicit and gateable.

### F) DeckGL/Viz Compatibility Surface (keys we must not break)

Evidence (dataTypeKey occurrences):
- Ecology truth:
  - `ecology.biome.*` (`biomes`, `biome-edge-refine`)
  - `ecology.pedology.*`
  - `ecology.resourceBasins.resourceBasinId`
  - `ecology.featureIntents.featureType`
- Gameplay projection:
  - `map.ecology.biomeId`, `map.ecology.temperature` (`plotBiomes.ts`)
  - `map.ecology.featureType` + debug heightfield fields (`features-apply/index.ts`)
  - `map.ecology.plotEffects.plotEffect` (`plot-effects/index.ts`)

Why it matters:
- The Studio DeckGL pipeline is keyed by `(dataTypeKey, spaceId, kind)`; refactors must preserve keys (or provide a deliberate migration plan).

### G) Determinism / RNG sensitivity (touchpoints)

- Seed labels we must preserve:
  - `features-plan`: `deriveStepSeed(context.env.seed, "ecology:planFeatureIntents")`
  - `plot-effects`: `deriveStepSeed(context.env.seed, "ecology:planPlotEffects")` (in `plot-effects/inputs.ts`)
- Ordering sensitivity:
  - `features-plan` merges placements across feature families and derives viz categories; modularization must preserve iteration ordering if it affects RNG consumption or deterministic placement ordering.

