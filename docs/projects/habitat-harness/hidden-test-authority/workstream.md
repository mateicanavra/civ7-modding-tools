# Embedded Hidden Authority Migration Workstream

This document is the current execution frame for the embedded hidden authority migration. It supersedes the older `ledger.md` rows where current code has moved on.

## Frame

Habitat owns authored structural authority: source-shape checks, import/export boundaries, file placement, generated/protected-surface currentness, and public structural contracts. Package tests own product behavior, runtime proof, live integration, and data semantics.

The unit of analysis is the assertion, not the test file. Mixed tests are split: static assertions move into `.habitat`; runtime or product assertions stay package-local.

## Team Lanes

- Corpus lane: package tests, canary target notes, package/project scripts, and active docs with architecture/check language.
- Existing-subject lane: match each candidate to current `.habitat/**/_self/<kind>/<category>` packets before adding a new one.
- Operational lane: apply the same distinction to `tools/habitat`, direct-control, control-oRPC, and bridge packages.
- Adversarial lane: reject whole-file moves, duplicate Habitat packets, new child niches, and runtime/product tests disguised as checks.

## Current Corpus Disposition

| Source | Embedded authority | Disposition | Proof |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts` | Standard public authoring surface, generated map entrypoint envelope shape, shipped catalog excludes transient Studio artifacts. | Migrated to `standard-authoring-surface`, `standard-map-entrypoints`, and `shipped-map-catalog`; package test deleted. | `bun habitat check --rule standard-authoring-surface --rule standard-map-entrypoints --rule shipped-map-catalog` |
| `mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts` | Standard recipe schema/default/UI artifact parity. | Migrated to `standard-recipe-artifact-parity`; package test deleted. | `bun habitat check --rule standard-recipe-artifact-parity` |
| `mods/mod-swooper-maps/test/config/standard-contract-manifest.test.ts` | Runtime stage order and Studio contract manifest parity. | Migrated to `standard-contract-manifest`; package test deleted. | `bun habitat check --rule standard-contract-manifest` |
| `mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts` | Ecology, hydrology, placement, and adapter source-token guardrails. | Migrated to `ecology-fudging-guardrails`; package test deleted. The pre-migration test exposed a comment-only false positive in `place-discoveries/contract.ts`, and this slice normalized that comment so the enforced Habitat rule closes green. | `bun habitat check --rule ecology-fudging-guardrails` |
| `packages/mapgen-core/test/architecture/core-purity.test.ts` | MapGen core runtime boundary. | Already covered by `mapgen-core-runtime-civ7`; package test deleted to remove duplicate authority. | `bun habitat check --rule mapgen-core-runtime-civ7` |
| `packages/civ7-map-policy/test/map-policy.test.ts` | Map policy package dependency boundary and generated source-evidence labels. | Boundary migrated to `civ7-map-policy-boundary`; provenance label migrated to `civ7-map-policy-provenance`; data behavior tests remain package-local. | `bun habitat check --rule civ7-map-policy-boundary --rule civ7-map-policy-provenance` |
| `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts` | Recipe-DAG service must load contract-only Studio recipe surface. | Static graph assertion migrated to `studio-recipe-dag-boundary`; deploy-plan behavior remains package-local. | `bun habitat check --rule studio-recipe-dag-boundary` |
| `apps/mapgen-studio/test/devServer/watchIgnores.test.ts` | Vite dev server must ignore generated/deploy outputs. | Migrated into `studio-dev-runner-topology`; package test deleted. | `bun habitat check --rule studio-dev-runner-topology` |
| `apps/mapgen-studio/test/server/nxDevRunner.test.ts` | Studio dev target topology, package script absence, and dev-port environment hooks. | Migrated into `studio-dev-runner-topology`; package test deleted. | `bun habitat check --rule studio-dev-runner-topology` |
| `apps/mapgen-studio/test/server/oneMount.test.ts` | EventHub lifecycle must stay inside Studio runtime construction. | Static source scan migrated to `studio-rpc-daemon-boundary`; runtime handler tests and contract collision behavior remain package-local. | `bun habitat check --rule studio-rpc-daemon-boundary` |
| `mods/mod-civ7-intelligence-bridge/test/controller-mod-package.test.ts` | UI bootstrap must use narrow `@civ7/control-orpc/game-ui` entrypoint. | Static source scan migrated to `intelligence-bridge-ui-bootstrap`; modinfo and generated bundle runtime tests remain package-local. | `bun habitat check --rule intelligence-bridge-ui-bootstrap` |
| `packages/civ7-adapter/src/**` coverage formerly embedded in the ecology static scan | Adapter-local legacy generator and ad-hoc RNG/fudge guardrails. | Split from `ecology-fudging-guardrails` into the platform-owned `adapter-legacy-generator-boundary`, so adapter-only changes select the correct Habitat owner target. | `bun habitat check --rule adapter-legacy-generator-boundary` |
| `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` | Generated bundle runtime import proof. | Left package-local; generated bundle/runtime proof is product packaging behavior. | `nx run mod-swooper-maps:test` |
| `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts` | Domain behavior around projection band. | Left package-local; it is product behavior, not static authority. | `nx run mod-swooper-maps:test` |
| `mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts` | Runtime generation proof that adapter RNG is not used. | Left package-local; static RNG source authority is already `rng-authority-static`. | `nx run mod-swooper-maps:test` |
| `tools/habitat/test/**` registry, manifest, baseline, hook, and service tests. | Habitat Toolkit internal contract tests. | Left package-local for this slice. These are Toolkit correctness tests until the Toolkit ontology/resolver redesign admits them as first-class Habitat self-authority packets. | `bun run --cwd tools/habitat test` |

## Same-Class Wiring Repair

During owner-target proof, `mapgen-studio:habitat:check` exposed an adjacent generation-order race: `mod-swooper-maps:build:studio-recipes:maps` allowed `gen:map-artifacts` to run alongside `gen:studio-recipes-types`, while the latter's bundle step cleans `dist/recipes`. The target graph now runs `gen:studio-recipes-types` before `gen:map-artifacts`, so `standard-map-configs.js` and `.d.ts` survive for Studio type-checks and Habitat owner checks.

## Closure Rules

- Do not add new child niches for these migrated packets.
- Do not hand-edit generated artifacts.
- Do not retire runtime/product package tests.
- Any static package test removed here must have an executable Habitat packet or an existing Habitat packet named above.
