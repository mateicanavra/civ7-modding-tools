# Packet 9 Verification Evidence

Packet: `swooper-catalog-index-cutover`

Status: Packet 9 static, behavior, OpenSpec, Habitat, classify-reported,
review, and workspace hygiene gates are green.

## Product Evidence

Catalog generation now treats `CatalogSourceIndex` as the durable source owner.
The Swooper mod generator reads indexed config paths rather than discovering
catalog membership from the configs directory, while the Studio catalog
generator emits only the three Studio map-catalog metadata files. Full mod and
runtime generated artifacts remain owned by the mod generation path.

Studio operation deploy generation now adds a selected, explicit config overlay
by id/path. That overlay is not durable catalog membership: normal catalog and
mod generation ignore ambient Studio proof environment, and deploy-only selected
configs enter generated outputs only through the deploy target.

SA-09 is registered as Habitat structure authority:
`structure-swooper-catalog-index-target-topology`. It keeps the catalog source
files and Studio metadata generator present and prevents the retired Packet 4
transitional advisory rule from returning. Target behavior and metadata-only
output classes are proven by Nx target execution and behavior tests rather than
by a custom topology script.

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Result | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- |
| focused-index-cutover-tests | Required | `bun test mods/mod-swooper-maps/test/config/catalog-generation-index-cutover.test.ts mods/mod-swooper-maps/test/config/catalog-source-index.test.ts mods/mod-swooper-maps/test/config/map-artifact-file-plan.test.ts apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts` | Exit `0`; `23` tests passed; `135` expects | Index order defines emitted Studio catalog metadata; missing/invalid indexed sources fail before metadata emission; metadata file plan excludes runtime mod artifacts; deploy commands pass explicit selected config id/path and scrub stale proof env. | PASS |
| studio-recipes-target | Required packet target gate | `nx run mod-swooper-maps:build:studio-recipes --skip-nx-cache --outputStyle=static` | Exit `0`; `gen:studio-map-catalog` generated `9` Studio catalog map configs from `CatalogSourceIndex` | Studio recipe/catalog target can build metadata through the new catalog metadata generator. | PASS |
| mod-studio-run-target | Required packet regression gate | `nx run mod-swooper-maps:test:studio-run-in-game --skip-nx-cache --outputStyle=static` | Exit `0`; `17` tests passed; `234` expects | Existing Swooper Run in Game behavior remains green after the catalog cutover. | PASS |
| normal-gen-proof-env-ignored | Required cache-soundness proof | `SWOOPER_STUDIO_RUN_ID=ambient-proof SWOOPER_STUDIO_LAUNCH_CONFIG_ID=swooper-earthlike SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST=ambient-digest nx run mod-swooper-maps:gen:map-artifacts --skip-nx-cache --outputStyle=static`; then `rg -n "ambient-proof|ambient-digest" mods/mod-swooper-maps/src/maps/generated mods/mod-swooper-maps/mod` | Exit `0` for generation; `rg` exit `1` with no matches | Regular mod artifact generation ignores ambient Studio proof env and remains cache-sound for the indexed catalog. | PASS |
| selected-deploy-overlay-proof | Required operation deploy proof | Create ignored `studio-current.config.json`; run `SWOOPER_STUDIO_DEPLOY_CONFIG_ID=studio-current SWOOPER_STUDIO_DEPLOY_CONFIG_PATH=mods/mod-swooper-maps/src/maps/configs/studio-current.config.json SWOOPER_STUDIO_RUN_ID=studio-run-in-game-proof SWOOPER_STUDIO_LAUNCH_CONFIG_ID=studio-current SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST=launch-envelope-digest-proof nx run mod-swooper-maps:build:studio-deploy --skip-nx-cache --outputStyle=static`; inspect generated markers; remove transient files; rerun `nx run mod-swooper-maps:build --skip-nx-cache --outputStyle=static`; assert no `studio-current` or proof markers remain | Exit `0`; deploy build generated `10` configs only for the explicit deploy overlay; proof markers appeared only in `studio-current` generated outputs; normal build restored the indexed `9` config state with no proof/transient markers. | Operation deploy can materialize exactly one explicit selected config without adding it to durable catalog membership or leaking proof markers into other generated artifacts. | PASS |
| mod-check | Required classify-reported gate | `nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` | Exit `0` | Swooper package build/typecheck surface remains green. | PASS |
| mod-test | Required classify-reported gate | `nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static` | Exit `0`; `517` tests passed; `2` existing tests skipped; `0` failed; `14783` expects; owner Habitat check passed `85` rules with `0` failing | Full Swooper behavior and owner authority remain green. | PASS |
| app-check | Required app gate | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | Exit `0` | Studio app type/build surface remains green. | PASS |
| app-test | Required app gate | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | Exit `0`; `67` files and `382` tests passed | Studio app behavior remains green. | PASS |
| contract-check | Required contract gate | `nx run studio-contract:check --skip-nx-cache --outputStyle=static` | Exit `0` | Studio contract types remain green. | PASS |
| server-check | Required server gate | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | Exit `0` | Studio server type/build surface and transitive oRPC/control checks remain green. | PASS |
| ui-check | Required UI gate | `nx run mapgen-studio-ui:check --skip-nx-cache --outputStyle=static` | Exit `0` | Studio UI component package types and tests types remain green. | PASS |
| studio-preflight-rebuild | Required operational app gate | `rm -f mods/mod-swooper-maps/dist/recipes/standard-map-configs.js && node apps/mapgen-studio/scripts/ensure-studio-recipe-artifacts.mjs && test -f mods/mod-swooper-maps/dist/recipes/standard-map-configs.js` | Exit `0`; preflight invoked `nx run mod-swooper-maps:build:studio-recipes --outputStyle=static` and regenerated `standard-map-configs.js` | Studio preflight rebuilds missing catalog metadata through the owning Nx target, not a stale package-local script. | PASS |
| sa09-structure | Required authority gate | `bun habitat check --rule structure-swooper-catalog-index-target-topology --json` | Exit `0`; rule status `pass`; empty locked baseline | SA-09 Habitat structure authority is registered and current tree satisfies it. | PASS |
| mapgen-studio-owner-habitat | Required classify/Habitat gate | `bun habitat check --owner mapgen-studio --json` | Exit `0`; `ok: true`; `11` rules passed | MapGen Studio authority remains green. | PASS |
| habitat-classify-swooper | Required classify gate | `bun habitat classify mods/mod-swooper-maps` | Exit `0`; reported `nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test`, and `bun run lint` | Classify-reported Swooper gates were run. | PASS |
| habitat-classify-studio | Required classify gate | `bun habitat classify apps/mapgen-studio` | Exit `0`; reported `nx run mapgen-studio:check`, `nx run mapgen-studio:test`, and `bun run lint` | Classify-reported Studio gates were run. | PASS |
| habitat-classify-sa09 | Required classify gate | `bun habitat classify .habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-index-target-topology` | Exit `0`; reported workspace lint and SA-09 exact-path routing | Habitat authority file routing was inspected and the reported runnable gate was run. | PASS |
| openspec-strict | Required | `bun run openspec -- validate swooper-catalog-index-cutover --strict` | Exit `0`; change is valid | OpenSpec packet remains valid. | PASS |
| workspace-lint | Required workspace hygiene gate | `bun run lint` | Exit `0`; lint succeeded for `9` projects after fixing the new test import ordering | Workspace lint remains green. | PASS |
| diff-check | Required workspace hygiene gate | `git diff --check` | Exit `0`; no whitespace or conflict-marker findings | Patch hygiene remains clean before commit. | PASS |

