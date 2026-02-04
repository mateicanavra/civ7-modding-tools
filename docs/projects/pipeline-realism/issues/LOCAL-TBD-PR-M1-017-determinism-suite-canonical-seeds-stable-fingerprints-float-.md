id: LOCAL-TBD-PR-M1-017
title: Determinism suite: canonical seeds + stable fingerprints + float tolerance policy
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-004]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add a CI-enforced determinism suite for M1: canonical seeds/configs + stable artifact fingerprints + an explicit float tolerance policy.

## Deliverables
- Define the canonical determinism suite inputs:
  - a small fixed set of `{ seed, width, height, authoring config }` cases that exercise:
    - wrap semantics,
    - multiple plate counts,
    - at least one “tectonically active” scenario.
- Define the canonical fingerprint surface:
  - which artifacts are fingerprinted (start with milestone Tier-1 artifacts, expand as needed),
  - and the stable hashing method for TypedArrays and object graphs.
- Define the float tolerance policy explicitly:
  - recommended default: enforce bit-level determinism for Float32Array outputs (hash bytes exactly),
  - if true cross-platform drift exists, introduce an explicit quantization/tolerance layer *and* document which artifacts are permitted to drift and why.

## Acceptance Criteria
- The determinism suite runs in CI and fails loudly on drift:
  - two identical runs produce identical fingerprints for the chosen artifact set.
- Drift is actionable:
  - failures report which artifact(s) changed and, when possible, which subfield/typed array hash changed.
- Float policy is decision-complete:
  - either “bit-identical required” or “quantized allowed” is documented with explicit scope.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a single determinism suite test entrypoint (new file) that:
  - runs the pipeline twice for each canonical case,
  - fingerprints the declared artifact set using the shared harness (`LOCAL-TBD-PR-M1-004`),
  - and asserts equality.
  Suggested location: `mods/mod-swooper-maps/test/pipeline/` (new test file).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-004`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/test/standard-run.test.ts` (existing stable hashing + TypedArray byte hashing pattern to generalize)
- `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` (pipeline-level artifact expectations; good place to add fingerprint coverage assertions)
- `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` (example contract-guard posture; determinism suite should pair with contract guards)
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` and `mods/mod-swooper-maps/src/recipes/standard/runtime.ts` (canonical run/compile entrypoints)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (Tier-1 artifact ids start here; fingerprints should reference these ids)

### References
- docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md
- docs/projects/pipeline-realism/resources/spec/budgets.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

There are already determinism-style hash patterns in tests (domain-specific, not generalized harness):
- `mods/mod-swooper-maps/test/standard-run.test.ts` (hashing TypedArray bytes + stable stringify)

This issue turns that pattern into:
- a single “suite” entrypoint,
- with explicit input cases,
- and explicit artifact coverage for M1.

### Proposed Change Surface

Expected harness consumption:
- shared fingerprint/invariant runner from `LOCAL-TBD-PR-M1-004`

Expected test placement:
- `mods/mod-swooper-maps/test/pipeline/` (suite-level integration tests)

### Pitfalls / Rakes

- Fingerprinting only a small subset of artifacts (drift can hide elsewhere).
- Allowing implicit float tolerance without documenting which artifacts may drift (drift becomes un-auditable).
- Using `Math.random` or ambient RNG inside ops (breaks determinism; must pass `rngSeed` as data only).

### Wow Scenarios

- **Determinism as a feature:** implementers can refactor internals aggressively because any causal drift surfaces immediately, and the failure report tells them which artifact boundary they violated.

## Implementation Decisions

### Canonical determinism cases (M1)
- **Context:** The suite must exercise wrap semantics, multiple plate counts, and at least one tectonically active scenario.
- **Options:** (A) single baseline case, (B) small multi-case suite with explicit plate/activity variation, (C) large grid of cases.
- **Choice:** Option B — three fixed cases in `test/support/determinism-suite.ts`:
  - `baseline-balanced`: seed 1337, 32×20, plateCount 23, plateActivity 0.5
  - `wrap-active`: seed 9001, 37×23 (odd width), plateCount 31, plateActivity 0.85
  - `compact-low-plates`: seed 4242, 28×18, plateCount 15, plateActivity 0.25
- **Rationale:** Covers wrap + multiple plate counts + active forcing while keeping CI runtime bounded.
- **Risk:** Edge cases outside these dimensions may still drift; expand suite if real regressions escape.

### Float tolerance policy: bit-identical
- **Context:** The harness fingerprints TypedArray bytes (including Float32Array).
- **Options:** (A) byte-level determinism, (B) quantized/tolerant floats with explicit scope.
- **Choice:** Option A.
- **Rationale:** Strongest determinism signal and simplest audit; any future tolerance must be explicit and scoped.
- **Risk:** Cross-platform float drift could require a controlled quantization layer later.
