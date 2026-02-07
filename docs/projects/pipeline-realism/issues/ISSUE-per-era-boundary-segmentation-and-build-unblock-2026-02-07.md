# ISSUE: Fix Builds First, Then Maximal Per-Era Boundary Segmentation + Finish Remaining Physics Work (2026-02-07)

This issue is the working checklist for the plan below. We will keep this document aligned with the implementation stack and link the relevant Graphite PRs per slice.

## Summary
We will do this in Graphite slices stacked on top of the current stack tip (`agent-GOBI-PRR-s115-foothills-budget`, PR #1185) with strict hygiene (no dirty worktrees, non-interactive commits).

This plan is “maximal” in two senses:
1. **Builds and runtime unblocking first:** we make root build/run and Mapgen Studio reliably runnable, and we eliminate the in-game `build-elevation` land/water drift failure so the map can generate end-to-end.
2. **Geology-grounded modeling next:** we re-evaluate plate boundaries per era by actually re-deriving era-specific plate membership + boundary classification + forcing fields, so mountain/landform probabilities are driven by collision/subduction/rift/shear history across eras (not a proxy field that accidentally saturates).

It also includes “everything else still needed”: config explicitization tooling for `swooper-earthlike.config.json`, remaining mountain-kind taxonomy wiring (including hotspot-track style volcanic mountain chains), audits for “no magic numbers,” “one rule per file,” and any stack hygiene/orphan branch integration.

---

## Current State (Ground Truth)
- Stack tip: `agent-GOBI-PRR-s115-foothills-budget` (PR #1185) on top of `agent-GOBI-PRR-s114-collision-history-orogeny` (PR #1184).
- Latest worktree previously had **uncommitted preset changes** (now being tracked via Slice 1.1).
- Root build **does** pass locally (`bun run build`), Mapgen Studio dev starts (prior “failure” can be just port-in-use / killed dev process).
- In-game / engine run can fail with:
  - `[map-morphology/build-elevation] drift: landMask=1 but adapter reports water at (x,y).`
  - This blocks testing inside Civ7; fixing this is part of “builds first.”

---

## Phase 0: Capture This Plan as Checklist + Scratch Pad
Deliverables:
1. This issue doc (current file) contains the plan verbatim and becomes the checklist.
2. Scratch pad for notes / diffs / measurements:
   - `docs/projects/pipeline-realism/scratch/agent-GOBI-PRR-per-era-boundaries/s00.md`

Working rule:
- Every slice appends to the scratch pad:
  - what changed
  - what commands were run
  - key metrics from `diag:analyze`
  - screenshots/paths to dumps (if applicable)
  - any deviations + rationale

---

## Phase 1: Fix Builds/Run First

### Slice 1.1: Track Earthlike Preset Fix (Dedicated Slice)
Goal:
- A preset update becomes a clean, reviewable slice on the stack (no dirty worktree), and Studio/build consumers see it.

Branch:
- `agent-GOBI-PRR-s116-earthlike-preset-build-fix`

Acceptance:
- `git status` clean
- `bun run build` passes
- `bun run --cwd apps/mapgen-studio build` passes
- `bun run --cwd mods/mod-swooper-maps check` passes

---

### Slice 1.2: Make Engine `build-elevation` Non-Drifting
Goal:
- The standard recipe can execute through `map-morphology/build-elevation` in the Civ7 engine without violating the “morphology landMask is authoritative” invariant.

Branch:
- `agent-GOBI-PRR-s117-build-elevation-no-water-drift`

Decision-complete fix:
- After `TerrainBuilder.buildElevation()`, restore the full pre-buildElevation terrain snapshot and run:
  - `TerrainBuilder.stampContinents()`
  - `AreaBuilder.recalculateAreas()`
  - `TerrainBuilder.storeWaterData()`
- Then re-run `assertNoWaterDrift(...)`.

Tests:
- Add a `MockAdapter`-based integration test that simulates a water flip during buildElevation and asserts we call the restore+recompute sequence deterministically.

Acceptance:
- In-engine run no longer throws drift at `build-elevation`.
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts` passes.
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts` passes.

---

### Slice 1.3: Mapgen Studio “Reliably Runnable” Smoke
Goal:
- Running Studio is straightforward and does not get misclassified as “broken” due to port conflicts or missing recipe build prerequisites.

Branch:
- `agent-GOBI-PRR-s118-studio-smoke-and-doc`

Changes:
- Add a short runbook note clarifying dev behavior and how to verify via `apps/mapgen-studio build`.
- Ensure Studio build script self-heals by building studio recipe artifacts when missing (so `bun run --cwd apps/mapgen-studio build` works standalone).

Acceptance:
- `bun run dev:mapgen-studio` starts and prints a Local URL.
- `bun run --cwd apps/mapgen-studio build` passes.

---

## Phase 2 (A): Maximal Per-Era Boundary Segmentation Re-Evaluation

### Slice 2.1: Era Plate Sites + Era Plate Membership (Deterministic)
Branch:
- `agent-GOBI-PRR-s119-era-plates-membership`

Acceptance:
- Determinism tests pass.
- Optional: Studio can render per-era plateId grids for debugging.

---

### Slice 2.2: Era Boundary Extraction + Kinematic Classification
Branch:
- `agent-GOBI-PRR-s120-era-boundary-classification`

Config knobs (named, documented):
- `boundary.normalEpsilon`
- `boundary.transformTangentialMin`
- `boundary.intensityScaleNormal`
- `boundary.intensityScaleTangential`

Acceptance:
- Boundary type distribution is non-degenerate across eras on canonical probe.

---

### Slice 2.3: Era Polarity + Collision vs Subduction Resolution
Branch:
- `agent-GOBI-PRR-s121-era-polarity-and-orogen-type`

Acceptance:
- `subductionPotential` no longer frequently collapses to zero on canonical probe.

---

### Slice 2.4: Era Forcing Field Emission From Era Boundaries
Branch:
- `agent-GOBI-PRR-s122-era-forcing-fields-from-era-boundaries`

Acceptance:
- Era-to-era displacement is visible in diagnostics.
- Determinism + gates pass.

---

## Phase 3 (B): Everything Else Still Needed

### Slice 3.1: Mountains/Hills Probabilities as a True Multi-Era Physics Classifier (No Saturation)
Branch:
- `agent-GOBI-PRR-s123-mountains-probabilities-multi-era`

Acceptance:
- Canonical probe produces non-trivial but bounded mountain/hill coverage (config max fractions).

---

### Slice 3.2: Hotspot Track Volcanic Mountain Chains
Branch:
- `agent-GOBI-PRR-s124-hotspot-track-volcanic-highlands`

---

### Slice 3.3: Make `swooper-earthlike.config.json` Fully Explicit (Tooling + Output)
Branch:
- `agent-GOBI-PRR-s125-earthlike-config-fully-explicit`

---

### Slice 3.4: “One Rule Per File” Audit and Cleanup
Branch:
- `agent-GOBI-PRR-s126-mountains-rules-file-split`

---

### Slice 3.5: Stack Hygiene (Orphan Branch Integration If Still Present)
Branch:
- `agent-GOBI-PRR-s127-stack-hygiene-integrate-orphans`

---

## Evidence + Test Bundle (Per Slice)
Minimum per slice (where applicable):
- `bun run build`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`
- Canonical probe evidence:
  - `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label <slice>`
  - `bun run --cwd mods/mod-swooper-maps diag:analyze -- <outputDir>`

## Assumptions and Defaults (Locked)
- Keep existing collision/subduction split channels, but upgrade them to be sourced from era-specific segmentation.
- No magic numbers: thresholds/weights live in schemas/config with defaults and docs.
- Determinism is a hard gate: explicit tie-breaks.
- Engine drift invariant is preserved by restore+stampContinents+storeWaterData, not by weakening assertions.

