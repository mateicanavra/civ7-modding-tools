## 1. Activation

- [x] 1.1 Link the exact-authored full-grid parity proof for
  `studio-run-in-game-mq20rbzr-1fhc`.
- [x] 1.2 Extract the concrete terrain mismatch rows and pair counts.

## 2. Diagnostics

- [x] 2.1 Add terrain-only mismatch context extraction.
- [x] 2.2 Add neighborhood classification for coast/ocean edge swaps.
- [x] 2.3 Produce the terrain-edge context artifact.
- [x] 2.4 Add or link shelf/coast/lake/projection-boundary mask evidence.
- [x] 2.5 Add or link live water/lake/area readback evidence.
- [x] 2.6 Add placement validation-boundary readback evidence.
- [x] 2.7 Classify source authority for each row.
- [x] 2.8 Add post-repair coast materialization boundary context.

## 3. Repair

- [x] 3.1 Repair only rows assigned to a repo-owned source authority.
- [x] 3.2 Preserve hydrology water mutation and Civ validation boundaries.
- [x] 3.3 Open any adapter/mock materialization repair as a separate bounded
      layer before changing code.
- [x] 3.4 Repair mock lake readback so ordinary coast terrain is not lake.
- [x] 3.5 Classify the remaining mock terrain coast/ocean materialization
      boundary before repair.
- [x] 3.6 Repair the source-authorized land-contact mock terrain
      materialization subset in a bounded repair layer.
- [ ] 3.7 Classify or repair the residual enclosed-water
      local-ocean/live-coast terrain row.

## 4. Verification

- [x] 4.1 Run focused terrain diagnostic tests.
- [ ] 4.2 Re-run exact-authored final-surface parity after any repair.
      Current drain attempt is blocked by stale exact proof config key
      `/config/ecology-features/floodplainPlanning`; source-recorded
      post-repair artifact remains evidence, not fresh proof.
- [x] 4.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.4 Run `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
- [x] 4.6 Run focused adapter mock terrain tests and adapter check/build.
- [x] 4.7 Record source-authored post-repair final-surface parity and
      terrain-edge context after the mock terrain materialization repair.
