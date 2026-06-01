## 1. Investigation And Spec

- [x] 1.1 Run fresh lake projection/runtime investigator.
- [x] 1.2 Run official-resource/runtime investigator for Civ7 lake/sea-level evidence.
- [x] 1.3 Classify the issue as runtime projection/materialization proof unless evidence proves Hydrology truth is wrong.
- [x] 1.4 Draft OpenSpec proposal/design/spec before implementation.

## 2. Implementation

- [ ] 2.1 Expand adapter lake readback diagnostics with terrain/water/lake/area/elevation evidence.
- [ ] 2.2 Add a final lifecycle lake preservation check after later engine terrain/cache calls.
- [ ] 2.3 Keep `map-hydrology` as projection owner and Hydrology as truth owner.
- [ ] 2.4 Record any sea-level runtime DB evidence; create a separate change if it is active.
- [ ] 2.5 Add useful why/what comments at non-obvious projection lifecycle boundaries.

## 3. Tests

- [ ] 3.1 Add focused adapter/mock tests for terrain/water/lake readback categories.
- [ ] 3.2 Add map-hydrology tests that distinguish projection rejection from final-lifecycle drying.
- [ ] 3.3 Extend world-balance stats to include final lake runtime drift where available.
- [ ] 3.4 Add a guard against reintroducing engine lake generation as standard MapGen truth.

## 4. Verification

- [ ] 4.1 Run focused map-hydrology/materialization tests.
- [ ] 4.2 Run shipped-map world-balance stats with lake drift checks.
- [ ] 4.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [ ] 4.4 Run targeted and global OpenSpec validation.
- [ ] 4.5 Run `bun run build`.
- [ ] 4.6 Deploy and prove a fresh Civ7 MapGeneration run through FireTuner/logs.
- [ ] 4.7 Run `git diff --check`.
