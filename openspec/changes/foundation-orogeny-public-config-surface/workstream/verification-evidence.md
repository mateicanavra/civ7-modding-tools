# Verification Evidence

Packet: `foundation-orogeny-public-config-surface`

Date: 2026-07-08

| Gate | Required | Command Or Protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| openspec-strict | required | `bun run openspec -- validate foundation-orogeny-public-config-surface --strict` | packet files written | passed | terminal output: `Change 'foundation-orogeny-public-config-surface' is valid` | change validates strictly | passed |
| habitat-classify | required | `bun habitat classify <write-set>` for the Packet 1 source, test, and Habitat files | implementation diff exists | passed | `/tmp/mapgen-packet1-classify/*.txt`; reported commands were `nx run mapgen-studio:check`, `nx run mapgen-studio:test`, `nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test`, `bun run lint` | reported authority checks are known | passed |
| generated-recipe-artifacts | required | `nx run mod-swooper-maps:build:studio-recipes` | public schema changed | passed | generated 9 Studio catalog map configs and rebuilt standard recipe bundle; no tracked generated diff remained | artifacts derive from stage owner schema/compile code | passed |
| focused-studio-config-tests | required | `nx run mapgen-studio:test -- test/config/defaultConfigSchema.test.ts test/config/standardRecipeArtifactGuards.test.ts test/presets/importFlow.test.ts` | generated recipe artifacts refreshed | passed | 3 files, 27 tests | Studio default config, presets, and import flow expose only public config and reject imported legacy envelopes | passed |
| focused-swooper-config-tests | required | `bun test mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts mods/mod-swooper-maps/test/standard-compile-errors.test.ts mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts` | generated recipe artifacts refreshed | passed | 4 files, 19 tests | public `crustCharacter` compiles to internal `crust-evolution` only at recipe compile; stale raw stage keys are rejected | passed |
| generated-entrypoint-selector | required | `bun .habitat/blueprints/mod-map/validate_generated_map_entrypoint_contracts/check.ts`; `bun test mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts` | untracked scratch config present in `src/maps/configs` | passed | Habitat check passed; 2 tests passed | shipped generated map entrypoints are selected from `CatalogSourceIndex`, not incidental files in the config directory | passed |
| public-authoring-surface-rule | required | `bun .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/check.ts` | public key matrix updated | passed | no findings | Foundation Orogeny public keys are `knobs` and `crustCharacter`; old `crust-evolution` key is not public | passed |
| mapgen-studio-check | classify-reported | `nx run mapgen-studio:check` | implementation diff exists | passed | TypeScript project check completed | Studio touched tests and imports typecheck | passed |
| mapgen-studio-test | classify-reported | `nx run mapgen-studio:test` | implementation diff exists | passed | 69 files, 412 tests | full Studio test suite remains green | passed |
| mod-swooper-maps-check | classify-reported | `nx run mod-swooper-maps:check` | implementation diff exists | passed | TypeScript project check completed | Swooper Maps source/tests typecheck | passed |
| mod-swooper-maps-test | classify-reported | `nx run mod-swooper-maps:test` | implementation diff exists | passed | 144 files, 519 passed, 2 skipped, 0 failed; Habitat owner check also passed 85 rules | full Swooper Maps test suite remains green under catalog-index-generated entrypoint selection | passed |
| changed-file-lint | classify-related | `bunx biome check <Packet 1 changed files>` | Packet 1 files formatted and imports organized | passed | 13 files checked | Packet 1 files satisfy current Biome/Effect plugin lint rules | passed |
| workspace-lint | classify-reported | `bun run lint` | dedicated downstack `codex/effect-biome-lint-baseline-stabilization` branch inserted above the Effect audit branch | passed | root lint ran 9 project lint targets successfully | workspace lint is green at the Packet 1 stack head without folding repo-wide Effect lint remediation into this packet | passed |
| review-type-script-refactoring | required | Dedicated TypeScript refactoring review lane | implementation diff exists | completed | reviewer reported no blocking findings; low findings accepted for typed Foundation Orogeny public config and new `any` removal | TypeScript boundary is not unnecessarily loose | passed |
| review-code-quality-structure | required | Dedicated code quality/structure review lane | implementation diff exists | completed | reviewer reported no blocking findings | packet is minimal, owns the stage boundary, and avoids Studio-side scrubbing | passed |
| review-library-correctness | required | Dedicated library/API correctness review lane | implementation diff exists | completed | reviewer reported no blocking findings in packet files; high note on untracked `earthlike-wowza.config.json` dispositioned as scratch-only and excluded from commit | TypeBox, authoring API, oRPC/Effect non-touch, and generated artifact expectations are correct | passed |
| review-habitat-entrypoint-selector | required after red gate | Dedicated Habitat authority investigation lane | `mod-swooper-maps:test` initially failed in generated-entrypoint check | completed | reviewer confirmed guardrail is valid and selector should use `CatalogSourceIndex`; fix implemented in Habitat check and package-local test | scratch config files must not become implicit shipped SDK map membership | passed |
| sequencing-review | required after workspace lint red | Dedicated verification sequencing lane | workspace lint failed from lower stack | completed | reviewer recommended keeping Packet 1 focused, committing it as an upstack checkpoint, and inserting a dedicated Effect lint baseline stabilization branch below it | repo-wide Effect lint remediation is a separate changeset | passed |

## Stack Baseline Resolution

`bun run lint` is green at this stack head after inserting the dedicated
`codex/effect-biome-lint-baseline-stabilization` branch below Packet 1 and above
the Effect audit branch. That branch is scoped to the repo-wide Effect Biome
diagnostics introduced by the audit layer; Packet 1 remains scoped to the
Foundation Orogeny public config surface.

The Packet 1 verification rerun after restacking confirmed:

- `bun run openspec -- validate foundation-orogeny-public-config-surface --strict`
  passed;
- `bun run lint` passed;
- `bunx biome check <Packet 1 changed files>` passed;
- `nx run mapgen-studio:check` and `nx run mod-swooper-maps:check` passed;
- `nx run mapgen-studio:test` passed with 69 files and 412 tests;
- `nx run mod-swooper-maps:test` passed with 144 files, 519 passed, 2 skipped,
  and 0 failed; the Habitat owner check inside that target passed 85 rules;
- direct generated-entrypoint and public-authoring-surface Habitat checks
  passed after `nx run mod-swooper-maps:gen:maps` materialized generated map
  sources.
