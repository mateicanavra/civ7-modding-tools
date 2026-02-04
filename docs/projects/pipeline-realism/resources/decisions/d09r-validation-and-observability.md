# Decision Packet: Define validation + observability minimums (D09r)

## Question

What is the **normative validation and observability posture** for the maximal evolutionary Foundation engine:

- which invariants are **hard gates** (fail the run),
- which diagnostics are emitted but not gating,
- and where these checks live in the pipeline,
while keeping visualization as an external, optional observer?

## Context (pointers only)

- Docs (contracts):
  - `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
  - `docs/system/libs/mapgen/reference/VISUALIZATION.md`
  - `docs/system/libs/mapgen/reference/ARTIFACTS.md`
  - `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- Docs (pipeline-realism):
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (Determinism + validation section)
  - `docs/projects/pipeline-realism/resources/spec/budgets.md` (fixed budgets)
  - `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md` (D04r budgets/invariants)
  - `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md` (D07r consumption posture)
  - `docs/projects/pipeline-realism/resources/research/d09r-validation-and-observability-evidence.md`

## Why this is ambiguous

- The repo has “trace + viz” plumbing and contracts, but the **minimum** set of physics-aligned invariants for a maximal, mantle-driven evolutionary engine is not yet enumerated.
- Validation can be over-scoped into “planet quality judging” (brittle), or under-scoped into “only shape checks” (misses semantic regressions).
- Determinism can be treated as a runtime requirement (expensive) or a CI gate (cheap), and the boundary between the two must be explicit.

## Why it matters

- Blocks/unblocks:
  - unblocks D08r (authoring surface) by defining what must be asserted for knobs to be safe
  - unblocks the final SPEC by providing the contract-level gates that prevent “fake physics” regressions
  - unblocks migration slices by defining what each slice must prove
- Downstream contracts affected:
  - Foundation truth/projection artifacts (publish-once, read-only)
  - Morphology consumption: belts must be explainable by Foundation era + provenance drivers
  - Studio tuning loop: diagnostics must be inspectable, but must not change semantics

## Simplest greenfield answer

Define two tiers of validation:

1. **Always-on hard gates** that assert artifact contract correctness, cross-artifact agreement, and fixed-budget invariants (bounded compute).
2. **Strict validation** (CI and/or developer mode) that promotes selected distribution/correlation diagnostics into failures once thresholds stabilize.

Visualization remains external and never becomes a correctness dependency.

## Why we might not yet simplify

- Some higher-level “planet quality” metrics need empirical calibration across seeds and dimensions to avoid brittleness.
- Certain correlations (e.g., uplift vs elevation) are valuable but can be noisy until Morphology consumption is fully cut over.
- We need to keep runtime overhead bounded (maximal engine is already heavy).

## Options

1) **Option A**: Shape-only runtime validation
   - Description: validate only array lengths, index bounds, finite values, and schema compliance.
   - Pros:
     - fast and simple
   - Cons:
     - fails to prevent “fake physics” drift (e.g., mantle forcing becomes smoothed noise but still bounded)

2) **Option B**: Runtime hard gates + CI strict validation (two-tier)
   - Description:
     - runtime: hard gates for contract correctness + cross-artifact agreement + fixed budgets
     - CI/strict mode: promote selected distribution/correlation diagnostics to failures
   - Pros:
     - bounded runtime cost
     - catches semantic drift without baking brittle thresholds into normal runs
   - Cons:
     - requires maintaining a small canonical seed/config suite for strict mode

3) **Option C**: Everything gated at runtime
   - Description: runtime always computes full diagnostics and fails on distributions/correlations.
   - Pros:
     - maximum safety
   - Cons:
     - too expensive and brittle for authoring iteration
     - encourages tuning the validator instead of the engine

## Proposed default

- Recommended: **Option B** (two-tier: runtime hard gates + CI/strict promotions).
- Rationale:
  - aligns with `OBSERVABILITY.md` (trace must not change semantics) and `ARTIFACTS.md` (publish-once correctness)
  - preserves maximal posture while keeping compute bounded
  - provides a clear path for tightening thresholds without introducing “optional correctness”

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`
- [ ] Migration slice created/updated at: `docs/projects/pipeline-realism/resources/spec/migration-slices/` (link from each slice to its gates)
- [ ] Follow-ups tracked: `docs/projects/pipeline-realism/triage.md` (if thresholds need calibration)

