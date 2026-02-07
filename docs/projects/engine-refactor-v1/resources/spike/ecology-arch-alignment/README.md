# SPIKE: Ecology Domain Architecture Alignment (No Behavior Change)

## 1) Objective

Understand the **current ecology domain** and the **target architecture**, identify **drift**, and define the **conceptual refactor target shape** needed to realign ecology to the architecture **without changing behavior**.

This spike is research-only: it produces documentation and refactor targets, not production refactors.

## 2) Assumptions and Unknowns

### Assumptions (explicit)

- We treat current target-architecture docs as canonical anchors:
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- We preserve behavior by preserving **public-ish compatibility surfaces**:
  - step ids, artifact ids, op ids
  - `dataTypeKey`/`spaceId` viz keys emitted by steps

### Unknowns (tracked)

- Whether `artifact:ecology.biomeClassification` should be treated as an immutable snapshot or a publish-once mutable handle (current code mutates in place).
- Whether `plot-effects` should provide an effect tag (it currently performs adapter writes without an explicit effect guarantee).
- Whether `features-plan` should remain a single orchestration step, or be split into multiple feature-family steps.

## 3) What We Learned

### Ecology already matches many target-architecture shapes

- **Ops are pure:** ecology op modules under `mods/mod-swooper-maps/src/domain/ecology/ops/**` have no adapter coupling and no artifact-store access.
- **Steps orchestrate:** ecology steps build runtime inputs from artifacts/buffers, call ops, emit viz, and publish artifacts.
- **Stages compile strict config:** `ecology` and `map-ecology` stages compile public stage config into per-step config using `createStage`.

### Key drift points are step/contract-level, not op-level

- `features-plan` imports `@mapgen/domain/ecology/ops` directly to access optional placement ops (`planVegetatedFeaturePlacements`, `planWetFeaturePlacements`).
  - This bypasses the compiler’s step-contract op binding/defaulting/normalization model.
- `biome-edge-refine` mutates `artifact:ecology.biomeClassification` in-place (refines `biomeIndex`) after it was published.
  - This creates implicit ordering/mutability coupling.
- `plot-effects` applies adapter writes but does not provide an effect tag.

### Viz keys are a hard compatibility surface

Ecology emits stable `dataTypeKey`s (tile space `tile.hexOddR`) consumed by MapGen Studio’s deck.gl viewer.
A behavior-preserving refactor must keep these keys stable.

## 4) Potential Shapes (Conceptual Refactor Targets)

### Shape A (recommended): Make step/contract surfaces fully explicit, preserve stage split

- Keep stages: `ecology` (truth) and `map-ecology` (projection).
- Remove direct domain imports from steps by declaring *all used ops* in `contract.ops`.
- Decide and document ecology artifact mutability posture.
- Optionally split `features-plan` into multiple feature-family steps if we want more explicit orchestration boundaries.

### Shape B (alternative): Keep `features-plan` as one step, but fully contract-ize optional ops

- Minimal structural change: keep the current step list but ensure compiler-owned op envelopes.
- Lower plan-node churn, but less granular seams for future work.

## 5) Minimal Experiment (Optional)

Use existing deterministic dump-first tooling as a baseline harness:

- `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label ecology-baseline`
- `bun --cwd mods/mod-swooper-maps run diag:list -- <runDir>`
- `bun --cwd mods/mod-swooper-maps run diag:diff -- <runA> <runB>`

This supports “no behavior change” parity validation without committing large binaries.

## 6) Risks and Open Questions

- **Contract drift risk:** Direct domain imports in steps make refactors more error-prone.
- **Implicit mutability:** In-place artifact mutation can create hidden dependencies.
- **Effect modeling:** Side-effectful projection steps without effect tags reduce plan legibility.

## 7) Next Steps

- If the next question is **integration/landing the refactor**, escalate to `/dev-spike-feasibility` and define:
  - the exact refactor approach (step split or not),
  - the artifact mutability decision,
  - and the parity harness gates to protect behavior.

---

See:
- `CURRENT.md` for the current ecology mental map.
- `TARGET.md` for ecology-scoped target architecture interpretation.
- `DRIFT.md` for the drift matrix.
- `REFRACTOR-TARGET-SHAPE.md` for the conceptual refactor target.
- `CONTRACTS.md` for ids (steps/artifacts/ops/tags).
- `DECKGL-VIZ.md` for viz key compatibility surfaces.
- `HARDENING.md` for behavior-preservation invariants and harness tooling.
- `DOCS-IMPACT.md` for Diataxis-oriented docs updates.
