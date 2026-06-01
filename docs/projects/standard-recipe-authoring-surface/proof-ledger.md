# Standard Recipe Authoring Surface Proof Ledger

## 2026-05-31: Corpus And Taxonomy Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/standard-recipe-authoring-surface-workstream --no-interactive` | New branch on top of the current stack in `wt-agent-dra-authoring-surface-handoff-reference`. |
| Graphite stack | `gt ls --stack --no-interactive` | Current branch is `codex/standard-recipe-authoring-surface-workstream` above the authoring handoff branch. |
| Narsil status | restarted `com.rawr.narsil-mcp-civ7` launch agent; used `list_repos`, `get_recent_changes`, `get_hotspots`, `find_symbols`, and `find_references` | Narsil indexed the Civ7 repo and supplied hotspots/references. Hybrid search was avoided after crash risk. |
| TypeBox/runtime stage inspection | `bun run scripts/report-standard-authoring-surface.ts --format=summary` | Enumerated 17 standard stages, all stage surface keys, field counts, raw-envelope counts, description gaps, step/op strategies, generated artifacts, shipped configs, Studio focus paths, and runtime read sites. |
| JSON corpus completeness check | `bun run scripts/report-standard-authoring-surface.ts --format=json`; duplicate-path check over `/tmp/standard-authoring-ledger.json` | `stageRows=17`, `fieldRows=761`, `stepRows=50`, `focusRows=50`, `duplicateFieldPathCount=0`. |
| Foundation raw-envelope proof | direct TypeBox inspection of `foundation.surfaceSchema.properties.mesh` | Public `foundation.mesh.computeMesh` contains raw op envelope `strategy/config` and low-level config fields. |
| Morphology public-surface proof | stage runtime inspection and existing OpenSpec `morphology-public-config-surface` | Morphology exposes semantic public keys and no raw op-envelope selectors. |
| Studio consumer path | `apps/mapgen-studio/src/recipes/catalog.ts`, `apps/mapgen-studio/src/App.tsx`, generator scripts | Studio consumes generated schema/default/uiMeta and `configFocusPathWithinStage`. |
| OpenSpec validation | `bun run openspec -- validate authoring-surface-corpus-and-taxonomy --strict` | Passed. |
| Peer-agent review | Corpus reviewer and taxonomy/OpenSpec reviewer | P1/P2 findings accepted and repaired; see `review-disposition-ledger.md`. |
| Whitespace check | `git diff --check` | Passed. |
| Package TypeScript check | `bun run check` in `mods/mod-swooper-maps` | Not used as a passing gate for this docs/diagnostic slice. It currently fails on existing generated map imports that cannot resolve `@mateicanavra/civ7-sdk/mapgen`. |

## Required Gates For Later Behavior Slices

| gate | command or evidence |
| --- | --- |
| OpenSpec validation | `bun run openspec -- validate <change-id> --strict` |
| TypeScript/schema generator check | Package-local `bun` scripts for touched package and generator scripts that own artifacts. |
| Config validation | `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`, `presets-schema-valid.test.ts`, and `studio-presets-schema-valid.test.ts`. |
| Compile determinism | Focused compiled-config snapshot or golden tests for touched stages. |
| Unknown-key failure | Focused tests proving removed fields fail strict validation with clear errors. |
| Studio proof | Generated schema/default/uiMeta assertions and, when needed, Studio form inspection. |
| Runtime proof | `@civ7/direct-control` or Studio runtime proof only for behavior-changing slices. |

