# SPIKE: Ecology Domain Architecture Alignment (No Behavior Change)

This directory contains:
- the original architecture-alignment spike outputs, and
- the follow-on feasibility/spec-prep outputs that make Phase 3 planning straightforward.

## 1) Objective

Understand the **current ecology domain** and the **target architecture**, identify **drift**, and define the **conceptual refactor target shape** needed to realign ecology to the architecture **without changing behavior**.

This spike is research-only: it produces documentation and refactor targets, not production refactors.

## 2) Locked Directives (No Ambiguity)

These are fixed goals for the eventual refactor target (use them to resolve related ambiguity in proposals):

- **Atomic per-feature operations:** each feature family is modeled as distinct op(s). Avoid bulk/multi-feature mega-ops.
- **Shared compute substrate:** separate **compute ops** (shared compute layers) from **plan ops** (discrete intent/placement planning), and reuse compute outputs across feature planners.
  - Reference pattern: Morphology domain uses `compute-*` ops as shared substrate plus `plan-*` ops for discrete planning (example: `morphology/compute-substrate`).
- **Maximal modularity:** target the maximal ideal modular architecture; do not optimize prematurely. Performance can be recovered via the shared compute substrate, caching, and compile-time normalization.

Documentation posture:
- Prefer canonical system/lib guidelines for MapGen (architecture, policies, specs) over historical ADRs.
- Treat ADRs older than ~10 days as non-authoritative for behavior/architecture direction.

## 3) Assumptions and Remaining Unknowns

### Assumptions (explicit)

- We treat current target-architecture docs as canonical anchors:
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- We preserve behavior by preserving **public-ish compatibility surfaces**:
  - step ids, artifact ids, op ids
  - `dataTypeKey`/`spaceId` viz keys emitted by steps

### Unknowns (still tracked)

- Whether `artifact:ecology.biomeClassification` should be treated as an immutable snapshot or a publish-once mutable handle (current code mutates in place).
- Whether `plot-effects` should provide an effect tag (it currently performs adapter writes without an explicit effect guarantee).
- Whether `map-ecology` should remain a single stage or be split into projection-only vs stamping-only stages (a clean separation, but more pipeline nodes).

## 4) What We Learned

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

## 5) Potential Shapes (Conceptual Refactor Targets)

### Shape A (target; recommended): Maximal modularity + compute substrate + explicit contracts

- Keep stages: `ecology` (truth) and `map-ecology` (gameplay projection/materialization).
- Model ecology around a shared **compute substrate** (compute ops) plus **atomic per-feature plan ops**.
- Remove direct domain imports from steps by declaring *all used ops* in `contract.ops`.
- Drive feature planning by per-feature op contracts (and per-feature orchestration seams if helpful), not by “one big feature op”.

See also:
- `GREENFIELD.md` (physics-first ideal ecology organization; explicitly compute-vs-plan).

### Shape B (transitional, not target): Keep current step list; contract-ize the missing ops

- Keep the current step list and current artifact ids.
- Remove direct domain-op imports from steps and move all runtime op use behind compiler-owned injection/normalization.
- Preserve config compatibility for `vegetatedFeaturePlacements` / `wetFeaturePlacements` by treating them as step-owned orchestration config and translating into internal per-feature op envelopes (default disabled).
- This can keep the *step list* stable while still achieving **atomic per-feature ops** at the op level.

## 6) Minimal Experiment (Optional)

Use existing deterministic dump-first tooling as a baseline harness:

- `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label ecology-baseline`
- `bun --cwd mods/mod-swooper-maps run diag:list -- <runDir>`
- `bun --cwd mods/mod-swooper-maps run diag:diff -- <runA> <runB>`

This supports “no behavior change” parity validation without committing large binaries.

## 7) Risks and Open Questions

- **Contract drift risk:** Direct domain imports in steps make refactors more error-prone.
- **Implicit mutability:** In-place artifact mutation can create hidden dependencies.
- **Effect modeling:** Side-effectful projection steps without effect tags reduce plan legibility.

## 8) Next Steps

- Feasibility/spec-prep is captured here:
  - `FEASIBILITY.md` (verdict + locked blueprint)
  - `CONTRACT-MATRIX.md` (step↔op↔artifact↔tags↔viz reference)
  - `DECISIONS/` (explicit “this-or-this” outcomes)
  - `PHASE-3-SKELETON.md` (execution shape, not hardened)

- The next stage is to harden `PHASE-3-SKELETON.md` into a full implementation plan:
  - explicit slice sequencing
  - explicit verification gates per slice
  - explicit migration/compat commitments (especially config surfaces for `features-plan`)

---

See:
- `CURRENT.md` for the current ecology mental map.
- `TARGET.md` for ecology-scoped target architecture interpretation.
- `DRIFT.md` for the drift matrix.
- `REFRACTOR-TARGET-SHAPE.md` for the conceptual refactor target.
- `GREENFIELD.md` for a physics-first, maximal-modularity ideal ecology shape (compute substrate + plan ops).
- `CONTRACTS.md` for ids (steps/artifacts/ops/tags).
- `DECKGL-VIZ.md` for viz key compatibility surfaces.
- `HARDENING.md` for behavior-preservation invariants and harness tooling.
- `DOCS-IMPACT.md` for Diataxis-oriented docs updates.
- `FEASIBILITY.md` for feasibility verdict + spec-ready blueprint.
- `CONTRACT-MATRIX.md` for the current-state contract matrix and feasibility seams.
- `DECISIONS/README.md` for decision packets.
- `PHASE-3-SKELETON.md` for the Phase 3 execution skeleton.
