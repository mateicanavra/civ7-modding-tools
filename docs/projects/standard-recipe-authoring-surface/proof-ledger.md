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