## 2026-05-31: Foundation Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/foundation-authoring-surface-alignment --no-interactive` | New behavior-slice branch above `codex/standard-recipe-authoring-surface-workstream`. |
| Public schema boundary | `bun test test/config/maps-schema-valid.test.ts ...` in `mods/mod-swooper-maps` | Foundation public schema exposes `knobs`, `meshResolution`, `mantleSources`, `mantleForcing`, `lithosphere`, `platePartition`, `plateMotion`, `tectonicSegmentation`, `tectonicEras`, `tectonicFields`, and `tectonicRollups`; no public raw `{ strategy, config }` envelope and no derived `meshResolution.cellCount`. |
| Shipped config migration | `mods/mod-swooper-maps/src/maps/configs/*.config.json` plus `maps-schema-valid.test.ts` | Four shipped configs migrated to semantic Foundation groups and validate. |
| Compile mapping | `maps-schema-valid.test.ts` Foundation compile assertion | Semantic Foundation groups compile to internal step/op envelopes with default strategies and default internal projection/topology behavior. |
| Public documentation | `bun run scripts/report-standard-authoring-surface.ts --format=summary`; `maps-schema-valid.test.ts` Foundation description guard | Foundation reports `desc missing/weak=0/0`; every Foundation public schema field has a description. |
| Unknown-key failure | `bun test test/standard-compile-errors.test.ts` | Legacy Foundation raw step/op envelope keys and derived `foundation.meshResolution.cellCount` fail strict validation with unknown-key errors. |
| Studio schema/default proof | `bun test test/config/defaultConfigSchema.test.ts` in `apps/mapgen-studio` | Studio default config validates; generated standard schema exposes semantic Foundation keys and no raw envelope keys. |
| Generated artifact regeneration | `bun run build:studio-recipes` in `mods/mod-swooper-maps` | Regenerated standard recipe/browser recipe dist outputs and four source map artifacts; tracked source artifact hash churn is from persisted config shape changes. |
| Ledger refresh | `bun run scripts/report-standard-authoring-surface.ts --format=summary` | Foundation now reports `surface keys=knobs, meshResolution, mantleSources, mantleForcing, lithosphere, platePartition, plateMotion, tectonicSegmentation, tectonicEras, tectonicFields, tectonicRollups`, `fields=61`, `raw envelope rows=0`, `desc missing/weak=0/0`, `numeric bounded=47/47`. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-foundation-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated from pre-slice commit `81dcd57bc` by compiling shipped Foundation configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current migrated shipped configs compile to the same stable `compiled.foundation` objects. |
| OpenSpec validation | `bun run openspec -- validate foundation-authoring-surface-alignment --strict` | Passed. |
| Package TypeScript check | `bun run check` in `mods/mod-swooper-maps` | Fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type test; new Foundation optional-ops errors were repaired. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims shipped-config compile equivalence, schema/default proof, and artifact regeneration only; it does not claim new generated-map behavior. |

