id: LOCAL-TBD-PR-M1-004
title: Add validation harness scaffolding (determinism fingerprints + invariant runners)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-001]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add the shared D09r harness plumbing: stable artifact fingerprints + invariant-runner scaffolding that later issues can fill with physics checks.

## Deliverables
- Establish a reusable “validation harness” surface (implementation mechanism is flexible, but must be reusable across many tests/issues):
  - stable artifact fingerprinting utilities for TypedArrays and object graphs containing TypedArrays,
  - a runner that can:
    - compute fingerprints for a declared set of artifacts,
    - run named invariants (pass/fail with actionable diagnostics),
    - and report failures in a diff-friendly shape.
- Define the initial canonical suite skeleton for pipeline-realism M1:
  - canonical seeds + dimensions list (small, fixed set),
  - list of artifacts that are fingerprinted at minimum (evolves over time, but starts with the milestone Tier-1 artifacts).

## Acceptance Criteria
- There is exactly one obvious place to add new invariants for M1 (no copy-pasted harness logic across tests).
- Fingerprints are stable for the same `{ seed, env, compiled config }` and change when inputs change.
- The harness can be used by `LOCAL-TBD-PR-M1-017..020` without additional “plumbing PRs”.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a harness smoke test that proves:
  - the fingerprint utility is stable across two identical runs,
  - and the invariant runner reports failures with actionable names.
  Suggested location: `mods/mod-swooper-maps/test/foundation/` or `mods/mod-swooper-maps/test/pipeline/`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-001`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/test/support/` (preferred home for shared fingerprint/invariant harness helpers)
- `mods/mod-swooper-maps/test/standard-run.test.ts` (existing TypedArray byte hashing pattern to generalize)
- `packages/mapgen-core/src/trace/index.ts` (`sha256Hex`, `stableStringify` primitives used by current tests)
- `packages/mapgen-core/src/engine/observability.ts` (`computePlanFingerprint` as an existing “stable identity” reference)
- `mods/mod-swooper-maps/test/pipeline/` (good home for suite-level harness smoke tests)

### References
- docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md

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

The repo already has the primitives needed for this harness, but they are scattered:
- Stable hashing helpers exist via trace utilities:
  - `sha256Hex(...)`, `stableStringify(...)` in `packages/mapgen-core/src/trace/index.ts`
- There are existing examples of “artifact fingerprinting” in tests (typed array → bytes → base64 → sha):
  - `mods/mod-swooper-maps/test/standard-run.test.ts`
- Plan identity is already deterministic and implemented centrally (but this is not an artifact fingerprint):
  - `packages/mapgen-core/src/engine/observability.ts` (`computePlanFingerprint`)

### Proposed Change Surface

Expected harness placement (recommendation; adjust if a better home exists, but keep it single-source):
- Add reusable test utilities under:
  - `mods/mod-swooper-maps/test/support/` (preferred), or
  - `packages/mapgen-core/src/engine/` if the harness is intended to be shared cross-mod.

The harness will be consumed by:
- determinism suite issue: `LOCAL-TBD-PR-M1-017`
- invariants issues: `LOCAL-TBD-PR-M1-018..020`

### Pitfalls / Rakes

- “Fingerprinting by JSON.stringify on TypedArrays”: this is slow and unstable; typed arrays must be hashed as bytes.
- “Viewer-dependent validation”: the harness must not depend on viz emissions; it validates artifacts directly.
- “Per-test harness forks”: if each issue adds its own fingerprint helper, determinism policy becomes un-auditable.

### Wow Scenarios

- **Regression-proof evolution:** a one-line change in mantle forcing or event mechanics produces a measurable fingerprint delta in the expected downstream artifacts, and CI can tell you *which* invariant failed and *which* artifacts drifted.
