## 1. Direct-Control Setup Contract

- [x] 1.1 Expand setup snapshots to bounded game options and player parameters.
- [x] 1.2 Add player setup options to single-player setup input.
- [x] 1.3 Apply player options with `setPlayerParameterValue`.
- [x] 1.4 Verify requested game/player setup options fail on missing readback.

## 2. Studio Setup Model

- [x] 2.1 Add bounded `Civ7StudioSetupConfig`.
- [x] 2.2 Persist setup config in authoring state.
- [x] 2.3 Include setup config in Run in Game fingerprints and source snapshots.
- [x] 2.4 Validate setup config at the server boundary.

## 3. Studio UX And Live Sync

- [x] 3.1 Add live setup read endpoint.
- [x] 3.2 Hydrate setup choices from live setup when no saved choices exist.
- [x] 3.3 Re-sync exact live setup on explicit Sync from Live.
- [x] 3.4 Add compact top-bar controls for map, leader, civ, difficulty, speed.

## 4. Verification

- [x] 4.1 Add direct-control setup option tests.
- [x] 4.2 Add Studio setup model, persistence, request, and fingerprint tests.
- [x] 4.3 Run package checks/builds.
- [x] 4.4 Restart Studio and prove live setup readback/launch payload retention.