## 2026-05-31: Morphology Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/morphology-authoring-surface-alignment --no-interactive` | New slice branch above `codex/foundation-authoring-surface-alignment`. Primary worktree was detached at the foundation head for Narsil indexing. |
| Narsil status | `list_repos`; avoided `hybrid_search` | Narsil MCP was responsive and indexed the primary Civ7 checkout. No restart was needed for this slice. |
| Public schema boundary | `bun test test/config/maps-schema-valid.test.ts test/standard-compile-errors.test.ts` in `mods/mod-swooper-maps` | Morphology stages expose semantic public keys only, with no raw `{ strategy, config }` public envelope; legacy Morphology step/op envelope config and out-of-range public numeric controls fail strict validation. |
| Public documentation and ranges | `bun run scripts/report-standard-authoring-surface.ts --format=summary` | Morphology reports: `morphology-coasts` raw `0`, docs `0/0`, numeric `59/59`; `morphology-routing` raw `0`, docs `0/0`, numeric `0/0`; `morphology-erosion` raw `0`, docs `0/0`, numeric `6/6`; `morphology-features` raw `0`, docs `0/0`, numeric `67/67`. |
| Compile mapping | `maps-schema-valid.test.ts` Morphology compile assertion | Public Morphology groups compile to internal executable step/op envelopes with default strategies for coasts, routing, erosion, islands, mountain family, volcanoes, and landmasses. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-morphology-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated before Morphology schema edits by compiling shipped Morphology configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current shipped configs compile to the same stable Morphology objects. |
| Generated artifact regeneration | `bun run build:studio-recipes` in `mods/mod-swooper-maps` | Regenerated standard recipe/browser recipe dist outputs, Studio recipe type artifacts, and source map artifacts; no tracked generated source artifacts changed because this slice changes schema metadata, not config values. |
| Studio schema/default proof | `bun test test/config/defaultConfigSchema.test.ts` in `apps/mapgen-studio` | Passed 7 tests / 108 expects. Studio default config validates; generated standard schema exposes only semantic Morphology keys, documented/range-bounded public fields, and author-facing stage descriptions. |
| Shipped configs and presets | `bun test test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/standard-compile-errors.test.ts test/m11-config-knobs-and-presets.test.ts` in `mods/mod-swooper-maps` | Passed 28 tests / 313 expects. |
| OpenSpec validation | `bun run openspec -- validate morphology-authoring-surface-alignment --strict` | Passed. |
| Peer-agent review | Implementation/schema peer and OpenSpec/proof peer | P1/P2 findings accepted and repaired; see `review-disposition-ledger.md`. |
| Package TypeScript check | `bun run check` in `mods/mod-swooper-maps` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type test; no new Morphology type errors were reported. |
| Whitespace check | `git diff --check` | Passed. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims schema/default proof and shipped-config compile equivalence only; it does not claim new generated-map behavior. |

## 2026-05-31: Hydrology Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/hydrology-authoring-surface-alignment --no-interactive` | New slice branch above `codex/morphology-authoring-surface-alignment`. Primary worktree remained detached at the Morphology head until this slice is committed for Narsil indexing. |
| Narsil status | `get_index_status`; avoided `hybrid_search` | Narsil MCP was responsive and indexed the primary Civ7 checkout. No restart was needed during this slice. |
| Public schema boundary | `bun test test/config/maps-schema-valid.test.ts test/standard-compile-errors.test.ts` in `mods/mod-swooper-maps` | Hydrology stages expose semantic public keys only, with no raw `{ strategy, config }` public envelope; legacy Hydrology step/op envelope config, stale public strategy selectors, and out-of-range public numeric controls fail strict validation. |
| Public documentation and ranges | `bun run scripts/report-standard-authoring-surface.ts --format=summary` | Hydrology reports: `hydrology-climate-baseline` raw `0`, docs `0/0`, numeric `53/53`; `hydrology-hydrography` raw `0`, docs `0/0`, numeric `11/11`; `hydrology-climate-refine` raw `0`, docs `0/0`, numeric `51/51`. |
| Compile mapping | `maps-schema-valid.test.ts` Hydrology compile assertion | Public Hydrology groups compile to internal executable step/op envelopes with selected default/refine strategies for climate baseline, hydrography, and climate refine runtime steps. |
| Shipped config migration | `mods/mod-swooper-maps/src/maps/configs/*.config.json`; `maps-schema-valid.test.ts` Hydrology shipped-config assertion | Four shipped map configs migrated from raw Hydrology envelopes to semantic public keys and validate without compatibility shims. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-hydrology-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated before Hydrology migration by compiling shipped Hydrology configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current migrated shipped configs compile to the same stable Hydrology objects. |
| Runtime-oriented Hydrology tests | `bun test test/hydrology-knobs.test.ts test/hydrology-seasonality-modes.test.ts test/pipeline/circulation-v2.integration.test.ts` in `mods/mod-swooper-maps` | Passed 9 tests / 31 expects. Tests author through semantic public Hydrology keys while asserting compiled/runtime effects for knobs, seasonal amplitudes, circulation, currents, and SST determinism. |
| Generated artifact regeneration | `bun run build:studio-recipes` in `mods/mod-swooper-maps` | Regenerated standard recipe/browser recipe dist outputs, Studio recipe type artifacts, and four generated source map artifacts from migrated source configs. |
| Studio schema/default proof | `bun test test/config/defaultConfigSchema.test.ts` in `apps/mapgen-studio` | Passed 11 tests / 252 expects. Studio default config validates; generated standard schema exposes semantic Hydrology keys, documented/range-bounded public fields, runtime step focus paths, and the legacy source default helper stays on the semantic Hydrology surface. |
| Shipped configs, presets, compile, and Hydrology runtime suite | `bun test test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/standard-compile-errors.test.ts test/m11-config-knobs-and-presets.test.ts test/hydrology-knobs.test.ts test/hydrology-seasonality-modes.test.ts test/pipeline/circulation-v2.integration.test.ts` in `mods/mod-swooper-maps` | Passed 46 tests / 560 expects. |
| OpenSpec validation | `bun run openspec -- validate hydrology-authoring-surface-alignment --strict` | Passed. |
| Package TypeScript check | `bun run check` in `mods/mod-swooper-maps` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type test; new Hydrology schema-helper type errors were repaired. |
| Whitespace check | `git diff --check` | Passed. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims schema/default proof, Hydrology-focused runtime tests, and shipped-config compile equivalence only; it does not claim new generated-map behavior. |

