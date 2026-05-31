# Studio Materialization Mapper

## Scope And Evidence

- [source-proven] Report scope is `apps/mapgen-studio/**`, Swooper config envelopes, `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`, deploy, map row materialization, durable Save/Run vs disposable `studio-current`, and proof boundaries.
- [source-proven] Root `AGENTS.md` says generated artifacts such as `dist/` and `mod/` are read-only source artifacts and must be regenerated through scripts, not hand-edited.
- [source-proven] This report is intentionally source/design evidence only. No fresh Civ runtime proof was collected; `live-proof-ledger.md` still records no fresh entries.
- [rejected] Generated `mod/`, `dist/`, deployed Mods, or quiet logs alone do not prove Civ loaded the exact current config.

## Current Studio Save/Deploy Flow

- [source-proven] `saveRepoBackedConfig()` in `apps/mapgen-studio/src/App.tsx` builds a Swooper envelope with `$schema`, `id`, `name`, `description`, `recipe: "standard"`, `sortIndex`, optional `latitudeBounds`, and nested `config`; it does not include seed.
- [source-proven] `POST /api/map-configs` in `apps/mapgen-studio/vite.config.ts` validates a kebab-case id, verifies the envelope shape, restricts writes to `mods/mod-swooper-maps/src/maps/configs/*.config.json`, writes the file, runs `bun run --cwd mods/mod-swooper-maps deploy`, then calls `restartCiv7GameAndBegin()`.
- [source-proven] If deploy fails, the endpoint restores the prior config file. If restart fails after save/deploy, the source config remains saved and deployed.
- [source-proven] The current endpoint queues save/deploy/restart requests with `saveDeployRestartQueue`, so concurrent Studio saves are serialized.
- [source-proven] The current UI labels successful save as “Config saved, deployed, and restart requested”; it is not yet a full setup/start action selecting map row, map size, and seed.
- [source-proven] Current restart proof can optionally wait for fresh `Scripting.log` markers, but the App client does not send `verifyRestart`, and the markers are generic Swooper generation markers, not exact config-hash proof.

## Studio State Available For Run In Game

- [source-proven] Current Studio has `worldSettings`: `mode`, `mapSize`, `playerCount`, and `resources`.
- [source-proven] Current Studio has `recipeSettings`: `recipe`, `preset`, and `seed`.
- [source-proven] Current Studio has `pipelineConfig`, `overridesDisabled`, resolved built-in/repo-backed presets with `id`, `label`, `description`, `sourcePath`, `sortIndex`, optional `latitudeBounds`, and `config`, plus `lastRunSnapshot` for dirty detection.
- [source-proven] Browser Run derives dimensions from `getCiv7MapSizePreset(worldSettings.mapSize)`, sends `seed`, `mapSizeId`, dimensions, player count, resource mode, and `pipelineConfig` as `configOverrides` unless overrides are disabled.
- [source-proven] Browser Run hard-codes latitude bounds to `80/-80`; Save preserves resolved preset `latitudeBounds` when present.
- [source-proven] The UI exposes mode values `browser` and `dump`; there is no Civ Run mode/action yet.
- [inferred] Run in Game should read the current in-memory `pipelineConfig`, selected/resolved map config identity, `worldSettings.mapSize/playerCount/resources`, and `recipeSettings.seed` at click time, not the last browser run snapshot.

## Swooper Config And Map Row Materialization

- [source-proven] Swooper map config authority is `mods/mod-swooper-maps/src/maps/configs/*.config.json`. Each envelope carries map identity, localization ordering, recipe id, optional latitude bounds, optional `logPrefix`, and the nested standard recipe config.
- [source-proven] `validateCanonicalMapConfig()` rejects unknown envelope keys, requires file stem to match `id`, requires `recipe: "standard"`, validates `latitudeBounds`, and validates nested `config` against the standard recipe schema after stripping root `$schema`.
- [source-proven] `generate-map-artifacts.ts` reads all `*.config.json`, validates/sorts them, generates `src/maps/generated/<id>.ts`, `mod/config/config.xml` map rows, `mod/swooper-maps.modinfo`, `mod/text/en_us/MapText.xml`, and Studio `dist/recipes/standard-map-configs.*`.
- [source-proven] Generated map entries call `createMap({ id, name, description, recipe, latitudeBounds, logPrefix, config: canonicalRecipeConfig(mapConfig) })`.
- [source-proven] Generated `mod/config/config.xml` map rows use `File="{swooper-maps}/maps/<id>.js"`, localization tags, and `SortIndex`.
- [source-proven] Civ setup parameters define `Map` as configuration group `Map`, key `Script`, domain `StandardMaps`; `MapSize` as group `Map`, key `SizeType`; and `MapRandomSeed` as group `Map`, key `RandomSeed`.
- [source-proven] Official setup domain query `Maps` selects `Domain, Name, Description, File AS Value, SortIndex FROM Maps`.
- [unresolved] Whether the shell/App UI `GameInfo.Maps` read returns the frontend map-script rows, the gameplay map-size rows, or depends on state/database binding must be live-proven before naming the exact wrapper contract.

