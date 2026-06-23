# Hidden Test Authority Ledger

Status: active investigation ledger for `agent-DRA-habitat-hidden-test-authority-audit`

## Frame

This pass identifies tests and scripts that encode Habitat authority while living
in package-local test or script trees. Current code and executable checks win
over historical docs. Product behavior tests stay package-local. Structural
authority moves only when the oracle is explicit enough to preserve the same
failure signal.

Repo-state baseline before edits:

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`
- Base branch: `agent-DRA-habitat-authority-placement-cleanup`
- Base commit: `9320b84a8`
- New slice: `agent-DRA-habitat-hidden-test-authority-audit`
- Initial status: clean

## Evidence Policy

| Claim strength | Meaning |
| --- | --- |
| verified | Current code path, test, or Habitat subject was inspected and command behavior was checked where feasible. |
| plausible | Current code was inspected, but migration needs a narrower follow-up slice. |
| non-claim | The row is intentionally not treated as Habitat authority in this pass. |

## Classification Rows

| Candidate | Assertion surface | Classification | Habitat home | Migration form | Genericization | False-positive model / stop condition |
| --- | --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts` | `foundation no-op-calls-op guardrails` forbade sibling op imports, domain ops barrel imports, `ops.bind`, and `runValidated` in domain op runtime entrypoints. | migrate | `.habitat/civ7/mapgen/pipeline/boundaries/op-calls-op` | `command-check` now; `.pattern.md` remains future Grit source. | easy | Stop if the scan cannot name exact op runtime entrypoint roots. Do not claim product/runtime behavior. |
| `mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts` | retired ecology topology absence and active ecology stages not importing/exporting `@mapgen/domain/ecology/{ops,rules}` internals. | migrate | `.habitat/civ7/mapgen/pipeline/boundaries/ecology-step-imports` | `command-check` now; `.pattern.md` remains future Grit source. | easy | Stop if retired directory absence and active-stage import bans cannot report distinct findings. Dynamic imports and source strings are non-claims. |
| `mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts` | legacy and target stage tokens must not coexist or remain in runtime source. | migrate | `.habitat/civ7/mapgen/pipeline/structure/cutover-source-guardrails` | `command-check` now; `.pattern.md` remains future Grit/source-check source. | medium | Text-token scan is intentionally scoped to runtime source roots and quoted legacy stage ids. Do not fold into `op-calls-op`. |
| `mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts` | runtime source must not use shim/shadow/dual/compare vocabulary. | migrate | `.habitat/civ7/mapgen/pipeline/structure/cutover-source-guardrails` | `command-check` now; `.pattern.md` remains future Grit/source-check source. | medium | Regex vocabulary scan remains scoped to runtime source roots; docs and tests stay outside the oracle. |
| `mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts` | standard stage topology/order and retired aliases. | migrate | `.habitat/civ7/mapgen/pipeline/structure/standard-stage-topology` | `command-check` | easy | Source-shape oracle reads `orderStandardStages` keys and stage directories; runtime recipe execution is not claimed. |
| `mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts` | source scan for engine RNG, official generators, and internal RNG imports. | migrate | `.habitat/civ7/mapgen/pipeline/capabilities/rng-authority-static` | `command-check` now; `.pattern.md` remains future Grit/source-check source. | medium | Static call/import bans migrated; runtime RNG consumption remains package-local in `standard-rng-authority.test.ts`. |
| `mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts` | full recipe run must not consume adapter RNG. | leave package-local | n/a | package test | not appropriate | Runtime execution proof, not structural authority. |
| `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` | generated mod scripts exist, bundle workspace imports, bootstrap `TextEncoder`, and include proof markers. | leave package-local | n/a | package test | not appropriate | Generated bundle/runtime-loader proof depends on build output freshness. |
| `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts` | map projection callsite ownership, physics/map contract separation, stage topology, map effect naming, and realized-map source token bans. | migrate | `.habitat/civ7/mapgen/pipeline/{capabilities/map-projection-callsite-ownership,contracts/map-contract-surfaces,structure/standard-stage-topology}` | `command-check` | medium | Static callsite/source-token/contract-name slices migrated. Product terrain behavior remains package-local elsewhere. |
| `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` | foundation legacy surface bans, contract/source shape, strategy import locality, artifact tag source, and projection dependency source. | migrate | `.habitat/civ7/mapgen/pipeline/contracts/foundation-contract-surfaces` | `command-check` | medium | Source-shape parity keeps exact text/import oracles; it does not execute foundation domain behavior. |
| `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts` | morphology legacy surfaces, overlay isolation, config imports, contract dependencies, map-facing artifact source, and effect-gating bans. | migrate | `.habitat/civ7/mapgen/pipeline/contracts/morphology-contract-surfaces` | `command-check` | medium | Source-shape parity keeps callsite/token/contract-source oracles; it does not execute morphology behavior. |
| `mods/mod-swooper-maps/test/morphology/catalog-ownership.test.ts` | domain config facade shape, op schema ownership, and recipe tag catalog naming. | migrate | `.habitat/civ7/mapgen/pipeline/structure/domain-config-catalogs` | `command-check` | medium | Exact facade line shape and source scans migrate; no product semantics claimed. |
| `mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts` | public authoring surface keys, strict schemas, generated map entrypoint shape, shipped catalog exclusions. | split later | `.habitat/civ7/mapgen/pipeline/contracts` and `.habitat/civ7/mapgen/pipeline/structure` | command-check/test-check | hard | Split into three subjects. Do not force schema derivation into Grit. |
| `mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts` | generated schema/default/UI metadata parity against source stages. | split later | `.habitat/civ7/mapgen/studio/structure` or pipeline contracts | command-check | hard | Requires generated artifact freshness and source-stage derivation; no source pattern claim. |
| `mods/mod-swooper-maps/test/config/standard-contract-manifest.test.ts` | runtime stage/step order equals contract manifest order. | split later | `.habitat/civ7/mapgen/pipeline/contracts` | command-check | easy | Migrate when the manifest is the sole oracle; avoid duplicating stage order constants. |
| `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts` | public config validation, schema behavior, retired aliases, and input boundary cases. | leave package-local | n/a | package test | not appropriate | Most assertions are product/schema behavior, not Habitat structure. |
| `mods/mod-swooper-maps/test/standard-compile-errors.test.ts` | compiler failure cases for invalid config. | leave package-local | n/a | package test | not appropriate | Product compiler behavior. |
| `mods/mod-swooper-maps/test/resources/*.test.ts` | official resource corpus and resource op contracts. | leave package-local | n/a | package test | not appropriate | Domain data and product behavior contracts. |
| `mods/mod-swooper-maps/test/placement/*.test.ts` | placement outcomes, resource behavior, starts, diagnostics, and failure paths. | leave package-local except narrow future source scans | n/a | package test | not appropriate | Runtime/product behavior dominates. |
| `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts` | mixed static recipe-DAG import graph and deploy-plan behavior. | split later | `.habitat/civ7/mapgen/studio/boundaries` | source or command check | medium | Move only static graph policing; deploy behavior stays app test. |
| `apps/mapgen-studio/test/server/nxDevRunner.test.ts` | Nx dev topology and retired watcher/script assertions. | split later | `.habitat/civ7/mapgen/studio/structure` | command-check | medium | Needs package/Nx manifest check; do not replace dev runtime tests. |
| `apps/mapgen-studio/test/devServer/watchIgnores.test.ts` | generated/deploy output zones ignored by Vite watch. | split later | `.habitat/civ7/mapgen/studio/structure` | command-check | medium | Migrate if framed as generated-zone structure; otherwise app dev UX. |
| `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` | mixed operation adoption behavior and source scans forbidding polling/storage ownership drift. | split later | `.habitat/civ7/platform/capabilities` | source checks plus package tests | medium | Static source scans can move. Event adoption stays app behavior. |
| `apps/mapgen-studio/test/server/oneMount.test.ts` | mixed one `/rpc` runtime behavior and static lifecycle/topology pins. | split later | `.habitat/civ7/platform/contracts` | command-check plus package tests | medium | HTTP/runtime proof stays package-local. |
| `apps/mapgen-studio/test/runInGame/proofIdentity.test.ts` | exact authorship proof behavior. | leave package-local | n/a | package test | not appropriate | Product/runtime proof model. |
| `apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts` | browser worker recipe emissions and layer visibility. | leave package-local | n/a | package test | not appropriate | Product visualization behavior. |
| `apps/docs/test/site.test.ts` | docs site config and entrypoint presence. | split later | `.habitat/docs/site/structure` | file/command check | easy | Migrate if duplicate with `apps/docs/scripts/validate-docs.ts`; keep site runtime tests local. |
| `apps/docs/scripts/validate-docs.ts` | docs site structure validation. | split later | `.habitat/docs/site/structure` | command-check | easy | Should become one authority with `apps/docs/test/site.test.ts`, not duplicate. |
| `apps/docs/scripts/*fix*.ts`, `update-code-blocks.ts`, `remove-duplicate-h1.ts`, `remove-title-prefixes.ts` | mutating docs hygiene operations. | migrate later as operations | `.habitat/docs/content/capabilities` | operation, not check | medium | Requires explicit dry-run check before any read-only rule claim. |
| `packages/mapgen-core/test/architecture/core-purity.test.ts` | MapGen core purity architecture target. | split later | `.habitat/civ7/mapgen/core/boundaries` | source/check | medium | Needs separate core audit; do not bundle into Swooper pipeline. |
| `mods/mod-civ7-intelligence-bridge/test/controller-mod-package.test.ts` | controller mod package and bundle boundary checks. | split later | `.habitat/civ7/platform/boundaries` or product mod niche | command/source check plus package tests | medium | Static bundle/import pieces can move; mod package behavior stays local. |
| `packages/civ7-map-policy/test/*.test.ts` | policy table data and package boundaries. | split later | `.habitat/civ7/resources` for generated surfaces only | file/source checks plus package tests | medium | Data policy behavior stays package-local. |
| `packages/civ7-control-orpc/test/*.test.ts` | contract-first oRPC procedure shape and procedure behavior. | split later | `.habitat/civ7/platform/contracts` | source/check plus package tests | medium | Contract ownership pieces can migrate; procedure behavior stays package-local. |

