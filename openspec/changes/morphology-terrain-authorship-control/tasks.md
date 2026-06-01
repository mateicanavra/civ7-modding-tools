## 1. State And Diagnosis

- [x] 1.1 Isolate the correct Graphite worktree and branch.
- [x] 1.2 Verify direct-control branch ancestry and avoid the active Studio
  worktree.
- [x] 1.3 Reproduce current Earthlike hill/flatness stats for the scout seed
  and multi-seed matrix.
- [x] 1.4 Diagnose root cause from source, tests, history/hotspots, Narsil, and
  peer review before changing behavior.

## 2. Corpus And Expectations

- [x] 2.1 Extract Civ7 terrain classes and terrain-linked official feature,
  natural-wonder, and resource implications.
- [x] 2.2 Extract direct/indirect/readback-only API surfaces from
  `TerrainBuilder`, `GameplayMap`, adapter wrappers, direct-control CLI, and
  Studio endpoints.
- [x] 2.3 Extract Morphology truth artifacts, projection stages, hydrology
  terrain mutation, and engine-only elevation/cliff boundaries.
- [x] 2.4 Predeclare Earthlike terrain morphology bands before implementation
  or tuning.

## 3. Architecture And Slices

- [x] 3.1 Record the single causal Foundation/Morphology strategy and forbidden
  owner boundaries.
- [x] 3.2 Define downstream implementation slices with write sets and review
  gates.
- [x] 3.3 Record peer-agent P1/P2 findings and dispositions.
- [x] 3.4 Record downstream realignment requirements for ecology, resources,
  natural wonders, and runtime proof.

## 4. Verification

- [x] 4.1 Run OpenSpec strict validation for this change.
- [x] 4.2 Run full OpenSpec validation.
- [x] 4.3 Record focused local checks available to this docs/spec slice.
- [x] 4.4 Run `git diff --check`.
- [x] 4.5 Record local commit, Graphite submit, runtime proof, and product
  proof as separate closure labels.