## Proposed Run In Game Endpoint/Action

- [inferred] Add a separate Studio action named Run in Game. It should not replace browser Run, change `worldSettings.mode` to a third preview mode, or reuse browser worker execution as launch proof.
- [inferred] Add `POST /api/civ7/run-in-game` owned by the Studio dev-server plugin, backed only by first-class `@civ7/direct-control` wrappers for setup/start/readback. Studio should send structured JSON, never raw setup JavaScript.
- [inferred] Request shape should include:
  - `recipeId`, currently accepted only as `mod-swooper-maps/standard`;
  - `seed` as a string plus parsed signed/unsigned numeric form;
  - `worldSettings.mapSize`, `playerCount`, and `resources`;
  - `materialization.mode`: `durable` or `disposable`;
  - selected map config identity when repo-backed (`id`, `sourcePath`, label metadata);
  - sanitized current `pipelineConfig`;
  - expected `configHash` and `envelopeHash`.
- [inferred] Endpoint phases should be: validate request, materialize map row, deploy or stage mod, verify map row visibility, prepare Civ setup with map script/map size/map seed/options, start game, then verify post-start map summary and Swooper log hash.
- [rejected] The endpoint must not accept arbitrary JavaScript, a caller-provided direct-control command string, or a bridge fallback.

## Materialization Policy

- [source-proven] Seed is part of MapGen `Env` and Studio browser runner inputs; canonical docs say `env` is runtime-provided input and not an authoring surface.
- [rejected] Do not add `seed`, `mapSeed`, `gameSeed`, or runtime observation fields to Swooper config envelopes.
- [inferred] Durable Save/Run means the user intentionally persists the current config into a repo-backed Swooper envelope, then Run in Game launches that saved map row. This may update `src/maps/configs/<id>.config.json` through the existing save policy.
- [inferred] Disposable Run Current means the current in-memory config is materialized as `studio-current` for this launch only. It must not overwrite the selected authored config and should leave the repo source tree clean after endpoint cleanup.
- [inferred] The safest disposable implementation is a temp materialization path: teach map artifact generation to accept an in-memory/temporary overlay envelope and output a deployable temp mod package, then deploy that package. That avoids adding `studio-current.config.json` to authored configs and avoids dirty generated source.
- [inferred] If the first implementation cannot avoid writing a temporary `studio-current.config.json` under `src/maps/configs`, it must snapshot and restore source files and regenerate canonical artifacts after deployment. That is weaker than temp output because generated repo artifacts can still churn during failure.
- [rejected] Do not infer config edits from live Civ observations. Runtime drift can produce diagnostics or suggestions, but it must not call `setPipelineConfig()` or write a config file automatically.

## Config Hash Strategy

- [inferred] Compute a canonical `configHash = sha256(stableJson(stripSchemaMetadataRoot(pipelineConfig)))` for the nested authored recipe config.
- [inferred] Compute an `envelopeHash = sha256(stableJson({ id, recipe, latitudeBounds, configHash }))` for the Civ map-row materialization identity. Exclude display-only fields if the goal is recipe equivalence; include them if the goal is exact row identity. The endpoint should return both.
- [inferred] Generation should embed the expected hashes as string literals in the generated map entry or a generated sidecar imported by the entry. Civ runtime should log the embedded `mapConfigId`, `mapFile`, `configHash`, `envelopeHash`, seed, map size, and dimensions at `RequestMapInitData`/`GenerateMap`.
- [inferred] Precomputing hashes in Node/generator is preferable to hashing inside Civ JS runtime, because current log-proof code already treats `TextEncoder` errors as reject patterns.
- [source-proven] Current `createMap()` resolves seed from `GameplayMap.getRandomSeed()`, dimensions/map size from `RequestMapInitData` plus adapter map info, and passes `env` to the recipe. That is the right runtime point to log seed/dimensions/hash proof.
- [unresolved] Exact log location and marker wording need implementation proof. The marker should be unique enough to distinguish stale previous runs.

## Map Row Verification Strategy

- [source-proven] Generation can prove that `mod/config/config.xml` contains a row for `{swooper-maps}/maps/<id>.js`.
- [unresolved] Live proof must show Civ setup can see that exact row after deploy/reload. Required proof: targeted App UI/shell read for the map script row with `File`/`Value == "{swooper-maps}/maps/<id>.js"` before setup.
- [inferred] Direct-control should own a bounded setup catalog/map-row wrapper, even if implemented with `Database` or `GameInfo` internally. Studio should call a wrapper like `getCiv7SetupMapRows()` or `verifyCiv7SetupMapRow()` rather than using `/api/civ7/gameinfo` ad hoc.
- [source-proven] Gameplay map-size dimensions can be checked against official base-standard `Maps` rows and post-start `GameplayMap.getGridWidth()`, `getGridHeight()`, `getMapSize()`, and `getRandomSeed()` via existing direct-control map summary.
- [unresolved] Reload semantics are gating. If a newly deployed or changed map row is not visible until a shell reload or full process restart, Run in Game must expose that boundary instead of pretending hot deploy is exact.

