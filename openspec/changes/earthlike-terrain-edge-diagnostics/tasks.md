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
- [ ] 2.7 Classify source authority for each row.

## 3. Repair

- [ ] 3.1 Repair only rows assigned to a repo-owned source authority.
- [ ] 3.2 Preserve hydrology water mutation and Civ validation boundaries.

## 4. Verification

- [x] 4.1 Run focused terrain diagnostic tests.
- [ ] 4.2 Re-run exact-authored final-surface parity after any repair.
- [x] 4.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.4 Run `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