## 2026-06-01: Ecology Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/ecology-authoring-surface-alignment --no-interactive` | New slice branch above `codex/hydrology-authoring-surface-alignment`. Primary worktree was detached at the Hydrology head for Narsil indexing before this branch was committed. |
| Narsil status | `list_repos`; avoided `hybrid_search` | Narsil MCP was responsive and indexed the primary Civ7 checkout. No restart was needed during this slice. |
| Public schema boundary | `bun test test/config/maps-schema-valid.test.ts test/standard-compile-errors.test.ts` in `mods/mod-swooper-maps` | Ecology stages expose semantic public keys only, with no raw `{ strategy, config }` public envelope; legacy Ecology step/op envelope config, stale public strategy selectors, plot-effect selector leakage, and out-of-range public numeric controls fail strict validation. |
| Public documentation and ranges | `bun run scripts/report-standard-authoring-surface.ts --format=summary` | Ecology reports: `ecology-pedology` raw `0`, docs `0/0`, numeric `29/29`; `ecology-biomes` raw `0`, docs `0/0`, numeric `29/29`; `ecology-features` raw `0`, docs `0/0`, numeric `106/106`. |
| Compile mapping | `maps-schema-valid.test.ts` Ecology compile assertion | Public Ecology groups compile to internal executable step/op envelopes with selected profile/default strategies for pedology, resource basins, biome classification, scoring, planning, and plot effects; recipe-owned plot-effect selectors are injected by compile. |
| Shipped config migration | `mods/mod-swooper-maps/src/maps/configs/*.config.json`; `maps-schema-valid.test.ts` Ecology shipped-config assertion | Four shipped map configs migrated from raw Ecology envelopes to semantic public keys and validate without compatibility shims. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-ecology-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated before Ecology migration by compiling shipped Ecology configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current migrated shipped configs compile to the same stable Ecology objects. |
| Generated artifact regeneration | `bun run build:studio-recipes` in `mods/mod-swooper-maps` | Regenerated standard recipe/browser recipe dist outputs, Studio recipe type artifacts, and four generated source map artifacts from migrated source configs. |
| Studio schema/default proof | `bun test test/config/defaultConfigSchema.test.ts` in `apps/mapgen-studio` | Passed 15 tests / 369 expects. Studio default config validates; generated standard schema exposes semantic Ecology keys, documented/range-bounded public fields, runtime step focus paths with empty Ecology public focus paths, and the legacy source default helper stays on the semantic Ecology surface. |
| Shipped configs, presets, and compile suite | `bun test test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/standard-compile-errors.test.ts` in `mods/mod-swooper-maps` | Passed 42 tests / 723 expects. |
| OpenSpec validation | `bun run openspec -- validate ecology-authoring-surface-alignment --strict` | Passed. |
| Package TypeScript check | `bun run check` in `mods/mod-swooper-maps` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type test; no new Ecology type errors were reported before those module-resolution failures. |
| Package TypeScript check | `bun run check` in `packages/mapgen-core` | Passed after correcting the legacy Ecology split-stage diagnostic. |
| Package TypeScript check | `bun run check` in `apps/mapgen-studio` | Passed. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims schema/default proof and shipped-config compile equivalence only; it does not claim new generated-map behavior. |

