## 1. Investigation

- [x] 1.1 Reproduce current full-recipe stats for shipped map identities.
- [x] 1.2 Classify lakes, cold reefs, atolls, wetlands, and dense vegetation
      regressions from generated artifacts/configs rather than assuming
      config-only causes.
- [x] 1.3 Scout official Civ7 map scripts/resources for active engine sea-level
      controls and record disposition.

## 2. Implementation

- [x] 2.1 Repair Hydrology lake planning so terminal-basin lake intent uses
      discharge admission and lakeiness-owned budgets.
- [x] 2.2 Keep feature-family score-to-intent policies local to owning Ecology
      planners and add config for family thresholds/reef spacing.
- [x] 2.3 Update shipped map configs and standard presets with valid,
      map-appropriate strategy/config values.
- [x] 2.4 Repair cold reef scoring against the current bathymetry proxy without
      turning it into warm-reef relabeling.
- [x] 2.5 Disposition live source TODO/review-comment residue and keep comments
      focused on product/domain/algorithm why.
- [x] 2.6 Keep Hydrology runtime artifact publication checks step-local, not in
      broad domain helper buckets, artifact registries, manual op guards, or
      Hydrology-only artifact machinery.

## 3. Tests

- [x] 3.1 Add Hydrology unit coverage for discharge/budget lake admission.
- [x] 3.2 Update hydrology knob compilation tests for terminal-basin policy.
- [x] 3.3 Add categorical full-recipe world-balance stats tests for shipped map
      identities.
- [x] 3.4 Keep config schema tests covering shipped map config/preset drift.

## 4. Verification

- [x] 4.1 Run focused hydrology/ecology/config/world-stat tests from the active
      worktree.
- [x] 4.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.3 Run `bun run openspec -- validate restore-mapgen-world-balance-proofs --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `bun run build`.
- [x] 4.6 Run `bun run --cwd mods/mod-swooper-maps deploy`.
- [x] 4.7 Confirm fresh `Scripting.log` map-generation success after deploy.
- [x] 4.8 Run `git diff --check`.
