## 1. Investigation And Spec

- [x] 1.1 Run fresh agents for vegetation logic, physical habitat targets, and testing design.
- [x] 1.2 Quantify current shipped-map feature counts across seeds.
- [x] 1.3 Classify the issue as categorical scoring/admission plus config identity, not only tuning.
- [x] 1.4 Draft OpenSpec proposal/design/spec before implementation.

## 2. Implementation

- [x] 2.1 Repair taiga, sagebrush, forest, savanna, and rainforest score logic at their owning score ops.
- [x] 2.2 Add owner-local per-feature vegetation admission policy/config without generic routing.
- [x] 2.3 Update vegetation planner strategy to apply per-feature policy before deterministic candidate selection.
- [x] 2.4 Update shipped map configs/presets to use current strategies and map-identity-specific values.
- [x] 2.5 Add useful why/what comments to changed policies/strategies without architecture metanarration.

## 3. Tests And Stats

- [x] 3.1 Add unit tests for cold/dry vegetation scoring so taiga and sagebrush are not double-penalized.
- [x] 3.2 Add planner tests for per-feature admission, not one aggregate vegetation threshold.
- [x] 3.3 Extend world-balance stats to report vegetation family counts and habitat/coherence signals.
- [x] 3.4 Add shipped-map/config seed-matrix assertions for required feature families by map identity.
- [x] 3.5 Update docs/evidence for feature-family targets and config posture.

## 4. Verification

- [x] 4.1 Run focused ecology and config tests.
- [x] 4.2 Run shipped-map world-balance and seed-matrix stats.
- [x] 4.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.4 Run targeted and global OpenSpec validation.
- [x] 4.5 Run `bun run build`.
- [x] 4.6 Deploy and verify in Civ7/FireTuner as part of the combined stack.
- [x] 4.7 Run `git diff --check`.