## 2026-06-01: Projection Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/projection-authoring-surface-audit --no-interactive` | New slice branch above `codex/ecology-authoring-surface-alignment`. Primary worktree was detached at the Ecology head for Narsil indexing before this branch was edited. |
| Narsil status | Restarted `com.rawr.narsil-mcp-civ7`; avoided `hybrid_search` | Narsil reported a complete index after restart, but structural `find_references` crashed the HTTP MCP server in this session. The server was restarted and this slice used local `rg`/file reads for code-intel proof instead of further Narsil calls. |
| Public schema boundary | `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/hydrology-knobs.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts` | Passed 55 tests / 917 expects. Projection stages expose semantic public keys only, with no raw `{ strategy, config }` public envelope; removed raw Projection step/op keys and invalid biome globals fail strict validation. |
| Public documentation, ranges, and enums | `bun mods/mod-swooper-maps/scripts/report-standard-authoring-surface.ts --format=json` | Projection reports: `map-morphology` raw `0`, docs `0/0`, numeric `0/0`; `map-hydrology` raw `0`, docs `0/0`, numeric `0/0`; `map-elevation` raw `0`, docs `0/0`, numeric `0/0`; `map-rivers` raw `0`, docs `0/0`, numeric `2/2`; `map-ecology` raw `0`, docs `0/0`, numeric `0/0`. Projection string leaves are enum/literal-guarded in tests. |
| Compile mapping | `maps-schema-valid.test.ts` Projection compile assertion | Public Projection groups compile to internal executable configs for map morphology, lake projection/readback, elevation rebuild, river modeling thresholds, biome bindings, feature application defaults, and plot-effect application defaults. |
| Biome binding default correction | `maps-schema-valid.test.ts`; `standard-compile-errors.test.ts`; `defaultConfigSchema.test.ts` | Omitted `map-ecology.biomeBindings.tropicalSeasonal` now normalizes to `BIOME_PLAINS`, matching the runtime resolver and shipped configs. `biomeBindings.marine` is fixed to `BIOME_MARINE`; non-marine values fail strict validation in MapGen and Studio schema tests. |
| Shipped config migration | `mods/mod-swooper-maps/src/maps/configs/*.config.json`; `maps-schema-valid.test.ts` Projection shipped-config assertion | Four shipped map configs migrated from raw Projection step/op keys to semantic public keys and validate without compatibility shims. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-projection-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated before Projection migration by compiling shipped Projection configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current migrated shipped configs compile to the same stable Projection objects. |
| Generated artifact regeneration | `bun run --cwd mods/mod-swooper-maps build:studio-recipes` | Regenerated standard recipe/browser recipe dist outputs, Studio recipe type artifacts, and four generated source map artifacts from migrated source configs. Tracked source artifact hash churn is from persisted config shape changes. |
| Studio schema/default proof | `bun test apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` | Passed 18 tests / 449 expects. Studio default config validates; generated standard schema exposes semantic Projection keys, documented/range/enum-bounded public fields, and runtime steps remain visible with empty focus paths for removed raw keys. |
| Shipped configs, presets, compile, and Studio suite | `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/presets-schema-valid.test.ts mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts mods/mod-swooper-maps/test/hydrology-knobs.test.ts apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` | Passed 78 tests / 1376 expects. |
| OpenSpec validation | `bun run openspec -- validate projection-authoring-surface-alignment --strict` | Passed. |
| Package TypeScript check | `bun run --cwd apps/mapgen-studio check` | Passed. |
| Package TypeScript check | `bun run --cwd packages/mapgen-core check` | Passed. |
| Package TypeScript check | `bun run --cwd mods/mod-swooper-maps check` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type test; new Projection implicit-any errors were repaired before recording this residual. |
| Whitespace check | `git diff --check` | Passed. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims schema/default proof and shipped-config compile equivalence only; it does not claim new generated-map behavior. |