## Implementation Write-Set

- [inferred] `apps/mapgen-studio/src/App.tsx`: add separate Run in Game client action, request assembly, UI state, and proof/result rendering; keep browser Run unchanged.
- [inferred] `apps/mapgen-studio/src/ui/components/AppFooter.tsx` or `RecipePanel.tsx`: add an explicit Run in Game button separate from Run/Reroll/Auto-run.
- [inferred] `apps/mapgen-studio/vite.config.ts`: add `POST /api/civ7/run-in-game`, materialization orchestration, hash computation, row/setup/start verification, and failure envelopes. Keep raw direct-control command strings out of request payloads.
- [inferred] `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`: support temp/overlay materialization and emit hash metadata for map entries.
- [inferred] `mods/mod-swooper-maps/src/maps/configs/canonical.ts`: only adjust if a shared canonical hash/envelope helper belongs beside validation; do not add seed to the schema.
- [inferred] `packages/civ7-direct-control/src/index.ts`: add setup-owned wrappers for map row verification and setup/start parameter application if not already available. Direct-control owns JavaScript command strings.
- [rejected] Do not edit `mods/mod-swooper-maps/mod/**`, `dist/**`, deployed Mods, or generated source by hand.

## Tests And Proof Gates

- [inferred] Studio unit tests: request assembly preserves seed outside `pipelineConfig`, chooses durable vs disposable policy correctly, and does not call browser runner for Run in Game.
- [inferred] Studio server tests: endpoint rejects unknown recipe ids, invalid seed, invalid map size, bad source paths, raw command fields, and malformed envelopes.
- [inferred] Swooper generator tests: overlay `studio-current` produces the expected map row/file/hash metadata without mutating authored configs.
- [inferred] Direct-control tests: setup wrappers validate parameter names/values, bound catalog reads, and reject unsafe/raw setup commands.
- [inferred] Integration proof: generated/deployed row exists, Civ setup sees exact map row, setup applies map script/map size/map seed, post-start `GameplayMap.getRandomSeed()` and dimensions match request, and fresh Swooper log hash matches expected `configHash`.
- [source-proven] Existing relevant commands are package-local `bun run --cwd apps/mapgen-studio build`, `bun run --cwd mods/mod-swooper-maps test/check/build`, and `bun run --cwd packages/civ7-direct-control test/check/build`; exact final gate should be scoped by touched files.

## P1 Risks

- [unresolved] Reload semantics may require full Civ process restart for changed/generated map rows. If true, the product contract must reframe Run in Game around explicit reload/restart semantics.
- [unresolved] Setup map row visibility may not be readable through current `GameInfo.Maps` wrappers. A direct-control setup catalog wrapper may need `Database` in App UI/shell, with live proof.
- [inferred] A disposable `studio-current` implemented by writing into `src/maps/configs` can dirty source/generated artifacts or fail mid-cleanup. Prefer temp materialization.
- [inferred] Hash proof can be false confidence if it is computed from a different normalization path than the generated map entry uses. Use one canonical serializer and compare server expected hash to runtime log.

## P2 Risks

- [source-proven] Browser Run currently uses fixed latitude bounds while saved envelopes can carry preset latitude bounds. Run in Game must define whether launch uses selected envelope latitude bounds, current UI bounds, or future map options.
- [inferred] `worldSettings.resources` currently affects browser mock adapter only; Civ Run needs an explicit setup parameter mapping or must mark resources-mode launch support unresolved.
- [inferred] Existing Save to Current converts local scratch configs into repo-backed configs. Run in Game must avoid surprising persistence when the user intended disposable launch.
- [inferred] Existing restart endpoint can leave saved/deployed config after restart failure. Run in Game needs clearer partial-failure result fields: `materialized`, `deployed`, `rowVerified`, `setupApplied`, `started`, `postStartVerified`.

## Next Steps

1. [unresolved] Live-prove setup row visibility for a generated Swooper map row from App UI/shell and record the exact read wrapper needed.
2. [unresolved] Live-prove setup/start mutation sequence for `Map.Script`, `Map.SizeType`, `Map.RandomSeed`, and required single-player defaults through `@civ7/direct-control`.
3. [inferred] Design the direct-control setup wrapper API before Studio endpoint code, so Studio never owns raw setup JavaScript.
4. [inferred] Implement temp/overlay `studio-current` materialization and hash logging before wiring UI.
5. [inferred] Add the Studio endpoint/UI and tests, then run the live proof ledger end to end.