## Commands Recorded

| Command | Result | Claim |
| --- | --- | --- |
| `bun test mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts` | pass | Old package authority for the two migrated subjects was green before deletion. |
| `bun tools/habitat-harness/bin/dev.ts check --rule op-calls-op --json` | fail: `FileReadFailed` | Existing `source-check` execution path is blocked by Toolkit compatibility debt before this slice's command-check cutover. |
| `bun tools/habitat-harness/bin/dev.ts check --rule ecology-step-imports --json` | fail: `FileReadFailed` | Existing `source-check` execution path is blocked by Toolkit compatibility debt before this slice's command-check cutover. |
| `node .habitat/civ7/mapgen/pipeline/boundaries/op-calls-op/op-calls-op.check.mjs` | pass | Habitat-owned transitional command check preserves the old package test's static source-shape oracle. |
| `node .habitat/civ7/mapgen/pipeline/boundaries/ecology-step-imports/ecology-step-imports.check.mjs` | pass | Habitat-owned transitional command check preserves the old package test's retired-topology and active-stage import oracle. |
| `bun tools/habitat-harness/bin/dev.ts check --rule op-calls-op` | fail: `FileReadFailed` | Current Habitat runner still fails before command execution; this is compatibility debt, not a rule finding. Package/Nx bridges call the Habitat-owned subject script directly until routing is repaired. |
| `bun run --cwd mods/mod-swooper-maps test:architecture-ecology-step-imports` | pass | Owner package command chain now executes the Habitat-owned `ecology-step-imports` subject script directly. |
| `bun run --cwd mods/mod-swooper-maps test:architecture-cutover` | pass | Owner package command chain now executes Habitat-owned `op-calls-op`, `cutover-source-guardrails`, and `standard-stage-topology` subject scripts directly. |
| `nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static` | pass | Nx owner target reaches the Habitat-owned ecology command script after dependency builds. |
| `nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static` | pass | Nx owner target reaches the Habitat-owned cutover command-check scripts. |
| `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts` | pass | Registry schema/facts accept the migrated owner-tool counts: 55 total rules, 29 `source-check`, 18 `command-check`. |
| `bun run habitat:check` | fail: `FileReadFailed` | Aggregate Habitat runner still fails before executing selected checks. This slice records the debt and does not mask it. |
| `bun test mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts` | pass | Pre-batch cutover package tests were green before their assertions moved into `cutover-source-guardrails` and `standard-stage-topology`. |
| `DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full REFRACTOR_DOMAINS=foundation,ecology ./.habitat/civ7/mapgen/pipeline/boundaries/domain-refactor-guardrails/domain-refactor-guardrails.check.sh` | fail | Full-profile guardrails cover neighboring static slices but currently expose unrelated debt; not a closure gate for this slice. |
| `bun test mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts mods/mod-swooper-maps/test/foundation/contract-guard.test.ts mods/mod-swooper-maps/test/morphology/contract-guard.test.ts mods/mod-swooper-maps/test/morphology/catalog-ownership.test.ts` | pass | Old package-local authority for the batch migration was green before deletion after building `@swooper/mapgen-core`. |
| `bun run --cwd mods/mod-swooper-maps test:architecture-static-guardrails` | pass | Owner package command chain executes every migrated Habitat command-check subject directly while the aggregate Habitat runner path is blocked. |
| `bun run --cwd mods/mod-swooper-maps test` | fail | Existing package-local product/resource/generated-bundle tests fail, but the package script still executes the appended static guardrail aggregate before returning the package-test status. This is not a migrated static-guardrail failure. |
| `nx run mod-swooper-maps:test:architecture-static-guardrails --outputStyle=static` | pass | Nx owner target reaches the migrated Habitat static guardrail aggregate; dependency builds were satisfied from existing outputs/local cache. |

## Stop Conditions

- Do not create broad `wrapped-test` Habitat execution to hide package tests under a new name.
- Do not delete a package test unless either Habitat owns the same structural oracle or this ledger marks the old assertion as intentionally out of scope.
- Do not model product/runtime behavior as a structural scan.
- Do not treat `.pattern.md` as active executable authority while the current `source-check` path is blocked by moved-pattern compatibility debt.