## 2026-06-01: Placement Authoring Surface Alignment Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create codex/placement-authoring-surface-alignment --no-interactive` | New slice branch above `codex/projection-authoring-surface-audit`. Primary worktree was detached at the Projection head for Narsil indexing before this branch was edited. |
| Narsil status | Restarted `com.rawr.narsil-mcp-civ7`; used `list_repos` and project structure inspection; avoided `hybrid_search` | Narsil was responsive after restart. Because it indexes the primary checkout, local `rg`/TypeBox/runtime inspection supplied branch-local proof until the primary checkout is moved to this slice head after commit. |
| Public schema boundary | `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` | Passed 83 tests / 1518 expects. Placement exposes `knobs`, `naturalWonders`, `discoveries`, `floodplains`, and `resources`; raw placement step keys, op envelopes, `candidateResourceTypes`, and start-sector overrides are absent from public schema/defaults. |
| Public documentation and ranges | `bun run scripts/report-standard-authoring-surface.ts --format=json` in `mods/mod-swooper-maps` | Placement reports `layer=semantic-public-config`, `surfaceKeys=knobs,naturalWonders,discoveries,floodplains,resources`, `fields=13`, `rawEnvelopeRows=0`, `missing/weak descriptions=0/0`, and `numeric bounded=8/8`. |
| Compile mapping | `maps-schema-valid.test.ts` Placement compile assertion | Public Placement groups compile to internal `derive-placement-inputs` configs for wonders, natural wonders, discoveries, floodplains, resources, starts, and empty product/effect step configs. `candidateResourceTypes` and start-sector/player overrides are not accepted as public config; compile preserves the legacy internal resource/start envelopes for deterministic equivalence, while execution reads adapter resource catalogs and runtime start data from placement step inputs. |
| Shipped config migration | `mods/mod-swooper-maps/src/maps/configs/*.config.json`; `maps-schema-valid.test.ts` Placement shipped-config assertion | Four shipped map configs migrated from raw Placement step/op keys to semantic public keys and validate without compatibility shims. |
| Stable compiled-config equivalence | `mods/mod-swooper-maps/test/fixtures/legacy-placement-compiled.json`; `maps-schema-valid.test.ts` stable comparison | Checked-in golden fixture was generated before Placement migration by compiling shipped Placement configs with `seed=123`, `dimensions=80x60`, and `latitudeBounds=60/-60`; current migrated shipped configs compile to the same stable Placement objects. |
| Generated artifact regeneration | `bun run --cwd mods/mod-swooper-maps build:studio-recipes` | Regenerated standard recipe/browser recipe dist outputs, Studio recipe type artifacts, and four generated source map artifacts from migrated source configs. Tracked source artifact hash churn is from persisted config shape changes. |
| Studio schema/default proof | `bun test apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` | Passed 22 tests / 469 expects. Studio default config validates; generated standard schema exposes semantic Placement keys, documented/range-bounded public fields, and runtime Placement steps remain visible with empty focus paths for removed raw keys. |
| Shipped configs, presets, compile, and Studio suite | `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/presets-schema-valid.test.ts mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` | Passed 85 tests / 1519 expects. |
| Placement operation suite | `bun test mods/mod-swooper-maps/test/placement/plan-ops.test.ts mods/mod-swooper-maps/test/placement/placement-contracts.test.ts mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts mods/mod-swooper-maps/test/placement/resources-landmass-region-restamp.test.ts mods/mod-swooper-maps/test/placement/landmass-region-id-projection.test.ts` | Passed 25 tests / 618 expects. Existing runtime placement behavior remains covered while this slice changes the authoring schema boundary. |
| OpenSpec validation | `bun run openspec -- validate placement-authoring-surface-alignment --strict` | Passed. |
| Package TypeScript check | `bun run --cwd apps/mapgen-studio check` | Passed. |
| Package build/check | `bun run --cwd packages/mapgen-core build`; `bun run --cwd packages/mapgen-core check` | Passed. |
| Package TypeScript check | `bun run --cwd mods/mod-swooper-maps check` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type inference test; no new Placement type errors were reported before those module-resolution failures. |
| Runtime proof | direct-control/Studio runtime | Not run. The slice claims schema/default proof, placement operation coverage, and shipped-config compile equivalence only; it does not claim new generated-map behavior. |

