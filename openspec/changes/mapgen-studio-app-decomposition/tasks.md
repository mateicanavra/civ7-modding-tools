## 1. Extract the non-React corpus

- [ ] 1.1 `features/mapConfigSave/api.ts`: move `toConfigId`, `saveRepoBackedConfig`, `fetchMapConfigSaveDeployStatus`, `MAP_CONFIG_SAVE_LAST_REQUEST_KEY`
- [ ] 1.2 `features/runInGame/api.ts`: move `runCurrentConfigInGame`, `fetchRunInGameStatus`
- [ ] 1.3 `features/runInGame/sourceSnapshotStorage.ts`: move `readStoredRunInGameSourceSnapshot` + `RUN_IN_GAME_LAST_*` keys
- [ ] 1.4 `features/runInGame/liveSource.ts`: move `liveSourceMatchesStudio`, `LastRunSnapshot`
- [ ] 1.5 `features/civ7Setup/api.ts`: move `fetchCiv7SetupConfig`, `fetchCiv7SavedSetupConfigs`, `fetchCiv7SetupCatalog`, `requestCiv7Autoplay`, `Civ7SetupCatalog(Option)` types
- [ ] 1.6 `features/civ7Setup/setupOptions.ts`: move `findSetupParameterLike`, `ensureSelectOption`, `mergeSelectOptions`, `setupCatalogOptions`
- [ ] 1.7 `features/civ7Setup/livePreset.ts`: move `LIVE_GAME_PRESET_ID`, `LIVE_GAME_PRESET_KEY`
- [ ] 1.8 `features/configOverrides/configBuilders.ts`: move merge/path/config builders + preset-apply + types
- [ ] 1.9 `features/presets/repoBacked.ts`: move `mergeBuiltInPresets`, `toRepoBackedPreset`
- [ ] 1.10 `features/presets/dialogState.ts`: move `PresetErrorState`
- [ ] 1.11 `shared/async.ts` + `shared/number.ts`: move `delay`, `isAbortLikeError`, `clampNumber`
- [ ] 1.12 Replace inline definitions in `App.tsx` with imports

## 2. Extract the provider shell + presentational chrome

- [ ] 2.1 `app/StudioProviders.tsx`: move the `App` export body
- [ ] 2.2 `app/CanvasStage.tsx`: move the canvas JSX (props-in, no logic change)
- [ ] 2.3 `app/ErrorBanner.tsx`: move the error banner JSX
- [ ] 2.4 `app/StudioShell.tsx`: move the outer layout frame
- [ ] 2.5 Wire `App.tsx` to the new components; keep `AppContent` logic intact

## 3. Verify parity

- [ ] 3.1 `bun run check` clean
- [ ] 3.2 `bun run build` succeeds incl. worker-bundle check
- [ ] 3.3 Live preview: no console errors; recipe authoring, viz, run-in-game identical
- [ ] 3.4 localStorage keys/shapes unchanged (grep diff)
- [ ] 3.5 OpenSpec strict validation passes