The first attempted parallel verification run is discarded as proof: concurrent
Nx targets raced on shared build outputs and `control-direct:build-bundle`
reported an `ENOENT` unlink failure. Serial reruns of the same gates passed.

## Authority Notes

- SA-09 uses Habitat `structure`; it does not introduce a custom topology
  script or a parallel `.grit` authority tree.
- The structure rule intentionally checks durable file/source topology and
  retired advisory removal. It does not mirror exact Nx JSON shape.
- Metadata-only target behavior is proven by executing
  `mod-swooper-maps:build:studio-recipes`, by the metadata file-plan behavior
  test, and by app/contract/server/UI checks.
- `gen:map-artifacts` does not consume Studio proof environment during regular
  generation. Operation-specific deploy overlay support is isolated to
  `gen:studio-deploy-map-artifacts`.
- `gen:studio-map-catalog` does not consume request environment state and does
  not emit runtime mod artifacts.

## Review Lanes

Required review lanes passed after reviewer findings were repaired:

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring | Catalog index loader and metadata/mod file-plan split, fixture seams, reachable state, public type drift, and JSDoc/anchor comments. | PASS after repairing selected deploy config id/path mismatch rejection, stale proof env scrubbing, normal generation proof-env isolation, and dead directory-scan helper removal. |
| Code quality / structure / Habitat | No custom topology scripts, Habitat structure appropriateness, non-brittle authority, ownership, target split, and JSDoc/anchor comments. | PASS. Reviewer confirmed SA-09 is narrow Habitat `structure` authority, not a custom topology script or brittle code mirror. |
| oRPC / Effect / library correctness | No oRPC/Effect contract drift, TypeBox/config validation, Nx metadata semantics, Bun filesystem failure behavior, and safe error boundaries. | PASS after repairing normal `gen:map-artifacts` cache-soundness and explicit deploy config id/path admission. |