## 2026-06-01: Studio/SDK Authoring Surface Guards Slice

| evidence | command or source | result |
| --- | --- | --- |
| Graphite isolation | `gt create --no-interactive --no-ai codex/studio-sdk-authoring-surface-guards` | New guard-hardening branch above `codex/placement-authoring-surface-alignment`. |
| Narsil status | Primary checkout detached to Placement head; restarted `com.rawr.narsil-mcp-civ7`; used `list_repos` and `get_file`; avoided `hybrid_search` | Narsil was responsive and indexed the primary checkout. Branch-local proof used direct file reads/tests until the primary checkout is moved to this slice head after commit. |
| Stale identity test repair | `bun test mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts` | Passed 1 test / 108 expects. The test now asserts public shipped configs expose semantic Ecology feature authoring, while compiled internal planners preserve the tuned vegetation, wetland, ice, and reef strategy configs. |
| Source authoring surface guards | `bun test mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts` | Passed 2 tests / 248 expects. All 17 standard stages use `semantic-public-config`, recursive public object schemas are strict, approved public keys match source, no public raw `{ strategy, config }`, and focus paths do not point at raw envelope keys. |
| Generated map/SDK boundary guards | `standard-authoring-surface-guards.test.ts` | Generated map entrypoints match canonical config ids, import `../configs/<id>.config.json`, call exactly `canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)` as the SDK `createMap` config expression, record exact recomputed source `configHash`/`envelopeHash`, and do not inline raw placement configs or strategy/config envelopes. |
| Studio artifact guards | `bun test apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts` | Passed 4 tests / 155 expects. Generated standard schema and UI metadata match source recipe stages, generated default config matches normalized `swooper-earthlike.config.json`, catalog/runtime entries share the same generated artifacts, UI focus paths land on public schema/default paths, and built-in presets validate without raw envelopes. |
| Shipped config, preset, Studio, and guard suite | `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/presets-schema-valid.test.ts mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts mods/mod-swooper-maps/test/config/shipped-map-identity.test.ts mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts apps/mapgen-studio/test/config/defaultConfigSchema.test.ts apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts` | Passed 69 tests / 1981 expects after accepted P2 repairs. |
| OpenSpec validation | `bun run openspec -- validate studio-sdk-authoring-surface-guards --strict` | Passed. |
| Package TypeScript check | `bun run --cwd apps/mapgen-studio check` | Passed. |
| Package build/check | `bun run --cwd packages/mapgen-core build`; `bun run --cwd packages/mapgen-core check` | Passed. |
| Package TypeScript check | `bun run --cwd mods/mod-swooper-maps check` | Still fails only on existing unresolved `@mateicanavra/civ7-sdk/mapgen` imports in generated maps and one type inference test; this guard slice did not add new mod type-check failures before those module-resolution failures. |
| Whitespace check | `git diff --check` | Passed. |
| Runtime proof | direct-control/Studio runtime | Not run. This guard slice changes tests/OpenSpec/docs only and claims generated artifact/config boundary proof, not generated-map behavior changes. |
